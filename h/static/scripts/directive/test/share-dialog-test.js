'use strict';

var angular = require('angular');

var util = require('./util');

describe('shareDialog', function () {
  var fakeCrossFrame;

  beforeEach(function () {
    fakeCrossFrame = { frames: [] };

    angular.module('h', [])
      .directive('shareDialog', require('../share-dialog'))
      .value('crossframe', fakeCrossFrame)
      .value('urlEncodeFilter', function (val) { return val; });
    angular.mock.module('h');
  });

  it('generates new via link', function () {
    var element = util.createDirective(document, 'shareDialog', {});
    fakeCrossFrame.frames.push({ uri: 'http://example.com' });
    element.scope.$digest();
    assert.equal(element.ctrl.viaPageLink, 'https://via.hypothes.is/http://example.com');
  });

  it('does not generate new via link if already on via', function () {
    var element = util.createDirective(document, 'shareDialog', {});
    fakeCrossFrame.frames.push({ uri: 'https://via.hypothes.is/http://example.com' });
    element.scope.$digest();
    assert.equal(element.ctrl.viaPageLink, 'https://via.hypothes.is/http://example.com');
  });
});
