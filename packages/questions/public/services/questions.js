'use strict';

//Questions service used for questions REST endpoint
angular.module('mean.questions').factory('Questions', ['$resource','Global',
  function($resource,Global) {
    //Different resources dependable on user roles
    /*
    if(Global.user.roles.indexOf('admin')<0){
    return $resource('questions/:questionId', {
      questionId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
    }else{
      return $resource();
    }
    */
    return $resource('questions/:questionId', {
      questionId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
