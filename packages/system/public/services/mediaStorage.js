'use strict';

function MediaStorage(clientStorage,$http){
  this.cs = clientStorage;
  this.transfer = $http;
  this.cs.iterate('media',this.loadBlob.bind(this));
  console.log('class store',MediaStorage.store);
}
MediaStorage.store = {};
MediaStorage.prototype.load = function(mediaelementid,mediaurl){
  var m = MediaStorage.store[mediaurl];
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
  this.transfer.get(mediaurl,{responseType:'blob'}).success(this.onURLLoaded.bind(this,mediaurl,cb));
};
MediaStorage.prototype.onURLLoaded = function(mediaurl,cb,data){
  //console.log('got data',data);
  var urlobj = URL.createObjectURL(data);
  MediaStorage.store[mediaurl] = urlobj;
  cb(urlobj);
  this.saveBlob(mediaurl,data);
  data = null;
};
MediaStorage.prototype.saveBlob = function(id,blob){
  var fr = new FileReader();
  fr.onload = this.onFileReadToBinary.bind(this,id,fr,blob.type);
  fr.readAsBinaryString(blob);
};
MediaStorage.prototype.onFileReadToBinary = function(id,filereader,type){
  try{
    var bd = btoa(filereader.result);
    //alert(bd.length);
    filereader = null;
    this.cs.save('media',id,{type:type,data:bd});
  }
  catch(e){
    alert(e);
  }
};
MediaStorage.prototype.loadBlob = function(key,media){
  try{
    var bytestring = atob(media.data);
    media.data = null;
    var uint8bytes = [];//new Array(bytestring.length);
    while(bytestring.length){
      uint8bytes.push(bytestring.charCodeAt(0));
      bytestring = bytestring.substring(1);
    }
    var byteArray = new Uint8Array(uint8bytes);
    uint8bytes = null;
    var blob = new Blob([byteArray],media);
    var urlobj = URL.createObjectURL(blob);
    MediaStorage.store[key] = urlobj;
  }
  catch(e){
    console.log(e.stack);
    console.log(e);
    //alert(e);
    return;
  }
};
MediaStorage.prototype.purge = function(){
  MediaStorage.store = {};
  //Nismo zavrsili
  this.cs.purge('media');
};
angular.module('mean.system').service('mediaStorage',['clientStorage','$http',MediaStorage]);
