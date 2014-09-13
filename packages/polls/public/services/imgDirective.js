'use strict';
/*

<a ng-href="/packages/system/public/media/{{question.src}}" data-lightbox="tdr-anketa">
  <button type="button" class="btn btn-success" ng-disabled="question.disabled" ng-click="calculateCounter(question,form)"><i class="glyphicon big-icon glyphicon-picture"></i></button>
</a>

*/

angular.module('mean.polls').directive('questionimage',['$http',function($http){
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
    this.button.appendChild(this.createElement('i',{},['glyphicon', 'big-icon', 'glyphicon-picture']));
    scope.$watch('disabled',this.enableButton.bind(this));
    $http.get(attrs.ngHref,{responseType:'blob'}).success(this.onLoaded.bind(this));
  }
  QuestionImage.prototype.enableButton = function(){
    if(this.scope.disabled){
      this.button.setAttribute('disabled',1);
    }else{
      this.button.removeAttribute('disabled');
    }
  };
  QuestionImage.prototype.createElement = function(type,attrs,classes){
    var el= document.createElement(type),i;
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
  QuestionImage.prototype.onLoaded = function(data){
    //console.log('got',data);
    var cou = URL.createObjectURL ? URL.createObjectURL.bind(URL) : webkitURL.createObjectURL.bind(webkitURL);
    if(!cou){
      throw 'Cannot createObjectURL';
    }
    var urldata = cou(new Blob([data],{type:'image/jpeg'}));
    console.log('from',typeof data,'got',urldata);//,data);
    this.link.href = urldata;
  };
  return {
    restrict:'E',
    scope: {
      disabled: '=',
      played: '='
    },
    link:function(scope,el,attrs){
      console.log('questionimage',scope,el,attrs);
      new QuestionImage(scope,el,attrs);
    }
  };
}]);

