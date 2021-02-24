var express = require('express')
var sequelize = require('sequelize')

const checkLoggedUser = (req, res, next) => {
    if(!req.session.logged_user){
        res.redirect(process.env.BASEPATH)
    }else{
        next()
    }
}

const checkAlreadyAuthenticated = (req, res, next) => {
    if(!req.session.logged_user){
        next()
    }else{
        res.redirect(process.env.BASEPATH + "dashboard")
    }
}

const checkAdmin = (req, res, next) => {
    if(!req.session.logged_user){
        res.redirect(process.env.BASEPATH)
    }else{
        if(req.session.logged_user.role == process.env.ADMIN_ROLE){
            next()
        }
    }
}

const checkAjaxAdmin = (req, res, next) => {
    if(!req.session.logged_user){
        res.status(200).json({cancel_request: true})
    }else{
        if(req.session.logged_user.role == process.env.ADMIN_ROLE){
            next()
        }else{
            res.status(200).json({cancel_request: true})
        }
    }
}

const checkAjaxLoggedUser = (req, res, next) => {
    if(!req.session.logged_user){
        res.status(200).json({cancel_request: true})
    }else{
        next()
    }
}

const checkDbConnection = (req, res, next) => {
    try {
        sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        res.send("Database Connection Problems")
        console.error('Unable to connect to the database:', error);
    }
}

module.exports.checkLoggedUser = checkLoggedUser;
module.exports.checkAdmin = checkAdmin;
module.exports.checkAjaxLoggedUser = checkAjaxLoggedUser;
module.exports.checkAjaxAdmin = checkAjaxAdmin;
module.exports.checkAlreadyAuthenticated = checkAlreadyAuthenticated;