const Sequelize = require("sequelize");
const db = require("../database/db.js");

module.exports = db.sequelize.define(
    "setting",
    {
        id_setting: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        json_settings: {
            type: Sequelize.STRING
        },
        last_modified_date: {
            type: Sequelize.DATE,
            default: Sequelize.NOW
        }
    },
    {
        timestamps: false
    }
)