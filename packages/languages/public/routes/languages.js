'use strict';

//Setting up route
angular.module('mean.languages').config(['$stateProvider',
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
      .state('all languages', {
        url: '/languages',
        templateUrl: 'languages/views/list.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('edit language', {
        url: '/languages/:languageId/edit',
        templateUrl: 'languages/views/edit.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      });
  }
]);
