const Sequelize = require("sequelize");
const db = require("../database/db.js");

module.exports = db.sequelize.define(
    "rfid_trip",
    {
        rfid_code: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        trip_name: {
            type: Sequelize.STRING
        },
        from: {
            type: Sequelize.STRING
        },
        to: {
            type: Sequelize.STRING
        },
        from_stop_id: {
            type: Sequelize.STRING
        },
        to_stop_id: {
            type: Sequelize.STRING
        },
        route: {
            type: Sequelize.STRING
        },
        pattern_id: {
            type: Sequelize.STRING
        },
        pattern_desc: {
            type: Sequelize.STRING
        },
        bus: {
            type: Sequelize.STRING
        },
        created: {
            type: Sequelize.DATE,
            default: Sequelize.NOW
        }
    },
    {
        timestamps: false
    }
)