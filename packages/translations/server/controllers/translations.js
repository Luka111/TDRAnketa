'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Translation = mongoose.model('Translation');


/**
 * Find translation by id
 */
exports.translation = function(req, res, next, id) {
  Translation.load(id, function(err, translation) {
    if (err) return next(err);
    if (!translation) return next(new Error('Failed to load translation ' + id));
    req.translation = translation;
    next();
  });
};

/**
 * Create an translation
 */
exports.create = function(req, res) {
  var checkingObj = {
      languageId : req.body.languageId,
      original : req.body.original
    };
  //First we check if the translation already exsists
  Translation.findOne(checkingObj, function(err,trans){
    if (err) {
      console.log('Couldnt find translation!');
    }
    if (trans){
      return res.json(500, {
        error: 'Translation already exsists!'
      });
    }else{
      var translation = new Translation(req.body);

      translation.save(function(err) {
        if (err) {
          return res.json(500, {
            error: 'Cannot save the translation'
          });
        }
        res.json(translation);

      });
    }
  });
};

/**
 * Update an translation
 */
exports.update = function(req, res) {
  Translation.findByOriginalAndLang(req.body,function(err, translation){
    if(err){
      return res.json(500, {
        error: 'Cant find translation for update!'
      });
    }
    translation.update({
      translation: req.body.translation
    },function(err,trans){
      if(err){
        return res.json(500, {
          error: 'Cannot update!'
        });
      }
      res.json(translation);
    });
  });
};

/**
 * Delete an translation
 */
exports.destroy = function(req, res) {
  console.log('STIGLO MI JE OVO BRE',req);
  Translation.findByOriginalAndLang(req.body,function(err, translation){
    if(err){
      return res.json(500, {
        error: 'Cant find translation for update!'
      });
    }
    if(!translation){
      return res.json(translation);
    }
    translation.remove(function(err,trans){
      if(err){
        return res.json(500, {
          error: 'Cannot remove!'
        });
      }
      res.json(translation);
    });
  });
};

/**
 * Show an translation
 */
exports.show = function(req, res) {
  res.json(req.translation);
};

/**
 * List of Translations
 */
exports.all = function(req, res) {
  Translation.aggregate({
    $group: {
      _id: '$original',
      translations: { $push: { language : '$languageId', translation : '$translation' } }
    }
  }).exec(function(err, translations) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the translations'
      });
    }
    res.json(translations);

  });
};
