var assert = require("assert");
var Link = require("../../lib/Structures/Link");
var LinkStub = require("../Stubs/LinkStub");

describe("link tests", () => {
    before(() => {
        Object.assign(global, require("../global").default)
    });
    
    describe("#Run", () => {
        it("Returns false if link is a target", () => {
            var stubLink = new LinkStub.default();
            stubLink.pos.findInRangeResults = [{}];
    
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), false, "Link run did not exit");
        });
    
        it("Returns false if link is on cooldown", () => {
            var stubLink = new LinkStub.default();
            stubLink.cooldown = 1;
    
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), false, "Link run did not exit");
        });
    
        it("Returns false if energy < 50%", () => {
            var stubLink = new LinkStub.default();
            stubLink.energy = 1;
            stubLink.energyCapacity = 3;
            
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), false, "Link run did not exit");
        });
    
        it("Returns false if it doent find a target", () => {
            var stubLink = new LinkStub.default();
            stubLink.pos.findClosestByRangeResult = undefined;
            
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), false, "Link found a target?");
        });
    
        it("Returns false if the target is full", () => {
            var stubLink = new LinkStub.default();
            stubLink.pos.findClosestByRangeResult = {energy: 1, energyCapacity: 1};
            
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), false, "Link target wasn't full?");
        });
    
        it("Returns false if the transfer fails", () => {
            var stubLink = new LinkStub.default();
            stubLink.pos.findClosestByRangeResult = {energy: 1, energyCapacity: 1};
            
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), false, "Link transfer unsuccessful");
        });
    
        it("Completes successfully", () => {
            var stubLink = new LinkStub.default();
            stubLink.pos.findClosestByRangeResult = {energy: 0, energyCapacity: 1};
            stubLink.transferEnergyResults = OK;
            
            var link = new Link.default(stubLink);
            assert.equal(link.Run(), true, "Link run complete");
        });
    });
});