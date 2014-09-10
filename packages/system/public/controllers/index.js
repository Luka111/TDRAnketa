'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', 'Global', 'identityService',
  function($scope, $rootScope, Global, identityService) {
    $scope.global = Global;

    function assignUserVars(){
      console.log('ONDA IDE ROOTSCOPE USER',$rootScope.user);
      $scope.myName = $rootScope.user.name;
      $scope.myRole = $rootScope.user.roles[1]; 
    }

    assignUserVars();

    $rootScope.$on('loggedin', assignUserVars);
  }
]);
