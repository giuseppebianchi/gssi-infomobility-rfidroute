var express = require('express');
var router = express.Router();

const { checkAlreadyAuthenticated } = require('../functions/checkers.js')

/* GET home page. */
router.get('/', checkAlreadyAuthenticated, function(req, res) {
  //check logged user
  res.render('index', { title: "Infomobilità L'Aquila" });
});

module.exports = router;
