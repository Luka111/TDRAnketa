'use strict';

//Polls service used for polls REST endpoint
angular.module('mean.polls').factory('QuestionnaireHandler', ['$scope',
  function($scope) {
    function QuestionnaireHandler($scope){
      this.scope = $scope;
    }
    return QuestionnaireHandler;
  }
]);

