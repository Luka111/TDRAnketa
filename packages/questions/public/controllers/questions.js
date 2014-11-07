'use strict';

angular.module('mean.questions').controller('QuestionsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Global', 'Questions', 'identityService',
  function($scope, $rootScope, $stateParams, $location, Global, Questions, identityService) {
    $scope.global = Global;
    $scope.content = [];

    //Only a pre-defined statics, not needed
    $scope.types = ['Question','Label','Image','Video'];
    $scope.creatableTypes = ['Question','Label'];
    $scope.type = $scope.types[0];

    //Conditional statics
    $scope.conditionalTypes = ['none','form','questionnaire'];

    //Question kinds statics
    $scope.questionKinds = ['radio','email','textarea'];

    //pointerObj is necessary because angular passes values by the reference
    //so, if we make title primitive (string) two-way data binding woudln't work
    //between the html templates
    $scope.pointerObj = {
      title : '',
      label : '',
      required : false,
      conditional : $scope.conditionalTypes[0],
      conditionalValue : '',
      kind: $scope.questionKinds[0],
      answer: ''
    };

    //If conditional is 'none' empty conditional value
    $scope.ifNoneEmptyValue = function(value){
      if(value === 'none'){
        $scope.pointerObj.conditionalValue = '';
      }
    };

    //If conditional is 'none' empty conditional value for edit
    $scope.ifNoneEmptyValueEdit = function(value){
      if(value === 'none'){
        $scope.question.conditional.value = '';
      }
    };

    $scope.ifNotRadioEmpty = function(kind){
      console.log('KIND',kind);
      if (kind !== 'radio'){
        $scope.pointerObj.conditional = '';
        $scope.pointerObj.conditionalValue = '';
      }
    };

    //If type is not question empty kind
    $scope.ifNotQuestionEmptyKind = function(type){
      if (type !== 'Question'){
        $scope.pointerObj.kind = '';
      }else{
        $scope.pointerObj.kind = $scope.questionKinds[0];
      }
    };

    $scope.hasAuthorization = function(poll) {
      if (!poll) return false;
      return ($rootScope.user.roles.indexOf('top-admin') !== -1);
    };

    $scope.addAnswer = function(answer){
      console.log('ANSWER',answer);
      if (!answer) return;
      $scope.content.push(answer);
    };

    $scope.create = function(isValid) {
      if (isValid) {
        //Empty everything that belongs ONLY to question
        if ($scope.type !== 'Question'){
          $scope.pointerObj.title = '';
          $scope.pointerObj.conditional = '';
          $scope.pointerObj.conditionalValue = '';
          $scope.pointerObj.required = null;
          $scope.pointerObj.kind = '';
          $scope.content = [];
        }else{
          if ($scope.pointerObj.kind !== 'radio'){
            $scope.content = [];
          }
        }
        //Empty everything that belongs ONLY to label
        if ($scope.type !== 'Label'){
          $scope.pointerObj.label = '';
        }
        var conditionalObj = {kind: $scope.pointerObj.conditional, value: $scope.pointerObj.conditionalValue};
        if (this.pointerObj.kind !== 'radio') this.content = [];
        var question = new Questions({
          title: this.pointerObj.title,
          content: this.content,
          type: this.type,
          label: this.pointerObj.label,
          required: this.pointerObj.required,
          conditional: conditionalObj,
          kind: this.pointerObj.kind
        });
        console.log('Pre slanja u bazu sam napravio ovaj objekat:',question);
        question.$save(function(response) {
          $location.path('questions/' + response._id);
        });

        this.title = '';
        this.content = [];
      } else {
        $scope.submitted = true;
      }
    };

    $scope.removeAnswer = function(index){
      $scope.question.content.splice(index,1);
      if ($scope.question.content.indexOf($scope.question.conditional.value) === -1) $scope.question.conditional.value = '';
    };

    $scope.removeAnswerC = function(index){
      $scope.content.splice(index,1);
    };

    $scope.remove = function(question) {
      if (question) {
        question.$remove();

        for (var i in $scope.questions) {
          if ($scope.questions[i] === question) {
            $scope.questions.splice(i, 1);
          }
        }
        $location.path('questions');
      } else {
        $scope.question.$remove(function(response) {
          $location.path('questions');
        });
      }
    };

    $scope.addNewAnswer = function(newAnswer){
      if (!newAnswer){
        return;
      }
      $scope.question.content.push(newAnswer);
      $scope.submitted = false;
    };

    $scope.update = function(isValid) {
      if (($scope.question.content.length === 0) && ($scope.question.type === 'Question')){
        $scope.submitted = true;
        return;
      }
      if ((typeof($scope.question.label) === 'undefined') && ($scope.question.type === 'Label')){
        $scope.submitted = true;
        return;
      }
      if (isValid) {
        if ($scope.question.kind !== 'radio') $scope.question.content = [];
        var question = $scope.question;
        if (!question.updated) {
          question.updated = [];
        }
        question.updated.push(new Date().getTime());

        question.$update(function() {
          $location.path('questions/' + question._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Questions.query(function(questions) {
        $scope.questions = questions;
        for(var i=questions.length-1; i>=0; i--){
          if ((questions[i].type === 'Image') || (questions[i].type === 'Video')) questions.splice(i,1);
        }
      });
    };

    $scope.findOne = function() {
      Questions.get({
        questionId: $stateParams.questionId
      }, function(question) {
        $scope.question = question;
        if (question.type === 'Question' && !question.conditional){
          $scope.question.conditional = { kind:$scope.conditionalTypes[0], value:'' };
        }
      });
    };
  }
]);
