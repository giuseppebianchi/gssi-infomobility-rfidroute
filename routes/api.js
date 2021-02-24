var express = require('express');
var cors = require('cors');
var router = express.Router();
const RfidTrip = require("../models/RfidTrip");
const Shift = require("../models/Shift");
const RfidShift = require("../models/RfidShift");
const Setting = require("../models/Setting");
const Schedule = require("../models/Schedule");
const Sequelize = require("sequelize")
const TripShift = require("../models/TripShift")

router.use(cors())
router.options('*', cors());

var { checkLoggedUser, checkAjaxLoggedUser} = require('../functions/checkers.js');

router.get('/rfid/tripname', checkAjaxLoggedUser, function(req, res, next) {
    //check logged user
    //debugger;
    let order = "created"
    if(req.query.order_by){
      order = req.query.order_by
    }
    //get rfid_trip data
    RfidTrip.findAll({
      order: [[order]]
    })
    .then(result => {
        res.status(200).json(result);
    }).error(err => {
        res.status(422).json(err);
    })
});
router.get('/rfid/tripname/:trip_name', function(req, res, next) {

    if(!req.query.from_id || !req.query.to_id || !req.params.trip_name){
        res.status(422).json({found: false, error_name: "Empty Fields"})
    }

    RfidTrip.findOne({
        where: {
            trip_name: req.params.trip_name,
            from_stop_id: req.query.from_id,
            to_stop_id: req.query.to_id
        }
    }).then(async result => {
        if(result) {
            //la trip è collegata ad un rfid quindi si procede ad inviare il valore del rfid
            res.status(200).json({found: true, data: result})
        }else{
            res.status(200).json({found: false, error_name: "RFID non trovato"})
        }
    }).catch(err => {
        console.log(err)
        res.status(500).json({found: false, error_name: "Errore Connessione Database: ", err: err})
    })
})

/******    ******/

/***** RFID SHIFT ****/

/******     *******/

router.get('/rfid/rfidshift/cardrfid', checkAjaxLoggedUser, function(req, res, next) {
    //check logged user
    //debugger;
    let order = "rfid_created";

    if(req.query.order_by){
        order = req.query.order_by
    }

    let options = {
        order: [
            [Sequelize.literal(order), 'asc'],
        ]
    }

    options.include = {
        model: Shift,
        include: [Schedule],
    }

    if(req.query.schedule != 0){
        options.include.where =  {
            schedule_fk: req.query.schedule
        }
    }

    //get rfid_trip data
    RfidShift.findAll(options)
        .then(result => {
            res.status(200).json(result);
        }).error(err => {
        res.status(422).json(err);
    })
});

router.get('/rfid/rfidshift/cardrfid/:id', checkAjaxLoggedUser, function(req, res, next) {
    //get trip_shift data TODO
})

router.get('/rfid/rfidshift/shift', checkAjaxLoggedUser, function(req, res, next) {
    //check logged user
    //debugger;

    let order = "rs_created";

    if(req.query.order_by){
        order = req.query.order_by
    }
    let options = {
        order: [[order]]
    }
    if(req.query.schedule != 0){
        options.where = {
           schedule_fk: req.query.schedule
        }
    }
    //get rfid_trip data
    Shift.findAll(options)
        .then(result => {
            res.status(200).json(result);
        }).error(err => {
        res.status(422).json(err);
    })
});

router.get('/rfid/rfidshift/shift/:id', checkAjaxLoggedUser, function(req, res, next) {
    //get trip_shift data TODO
})

/***** TRIPSHIFT ****/

router.get('/rfid/rfidshift/tripshift', checkAjaxLoggedUser, function(req, res, next) {
    //check logged user
    //debugger;
    let order = "ts_created";

    if(req.query.order_by){
        order = req.query.order_by
    }

    let options = {
        order: [
            //[Sequelize.literal(order), 'asc'],
            [order]
        ]
    }

    options.include = {
        model: Shift,
        include: [Schedule],
    }


    if(req.query.shift != 0){
        options.where =  {
            shift_fk: req.query.shift
        }
    }else{
        if(req.query.schedule && req.query.schedule != 0){
            options.include.where =  {
                schedule_fk: req.query.schedule
            }
        }
    }




    //get trip shift data
    TripShift.findAll(options)
        .then(result => {
            debugger;
            res.status(200).json(result);
        }).error(err => {
            debugger;
            res.status(422).json(err);
    })
});





