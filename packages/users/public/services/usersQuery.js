'use strict';

//Users service used for users REST endpoint
angular.module('mean.users').factory('UsersQuery', ['$resource',
  function($resource) {
    return $resource('usersQuery/:mode',{
      mode: '@mode'
    });
  }
]);
