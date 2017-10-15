var PositionStub = require("./PositionStub");

class LinkStub {
    constructor(pos) {
        this.pos = pos || new PositionStub.default();
        this.transferEnergyResults = 0;
    }

    transferEnergy() {
        return this.transferEnergyResults;
    }
};

exports.default = LinkStub;