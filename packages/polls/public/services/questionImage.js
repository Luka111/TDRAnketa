'use strict';
angular.module('mean.polls').factory('questionImageClass',['mediaStorage',function(mediaStorage){
  function QuestionImage(scope,el,attrs){
    this.scope = scope;
    this.el = el;
    this.attrs = attrs;
    this.link = this.createElement('a',{
      //href:attrs.ngHref
      'data-lightbox':attrs.lightbox
    });
    this.el[0].appendChild(this.link);
    this.button = this.createElement('button',{
      'disabled':scope.disabled
    },['btn', 'btn-success']);
    this.link.appendChild(this.button);
    this.icon = this.createElement('i',{},['glyphicon', 'big-icon', 'glyphicon-picture']);
    this.button.appendChild(this.icon);
    scope.$watch('disabled',this.enableButton.bind(this));
    mediaStorage.load(this.putBlob.bind(this),attrs.ngHref);
    this.scope.$on('$destroy',this.destroy.bind(this));
  }
  QuestionImage.prototype.destroy = function(){
    this.button.removeChild(this.icon);
    this.icon = null;
    this.link.removeChild(this.button);
    this.button = null;
    this.el[0].removeChild(this.link);
    this.link = null;
    this.attrs = null;
    this.attrs = null;
    this.scope = null;
  }
  QuestionImage.prototype.putBlob = function(blob){
    this.link.href = blob;
  };
  QuestionImage.prototype.enableButton = function(){
    if(this.scope.disabled){
      this.button.setAttribute('disabled',1);
    }else{
      this.button.removeAttribute('disabled');
    }
  };
  QuestionImage.prototype.createElement = function(type,attrs,classes){
    var el = document.createElement(type),i;
    for(i in attrs){
      if(attrs[i]){
        el.setAttribute(i,attrs[i]);
      }
    }
    if(classes){
      if(el.className.length){
        el.className+=' ';
      }
      el.className += classes.join(' ');
    }
    return el;
  };
  return QuestionImage;
}]);
