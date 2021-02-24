var express = require('express');
var session = require("express-session");
var router = express.Router();
const cors = require("cors");
const { Op } = require("sequelize");
const Setting = require("../models/Setting")

router.use(cors())

const { checkAjaxAdmin, checkAdmin } = require('../functions/checkers.js')
const { check, validationResult } = require('express-validator');

const special_character = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

function IsJsonString(text) {
  try {
    JSON.parse(text);
  } catch (e) {
    return false;
  }
  return true;
}

/* GET settings. */

router.get('/', checkAdmin, function(req, res) {
  //check logged user
  //res.json(req.session)
  Setting.findOne({
    where: {
      id_setting: 1
    }
  })
  .then(results => {
    res.render('settings', { title: "Impostazioni - Infomobilità L'Aquila", loggedUser: req.session.logged_user, settings: results.json_settings});
  })
  .catch( () => {
    res.send("errore settings");
  })
});


router.post('/update', checkAjaxAdmin, [
  check('json_settings').notEmpty()
], function(req, res, next) {
  //check logged user
  //debugger;
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    return res.status(422).json({ errors: validation_errors.array() });
  }


  let new_json = {}

  if(req.body.json_settings && IsJsonString(req.body.json_settings)){
    new_json.json_settings = req.body.json_settings
  }else{
    res.status(200).json({error_name: "Valori non validi"})
  }

  Setting.update(new_json, {
    where: { id_setting: 1 },
    returning: true,
    plain: true
  }).then((rows) => {
    //debugger;
    //response to admin
    res.status(200).json({editing: true, result: rows})
  }).catch(err => {
    //debugger;
    console.log(err)
    res.status(500).json({error_name: "Errore durante l'update delle impostazioni: ", err: err})
  })

  //res.render('index', { title: "Infomobilità L'Aquila"});
});

module.exports = router;
