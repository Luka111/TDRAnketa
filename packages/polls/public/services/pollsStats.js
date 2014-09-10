'use strict';

//Polls service used for polls REST endpoint
angular.module('mean.polls').factory('PollStats', ['$resource',
  function($resource) {
    return $resource('pollStats');
  }
]);
