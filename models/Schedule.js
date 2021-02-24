const Sequelize = require("sequelize");
const db = require("../database/db.js");

module.exports = db.sequelize.define(
    "schedule",
    {
        schedule_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        schedule_name: {
            type: Sequelize.STRING,
        },
        schedule_desc: {
            type: Sequelize.STRING
        },
        schedule_active: {
            type: Sequelize.BOOLEAN,
            default: false
        },
        schedule_created: {
            type: Sequelize.DATE,
            default: Sequelize.NOW
        }
    },
    {
        timestamps: false
    }
)