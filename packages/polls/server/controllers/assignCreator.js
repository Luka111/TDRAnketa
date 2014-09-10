'use strict';
/* global db:false, printjson:false, print:false */


function doQuery(collection,q,cb){
  var qr = collection.find(q);
  while(qr.hasNext()){
    cb(qr.next());
  }
}

function doOperaterUser(opid,ou){
  print(opid);
  printjson(ou);
}

function doOperater(op){
  //printjson(db.users.update({_id:{$in:op.operaters}},{$set:{myCreator:op._id}},{upsert:true,multi:true}));
  doQuery(db.users,{_id:{$in:op.operaters}},doOperaterUser.bind(null,op._id));
}

doQuery(db.users,{'operaters.1':{$exists:true}},doOperater);


