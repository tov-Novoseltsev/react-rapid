'use strict';

var _ = require('lodash');

module.exports.getListItemFromValue = function(val) {
  return { name: val + '', value: val };
};

module.exports.getFirstValue = function(array) {
  return _.first(_.map(array, function(item) { return item.value; }));
};

module.exports.getItemNameByValue = function(array, val) {
  return _.result(_.find(array, { 'value': val }), 'name');
};
