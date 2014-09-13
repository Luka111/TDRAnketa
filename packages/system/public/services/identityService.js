'use strict';

//Global service for global variables
angular.module('mean.system').service('identityTokenService', [function(){
  this.token = null;
  this.tokenName = function(){
    return 'hersauthkey';
  };
  this.hasLocalStorage = function(){
    return 'localStorage' in window && window.localStorage !== null;
  };
  this.getToken = function(){
    if(this.token === null && this.hasLocalStorage()){
      this.token = localStorage.getItem(this.tokenName());
    }
    return this.token;
  };
  this.setToken = function(token){
    if(!(typeof token === 'string' && this.hasLocalStorage())){
      return;
    }
    var ts = token.split(';');
    for(var i in ts){
      if(ts[i].indexOf('connect')===0){
        token = ts[i];
        break;
      }
    }
    console.log('should set token',token);
    this.token = token;
    localStorage.setItem(this.tokenName(),token);
  };
}]);

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
  }
]);
