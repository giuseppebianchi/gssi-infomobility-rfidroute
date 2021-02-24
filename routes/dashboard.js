var express = require('express');
var router = express.Router();
const RfidTrip = require("../models/RfidTrip")

var { checkLoggedUser } = require('../functions/checkers.js');

router.get('/', checkLoggedUser, function(req, res, next) {
  //check logged user

  //get rfid_trip data
  RfidTrip.findAll()
      .then(result => {
        res.render('dashboard', { title: "Dashboard - Infomobilità L'Aquila",  loggedUser: req.session.logged_user});
      }).error(err => {
        res.send("errore")
      })


  //get trip_shift data TODO


});

module.exports = router;
