'use strict';

//Forms service used for forms REST endpoint
angular.module('mean.forms').factory('Forms', ['$resource',
  function($resource) {
    return $resource('forms/:formId', {
      formId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
