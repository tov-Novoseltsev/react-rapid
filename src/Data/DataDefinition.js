/* jshint latedef: false */
'use strict';

var _ = require('lodash');

var wrappedProperty = require('./WrappedProperty');
var compositeWrappedProperty = function(getState, setState, propertyName, propertyDefinition) {
  var self = this;

  self.definition = new DataDefinition(propertyDefinition.nested);
  var nestedWrappedProperty = self.definition.getWrappedData(
    function() {
      return {
        state: getState().state[propertyName],
        getParentState: getState
      };
    },
    function(newState) {
      var compositeNewState = getState().state;
      compositeNewState[propertyName] = newState;
      setState(compositeNewState);
    }
  );
  self.val = function () {
    return nestedWrappedProperty;
  };
  self.ignored = function() {
    return _.has(propertyDefinition, 'ignored') && propertyDefinition.ignored(getState);
  };
  self.validate = function() {
    return { isValid: nestedWrappedProperty.validate() };
  };
};

var DataDefinition = function(definitionObject) {
  var self = this;

  self.getOriginalDefinitionObject = function() {
    return definitionObject;
  };

  var pureGetInitialData = function(_, definitionObject, serverData) {
    var retval = {};
    for (var property in definitionObject) {
      if (definitionObject.hasOwnProperty(property)) {
        var propertyDefinition = definitionObject[property];
        if(_.has(propertyDefinition, 'nested')) {
          retval[property] = pureGetInitialData(_, propertyDefinition.nested, serverData ? serverData[property] : undefined);
        }
        else {
          retval[property] = serverData && _.has(serverData, property) ? serverData[property] : propertyDefinition.initialVal;
          if(_.has(propertyDefinition, 'ingoingTransform')) {
            retval[property] = propertyDefinition.ingoingTransform(retval[property]);
          }
        }
      }
    }
    return retval;
  };

  self.getInitialData = function(serverData) {
    return pureGetInitialData(_, definitionObject, serverData);
  };

  self.getWrappedData = function(getState, setState, initialData) {
    if(!getState || !setState) {
      throw new Error('Please supply getState and setState functions.');
    }

    var retval = {
      data: {}
    };

    var setWrappedProperty = function(getState, setState, propertyName, propertyDefinition) {
      if(_.has(propertyDefinition, 'nested')) {
        return new compositeWrappedProperty(getState, setState, propertyName, propertyDefinition);
      } else {
        return new wrappedProperty(getState, setState, propertyName, propertyDefinition);
      }
    };

    _.each(definitionObject, function(propertyDefinition, propertyName) {
      retval.data[propertyName] = setWrappedProperty(getState, setState, propertyName, propertyDefinition);
    });

    retval.validate = function() {
      var allPropertiesAreValid = true;
      var state = getState().state;
      for (var propertyName in state) {
        if (state.hasOwnProperty(propertyName) && propertyName.indexOf('__') !== 0) {
          var wrappedProperty = retval.data[propertyName];
          wrappedProperty.isVirgin = false;
          var isIgnored = _.has(wrappedProperty, 'ignored') && wrappedProperty.ignored(getState);
          if(!isIgnored && !wrappedProperty.validate().isValid) {
            allPropertiesAreValid = false;
          }
        }
      }

      state.__AllPropertiesAreValid = allPropertiesAreValid;
      setState(state);
      return allPropertiesAreValid;
    };

    retval.getPureData = function() {
      var pureData = {};
      _.each(definitionObject, function(propertyDefinition, propertyName) {
        if(retval.data[propertyName].ignored()) {
          if(propertyDefinition.produceNullWhenIgnored) {
            pureData[propertyName] = null;
          }
          return;
        }

        if(_.has(propertyDefinition, 'nested')) {
          pureData[propertyName] = retval.data[propertyName].val().getPureData();
        } else {
          pureData[propertyName] = retval.data[propertyName].val();
          if(_.has(propertyDefinition, 'outgoingTransform')) {
            pureData[propertyName] = propertyDefinition.outgoingTransform(pureData[propertyName]);
          }
        }
      });
      return pureData;
    };

    return retval;
  };

  return self;
};

module.exports = DataDefinition;
