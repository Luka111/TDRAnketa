'use strict';

// Requires meanio
var mean = require('meanio');

// Creates and serves mean application
mean.serve({
    webapp : {
      route : '/webapp.manifest',
      cb : function(req,res){
        res.header('Content-Type', 'text/cache-manifest');
        var string = 'CACHE MANIFEST\n';
        string += '/polls/assets/css/polls.css\n';
        string += '/system/translation/translations.js\n';
        string += '/system/views/header.html\n';
        string += '/system/views/index.html\n';
        string += '/admin/menu\n';
        string += '/system/views/admin-header.html\n';
        string += 'NETWORK: \n';
        string += '/ \n';
        string += 'http://fonts.googleapi.com/\n';
        string += '*\n';
        string += (new Date()).getTime()+'\n';
        res.end(string);
      }
    }
  }, function(app, config) {
  console.log('Mean app started on port ' + config.port + ' (' + process.env.NODE_ENV + ')');
});
