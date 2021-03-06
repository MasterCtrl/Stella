var assert = require("assert");
require("../global").Register();

var Terminal = require("../../lib/Structures/Terminal");
var Configuration = require("../../lib/Configuration");
var GameStub = require("../Stubs/GameStub");
var LodashStub = require("../Stubs/LodashStub");
var MemoryStub = require("../Stubs/MemoryStub");
var TerminalStub = require("../Stubs/TerminalStub");
var Suppressor = require("../Suppressor");

describe("Terminal Tests", () => {
    var terminalStub, gameStub, memoryStub, lodashStub;
    
    beforeEach(() => {
        terminalStub = new TerminalStub();
        gameStub = new GameStub();
        memoryStub = new MemoryStub();
        lodashStub = new LodashStub();
    });

    describe("#Run", () => {
        it("Returns false if terminal has no energy", () => {
            terminalStub.store.energy = 0;
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(terminal.Run(), false, "Terminal Run did not exit");
        });

        it("Returns false if game time is not correct", () => {
            gameStub.time = 1;
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(terminal.Run(), false, "Terminal Run did not exit");
        });
        
        it("Returns false if terminal is on cooldown", () => {
            terminalStub.cooldown = 1;
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(terminal.Run(), false, "Terminal Run did not exit");
        });
    });

    describe("#SellResources", () =>{
        it("Returns false if there are no minerals in storage", () => {
            terminalStub.store = { energy: Configuration.default.Terminal.energy.Maximum + 1 };
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SellResources()), false, "Terminal SellResources did not exit");
        });

        it("Returns false if the minerals are below threshold", () => {
            terminalStub.store[RESOURCE_HYDROGEN] = 1;
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SellResources()), false, "Terminal SellResources did not exit");
        });

        it("Returns false if there are no orders", () => {
            gameStub.market.getAllOrdersResult = [];
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SellResources()), false, "Terminal SellResources did not exit");
        });

        it("Returns false if the transfer cost is too high", () => {
            gameStub.market.calcTransactionCostResult = Configuration.default.Terminal.energy.Maximum + 10;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SellResources()), false, "Terminal SellResources did not exit");
        });

        it("Returns false if the transfer fails", () => {
            gameStub.market.dealResult = -1;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SellResources()), false, "Terminal SellResources did not exit");
        });

        it("Completes if the transfer is successful", () => {
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SellResources()), true, "Terminal SellResources did not complete successfully");
        });
    });

    describe("#SendResources", () => {
        it("Returns false if there are no rooms in memory", () => {
            memoryStub.rooms = [];

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), false, "Terminal SendResources found rooms in memory?");
        });

        it("Returns false if no rooms need resources", () => {
            memoryStub.rooms = [{}];

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), false, "Terminal SendResources found a room that needs resources?");
        });

        it("Returns false if there are no in game rooms", () => {
            gameStub.rooms = {};

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), false, "Terminal SendResources found rooms in game?");
        });

        it("Returns false if the room has no terminal", () => {
            gameStub.rooms = { B : {} };

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), false, "Terminal SendResources found a terminal?");
        });

        it("Returns false if there is not enough energy", () => {
            terminalStub.store.energy = 0;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), false, "Terminal SendResources had enough energy?");
        });

        it("Returns false if send fails", () => {
            terminalStub.sendResult = -1;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), false, "Terminal SendResources sent successfully?");
        });

        it("Completes if the send is successful", () => {
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => terminal.SendResources()), true, "Terminal SendResources did not complete successfully");
        });
    });
});