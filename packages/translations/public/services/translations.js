'use strict';

//Translations service used for translations REST endpoint
angular.module('mean.translations').factory('Translations', ['$resource',
  function($resource) {
    return $resource('translations/:translationId', {
      translationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
