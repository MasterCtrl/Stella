var RoomPositionStub = require("./RoomPositionStub");
var RoomStub = require("./RoomStub");
var Configuration = require("../../lib/Configuration");

module.exports = class TerminalStub {
    constructor(pos) {
        this.pos = pos || new RoomPositionStub();
        this.room = new RoomStub("A");
        this.store = { 
            energy: Configuration.default.Terminal.energy + 1,
            H: Configuration.default.Terminal.Fallback + 1
        };
        this.cooldown = 0;
        this.sendResult = OK;
    }

    send(){
        return this.sendResult;
    }
};