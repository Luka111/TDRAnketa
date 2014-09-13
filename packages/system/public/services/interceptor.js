'use strict';

angular.module('mean-factory-interceptor', [])
  .factory('httpInterceptor', ['$q', '$location', 'identityTokenService',
    function($q, $location, identityTokenService) {
      return {
        'request': function(config) {
          config.headers[identityTokenService.tokenName()] = identityTokenService.getToken();
          return config;
        },
        'response': function(response) {
          /*
          if (response.status === 401) {
            $location.path('/auth/login');
            return $q.reject(response);
          }
          */
          identityTokenService.setToken(response.headers('set-'+identityTokenService.tokenName()));
          return response || $q.when(response);
        },

        'responseError': function(rejection) {

          if (rejection.status === 401) {
            $location.url('/auth/login');
            return $q.reject(rejection);
          }
          return $q.reject(rejection);
        }

      };
    }
  ])
//Http Interceptor to check auth failures for XHR requests
.config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
  }
]);
