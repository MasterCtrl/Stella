var assert = require("assert");
require("../global").Register();

var RoomController = require("../../lib/Controllers/RoomController");
var GameStub = require("../Stubs/GameStub");
var LodashStub = require("../Stubs/LodashStub");
var RoomStub = require("../Stubs/RoomStub");

describe("Room Controller Tests", () => {
    var gameStub, roomStub, lodashStub;
    
    beforeEach(() => {
        gameStub = new GameStub();
        lodashStub = new LodashStub();
        roomStub = new RoomStub();
    });

    describe("#Constructor", () => {
        it("Assigns index when undefined", () => {
            roomStub.memory.index = undefined;
            
            var roomController = new RoomController.default(roomStub);
            assert.equal(roomStub.memory.index, 0, "index is not set");
        });

        it("Assigns larger index when another room is added", () => {
            lodashStub.maxResult = { index: 0 };

            var roomController = new RoomController.default(roomStub);
            assert.equal(roomStub.memory.index, 1, "index is not incremented");
        });

        it("Does not change an index that is already assigned", () => {
            var roomController = new RoomController.default(roomStub);
            assert.equal(roomStub.memory.index, 1, "index is not incremented");
        });
    });
});