'use strict';

// Requires meanio
var mean = require('meanio');

// Creates and serves mean application
mean.serve({
    webapp : {
      route : '/webapp.manifest',
      cb : function(req,res){
        res.status(404).send('FU');
        return;
        res.header('Content-Type', 'text/cache-manifest');
        var string = 'CACHE MANIFEST\n';
        string += '/polls/assets/css/polls.css\n';
        string += '/system/translation/translations.js\n';
        string += '/system/views/header.html\n';
        string += '/system/views/admin-header.html\n';
        string += '/system/views/operater-header.html\n';
        string += '/system/views/index.html\n';
        string += '/system/views/non-auth-index.html\n';
        string += '/forms/views/create.html\n';
        string += '/forms/views/edit.html\n';
        string += '/forms/views/list.html\n';
        string += '/forms/views/view.html\n';
        string += '/questions/views/create.html\n';
        string += '/questions/views/create-label.html\n';
        string += '/questions/views/create-question.html\n';
        string += '/questions/views/edit.html\n';
        string += '/questions/views/edit-label.html\n';
        string += '/questions/views/edit-question.html\n';
        string += '/questions/views/list.html\n';
        string += '/questions/views/view.html\n';
        string += '/questionnaires/views/create.html\n';
        string += '/questionnaires/views/edit.html\n';
        string += '/questionnaires/views/list.html\n';
        string += '/questionnaires/views/view.html\n';
        string += '/users/views/admin-list.html\n';
        string += '/users/views/edit.html\n';
        string += '/users/views/forgot-password.html\n';
        string += '/users/views/index.html\n';
        string += '/users/views/list.html\n';
        string += '/users/views/login.html\n';
        string += '/users/views/manager-list.html\n';
        string += '/users/views/register.html\n';
        string += '/users/views/reset-password.html\n';
        string += '/users/views/supervisor-list.html\n';
        string += '/users/views/view.html\n';
        string += '/polls/views/active.html\n';
        string += '/polls/views/admin-by-country.html\n';
        string += '/polls/views/admin-by-country-questionnaire.html\n';
        string += '/polls/views/admin-by-country-user.html\n';
        string += '/polls/views/admin-by-country-user-questionnaire.html\n';
        string += '/polls/views/admin-list.html\n';
        string += '/polls/views/by-country.html\n';
        string += '/polls/views/by-country-questionnaire.html\n';
        string += '/polls/views/by-country-user.html\n';
        string += '/polls/views/by-country-user-questionnaire.html\n';
        string += '/polls/views/create.html\n';
        string += '/polls/views/edit.html\n';
        string += '/polls/views/index.html\n';
        string += '/polls/views/list.html\n';
        string += '/polls/views/location-by-user.html\n';
        string += '/polls/views/manager-by-country-user.html\n';
        string += '/polls/views/manager-by-country-user-questionnaire.html\n';
        string += '/polls/views/manager-by-country-questionnaire.html\n';
        string += '/polls/views/manager-list.html\n';
        string += '/polls/views/operater-list.html\n';
        string += '/polls/views/stats.html\n';
        string += '/polls/views/supervisor-list.html\n';
        string += '/polls/views/supervisor-by-country-user.html\n';
        string += '/polls/views/supervisor-by-country-user-questionnaire.html\n';
        string += '/polls/views/supervisor-by-country-questionnaire.html\n';
        string += '/polls/views/view.html\n';
        string += 'NETWORK: \n';
        string += '/ \n';
        string += '*\n';
        string += (new Date()).getTime()+'\n';
        res.end(string);
      }
    }
  }, function(app, config) {
  console.log('Mean app started on port ' + config.port + ' (' + process.env.NODE_ENV + ')');
});
