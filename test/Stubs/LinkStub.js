var RoomPositionStub = require("./RoomPositionStub");

module.exports = class LinkStub {
    constructor(pos) {
        this.pos = pos || new RoomPositionStub();
        this.transferEnergyResults = OK;
        this.cooldown = 0;
        this.energy = 1;
        this.energyCapacity = 1;
    }

    transferEnergy() {
        return this.transferEnergyResults;
    }
};