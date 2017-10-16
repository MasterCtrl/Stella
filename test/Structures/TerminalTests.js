var assert = require("assert");
var Terminal = require("../../lib/Structures/Terminal");
var Configuration = require("../../lib/Configuration");
var GameStub = require("../Stubs/GameStub");
var LodashStub = require("../Stubs/LodashStub");
var MemoryStub = require("../Stubs/MemoryStub");
var TerminalStub = require("../Stubs/TerminalStub");
var Suppressor = require("../Suppressor");

describe("Terminal Tests", () => {
    before(() => {
        require("../global").Register();
    });
    
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
            terminalStub.store = { energy: Configuration.default.Terminal.energy + 1 };
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SellResources() }), false, "Terminal SellResources did not exit");
        });

        it("Returns false if the minerals are below threshold", () => {
            terminalStub.store[RESOURCE_HYDROGEN] = 1;
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SellResources() }), false, "Terminal SellResources did not exit");
        });

        it("Returns false if there are no orders", () => {
            gameStub.market.getAllOrdersResult = [];
            
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SellResources() }), false, "Terminal SellResources did not exit");
        });

        it("Returns false if the transfer cost is too high", () => {
            gameStub.market.calcTransactionCostResult = Configuration.default.Terminal.energy + 10;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SellResources() }), false, "Terminal SellResources did not exit");
        });

        it("Returns false if the transfer fails", () => {
            gameStub.market.dealResult = -1;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SellResources() }), false, "Terminal SellResources did not exit");
        });

        it("Completes if the transfer is valid", () => {
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SellResources() }), true, "Terminal SellResources did not complete successfully");
        });
    });

    describe("#SendRelief", () => {
        it("Returns false if there are no rooms in memory", () => {
            memoryStub.rooms = [];

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), false, "Terminal SendRelief found rooms in memory?");
        });

        it("Returns false if no rooms need relief", () => {
            memoryStub.rooms = [{}];

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), false, "Terminal SendRelief found a room that needs relief?");
        });

        it("Returns false if there are no in game rooms", () => {
            gameStub.rooms = {};

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), false, "Terminal SendRelief found rooms in game?");
        });

        it("Returns false if the room has no terminal", () => {
            gameStub.rooms = { B : {} };

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), false, "Terminal SendRelief found a terminal?");
        });

        it("Returns false if there is not enough energy", () => {
            terminalStub.store.energy = 0;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), false, "Terminal SendRelief found a terminal?");
        });

        it("Returns false if send fails", () => {
            terminalStub.sendResult = -1;

            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), false, "Terminal SendRelief sent successfully?");
        });

        it("Completes if the send is successful", () => {
            var terminal = new Terminal.default(terminalStub);
            assert.equal(Suppressor(() => { return terminal.SendRelief() }), true, "Terminal SendRelief did not complete successfully");
        });
    });
});