'use strict';

//Setting up route
angular.module('mean.polls').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
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

    var checkIfOperater = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Not operater 
        if (user.roles.indexOf('operater') === -1) {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Operater
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    var checkIfManager = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Not operater 
        if (user.roles.indexOf('manager') === -1) {
          $timeout(deferred.reject);
          $location.url('/login');
        }

        // Operater
        else $timeout(deferred.resolve);
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
      .state('all polls', {
        url: '/polls',
        templateUrl: 'polls/views/list.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('pick active questionnaire', {
        url: '/polls/active',
        templateUrl: 'polls/views/active.html',
        resolve: {
          loggedin: checkIfOperater
        }
      })
      .state('create poll', {
        url: '/polls/create/:questionnaireId',
        templateUrl: 'polls/views/create.html',
        resolve: {
          loggedin: checkIfOperater
        }
      })
      .state('edit poll', {
        url: '/polls/:pollId/edit',
        templateUrl: 'polls/views/edit.html',
        resolve: {
          loggedin: checkIfManager
        }
      })
      .state('poll by id', {
        url: '/polls/:pollId',
        templateUrl: 'polls/views/view.html',
        resolve: {
          loggedin: checkIfManager
        }
      })
      .state('stats', {
        url: '/stats',
        templateUrl: 'polls/views/stats.html',
        resolve: {
          loggedin: checkIfNotOperater
        }
      });
  }
]);
