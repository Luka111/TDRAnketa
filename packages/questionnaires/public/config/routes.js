'use strict';

//Setting up route
angular.module('mean.questionnaires').config(['$stateProvider',
  function($stateProvider) {
    var checkIfManager = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Not manager
        if (user === '0' || user.roles.indexOf('manager') === -1) {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Manager
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
      .state('all questionnaires', {
        url: '/questionnaires',
        templateUrl: 'questionnaires/views/list.html',
        resolve: {
          loggedin: checkIfManager
        }
      })
      .state('create questionnaire', {
        url: '/questionnaires/create',
        templateUrl: 'questionnaires/views/create.html',
        resolve: {
          loggedin: checkIfManager
        }
      })
      .state('edit questionnaire', {
        url: '/questionnaires/:questionnaireId/edit',
        templateUrl: 'questionnaires/views/edit.html',
        resolve: {
          loggedin: checkIfManager
        }
      })
      .state('questionnaire by id', {
        url: '/questionnaires/:questionnaireId',
        templateUrl: 'questionnaires/views/view.html',
        resolve: {
          loggedin: checkIfManager
        }
      });
  }
]);
