'use strict';

//Setting up route
angular.module('mean.questions').config(['$stateProvider',
  function($stateProvider) {
    var checkIfAdmin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Not admin 
        if (user === '0' || user.roles.indexOf('top-admin') === -1) {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Admin
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
      .state('all questions', {
        url: '/questions',
        templateUrl: 'questions/views/list.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('create question', {
        url: '/questions/create',
        templateUrl: 'questions/views/create.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('edit question', {
        url: '/questions/:questionId/edit',
        templateUrl: 'questions/views/edit.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('question by id', {
        url: '/questions/:questionId',
        templateUrl: 'questions/views/view.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      });
  }
]);
