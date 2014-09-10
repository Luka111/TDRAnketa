'use strict';

//Polls service used for polls REST endpoint
angular.module('mean.polls').factory('PollsQuery', ['$resource',
  function($resource) {
    return $resource('pollsQuery');
  }
]);
