var assert = require("assert");
require("../global").Register();

var Link = require("../../lib/Structures/Link");
var LinkStub = require("../Stubs/LinkStub");

describe("Link Tests", () => {
    var linkStub;

    beforeEach(() =>{
        linkStub = new LinkStub();        
    });
    
    describe("#Run", () => {
        it("Returns false if link is on cooldown", () => {
            linkStub.cooldown = 1;
    
            var link = new Link.default(linkStub);
            assert.equal(link.Run(), false, "Link run did not exit");
        });

        it("Returns false if link is a target", () => {
            linkStub.room.memory.linkTarget = "A";

            var link = new Link.default(linkStub);
            assert.equal(link.Run(), false, "Link run did not exit");
        });
    
        it("Returns false if energy < 50%", () => {
            linkStub.energy = 0.4;
            
            var link = new Link.default(linkStub);
            assert.equal(link.Run(), false, "Link run did not exit");
        });
    
        it("Returns false if it does not find a target", () => {
            linkStub.pos.findClosestByRangeResult = undefined;
            
            var link = new Link.default(linkStub);
            assert.equal(link.Run(), false, "Link found a target?");
        });
    
        it("Returns false if the target is full", () => {
            linkStub.pos.findClosestByRangeResult = {energy: 1, energyCapacity: 1};
            
            var link = new Link.default(linkStub);
            assert.equal(link.Run(), false, "Link target wasn't full?");
        });
    
        it("Returns false if the transfer fails", () => {
            linkStub.transferEnergyResults = -1;
            
            var link = new Link.default(linkStub);
            assert.equal(link.Run(), false, "Link transfer successful?");
        });
    
        it("Completes if transfer is successful", () => {
            var link = new Link.default(linkStub);
            assert.equal(link.Run(), true, "Link run did not complete successfully");
        });
    });
});