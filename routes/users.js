var express = require('express');
var session = require("express-session");
var router = express.Router();
const cors = require("cors");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Op } = require("sequelize");
const User = require("../models/User")

router.use(cors())

const { checkAlreadyAuthenticated, checkAdmin, checkAjaxAdmin, checkLoggedUser } = require('../functions/checkers.js')
const { check, param, query, validationResult } = require('express-validator');

const special_character = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

/* GET users listing. */

router.get('/', checkLoggedUser, function(req, res) {
  //check logged user
  //res.json(req.session)
  User.findAll()
  .then(users => {
    res.render('users', { title: "Utenti - Infomobilità L'Aquila", loggedUser: req.session.logged_user, users_list: users});
  })
  .catch( () => {
    res.send("errore users");
  })
});


router.get('/logout', checkLoggedUser, function(req, res) {
  //check logged user
  req.session.destroy(function (err) {

  })
  res.redirect(process.env.BASEPATH);
  //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/login', checkAlreadyAuthenticated, [
  check('username').notEmpty(),
  check('password').notEmpty()
], function(req, res, next) {
  //Check if user is already logged for redirection

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    return res.status(422).json({ errors: validation_errors.array() });
  }
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(async user => {
    if(user){
      try {
        if (await bcrypt.compare(req.body.password, user.password)) {
          //create session
          req.session.logged_user = user.dataValues;
          if(req.body.keep_session){
            req.session.cookie.maxAge = null;
          }
          res.redirect(process.env.BASEPATH + "dashboard");
        } else {
          res.status(400).json({error_name: "Password errata"})
        }
      }catch (err){
        res.status(500).json({error_name: "Qualcosa è andato storto", err: err})
      }
    }else{
      res.status(400).json({error_name: "Username errato"})
    }
  }).catch((err) => {

  })
  //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/register', checkAjaxAdmin, [
  check('username').notEmpty().isLength({ min: 5 , max: 45}).withMessage("L'username deve essere lunga almeno 5 caratteri e max 45."),
  check('email').notEmpty().isLength({ max: 45 }).normalizeEmail().isEmail(),
  check('password').notEmpty().isLength({ min: 8 , max: 45}).withMessage("La password deve essere lunga ameno 8 caratteri e includere un carattere minuscolo, un carattere maiuscolo, un numero, e un carattere speciale.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i").withMessage("La password deve essere lunga ameno 8 caratteri e includere un carattere minuscolo, un carattere maiuscolo, un numero, e un carattere speciale."),
  check('first_name').isLength({ max: 45 }),
  check('last_name').isLength({ max: 45 }),
  check('role').isInt({min: 1, max: 2})
],function(req, res, next) {
  //check logged user

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    return res.status(422).json({ errors: validation_errors.array() });
  }

  const new_user = {
    username: req.body.username.toLowerCase(),
    password: "",
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    created: new Date(),
    role: req.body.role
  }

  User.findOne({
    where: {
      [Op.or]: [
        { username: req.body.username },
        { email: new_user.email }
      ]
    }
  }).then(async result => {
    if(!result) {
      //l'username è disponibile quindi si procede a registrare la password
      try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        new_user.password = hashedPassword;
        User.create(new_user)
            .then(result => {
              //response to admin
              let data = result.dataValues;
              data.formatted_created = moment(data.created).format("DD/MM/YYYY, H:mm")
              res.status(200).json(data)
            })
            .catch(err => {
              console.log(err)
              res.status(500).json({error_name: "Errore durante registrazione: " + err})
            })
      } catch (err){
        console.log(err)
        res.status(500).json({error_name: "Errore durante registrazione: " + err})
      }
    }else{
      res.json({error_name: "Username o email già esistente"})
    }
  }).catch(err => {
      res.json({error_name: "Errore Connessione Database: " + err})
  })

  //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.get('/check/:p', checkAjaxAdmin, [
  param('p').notEmpty(),
  query('q').notEmpty().isLength({ max: 45 }).withMessage("Max 45 caratteri")
], function(req, res, next) {
  //check logged user
  //debugger;
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    return res.status(422).json({ validation_errors: true, errors: validation_errors.array() });
  }

  let options = {
    where: {}
  }

  if(req.params.p == "email" || req.params.p == "username"){
    options.where[req.params.p] = req.query.q;
  }else{
    res.status(422).json({error_name: "Parametri non validi"})
  }

  User.findOne(options).then(result => {
    if(result) {
      res.status(200).json({msg: " già presente nel sistema.", result: true})
    }else{
      //l'rfid è disponibile
      res.status(200).json({msg: "Disponibile", result: false})
    }
  }).catch(err => {
    res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
  })
  //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/update', checkAjaxAdmin, [
  check('username').notEmpty().isLength({ max: 45 }),
  check('email').isLength({ max: 45 }),
  check('password').isLength({ max: 45 }),
  check("first_name").isLength({ max: 45 }),
  check("last_name").isLength({ max: 45 })
], function(req, res, next) {
  //check logged user
  //debugger;
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    return res.status(422).json({ errors: validation_errors.array() });
  }

  let new_values = {}
  let editing = false;

  if(req.body.email){
    editing = true;
    new_values.email = req.body.email
  }
  if(req.body.password != ""){
    editing = true;
    //new_values.password = req.body.password
  }
  if(req.body.first_name){
    editing = true;
    new_values.first_name = req.body.first_name
  }
  if(req.body.last_name){
    editing = true;
    new_values.last_name = req.body.last_name
  }
  if(req.body.role){
    editing = true;
    new_values.role = req.body.role
  }

  if(!editing){
    return res.status(200).json({ editing: false, msg: "Nessuna modifica richiesta" }); //editing means no changes
  }

  if(req.body.password != ""){
    //check password
    try{
      bcrypt.hash(req.body.password, 10, (pass) => {
        new_values.password = pass;
        User.update(new_values, {
          where: { username: req.body.username },
          returning: true,
          plain: true
        }).then((rows) => {
          //debugger;
          //response to admin
          res.status(200).json({editing: true, result: rows})
        }).catch(err => {
          //debugger;
          console.log(err)
          res.status(500).json({error_name: "Errore durante l'update dell'utente: ", err: err})
        })
      })
    } catch (err){
      console.log(err)
      res.status(500).json({error_name: "Errore durante l'update della password: " + err})
    }
  }else{
    User.update(new_values, {
      where: { username: req.body.username },
      returning: true,
      plain: true
    }).then((rows) => {
      //debugger;
      //response to admin
      res.status(200).json({editing: true, result: rows})
    }).catch(err => {
      //debugger;
      console.log(err)
      res.status(500).json({error_name: "Errore durante l'update dell'utente: ", err: err})
    })
  }
  //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/delete', checkAjaxAdmin, [
  check('username').notEmpty().isLength({ max: 45 })
], function(req, res, next) {
  //check logged user

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    return res.status(422).json({ errors: validation_errors.array() });
  }

  User.destroy({
    where: {
      username: req.body.username
    }
  }).then(result => {
    //debugger;
    if(result) {
      res.status(200).json({msg: "Rimosso Correttamente", delete: true})
    }else{
      res.status(200).json({msg: "RFID non trovato.", delete: false})
    }
  }).catch(err => {
    //debugger;
    res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
  })

  //res.render('index', { title: "Infomobilità L'Aquila"});
});

module.exports = router;
