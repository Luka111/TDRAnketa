'use strict';

//Languages service used for languages REST endpoint
angular.module('mean.languages').factory('Languages', ['$resource',
  function($resource) {
    return $resource('languages/:languageId', {
      languageId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
