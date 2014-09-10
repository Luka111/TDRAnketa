'use strict';

//Setting up route
angular.module('mean.users').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is not connected
    var checkLoggedOut = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Not Authenticated
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    var checkIfAdmin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Not admin 
        if (user.roles.indexOf('top-admin') === -1) {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Admin
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    var checkIfNotOperater = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Operater 
        if (user.roles.indexOf('operater') !== -1) {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Operater 
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    var checkIfNotClientAdmin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Not admin 
        if (user.roles.indexOf('client-admin') !== -1) {
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
      .state('auth', {
        url: '/auth',
        templateUrl: 'users/views/index.html'
      })
      .state('auth.login', {
        url: '/login',
        templateUrl: 'users/views/login.html',
        resolve: {
          loggedin: checkLoggedOut
        }
      })
      .state('auth.register', {
        url: '/register',
        templateUrl: 'users/views/register.html',
        resolve: {
          notOperater: checkIfNotOperater,
          notClientAdmin: checkIfNotClientAdmin
        }
      })
      .state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'users/views/forgot-password.html',
        resolve: {
          loggedin: checkLoggedOut
        }
      })
      .state('reset-password', {
        url: '/reset/:tokenId',
        templateUrl: 'users/views/reset-password.html',
        resolve: {
          loggedin: checkLoggedOut
        }
      })
      .state('all users', {
        url: '/users',
        templateUrl: 'users/views/list.html',
        resolve: {
          loggedin: checkIfNotOperater 
        }
      })
      .state('edit user', {
        url: '/users/:userId/edit',
        templateUrl: 'users/views/edit.html',
        resolve: {
          loggedin: checkIfAdmin
        }
      })
      .state('user by id', {
        url: '/users/:userId',
        templateUrl: 'users/views/view.html',
        resolve: {
          loggedin: checkIfNotOperater
        }
      });
  }
]);
