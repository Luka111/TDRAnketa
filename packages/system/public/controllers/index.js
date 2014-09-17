'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', 'Global', 'identityService', '$http',
  function($scope, $rootScope, Global, identityService, $http) {
    $scope.global = Global;

    function assignUserVars(){
      console.log('ONDA IDE ROOTSCOPE USER',$rootScope.user);
      $scope.myName = $rootScope.user.name;
      $scope.myRole = $rootScope.user.roles[1]; 
    }

    assignUserVars();

    $rootScope.$on('loggedin', assignUserVars);





    function MediaStorage(){
      this.store = {};
      for(var i in localStorage){
        this.loadBlob(i);
      }
      console.log('my store',this.store);
    }
    MediaStorage.prototype.load = function(mediaelementid,mediaurl){
      var m = this.store[mediaurl];
      if(m){
        this.putMediaToElement(mediaelementid,m);
      }else{
        console.log('gotta load',mediaurl);
        this.loadURL(mediaurl,this.putMediaToElement.bind(this,mediaelementid));
      }
    };
    MediaStorage.prototype.putMediaToElement = function(mediaelementid,media){
      console.log('putting src to',media);
      document.getElementById(mediaelementid).src = media;
    };
    MediaStorage.prototype.loadURL = function(mediaurl,cb){
      $http.get(mediaurl,{responseType:'blob'}).success(this.onURLLoaded.bind(this,mediaurl,cb));
    };
    MediaStorage.prototype.onURLLoaded = function(mediaurl,cb,data){
      console.log('got data',data);
      this.saveBlob(mediaurl,data);
      var urlobj = URL.createObjectURL(data);
      this.store[mediaurl] = urlobj;
      cb(urlobj);
    };
    MediaStorage.prototype.saveBlob = function(id,blob){
      var fr = new FileReader();
      fr.onload = this.onFileRead.bind(this,id,fr,blob.type);
      fr.readAsArrayBuffer(blob);
    };
    MediaStorage.prototype.onFileRead = function(id,filereader,type){
      var uint8bytes = new Uint8Array(filereader.result);
      var data = '';
      for(var i in uint8bytes){
        data += String.fromCharCode(uint8bytes[i]);
      }
      localStorage.setItem('media:'+id,JSON.stringify({type:type,data:btoa(data)}));
    };
    MediaStorage.prototype.loadBlob = function(id){
      var key = this.keyFromMediaKey(id);
      if(!key){
        return;
      }
      var mediastring = localStorage.getItem(id);
      try{
        var media = JSON.parse(mediastring);
        console.log(media);
        var bytes = atob(media.data);
        var uint8bytes = new Array(bytes.length);
        for(var i = 0; i<bytes.length; i++){
          uint8bytes[i] = bytes.charCodeAt(i);
        }
        var byteArray = new Uint8Array(uint8bytes);
        var blob = new Blob([byteArray],media);
        var urlobj = URL.createObjectURL(blob);
        this.store[key] = urlobj;
      }
      catch(e){
        console.log(e.stack);
        console.log(e);
        return;
      }
    };
    MediaStorage.prototype.isMediaKey = function(key){
      return key.indexOf('media:')===0;
    };
    MediaStorage.prototype.keyFromMediaKey = function(mediakey){
      if(!this.isMediaKey(mediakey)){
        return;
      }
      return mediakey.substring(6);
    };
    MediaStorage.prototype.purge = function(){
      this.store = {};
      for(var i in localStorage){
        if(this.isMediaKey(i)){
          localStorage.removeItem(i);
        }
      }
    };

    var _MS = new MediaStorage();

    $scope.dopic = function(){
      _MS.load('pic','system/media/bale_psycho.jpg');
    };
    $scope.dovid = function(){
      _MS.load('vid','system/media/Media-Convert_test1_36s_AVC_VBR_521kbps_320x240_25fps_AACLCv4_VBR_96kbps_Stereo_44100Hz.mp4');
    };
    $scope.purgeMedia = function(){
      _MS.purge();
      console.log('after purge',_MS);
    };
  }
]);
