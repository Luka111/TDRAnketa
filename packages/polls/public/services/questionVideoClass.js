'use strict';
angular.module('mean.polls').factory('questionVideoClass',['mediaStorage',function(mediaStorage){
  function VideoClass(scope,elem,attrs){
    this.scope = scope;
    this.elem = elem;
    this.attrs = attrs;
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.elem.append(b);
    this.video = document.createElement('video');
    this.video.style.display = 'none';
    this.button.onclick = this.goFullScreenAndPlay.bind(this);
    this.video.controls = true;
    this.elem.append(v);
    this.source = document.createElement('source');
    this.source.src = this.attrs.src;
    this.source.type = this.attrs.type;
    this.video.appendChild(this.source);
    this.addListeners();
    this.scope.$watch('disabled',this.disabledWatcher.bind(this));
    this.scope.$watch('played',this.playedWatcher.bind(this));
    this.scope.$on('$destroy',this.destroy.bind(this));
  }
  VideoClass.prototype.destroy = function(){
    this.source = null;
    this.video = null;
    this.video.removeChild(this.source);
    this.button.removeChild(this.video);
    this.elem[0].removeChild(this.button);
    this.button = null;
    this.attrs = null;
    this.elem = null;
    this.scope = null;
  };
  VideoClass.prototype.disabledWatcher = function(newVal, oldVal){
    var jQueryObj;
    if (newVal === true){
      jQueryObj = jQuery(this.button);
      jQueryObj.prop('disabled',true);
      return;
    }
    if (newVal === false){
      jQueryObj = jQuery(this.button);
      jQueryObj.prop('disabled',false);
      return;
    }
  };
  VideoClass.prototype.playedWatcher = function(newVal, oldVal){
    var jQueryButton;
    if (newVal === 1){
      jQueryButton = jQuery(this.button);
      jQueryButton.removeClass('btn-warning');
      jQueryButton.addClass('btn btn-primary');
      this.button.innerHTML = '<i class="glyphicon big-icon glyphicon-play-circle"></i>';
      return;
    }
    if (newVal === 0){
      jQueryButton = jQuery(this.button);
      jQueryButton.removeClass('btn-primary');
      jQueryButton.addClass('btn btn-warning');
      this.button.innerHTML = '<i class="glyphicon big-icon glyphicon-repeat"></i>';
      return;
    }
  };
  VideoClass.prototype.goFullScreenAndPlay = function(){
        this.elem.style.display = 'inline';
        if (this.elem.requestFullscreen) {
            this.elem.requestFullscreen();
        } else if (this.elem.msRequestFullscreen) {
            this.elem.msRequestFullscreen();
        } else if (this.elem.mozRequestFullScreen) {
            this.elem.mozRequestFullScreen();
        } else if (this.elem.webkitRequestFullscreen) {
            this.elem.webkitRequestFullscreen();
        } else if (this.elem.webkitEnterFullScreen) {
            //PROB NOT WORKING, STILL HAVENT TESTED
            this.elem.style.display = '-webkit-transform: rotateX(0deg); height: auto;';
            //this.elem.webkitEnterFullScreen();
        }
        this.elem.play();
      };
  VideoClass.prototype.standardListener = function(){
    console.log(document.fullscreen);
    if (!document.fullscreen){
      this.elem.pause();
      this.style.display = 'none';
    }
  };
  VideoClass.prototype.mozillaListener = function(){
    console.log(document.mozFullScreen);
    if (!document.mozFullScreen){
      this.elem.pause();
      this.style.display = 'none';
    }
  }
  VideoClass.prototype.webkitListener = function(){
    console.log(document.webkitIsFullScreen);
    if (!document.webkitIsFullScreen){
      this.elem.pause();
      this.elem.style.display = 'none';
    }else{
      this.elem.style.display = 'block';
    }
  }
  VideoClass.prototype.iosListener =  function () {
    this.elem.style.display = '-webkit-transform: rotateX(90deg); height: 0;';
  }
  VideoClass.prototype.microsoftListener = function(){
    console.log(document.msFullscreenElement);
    if (!document.msFullscreenElement){
      this.elem.pause();
      this.elem.style.display = 'none';
    }
  }
  VideoClass.prototype.addListeners = function(){
    this.elem.addEventListener('fullscreenchange', this.standardListener.bind(this), false);
    this.elem.addEventListener('mozfullscreenchange', this.mozillaListener.bind(this), false);
    this.elem.addEventListener('webkitfullscreenchange', this.webkitListener.bind(this), false);
    this.elem.addEventListener('webkitendfullscreen', this.iosListener.bind(this), false);
    this.elem.addEventListener('msfullscreenchange', this.microsoftListener(this), false);
  };
}]);
