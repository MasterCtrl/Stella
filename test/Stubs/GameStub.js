var MarketStub = require("./MarketStub");
module.exports = class GameStub {
    constructor() {
        this.time = 0;
        this.market = new MarketStub();
        this.rooms = { B: { terminal: {} } }
        Object.assign(global, { Game: this });
    }
};