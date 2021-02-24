const Sequelize = require("sequelize");
const db = require("../database/db.js");
const Schedule = require("./Schedule")
const Shift = require("./Shift")


const TripShift = db.sequelize.define(
    "trip_shift",
    {
        trip_shift_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        trip_id: {
            type: Sequelize.STRING
        },
        trip_name: {
            type: Sequelize.STRING
        },
        departure_time: {
            type: Sequelize.INTEGER
        },
        from: {
            type: Sequelize.STRING
        },
        arrival_time: {
            type: Sequelize.INTEGER
        },
        to: {
            type: Sequelize.STRING
        },
        route: {
            type: Sequelize.STRING
        },
        from_stop_id: {
            type: Sequelize.STRING
        },
        to_stop_id: {
            type: Sequelize.STRING
        },
        pattern_id: {
            type: Sequelize.STRING
        },
        pattern_desc: {
            type: Sequelize.STRING
        },
        shift_fk: {
            type: Sequelize.INTEGER
        },
        ts_created: {
            type: Sequelize.DATE,
            default: Sequelize.NOW
        }
    },
    {
        timestamps: false
    }
)

TripShift.belongsTo(Shift, {foreignKey: "shift_fk", targetKey: "shift_id"})
Shift.hasMany(TripShift, {foreignKey: "shift_fk", sourceKey: "shift_id"})

module.exports = TripShift;