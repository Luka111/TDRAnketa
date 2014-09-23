'use strict';

angular.module('mean.system').provider('clientStorage',function(){
  var __instance;
  this.$get = [function(){return __instance;}];
  function inherit(child,parnt){
    child.prototype = Object.create(parnt.prototype,{constructor:{
      value: child,
      enumerable: false,
      configurable: false,
      writable: false
    }});
  }

  function StorageBase(){
  }
  StorageBase.prototype.save = function(category,key,value){
    throw 'Storage Base has no implementation for save';
  };
  StorageBase.prototype.get = function(category,key){
    throw 'Storage Base has no implementation for get';
  };
  StorageBase.prototype.remove = function(category,key){
    throw 'Storage Base has no implementation for remove';
  };
  StorageBase.prototype.__internalIterate = function(category,cb){
    throw 'Storage Base has no implementation for iterate';
  };
  StorageBase.prototype.__onInternalIterateForExternalIterate = function(cb,category,key){
    cb(key,this.get(category,key));
  };
  StorageBase.prototype.iterate = function(category,cb){
    this.__internalIterate(category,this.__onInternalIterateForExternalIterate.bind(this,cb,category));
  };
  StorageBase.prototype.purge = function(category){
    this.iterate(category,this.remove.bind(this,category));
  };

  function LocalStorage(){
  }
  inherit(LocalStorage,StorageBase);
  LocalStorage.prototype.save = function(category,key,value){
    localStorage.setItem(category+':'+key,JSON.stringify(value));
  };
  LocalStorage.prototype.get = function(category,key){
    return JSON.parse(localStorage.getItem(category+':'+key));
  };
  LocalStorage.prototype.remove = function(category,key){
    localStorage.removeItem(category+':'+key);
  };
  LocalStorage.prototype.__internalIterate = function(category,cb){
    for(var i in localStorage){
      var realkey = this.keyFromCategoryAndKey(category,i);
      if(realkey){
        cb(realkey);
      }
    }
  };
  LocalStorage.prototype.keyIsOfCategory = function(key,category){
    return key.indexOf(category+':')===0;
  };
  LocalStorage.prototype.keyFromCategoryAndKey = function(category,key){
    if(!this.keyIsOfCategory(key,category)){
      return;
    }
    return key.substring(category.length+1);
  };

  function IndexedDB(){
    this.categories = [];
    this.dbWaiters = [];
    this.db = null;
    this.reOpen();
    StorageBase.call(this);
  }
  IndexedDB.dbVersion=0;
  inherit(IndexedDB,StorageBase);
  IndexedDB.prototype.save = function(category,key,value){
    this.checkCategory(category,this.realSave.bind(this,category,key,value));
  };
  IndexedDB.prototype.reOpen = function(){
    if(this.db){
      this.db.close();
      this.db = null;
    }
    var request = window.indexedDB.open('HERS',IndexedDB.dbVersion+1);
    request.onupgradeneeded = this.onDBupgradeneeded.bind(this);
    request.onsuccess = this.onDBOpen.bind(this);
    request.onerror = this.onDBOpenError.bind(this);
  };
  IndexedDB.prototype.onDBupgradeneeded = function(e){
    var db = e.target.result, cat;
    while(this.categories.length){
      cat = this.categories.shift();
      if(!db.objectStoreNames.contains(cat)){
        db.createObjectStore(cat,{keyPath:'key'});
      }
    }
  };
  IndexedDB.prototype.onDBOpen = function(e){
    this.db = e.target.result;
    IndexedDB.dbVersion = this.db.version;
    console.log('db opened with',IndexedDB.dbVersion);
    while(this.dbWaiters.length){
      (this.dbWaiters.shift())();
    }
  };
  IndexedDB.prototype.onDBOpenError = function(e){
    console.log(e.target.error);
    if(e.target.error.name==='VersionError'){
      IndexedDB.dbVersion++;
      this.reOpen();
    }
  };
  IndexedDB.prototype.checkCategory = function(category,cb){
    if(!this.db){
      this.dbWaiters.push(this.checkCategory.bind(this,category,cb));
      return;
    }
    if(this.db.objectStoreNames.contains(category)){
      cb();
    }else{
      this.categories.push(category);
      this.dbWaiters.push(this.checkCategory.bind(this,category,cb));
      this.reOpen();
    }
  };
  IndexedDB.prototype.realSave = function(category,key,value){
    var trans = this.db.transaction([category],'readwrite');
    var store = trans.objectStore(category);
    var request = store.put({key:key,value:value});
    console.log('realSave request',request);
    //trans.oncomplete = function(e){...}
    //request.onerror = function(e){...}
  };
  IndexedDB.prototype.iterate = function(category,cb){
    this.checkCategory(category,this.realIterate.bind(this,category,cb));
  };
  IndexedDB.prototype.realIterate = function(category,cb){
    var trans = this.db.transaction([category],'readwrite');
    var store = trans.objectStore(category);
    var range = IDBKeyRange.lowerBound(0);
    var cursor = store.openCursor(range);
    cursor.onsuccess = this.onIterate.bind(this,cb);
  };
  IndexedDB.prototype.onIterate = function(cb,e){
    var result = e.target.result;
    console.log('iterateResult',result);
    if(result && result.value){
      cb(result.value.key,result.value.value);
    }
  };


  function WebSQL(){
    StorageBase.call(this);
    this.db = openDatabase('HERS','1.0','HERS database',50*1024*1024,this.onDBOpen.bind(this));
  }
  inherit(WebSQL,StorageBase);
  WebSQL.prototype.onDBOpen = function(db){
    console.log('WebSQL opened',arguments);
    this.db = db;
  };
  WebSQL.prototype.save = function(category,key,value){
    this.db.transaction(this.txCheckCategoryForSave.bind(this,category,key,value));
  };
  WebSQL.prototype.txCheckCategoryForSave = function(category,key,value,tx){
    tx.executeSql('CREATE TABLE IF NOT EXISTS '+category+' (key unique,value)',[],this.realSave.bind(this,category,key,value),null);
  };
  WebSQL.prototype.realSave = function(category,key,value,tx){
    console.log('INSERT INTO',category);
    tx.executeSql('INSERT INTO '+category+' (key,value) VALUES (?,?)',[key,JSON.stringify(value)],this.onSave.bind(this),null);
  };
  WebSQL.prototype.onSave = function(tx,result){
    console.log('onSave',tx,result);
  };
  WebSQL.prototype.iterate = function(category,cb){
    this.db.transaction(this.txIterate.bind(this,category,cb));
  };
  WebSQL.prototype.txIterate = function(category,cb,tx){
    tx.executeSql('SELECT * FROM '+category,[], this.realIterate.bind(this,cb),null);
  };
  WebSQL.prototype.realIterate = function(cb,tx,result){
    if(!(result && result.rows)){
      return;
    }
    var r = result.rows, l = r.length, item;
    for(var i=0; i<l; i++){
      item = r.item(i);
      cb(item.key,JSON.parse(item.value));
    }
  };



  var enginesToTry = {
    indexedDB:IndexedDB,
    openDatabase:WebSQL,
    localStorage:LocalStorage
  };
  for(var i in enginesToTry){
    if(typeof window[i] !== 'undefined'){
      __instance = new (enginesToTry[i])();
      return;
    }
  }
  console.log(this);
  //return __instance;
});
