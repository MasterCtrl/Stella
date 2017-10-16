var RoomPositionStub = require("./RoomPositionStub");

module.exports = class TowerStub {
    constructor(pos) {
        this.pos = pos || new RoomPositionStub();
        this.attackResult = OK;
        this.repairResult = OK;
    }

    attack() {
        return this.attackResult;
    }

    repair() {
        return this.repairResult;        
    }
};