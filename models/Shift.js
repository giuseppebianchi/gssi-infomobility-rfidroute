const Sequelize = require("sequelize");
const db = require("../database/db.js");
const Schedule = require("./Schedule")

const Shift = db.sequelize.define(
    "shift",
    {
        shift_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        shift_code: {
            type: Sequelize.STRING
        },
        shift_number: {
            type: Sequelize.STRING
        },
        schedule_fk: {
            type: Sequelize.INTEGER
        },
        shift_start: {
            type: Sequelize.INTEGER
        },
        shift_end: {
            type: Sequelize.INTEGER
        },
        rs_created: {
            type: Sequelize.DATE,
            default: Sequelize.NOW
        }
    },
    {
        timestamps: false
    }
)

Shift.belongsTo(Schedule, {foreignKey: "schedule_fk", targetKey: "schedule_id"})
Schedule.hasMany(Shift, {foreignKey: "schedule_fk", sourceKey: "schedule_id"})

module.exports = Shift;