/***** ******/

/***** SETTINGS ******/

/***** ******/

router.get('/settings', function(req, res) {
    //check logged user
    //res.json(req.session)
    Setting.findOne({
        where: {
            id_setting: 1
        }
    }).then(results => {
            res.status(200).json(results);
        })
        .catch( () => {
            res.status(500).json({error_name: "Database Error"});
        })
});


/***** ******/

/***** SCHEDULES ******/

/***** ******/

router.get('/rfid/rfidshift/schedules', checkAjaxLoggedUser, function(req, res) {
    //check logged user
    //res.json(req.session)
    Schedule.findAll()
    .then(results => {
        res.status(200).json(results);
    })
        .catch( () => {
            res.status(500).json({error_name: "Database Error"});
        })
});

/***** ******/

/***** REAL TIME ****/

/****** ******/

router.get('/realtime/rfidshift/:trip_id', function(req, res, next) {
    //check logged user
    //debugger;

    if(!req.params.trip_id){
        res.status(422).json(err);
    }

    let options = {
        include: {
            model: TripShift,
            where: {
                trip_id: req.params.trip_id
            }
        }
    }

    if(req.query.check_schedule){
        options.include.include = {
            model: Shift,
            include: {
                model: Schedule,
                where: {
                    schedule_active: 1
                }
            }
        }
    }

    //get rfid_trip data
    RfidShift.findAll(options)
        .then(result => {
            if(result.length) {
                //la trip è collegata ad un rfid quindi si procede ad inviare il valore del rfid
                res.status(200).json({found: true, data: result})
            }else{
                res.status(200).json({found: false, error_name: "RFID non trovato"})
            }
        }).error(err => {
            res.status(422).json(err);
    })
});

router.post('/realtime/rfidshift', function(req, res, next) {
    //check logged user
    //debugger;

    if(!req.body.trips){
        res.status(422).send("Trips are missing")
    }

    if(!Array.isArray(req.body.trips)){
        res.status(422).send("Trips are not valid")
    }

    let options = {
        include: {
            model: TripShift,
            where: {
                trip_id: req.body.trips
            }
        }
    }

    if(req.query.check_schedule){
        options.include.include = {
            model: Shift,
            include: {
                model: Schedule,
                where: {
                    schedule_active: 1
                }
            }
        }
    }

    //get rfid_trip data
    RfidShift.findAll(options)
        .then(result => {
            if(result.length) {
                //la trip è collegata ad un rfid quindi si procede ad inviare il valore del rfid
                res.status(200).json({found: true, data: result})
            }else{
                res.status(200).json({found: false, error_name: "RFID non trovato"})
            }
        }).error(err => {
        res.status(422).json(err);
    })
});

router.post('/realtime/shift/rfidshift', function(req, res, next) {
    //check logged user
    //debugger;

    if(!req.body.trips){
        res.status(422).send("Trips are missing")
    }

    if(!Array.isArray(req.body.trips)){
        res.status(422).send("Trips are not valid")
    }

    let options = {
        include: {
            model: TripShift,
            where: {
                trip_id: req.body.trips
            },
            include: {
                model: Shift
            }
        }
    }

    if(req.query.check_schedule){
        options.include.include.include = {
            model: Schedule,
            where: {
                schedule_active: 1
            }
        }
    }

    //get rfid_trip data
    RfidShift.findAll(options)
        .then(result => {
            if(result.length) {
                //la trip è collegata ad un rfid quindi si procede ad inviare il valore del rfid
                res.status(200).json({found: true, data: result})
            }else{
                res.status(200).json({found: false, error_name: "RFID non trovato"})
            }
        }).error(err => {
        res.status(422).json(err);
    })
});



module.exports = router;
