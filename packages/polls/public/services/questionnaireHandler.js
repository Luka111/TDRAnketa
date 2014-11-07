'use strict';
/*global jQuery:false */

//Polls service used for polls REST endpoint
angular.module('mean.polls').factory('QuestionnaireHandler', ['Polls','$timeout','mediaStorage','clientStorage',function(Polls,$timeout,mediaStorage,clientStorage) {
  var __pollInSend, __failedTimeout=1;
  function sendPoll(key,p){
    if(!key){return;}
    if(!p){return;}
    if(__pollInSend){return;}
    __pollInSend = key;
    var _p = new Polls(p);
    _p.$save(resetAndGetPollForSending.bind(null,key),resetAndRetryPollForSending);
  }
  function annulateAndGetPollForSending(){
    __pollInSend = null;
    getPollForSending();
  }
  function resetAndRetryPollForSending(){
    if(!__pollInSend){return;}
    __failedTimeout *= 2;
    if(__failedTimeout>10000){
      __failedTimeout = 10000;
    }
    $timeout(annulateAndGetPollForSending,__failedTimeout);
  }
  function resetAndGetPollForSending(key){
    if(!__pollInSend){return;}
    __pollInSend = null;
    __failedTimeout = 1;
    clientStorage.remove('results',key,getPollForSending);
  }
  function getPollForSending(){
    clientStorage.iterate('results',sendPoll);
  }
  getPollForSending();
  function inherit(chld,parnt){
    chld.prototype = Object.create(parnt.prototype,{constructor:{
      value: chld,
      enumerable: false,
      configurable: false,
      writable: false
    }});
  }

  function NullableProperty(val,nullval){
    this.value = val;
    this.originalValue = val;
    this.nullValue = nullval;
    this.disableDepth = 0;
  }
  NullableProperty.prototype.destroy = function(){
    this.disableDepth = null;
    this.nullValue = null;
    this.originalValue = null;
    this.value = null;
  };
  NullableProperty.prototype.set = function(val){
    this.value = val;
    this.originalValue = val;
    this.disableDepth = 0;
  };
  NullableProperty.prototype.reset = function(){
    this.set(this.originalValue);
  };
  NullableProperty.prototype.disable = function(){
    this.originalValue = this.value;
    this.value = this.nullValue;
    this.disableDepth++;
  };
  NullableProperty.prototype.enable = function(){
    this.disableDepth--;
    if(this.disableDepth<0){
      throw 'too many enables!';
    }
    if(this.disableDepth===0){
      this.value = this.originalValue;
    }
  };

  function NullableNumber(val,nullval){
    NullableProperty.call(this,val,nullval);
  }
  inherit(NullableNumber,NullableProperty);
  NullableNumber.prototype.inc = function(){
    if(this.disableDepth){
      throw 'Inc-ing NullableNumber while it is disabled';
    }
    this.set(this.value+1);
  };
  NullableNumber.prototype.dec = function(){
    if(this.disableDepth){
      throw 'Dec-ing NullableNumber while it is disabled';
    }
    this.set(this.value-1);
  };


  function FormItem(parnt,q){
    this.__parent = parnt;
    this._id = q._id;
    this.type = q.type;
  }
  FormItem.prototype.destroy = function(){
    this.type = null;
    this._id = null;
    this.__parent = null;
  };
  FormItem.prototype.isObligatory = function(){
    return false;
  };
  FormItem.prototype.isValid = function(){
    return typeof this._id !== 'undefined';
  };
  FormItem.prototype.isRequired = function(){
    return false;
  };
  FormItem.prototype.disable = function(){
  };
  FormItem.prototype.enable = function(){
  };
  FormItem.prototype.reset = function(){
  };
  FormItem.prototype.updateCounter = function(){
    FormItem.questionnaire.check(this.__parent);
  };
  FormItem.prototype.reportTo = function(answerarry){
  };
  FormItem.produce = function(form,q,questionnaire){
    FormItem.questionnaire = questionnaire;
    var _q,f;
    switch(q.type){
      case 'Question':
        _q = new Question(form,q);
        break;
      case 'Label':
        _q = new Label(form,q);
        break;
      case 'Image':
        f = questionnaire.imageFiles.getNext(form);
        if (!!f){
          _q = new Image(form,q,f);
        }
        break;
      case 'Video':
        f = questionnaire.videoFiles.getNext(form);
        if (!!f){
          _q = new Video(form,q,f);
        }
    }
    return _q;
  };

  function Label(parnt,q){
    FormItem.call(this,parnt,q);
    this.label = q.label;
  }
  inherit(Label,FormItem);
  Label.isValid = function(){
    return ('string' === typeof this.label && this.label.length>0);
  };
  Label.prototype.destroy = function(){
    this.label = null;
    FormItem.prototype.destroy.call(this);
  };

  function Disablable(parnt,q){
    FormItem.call(this,parnt,q);
    this.disabled = new NullableProperty(false,true);
  }
  inherit(Disablable,FormItem);
  Disablable.prototype.destroy = function(){
    this.disabled.destroy();
    this.disabled = null;
    FormItem.prototype.destroy.call(this);
  };
  Disablable.prototype.isObligatory = function(){
    return !this.disabled.value;
  };
  Disablable.prototype.reset = function(){
    this.disabled.set(false);
  };
  Disablable.prototype.enable = function(){
    this.disabled.enable();
  };
  Disablable.prototype.disable = function(){
    this.disabled.disable();
  };

  function Question(parnt,q){
    Disablable.call(this,parnt,q);
    this.title = q.title;
    this.required = new NullableProperty(q.required,false);
    this.kind = q.kind;
    this.content = q.content;
    this.conditional = q.conditional;
    this.answer = new NullableProperty('','');
    this.isToggled = false;
    this.answeredIndicator = 1;
    this.conditionalValueActive = false;
  }
  inherit(Question,Disablable);
  Question.prototype.destroy = function(){
    this.conditionalValueActive = null;
    this.answeredIndicator = null;
    this.isToggled = null;
    this.answer.destroy();
    this.answer = null;
    this.conditional = null;
    this.content = null;
    this.kind = null;
    this.required = null;
    this.title = null;
    Disablable.prototype.destroy.call(this);
  };
  Question.prototype.updateCounter = function(){
    if(this.answeredIndicator===1 && this.required.value){
      this.__parent.updateCounter();
    }
    this.answeredIndicator = 0;
    this.isToggled = !this.isToggled;
    if (this.conditional.kind === 'form'){
      if (this.conditional.value === this.answer.value){
        FormItem.questionnaire.freezeFrame();
        this.__parent.disable(this);
      }else{
        if (this.conditionalValueActive){
          FormItem.questionnaire.unfreezeFrame();
          this.__parent.enable(this);
        }
      }
    }
    if (this.conditional.kind === 'questionnaire'){
      if (this.conditional.value === this.answer.value){
        FormItem.questionnaire.freezeFrame();
        FormItem.questionnaire.disableAllForms(this);
      }else if (this.conditionalValueActive){
        FormItem.questionnaire.unfreezeFrame();
        FormItem.questionnaire.enableAllForms(this);
      }
    }
    FormItem.prototype.updateCounter.call(this);
  };
  Question.prototype.isObligatory = function(){
    return Disablable.prototype.isObligatory.call(this) && this.required.value;
  };
  Question.prototype.isRequired = function(){
    return this.required.value;
  };
  Question.prototype.reset = function(){
    this.answer.set('');
    this.originalAnswer = '';
    this.isToggled = false;
    this.answeredIndicator = 1;
    this.required.reset();
    Disablable.prototype.reset.call(this);
  };
  Question.prototype.disable = function(question){
    if(this._id !== question._id){
      this.required.disable();
      Disablable.prototype.disable.call(this);
      this.answer.disable();
    }else{
      question.conditionalValueActive = true;
    }
  };
  Question.prototype.enable = function(question){
    if(this._id !== question._id){
      this.required.enable();
      Disablable.prototype.enable.call(this);
      this.answer.enable();
    }else{
      question.conditionalValueActive = false;
    }
  };
  Question.prototype.reportTo = function(answerarry){
    answerarry.push({ title: this.title, answer: this.answer.value});
  };

  function Media(parnt,q,mediafile){
    Disablable.call(this,parnt,q);
    this.src = mediafile ? mediafile.src : null;
    this.fileType = mediafile ? mediafile.fileType : null;
    this.answeredIndicator = 1;
  }
  inherit(Media,Disablable);
  Media.prototype.destroy = function(){
    this.fileType = null;
    this.src = null;
    Disablable.prototype.destroy.call(this);
  };
  Media.prototype.updateCounter = function(){
    if(this.answeredIndicator===1){
      this.__parent.updateCounter();
    }
    this.answeredIndicator = 0;
    FormItem.prototype.updateCounter.call(this);
  };
  Media.prototype.isValid = function(){
    if('undefined' === typeof this.src){
      return false;
    }
    if(this.src === '' || this.src === 'undefined'){
      return false;
    }
    return true;
  };
  Media.prototype.isRequired = function(){
    return true;
  };
  Media.prototype.reset = function(){
    this.answeredIndicator = 1;
    Disablable.prototype.reset.call(this);
  };

  //academic purity
  function Image(parnt,q,mediafile){
    Media.call(this,parnt,q,mediafile);
  }
  inherit(Image,Media);

  function Video(parnt,q,mediafile){
    Media.call(this,parnt,q,mediafile);
    this.fullSrc = mediafile.fullSrc();
  }
  inherit(Video,Media);
  Video.prototype.destroy = function(){
    this.fullSrc = null;
    Media.prototype.destroy.call(this);
  };

  function Form(formdesc,questionnaire){
    this.__parent = questionnaire;
    this.questionsCounter = new NullableNumber(0,0);
    this._id = formdesc._id;
    this.title = formdesc.title;
    this.questions = [];
    for(var i in formdesc.content){
      //var q = new Question(content[i]);
      var q = FormItem.produce(this,formdesc.content[i],questionnaire);
      if (!q){
        continue;
      }
      if (!q.isValid()){
        q.destroy();
        continue;
      }
      this.questions.push(q);
    }
    this.reset();
  }
  Form.prototype.destroy = function(){
    var q;
    while(this.questions.length){
      q = this.questions.shift();
      q.destroy();
    }
    this.questions = null;
    this.title = null;
    this._id =null;
    this.questionsCounter.destroy();
    this.questionsCounter = null;
    this.__parent = null;
  };
  Form.prototype.updateCounter = function(){
    this.questionsCounter.dec();
  };
  Form.prototype.isObligatory = function(){
    for(var i in this.questions){
      if(this.questions[i].isObligatory()){
        return true;
      }
    }
  };
  Form.prototype.reset = function(){
    var q;
    this.questionsCounter.set(0);
    for(var i = 0; i<this.questions.length; i++){
      q = this.questions[i];
      q.reset();
      if(q.isRequired()){
        this.questionsCounter.inc();
      }
    }
  };
  Form.prototype.disable = function(question){
    for (var i=0; i<this.questions.length; i++){
      this.questions[i].disable(question);
    }
    this.questionsCounter.disable();
  };
  Form.prototype.enable = function(question){
    for (var i=0; i<this.questions.length; i++){
      this.questions[i].enable(question);
    }
    this.questionsCounter.enable();
  };
  Form.prototype.reportAnswers = function(answerarry){
    for (var i=0; i<this.questions.length; i++){
      this.questions[i].reportTo(answerarry);
    }
  };

  function MediaFile(mediafilestring){
    var mfsa = mediafilestring.split(' ');
    this.src = mfsa[0];
    this.fileType = mfsa[1];
    this.targetFormId = mfsa[2];
  }
  MediaFile.prototype.destroy = function(){
    this.src = null;
    this.fileType = null;
    this.targetFormId = null;
  };
  MediaFile.prototype.fullSrc = function(){
    return '/packages/system/public/media/' + this.src;
  };

  function FileStore(files){
    this.files = [];
    while(files.length){
      this.files.push(new MediaFile(files.shift()));
    }
  }
  FileStore.prototype.destroy = function(){
    while(this.files.length()){
      this.files.shift().destroy();
    }
  };
  FileStore.prototype.getNext = function(form){
    if(this.files[0].targetFormId===form._id){
      return this.files.shift();
    }
    return null;
  };

  function QuestionnaireHandler(scope,questionnaire){
    this.scope = scope;
    this._id = questionnaire._id;
    this.language = questionnaire.language;
    this.q = questionnaire;
    this.forms = [];
    this.savedForms = null;
    this.savedCompletedPercent = null;
    this.savedCompletedPercentStyle = null;
    this.savedShowSubmit = null;
    this.imageFiles = new FileStore(questionnaire.imageFiles);
    this.videoFiles = new FileStore(questionnaire.videoFiles);
    this.imageCounter = 0;
    this.videoCounter = 0;
    for (var i=0; i<this.q.content.length; i++){
      this.forms.push(new Form(this.q.content[i],this));
    }
    this.backgroundImage = this.q.backgroundImage;
    this.init();
    this.q = null;
  }
  QuestionnaireHandler.prototype.destroy = function(){
    this.videoCounter = null;
    this.imageCounter = null;
    this.videoFiles.destroy();
    this.videoFiles = null;
    this.imageFiles.destroy();
    this.imageFiles = null;
    this.savedShowSubmit = null;
    this.savedCompletedPercentStyle = null;
    this.savedCompletedPercent = null;
    this.savedForms = null;
    while(this.forms.length){
      this.forms.shift().destroy();
    }
    this.q = null;
    this.scope = null;
  };
  QuestionnaireHandler.prototype.onBackgroundMedia = function(m){
    jQuery('.operater').css('background-image','url(\'' + m + '\')');
  };
  QuestionnaireHandler.prototype.init = function(){
    //Ind showing submit button
    this.scope.showSubmit = false;
    //BACKGROUND LOADER
    if (this.backgroundImage){
      //jQuery('.operater').css('background-image','url(\'' + this.backgroundImage + '\')');
      mediaStorage.load(this.onBackgroundMedia.bind(this),this.backgroundImage);
    }else{
      jQuery('.operater').css('background-image','none');
    }
    //Initializing answers
    //We will load forms one at the time
    //When the operator fill the form, he will get access to the next one and so on...
    this.scope.loadedForms = [];
    this.addToLoadedForms();
    this.scope.slideIndex = 0;
    window.scrollTo(0,0);
    getPollForSending();
  };
  QuestionnaireHandler.prototype.reset = function(){
    for(var i = 0; i< this.forms.length; i++){
      this.forms[i].reset();
    }
    this.init();
  };
  QuestionnaireHandler.prototype.applyResetOnScope = function(){
    this.scope.$apply(this.reset.bind(this));
  };
  QuestionnaireHandler.prototype.freezeFrame = function(){
    this.savedForms = this.scope.loadedForms.slice();
    this.savedCompletedPercent = this.scope.completedPercent;
    this.savedCompletedPercentStyle = this.scope.completedPercentStyle;
    this.savedShowSubmit = this.scope.showSubmit;
  };
  QuestionnaireHandler.prototype.unfreezeFrame = function(){
    if(!this.savedForms){
      return;
    }
    this.scope.loadedForms = this.savedForms;
    this.savedForms = null;
    this.scope.completedPercent = this.savedCompletedPercent;
    this.savedCompletedPercent = null;
    this.scope.completedPercentStyle = this.savedCompletedPercentStyle;
    this.savedCompletedPercentStyle = null;
    this.scope.showSubmit = this.savedShowSubmit;
    this.savedShowSubmit = null;
  };
  QuestionnaireHandler.prototype.enableAllForms = function(question){
    for (var i=0; i<this.forms.length; i++){
      this.forms[i].enable(question);
    }
  };
  QuestionnaireHandler.prototype.disableAllForms = function(question){
    for (var i=0; i<this.forms.length; i++){
      this.forms[i].disable(question);
    }
  };
  QuestionnaireHandler.prototype.check = function(form){
    if(form.questionsCounter.value===0 && form._id===this.scope.loadedForms[this.scope.loadedForms.length-1]._id){
      this.addToLoadedForms();
    }
  };
  //Helper function for adding new form to loadedForms
  QuestionnaireHandler.prototype.addToLoadedForms = function(){
    var numberOfLoadedForms = this.scope.loadedForms.length;
    this.scope.completedPercent = parseFloat((this.scope.loadedForms.length)*100/this.forms.length).toFixed(1);
    if(parseInt(this.scope.completedPercent)){
      this.scope.completedPercentStyle = {width: this.scope.completedPercent+'%'};
    }else{
      this.scope.completedPercentStyle = {width: '30px'};
    }
    if (numberOfLoadedForms === this.forms.length){
      this.scope.showSubmit = true;
    }else{
      var newForm = this.forms[numberOfLoadedForms];
      this.scope.loadedForms.push(newForm);
      if(!newForm.isObligatory()){
        this.addToLoadedForms();
      }
    }
  };
  QuestionnaireHandler.prototype.save = function(){
    var title_answer_array = [];
    for (var i=0; i<this.forms.length; i++){
      this.forms[i].reportAnswers(title_answer_array);
    }
    this.geoLocatePoll(title_answer_array);/*);*/
  };
  QuestionnaireHandler.prototype.geoLocatePoll = function(answers){
    navigator.geolocation.getCurrentPosition(this.saveToClientStorage.bind(this,answers),function(positionError){
      var $scope = this.scope;
      //PERMISSION DENIED
      if (positionError.code === 1){ 
        $scope.$apply(function(){
          $scope.permissionDenied = 'You cannot submit because you denied to share your location privacy. Please enable location privacy and RELOAD page.';
        });
      }else{
        $scope.permissionDenied= '';
      }
      //POSITION UNAVAILABLE
      if (positionError.code === 2){ 
        $scope.$apply(function(){
          $scope.positionUnavailable= 'Your position cannot be determined. Network is down or the positioning satelites cannot be contacted.';
        });
      }else{
        $scope.positionUnavailable= '';
      }
      //TIMEOUT
      if (positionError.code === 3){ 
        $scope.$apply(function(){
          $scope.timeoutExpired= 'Timeout expired.';
        });
      }else{
        $scope.timeoutExpired= '';
      }
      $scope.locationError = positionError.message;
    },{maximumAge:600000, timeout:5000, enableHighAccuracy : true});
  };
  QuestionnaireHandler.prototype.saveToClientStorage = function(answers,lokation){
    clientStorage.save('results',(new Date()).getTime()+'',{
      answers : answers,
      questionnaire : this._id,
      questionnaireLanguage : this.language,
      geoLocation: {'type':'Point',coordinates:[lokation.coords.longitude,lokation.coords.latitude]}
    },this.applyResetOnScope.bind(this));
  };

  function onSave(scope,questionnairedesc){
    scope.$apply(function(){
      scope.questionnaire = new QuestionnaireHandler(scope,questionnairedesc);
    });
  }
  QuestionnaireHandler.produce = function(scope,questionnairedesc){
    var qd = questionnairedesc; //should trim it down to information
    console.log('pre save',qd);
    clientStorage.save('global','questionnaire',JSON.stringify(qd),onSave.bind(null,scope,questionnairedesc));
  };
  return QuestionnaireHandler;
}]);

