'use strict';

//Global service for global variables
angular.module('mean.system').factory('identityService', ['$http', '$rootScope',
  function($http, $rootScope) {
    function assignDefaultUser(){
      $rootScope.user = {
        name: '',
        roles: ['','']
      };
    }
    if(!$rootScope.user) {
      assignDefaultUser();
      $http.get('/loggedin', {
      }) //point is in the interceptor that will put the token header
        .success(function(response) {
          // authentication OK
          //convert from string 0 to empty object 
          if (response === '0'){
            assignDefaultUser(); 
            return;
          }
          $rootScope.user = response;
          console.log('OD LOGGEDIN-A',response);
          $rootScope.$emit('loggedin');
        })
        .error(function() {
          console.log('ERROR IDENTITY');
        });
    }
    console.log('PRVO IDE ROOTSCOPE USER',$rootScope.user);
    return 'No Instance From identityService';
  }
]);
