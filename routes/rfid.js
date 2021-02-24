var express = require('express');
var session = require("express-session");
var router = express.Router();
const cors = require("cors");
const bcrypt = require("bcrypt");

const { Op } = require("sequelize");
const User = require("../models/User")
const RfidTrip = require("../models/RfidTrip")
const Shift = require("../models/Shift")
const Schedule = require("../models/Schedule")
const TripShift = require("../models/TripShift")
const RfidShift = require("../models/RfidShift")

var { checkLoggedUser, checkAjaxLoggedUser } = require('../functions/checkers.js');

router.use(cors())

const { check, validationResult } = require('express-validator');

router.get('/tripname', checkLoggedUser, function(req, res, next) {
  //check logged user

  //get rfid_trip data
  RfidTrip.findAll()
      .then(result => {
        res.render('rfid_tripname', { title: "RFID - TRIP NAME",  loggedUser: req.session.logged_user, rfid_list: result});
      }).error(err => {
        console.log(err)
        debugger;
      })


});

router.post('/tripname/create', checkAjaxLoggedUser, [
    check('rfid_code').notEmpty().isLength({ max: 12 }),
    check('trip_name').notEmpty().isLength({ max: 45 }),
    check('route').notEmpty().isLength({ max: 45 }),
    check("pattern_id").notEmpty().isLength({ max: 45 }),
    check("pattern_from").notEmpty().isLength({ max: 100 }),
    check("pattern_to").notEmpty().isLength({ max: 100 }),
    check("pattern_from_stop_id").notEmpty().isLength({ max: 45 }),
    check("pattern_to_stop_id").notEmpty().isLength({ max: 45 }),
    check("autobus").isLength({ max: 45 })
], function(req, res, next) {
    //check logged user
    debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    const new_rfid = {
        rfid_code: req.body.rfid_code,
        bus: req.body.autobus,
        route: req.body.route,
        pattern_id: req.body.pattern_id,
        pattern_desc: "Da " + req.body.pattern_from + " - A " + req.body.pattern_to,
        from: req.body.pattern_from,
        to: req.body.pattern_to,
        from_stop_id: req.body.pattern_from_stop_id,
        to_stop_id: req.body.pattern_to_stop_id,
        trip_name: req.body.trip_name,
        created: new Date()
    }

    RfidTrip.findOne({
        where: {
            rfid_code: req.body.rfid_code
        }
    }).then(async result => {
        if(!result) {
            //l'rfid è disponibile quindi si procede a registrare l'associazione con la trip
            try{
                RfidTrip.create(new_rfid)
                    .then(result => {
                        //response to admin
                        res.status(200).json(result)
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({error_name: "Errore durante la creazione del RFID: ", err: err})
                    })
            } catch (err){
                console.log(err)
                res.status(500).json({error_name: "Errore durante la creazione del RFID: ", err: err})
            }
        }else{
            res.status(422).json({error_name: "RFID già esistente nel sistema."})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/tripname/check_rfid', checkAjaxLoggedUser, [
    check('rfid_code').notEmpty().isLength({ max: 45 })
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    RfidTrip.findOne({
        where: {
            rfid_code: req.body.rfid_code
        }
    }).then(async result => {
        if(result) {
            res.status(200).json({msg: "RFID già presente nel sistema.", result: true})
        }else{
            //l'rfid è disponibile
            res.status(200).json({msg: "RFID disponibile.", result: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })
    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/tripname/update', checkAjaxLoggedUser, [
    check('rfid_code').notEmpty().isLength({ max: 12 }),
    check('trip_name').isLength({ max: 45 }),
    check('route').isLength({ max: 45 }),
    check("pattern_id").isLength({ max: 45 }),
    check("pattern_from").isLength({ max: 100 }),
    check("pattern_to").isLength({ max: 100 }),
    check("pattern_from_stop_id").isLength({ max: 45 }),
    check("pattern_to_stop_id").isLength({ max: 45 }),
    check("autobus").isLength({ max: 45 })
], function(req, res, next) {
    //check logged user
    //debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    let new_values = {}

    if(req.body.autobus){
        new_values.bus = req.body.autobus
    }
    if(req.body.trip_name && req.body.route && req.body.pattern_id && req.body.pattern_id && req.body.pattern_from && req.body.pattern_to && req.body.pattern_from_stop_id && req.body.pattern_to_stop_id){
        new_values.route = req.body.route
        new_values.pattern_id = req.body.pattern_id
        new_values.from = req.body.pattern_from
        new_values.to = req.body.pattern_to
        new_values.from_stop_id = req.body.pattern_from_stop_id
        new_values.to_stop_id = req.body.pattern_to_stop_id
        new_values.pattern_desc = "Da " + req.body.pattern_from + " - A " + req.body.pattern_to
        new_values.trip_name = req.body.trip_name
    }
    if(req.body.autobus == null && req.body.trip_name == null){
        return res.status(200).json({ editing: false, msg: "Nessuna modifica richiesta" }); //editing means no changes
    }
    RfidTrip.update(new_values, {
        where: { rfid_code: req.body.rfid_code },
        returning: true,
        plain: true
    })
    .then((rows) => {
        debugger;
        //response to admin
        res.status(200).json({editing: true, result: rows})
    })
    .catch(err => {
        debugger;
        console.log(err)
        res.status(500).json({error_name: "Errore durante l'update del RFID: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/tripname/delete', checkAjaxLoggedUser, [
    check('rfid_code').notEmpty().isLength({ max: 45 })
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    RfidTrip.destroy({
        where: {
            rfid_code: req.body.rfid_code
        }
    }).then(result => {
        if(result) {
            res.status(200).json({msg: "Rimosso Correttamente", delete: true})
        }else{
            res.status(200).json({msg: "RFID non trovato.", delete: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

/****** ******/

/****** RFID SHIFT SECTION ******/

/****** ******/

/****** CARD  ******/

router.get('/rfidshift/cardrfid', checkLoggedUser, async function(req, res, next) {
    //check logged user
    const schedule_list = await Schedule.findAll()
    //get rfid_shift data
    RfidShift.findAll({include: [{
            model: Shift,
            include: [
                Schedule
            ]
        }]})
        .then(result => {
            res.render('rfidshift', {
                title: "CARD RFID",
                loggedUser: req.session.logged_user,
                rfid_list: result,
                schedule_list: schedule_list});
        }).error(err => {
        console.log(err)
        debugger;
    })


});

router.post('/rfidshift/cardrfid/check_rfid', checkAjaxLoggedUser, [
    check('rfid_code').notEmpty().isLength({ max: 45 })
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    RfidShift.findOne({
        where: {
            rfid_code: req.body.rfid_code.toUpperCase()
        }
    }).then(async result => {
        if(result) {
            res.status(200).json({msg: "RFID già presente nel sistema.", result: true})
        }else{
            //l'rfid è disponibile
            res.status(200).json({msg: "RFID disponibile.", result: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })
    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/cardrfid/create', checkAjaxLoggedUser, [
    check("rfid").notEmpty().isLength({ max: 12 }),
    check("shift").notEmpty()
], function(req, res, next) {
    //check logged user
    //debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    let new_rfid = {
        rfid_code: req.body.rfid.toUpperCase(),
        rs_shift_fk: req.body.shift,
        rfid_created: new Date()
    }


    RfidShift.findOne({
        where: {
            rfid_code: req.body.rfid.toUpperCase(),
        }
    }).then(async result => {
        if(!result) {
            //l'rfid è disponibile quindi si procede a registrare l'associazione con la trip
            try{
                RfidShift.create(new_rfid)
                    .then(result => {
                        //debugger;
                        res.status(200).json(result)
                        /*Schedule.findOne({
                            where: {
                               schedule_id: result.dataValues.schedule_fk
                            }
                        }).then(sch => {
                            //debugger;
                            result.dataValues.schedule_name = sch.dataValues.schedule_name
                            //response to admin
                            res.status(200).json(result)
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({error_name: "Errore durante la creazione dell'associazione RFIDShift - Rfid/Turno: ", err: err})
                        })*/

                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({error_name: "Errore durante la creazione dell'associazione RFIDShift - Rfid/Turno: ", err: err})
                    })
            } catch (err){
                console.log(err)
                res.status(500).json({error_name: "Errore durante la creazione dell'associazione RFIDShift - Rfid/Turno: ", err: err})
            }
        }else{
            res.status(422).json({error_name: "Turno già presente nel sistema."})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/cardrfid/update', checkAjaxLoggedUser, [
    check('rfid_id').notEmpty()
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }
    if(req.body.shift == null){
        return res.status(200).json({ editing: false, msg: "Nessuna modifica richiesta" }); //editing means no changes
    }

    let new_values = {}

    if(req.body.shift){
        new_values.rs_shift_fk = req.body.shift;
        new_values.rfid_created = new Date();
    }

    RfidShift.update(new_values, {
        where: { rfid_id: req.body.rfid_id },
        returning: true,
        plain: true
    })
        .then((rows) => {
            debugger;
            //response to admin
            res.status(200).json({editing: true, result: rows})
        })
        .catch(err => {
            debugger;
            console.log(err)
            res.status(500).json({error_name: "Errore durante l'update del RFID: ", err: err})
        })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/cardrfid/delete', checkAjaxLoggedUser, [
    check('rfid_id').notEmpty()
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    RfidShift.destroy({
        where: {
            rfid_id: req.body.rfid_id
        }
    }).then(result => {
        if(result) {
            res.status(200).json({msg: "Rimosso Correttamente", delete: true})
        }else{
            res.status(200).json({msg: "RFID non trovato.", delete: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});


/****** SHIFT  ******/

router.get('/rfidshift/shift', checkLoggedUser, async function(req, res, next) {
    //check logged user
    const schedule_list = await Schedule.findAll()
    //get rfid_shift data
    Shift.findAll({include: [Schedule]})
        .then(result => {
            res.render('shift', {
                title: "Turni",
                loggedUser: req.session.logged_user,
                shift_list: result,
                schedule_list: schedule_list});
        }).error(err => {
        console.log(err)
        debugger;
    })


});

router.post('/rfidshift/shift/create', checkAjaxLoggedUser, [
    check("shift").notEmpty().isLength({ max: 45 }),
    check("shift_id").notEmpty().isLength({ max: 45 }),
    check("schedule").notEmpty()
], function(req, res, next) {
    //check logged user
    //debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    let new_rfid = {
        rfid_code: req.body.rfid_code,
        shift_number: req.body.shift,
        shift_code: req.body.shift_id,
        schedule_fk: req.body.schedule,
        rs_created: new Date()
    }

    if(req.body.shift_start){
        new_rfid.shift_start = req.body.shift_start;
    }
    if(req.body.shift_end){
        new_rfid.shift_end = req.body.shift_end;
    }

    Shift.findOne({
        where: {
            shift_number: req.body.shift,
            shift_code: req.body.shift_id,
            schedule_fk: req.body.schedule
        }
    }).then(async result => {
        if(!result) {
            //l'rfid è disponibile quindi si procede a registrare l'associazione con la trip
            try{
                Shift.create(new_rfid)
                    .then(result => {
                        //debugger;
                        res.status(200).json(result)
                        /*Schedule.findOne({
                            where: {
                               schedule_id: result.dataValues.schedule_fk
                            }
                        }).then(sch => {
                            //debugger;
                            result.dataValues.schedule_name = sch.dataValues.schedule_name
                            //response to admin
                            res.status(200).json(result)
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({error_name: "Errore durante la creazione dell'associazione RFIDShift - Rfid/Turno: ", err: err})
                        })*/

                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({error_name: "Errore durante la creazione del Turno: ", err: err})
                    })
            } catch (err){
                console.log(err)
                res.status(500).json({error_name: "Errore durante la creazione del Turno: ", err: err})
            }
        }else{
            res.status(422).json({error_name: "Turno già presente nel sistema."})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/shift/check_shift', checkAjaxLoggedUser, [
    check('shift').notEmpty().isLength({ max: 45 }),
    check('shift_id').notEmpty().isLength({ max: 45 }),
    check('schedule').notEmpty()
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    Shift.findOne({
        where: {
            shift_number: req.body.shift,
            shift_code: req.body.shift_id,
            schedule_fk: req.body.schedule
        }
    }).then(async result => {
        //debugger;
        if(result) {
            //Questo turno esiste già
            res.status(200).json({msg: "Turno già presente nel sistema.", result: true})
        }else{
            //turno disponibile
            res.status(200).json({msg: "Turno disponibile.", result: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })
    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/shift/update', checkAjaxLoggedUser, [
    check('id').notEmpty(),
    check("shift").isLength({ max: 45 }),
    check("shift_id").isLength({ max: 45 }),
    check("schedule").notEmpty(),
], function(req, res, next) {
    //check logged user
    debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }
    if(req.body.autobus == null && req.body.trip_name == null){
        return res.status(200).json({ editing: false, msg: "Nessuna modifica richiesta" }); //editing means no changes
    }

    let new_values = {}

    if(req.body.bus){
        new_values.bus = req.body.bus
    }
    if(req.body.shift){
        new_values.shift_number = req.body.shift
        new_values.schedule = req.body.schedule
    }
    if(req.body.rfid_code){
        new_values.rfid_code = req.body.rfid_code
    }
    RfidShift.update(new_values, {
        where: { id: req.body.id },
        returning: true,
        plain: true
    })
        .then((rows) => {
            debugger;
            //response to admin
            res.status(200).json({editing: true, result: rows})
        })
        .catch(err => {
            debugger;
            console.log(err)
            res.status(500).json({error_name: "Errore durante l'update del RFID: ", err: err})
        })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/shift/delete', checkAjaxLoggedUser, [
    check('id').notEmpty()
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    Shift.destroy({
        where: {
            shift_id: req.body.id
        }
    }).then(result => {
        if(result) {
            res.status(200).json({msg: "Rimosso Correttamente", delete: true})
        }else{
            res.status(200).json({msg: "RFID non trovato.", delete: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

/**** SCHEDULES ***/

router.get('/rfidshift/schedules', checkLoggedUser, function(req, res) {
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

/**** TRIP SHIFT ****/

router.get('/rfidshift/tripshift', checkLoggedUser, async function(req, res, next) {
    //check logged user
    const schedule_list = await Schedule.findAll()
    //get rfid_shift data
    TripShift.findAll({include: [{
            model: Shift,
            include: [
                Schedule
            ]
        }]})
        .then(result => {
            //debugger;
            res.render('trip_shift', {
                title: "Corse Turno - TripShift",
                loggedUser: req.session.logged_user,
                trip_shift_list: result,
                schedule_list: schedule_list});
        }).error(err => {
        console.log(err)
        //debugger;
    })


});

router.post('/rfidshift/tripshift/check_tripshift', checkAjaxLoggedUser, [
    check('trip_id').notEmpty().isLength({ max: 45 }),
    check('shift_id').notEmpty().isLength({ max: 45 }),
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    TripShift.findOne({
        where: {
            trip_id: req.body.trip_id,
            shift_fk: req.body.shift_id
        }
    }).then(async result => {
        //debugger;
        if(result) {
            //Questo turno esiste già
            res.status(200).json({msg: "Corsa già assegnata al turno selezionato.", result: true})
        }else{
            //turno disponibile
            res.status(200).json({msg: "Corsa disponibile per il turno selezionato.", result: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })
    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/tripshift/create', checkAjaxLoggedUser, [
    check('trip_id').notEmpty(),
    check('trip_name').notEmpty().isLength({ max: 45 }),
    check('route').notEmpty().isLength({ max: 45 }),
    check("pattern_id").notEmpty().isLength({ max: 45 }),
    check("pattern_from").notEmpty().isLength({ max: 100 }),
    check("pattern_to").notEmpty().isLength({ max: 100 }),
    check("pattern_from_stop_id").notEmpty().isLength({ max: 45 }),
    check("pattern_to_stop_id").notEmpty().isLength({ max: 45 }),
    check("arrival_time").notEmpty(),
    check("departure_time").notEmpty(),
    check("shift_id").notEmpty()
], function(req, res, next) {
    //check logged user
    //debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    let new_tripshift = {
        route: req.body.route,
        pattern_id: req.body.pattern_id,
        pattern_desc: "Da " + req.body.pattern_from + " - A " + req.body.pattern_to,
        from: req.body.pattern_from,
        to: req.body.pattern_to,
        departure_time: req.body.departure_time,
        arrival_time: req.body.arrival_time,
        from_stop_id: req.body.pattern_from_stop_id,
        to_stop_id: req.body.pattern_to_stop_id,
        trip_name: req.body.trip_name,
        trip_id: req.body.trip_id,
        shift_fk: req.body.shift_id,
        ts_created: new Date()
    }

    if(req.body.shift_start){
        new_rfid.shift_start = req.body.shift_start;
    }
    if(req.body.shift_end){
        new_rfid.shift_end = req.body.shift_end;
    }

    TripShift.findOne({
        where: {
            trip_id: req.body.trip_id,
            shift_fk: req.body.shift_id,
        }
    }).then(async result => {
        if(!result) {
            //l'rfid è disponibile quindi si procede a registrare l'associazione con la trip
            try{
                TripShift.create(new_tripshift)
                    .then(result => {
                        //debugger;
                        res.status(200).json(result)
                        /*Schedule.findOne({
                            where: {
                               schedule_id: result.dataValues.schedule_fk
                            }
                        }).then(sch => {
                            //debugger;
                            result.dataValues.schedule_name = sch.dataValues.schedule_name
                            //response to admin
                            res.status(200).json(result)
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({error_name: "Errore durante la creazione dell'associazione RFIDShift - Rfid/Turno: ", err: err})
                        })*/

                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({error_name: "Errore durante la creazione del Turno: ", err: err})
                    })
            } catch (err){
                console.log(err)
                res.status(500).json({error_name: "Errore durante la creazione del Turno: ", err: err})
            }
        }else{
            res.status(422).json({error_name: "Turno già presente nel sistema."})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/tripshift/delete', checkAjaxLoggedUser, [
    check('id').notEmpty()
], function(req, res, next) {
    //check logged user

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }

    TripShift.destroy({
        where: {
            trip_shift_id: req.body.id
        }
    }).then(result => {
        if(result) {
            res.status(200).json({msg: "Rimosso Correttamente", delete: true})
        }else{
            res.status(200).json({msg: "RFID non trovato.", delete: false})
        }
    }).catch(err => {
        res.status(500).json({error_name: "Errore Connessione Database: ", err: err})
    })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});

router.post('/rfidshift/tripshift/update', checkAjaxLoggedUser, [
    check('id').notEmpty(),
    check("shift").isLength({ max: 45 }),
], function(req, res, next) {
    //check logged user
    debugger;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
        return res.status(422).json({ errors: validation_errors.array() });
    }
    if(req.body.shift == null){
        return res.status(200).json({ editing: false, msg: "Nessuna modifica richiesta" }); //editing means no changes
    }

    let new_values = {
        shift_fk: req.body.shift
    }

    TripShift.update(new_values, {
        where: { trip_shift_id: req.body.id },
        returning: true,
        plain: true
    })
        .then((rows) => {
            debugger;
            //response to admin
            res.status(200).json({editing: true, result: rows})
        })
        .catch(err => {
            debugger;
            console.log(err)
            res.status(500).json({error_name: "Errore durante l'update del RFID: ", err: err})
        })

    //res.render('index', { title: "Infomobilità L'Aquila"});
});


module.exports = router;
