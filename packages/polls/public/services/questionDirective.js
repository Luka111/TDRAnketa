'use strict';
/* global jQuery:false */

angular.module('mean.polls').directive('questionvideo',function(){
  return {
    restrict:'E',
    scope: {
      disabled: '=',
      played: '='
    },
    link:function(scope,el,attrs){

      //Full screen button
      var goFullScreenAndPlay = function(elem){
        elem.style.display = 'inline';
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.webkitEnterFullScreen) {
            //PROB NOT WORKING, STILL HAVENT TESTED
            elem.style.display = '-webkit-transform: rotateX(0deg); height: auto;';
            //elem.webkitEnterFullScreen();
        }
        elem.play();
      };

      //Function for adding listeners
      var addListeners = function(elem){
        //STANDARD
        elem.addEventListener('fullscreenchange', function () {
              console.log(document.fullscreen);
              if (!document.fullscreen){
                elem.pause();
                this.style.display = 'none';
              }
        }, false);
        //MOZ
        elem.addEventListener('mozfullscreenchange', function () {
              console.log(document.mozFullScreen);
              if (!document.mozFullScreen){
                elem.pause();
                this.style.display = 'none';
              }
        }, false);
        //WEBKIT
        elem.addEventListener('webkitfullscreenchange', function () {
              console.log(document.webkitIsFullScreen);
              if (!document.webkitIsFullScreen){
                elem.pause();
                this.style.display = 'none';
              }else{
                elem.style.display = 'block';
              }
        }, false);
        //IOS
        elem.addEventListener('webkitendfullscreen', function () {
              this.style.display = '-webkit-transform: rotateX(90deg); height: 0;';
        }, false);
        //IE11
        elem.addEventListener('msfullscreenchange', function () {
              console.log(document.msFullscreenElement);
              if (!document.msFullscreenElement){
                elem.pause();
                this.style.display = 'none';
              }
        }, false);
      };

      scope.$watch('disabled',function(newVal, oldVal){
        var jQueryObj;
        if (newVal === true){
          jQueryObj = jQuery(b);
          jQueryObj.prop('disabled',true);
          return;
        }
        if (newVal === false){
          jQueryObj = jQuery(b);
          jQueryObj.prop('disabled',false);
          return;
        }
      });

      scope.$watch('played',function(newVal, oldVal){
        var jQueryButton;
        if (newVal === 1){
          jQueryButton = jQuery(b);
          jQueryButton.removeClass('btn-warning');
          jQueryButton.addClass('btn btn-primary');
          b.innerHTML = '<i class="glyphicon big-icon glyphicon-play-circle"></i>';
          return;
        }
        if (newVal === 0){
          jQueryButton = jQuery(b);
          jQueryButton.removeClass('btn-primary');
          jQueryButton.addClass('btn btn-warning');
          b.innerHTML = '<i class="glyphicon big-icon glyphicon-repeat"></i>';
          return;
        }
      });

      var b = document.createElement('button');
      b.type = 'button';
      el.append(b);
      var v = document.createElement('video');
      v.style.display = 'none';
      b.onclick = goFullScreenAndPlay.bind(null,v);
      v.controls = true;
      el.append(v);
      var s = document.createElement('source');
      s.src = attrs.src;
      s.type = attrs.type;
      console.log(s);
      v.appendChild(s);
      addListeners(v);
    }
  };
});

