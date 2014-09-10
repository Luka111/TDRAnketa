'use strict';

module.exports = function(System, app, auth, database) {

  // Home route
  var index = require('../controllers/index');
  app.route('/')
    .get(index.render);

    /*
  app.get('/webapp.manifest',function(req,res){
    res.status(404).send('Not found');
      res.header('Content-Type', 'text/cache-manifest');
      var string = 'CACHE MANIFEST\n';
      string += '/polls/assets/css/polls.css\n';
      string += '/system/translation/translations.js\n';
      string += '/system/views/header.html\n';
      string += '/system/views/index.html\n';
      string += '/admin/menu\n';
      string += '/system/views/admin-header.html\n';
      //string += 'lib/casino/skins/mobile/casinolobby.svg \n';
      //string += 'lib/casino/skins/mobile/pokerroom.svg \n';
      string += 'NETWORK: \n';
      string += '/ \n';
      string += 'http://fonts.googleapi.com/\n';
      string += '*\n';
      string += (new Date()).getTime()+'\n';
      res.end(string);
  });
      */

};
