'use strict';

//Polls service used for polls REST endpoint
angular.module('mean.polls').factory('DistinctUsers', ['$resource',
  function($resource) {
    return $resource('distinctUsers');
  }
]);
