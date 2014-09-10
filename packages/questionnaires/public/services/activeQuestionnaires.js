'use strict';

//Questionnaires service used for questionnaires REST endpoint
angular.module('mean.questionnaires').factory('queryQuestionnaires', ['$resource',
  function($resource) {
    return $resource('queryQuestionnaires');
  }
]);
