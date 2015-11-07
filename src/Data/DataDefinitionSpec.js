'use strict';

var _ = require('lodash');
var DataDefinitionClass = require('./DataDefinition');

describe('When getting initial data from Definition', function() {
  
  it('should at least pass flat properties', function () {
    // Arrange
    var definition = {
      Property1: {},
      Property2: {}
    };

    // Act
    var dataDefinition = new DataDefinitionClass(definition);
    var initialData = dataDefinition.getInitialData();

    // Assert
    expect(_.has(initialData, 'Property1')).toBeTruthy();
    expect(_.has(initialData, 'Property2')).toBeTruthy();
  });
  
	it('should pass flat server data', function () {
    // Arrange
    var definition = {
      Property1: {},
      Property2: {}
    };
    var serverData = {
      Property1: 'test_string',
      Property2: 42
    };

    // Act
    var dataDefinition = new DataDefinitionClass(definition);
    var initialData = dataDefinition.getInitialData(serverData);

    // Assert
    expect(initialData.Property1).toBe('test_string');
    expect(initialData.Property2).toBe(42);
  });

  it('should pass composite properties', function () {
    // Arrange
    var definition = {
      Property1: {
        nested: {
          Property2: {}
        }
      }
    };

    // Act
    var dataDefinition = new DataDefinitionClass(definition);
    var initialData = dataDefinition.getInitialData();

    // Assert
    expect(_.has(initialData, 'Property1')).toBeTruthy();
    expect(_.has(initialData.Property1, 'Property2')).toBeTruthy();
  });

  it('should pass composite server data', function () {
    // Arrange
    var definition = {
      Property1: {
        nested: {
          Property2: {}
        }
      }
    };
    var serverData = {
      Property1: {
        Property2: 42
      }
    };

    // Act
    var dataDefinition = new DataDefinitionClass(definition);
    var initialData = dataDefinition.getInitialData(serverData);

    // Assert
    expect(initialData.Property1.Property2).toBe(42);
  });
});

describe('When getting wrapped data from Definition', function() {

  it('should initialize wrapped members', function () {
    // Arrange
    var definition = {
      Property1: {}
    };
    var dataDefinition = new DataDefinitionClass(definition);
    var getState = function() {
      return {
        state: {
          Property1: undefined
        }
      };
    };

    // Act
    var wrapper = dataDefinition.getWrappedData(getState, function(){});
    var wrappedData = wrapper.data;

    // Assert
    expect(_.has(wrappedData, 'Property1')).toBeTruthy();
    expect(_.has(wrappedData.Property1, 'val')).toBeTruthy();
    expect(_.has(wrappedData.Property1, 'required')).toBeTruthy();
    expect(_.has(wrappedData.Property1, 'validate')).toBeTruthy();
  });

  it(':: val() function should return the value of state', function () {
    // Arrange
    var definition = {
      Property1: {}
    };
    var dataDefinition = new DataDefinitionClass(definition);
    var getState = function() {
      return {
        state: {
          Property1: 'test_string'
        }
      };
    };

    // Act
    var wrappedData = dataDefinition.getWrappedData(getState, function(){});

    // Assert
    expect(wrappedData.data.Property1.val()).toBe('test_string');
  });

  it('should pass composite state properties to wrapped data', function () {
    // Arrange
    var definition = {
      Property1: {
        nested: {
          Property2: {}
        }
      }
    };

    var dataDefinition = new DataDefinitionClass(definition);
    var getState = function() {
      return {
        state: {
          Property1: {
            Property2: 42
          }
        }
      };
    };

    // Act
    var wrappedData = dataDefinition.getWrappedData(getState, function(){}).data;

    // Assert
    expect(_.has(wrappedData.Property1.val().data, 'Property2')).toBeTruthy();
    expect(wrappedData.Property1.val().data.Property2.val()).toBe(42);
  });

  it('should pass composite state to wrapped data', function () {
    // Arrange
    var stateUpdates = [];
    var definition = {
      Property0: {},
      Property1: {
        nested: {
          Property2: {}
        }
      }
    };

    var dataDefinition = new DataDefinitionClass(definition);
    var getState = function() {
      return {
        state: {
          Property0: 'foo',
          Property1: {
            Property2: 42
          }
        }
      };
    };
    var setState = function(newState) {
      stateUpdates.push(newState);
    };

    // Act
    var wrappedData = dataDefinition.getWrappedData(getState, setState).data;
    wrappedData.Property0.val('bar');
    wrappedData.Property1.val().data.Property2.val(11);

    // Assert
    expect(stateUpdates[0].Property0).toBe('bar');
    expect(stateUpdates[1].Property1.Property2).toBe(11);
  });
  
});