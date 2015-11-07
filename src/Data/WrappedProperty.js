'use strict';

var _ = require('lodash');

module.exports = function(getState, setState, propertyName, propertyDefinition) {
  var self = this;

  self.meta = propertyDefinition;
  self.isVirgin = true;

  self.val = function(newVal) {
    var valDefinition = propertyDefinition.val;
    if(!_.isUndefined(valDefinition)) {
      if(!_.isUndefined(newVal)) {
        console.log('Setting of calculated field is not allowed');
      } else {
        return propertyDefinition.val(getState);
      }
    }


    if(_.isUndefined(newVal)) {
      return getState().state[propertyName];
    } else {
      self.isVirgin = false;

      var state = getState().state;
      state[propertyName] = newVal;
      setState(state);
    }
  };

  self.ignored = function() {
    var ignoredDefinition = propertyDefinition.ignored;
    if(_.isUndefined(ignoredDefinition)) {
      return false;
    }	else if(_.isBoolean(ignoredDefinition)) {
      return ignoredDefinition;
    }	else if(_.isFunction(ignoredDefinition)) {
      return ignoredDefinition(getState);
    } else {
      throw new Error('"ignored" definition is invalid for property: ' + propertyName);
    }
  };

  self.required = function() {
    var requiredDefinition = propertyDefinition.required;
    if(_.isUndefined(requiredDefinition) || self.ignored()) {
      return false;
    }	else if(_.isBoolean(requiredDefinition)) {
      return requiredDefinition;
    }	else if(_.isFunction(requiredDefinition)) {
      return requiredDefinition(getState);
    } else {
      throw new Error('"required" definition is invalid for property: ' + propertyName);
    }
  };

  self.validate = function() {
    var retval = { isValid: true, validationMessage: '' };

    var val = self.val();
    if(!self.isVirgin && (_.isUndefined(val) || val === null || val === '') && self.required()) {
      retval.isValid = false;
      retval.validationMessage = 'Required field';
    } else {
      var validateDefinition = propertyDefinition.validate;
      if(_.isString(validateDefinition)) {
        // todo: add validations like numeric, alphanumeric, etc
      }	else if(_.isRegExp(validateDefinition)) {

      } else if (_.isFunction(validateDefinition)) {
        var validationResult = validateDefinition(getState);
        if(_.isBoolean(validationResult)) {
          retval.isValid = validationResult;
        } else {
          retval = validationResult;
        }
      }
    }

    return retval;
  };
};
