'use strict';

//Translations service used for translations REST endpoint
angular.module('mean.translations').factory('deleteTranslations', ['$resource',
  function($resource) {
    return $resource('deleteTranslations/:translationId', {
      translationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
