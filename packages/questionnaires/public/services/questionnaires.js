'use strict';

//Questionnaires service used for questionnaires REST endpoint
angular.module('mean.questionnaires').factory('Questionnaires', ['$resource',
  function($resource) {
    return $resource('questionnaires/:questionnaireId', {
      questionnaireId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
