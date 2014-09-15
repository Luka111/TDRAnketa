'use strict';

//Setting up route
angular.module('mean.forms').config(['$stateProvider',
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
      .state('all forms', {
        url: '/forms',
        templateUrl: 'forms/views/list.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('create form', {
        url: '/forms/create',
        templateUrl: 'forms/views/create.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('edit form', {
        url: '/forms/:formId/edit',
        templateUrl: 'forms/views/edit.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('form by id', {
        url: '/forms/:formId',
        templateUrl: 'forms/views/view.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      });
  }
]);
