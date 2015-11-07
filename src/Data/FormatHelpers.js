'use strict';

var config = require('../AppConfiguration'),
  _ = require('underscore');

var numbersRegExpression = /\d+/g;
var thousandSeparator = ',';
var decimalPoint = '.';

var helpers = {
  getNumbersFromString: function(str) {
    str += '';
    var retval = str.match(numbersRegExpression, '');
    return retval != null ? retval.reduce(function(prev, cur) { return prev + cur; }) : '';
  },
  addThousandsSeparators: function(str) { // may be use this instead: http://formatjs.io/react
    str += '';
    var x = str.split(decimalPoint);
    var x1 = x[0];
    var x2 = x.length > 1 ? decimalPoint + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + thousandSeparator + '$2');
    }
    return x1 + x2;
  },
  decorateCurrency: function(number) {
    if(_.isUndefined(number)) {
      return number;
    }
    number = Math.round(number * 100) / 100;
    return config.FinancialSign + helpers.addThousandsSeparators(number);
  }
};

module.exports = helpers;
