const Sequelize = require("sequelize");
const db = require("../database/db.js");
const Shift = require("./Shift")
const TripShift = require("./TripShift")

const RfidShift = db.sequelize.define(
    "rfid_shift",
    {
        rfid_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        rfid_code: {
            type: Sequelize.STRING,
        },
        rs_shift_fk: {
            type: Sequelize.INTEGER,
        },
        rfid_created: {
            type: Sequelize.DATE,
            default: Sequelize.NOW
        },
    },
    {
        timestamps: false
    }
)

RfidShift.belongsTo(Shift, {foreignKey: "rs_shift_fk", targetKey: "shift_id"})
Shift.hasMany(RfidShift, {foreignKey: "rs_shift_fk", sourceKey: "shift_id"})

TripShift.belongsTo(RfidShift, {foreignKey: "shift_fk", targetKey: "rs_shift_fk"})
RfidShift.hasMany(TripShift, {foreignKey: "shift_fk", sourceKey: "rs_shift_fk"})

module.exports = RfidShift;