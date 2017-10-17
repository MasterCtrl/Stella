var RoomPositionStub = require("./RoomPositionStub");

module.exports = class LinkStub {
    constructor(pos) {
        this.pos = pos || new RoomPositionStub();
        this.transferEnergyResults = OK;
        this.cooldown = 0;
        this.energy = 1;
        this.energyCapacity = 1;
        this.id = "A";
        this.room = { memory: { linkTarget: "B" } };
    }

    transferEnergy() {
        return this.transferEnergyResults;
    }
};