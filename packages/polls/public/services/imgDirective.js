'use strict';
/*

<a ng-href="/packages/system/public/media/{{question.src}}" data-lightbox="tdr-anketa">
  <button type="button" class="btn btn-success" ng-disabled="question.disabled" ng-click="calculateCounter(question,form)"><i class="glyphicon big-icon glyphicon-picture"></i></button>
</a>

*/

angular.module('mean.polls').directive('questionimage',['questionImageClass',function(QuestionImageClass){
  return {
    restrict:'E',
    scope: {
      disabled: '=',
      played: '='
    },
    link:function(scope,el,attrs){
      console.log('questionimage',scope,el,attrs);
      new QuestionImageClass(scope,el,attrs);
    }
  };
}]);

