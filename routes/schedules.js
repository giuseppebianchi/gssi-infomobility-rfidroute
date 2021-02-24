var express = require('express');
var session = require("express-session");
var router = express.Router();
const cors = require("cors");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Op } = require("sequelize");
const Schedule = require("../models/Schedule")

router.use(cors())

const { checkAlreadyAuthenticated, checkAdmin, checkAjaxAdmin, checkLoggedUser, checkAjaxLoggedUser } = require('../functions/checkers.js')
const { check, param, query, validationResult } = require('express-validator');

const special_character = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

/* GET users listing. */

router.get('/', checkLoggedUser, function(req, res) {
    //check logged user
    //res.json(req.session)
    Schedule.findAll()
        .then(schedules => {
            res.render('schedules', { title: "Servizi", loggedUser: req.session.logged_user, schedules_list: schedules});
        })
        .catch( (e) => {
            res.send("Errore Schedules");
        })
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

router.get('/active/:id', checkAjaxLoggedUser, [
    check('id').notEmpty()
], function(req, res, next) {
    //check logged user
    //debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }


    Schedule.update({
        schedule_active: 0
    }, {
        where: { },
        returning: true,
        plain: true
    }).then((rows) => {
        //debugger;
        Schedule.update({
            schedule_active: 1
        }, {
            where: { schedule_id: req.params.id },
            returning: true,
            plain: true
        }).then((rows) => {
            //debugger;
            //response to admin
            res.status(200).json({editing: true, result: rows})
        }).catch(err => {
            //debugger;
            console.log(err)
            res.status(500).json({error_name: "Errore durante l'update del servizio: ", err: err})
        })
    }).catch(err => {
        //debugger;
        console.log(err)
        res.status(500).json({error_name: "Errore durante l'update del servizio: ", err: err})
    })
    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/delete/:id', checkAjaxAdmin, [
    check('id').notEmpty().isLength({ max: 45 })
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    Schedule.destroy({
        where: {
            schedule_id: req.params.id
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
