'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', 'Global', 'identityService', '$http', 'mediaStorage',
  function($scope, $rootScope, Global, identityService, $http, mediaStorage) {
    $scope.global = Global;

    function assignUserVars(){
      console.log('ONDA IDE ROOTSCOPE USER',$rootScope.user);
      $scope.myName = $rootScope.user.name;
      $scope.myRole = $rootScope.user.roles[1]; 
    }

    assignUserVars();

    $rootScope.$on('loggedin', assignUserVars);

    $scope.dopic = function(){
      mediaStorage.load('pic','system/media/bale_psycho.jpg');
    };
    $scope.dovid = function(){
      mediaStorage.load('vid','system/media/Media-Convert_test1_36s_AVC_VBR_521kbps_320x240_25fps_AACLCv4_VBR_96kbps_Stereo_44100Hz.mp4');
    };
    $scope.purgeMedia = function(){
      mediaStorage.purge();
      console.log('after purge',mediaStorage);
    };
  }
]);
