var RoomPositionStub = require("./RoomPositionStub");
var RoomStub = require("./RoomStub");

module.exports = class TowerStub {
    constructor(pos, room) {
        this.pos = pos || new RoomPositionStub();
        this.room = room || new RoomStub();
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