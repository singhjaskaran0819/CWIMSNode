'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let roles = connection.define("userroles", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: { type: Sequelize.DataTypes.STRING },
        type: { type: Sequelize.DataTypes.INTEGER }, // Custom, Operator, Admin, AP Consumer 
        nature: { type: Sequelize.DataTypes.INTEGER }, // System/Business Role
        permissions: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false,
            defaultValue: "{}",
            get() {
                let data = this.getDataValue('permissions');
                return JSON.parse(data);
            },
            set(value) {
                this.setDataValue('permissions', JSON.stringify(value || this.permissions));
            }
        }
    }, {
        timestamps: true
    });


    roles.associate = (models) => {
        roles.hasMany(models.user, { foreignKey: 'role', sourceKey: 'id' });
        models.user.belongsTo(roles, { foreignKey: 'role', targetKey: 'id' });
    }

    return roles;
};
