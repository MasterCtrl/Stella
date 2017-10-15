var assert = require("assert");
var Link = require("../lib/Structures/Link");
var LinkStub = require("./Stubs/LinkStub");

describe("link tests", function() {
    before(function() {
        Object.assign(global, require("./global").default)
    });
    
    it("Run returns false if link is a target", function() {
        var stubLink = new LinkStub.default();
        stubLink.pos.findInRangeResults = [{}];

        var link = new Link.default(stubLink);
        assert.equal(link.Run(), false, "Link run did not exit");
    });

    it("Run returns false if link is on cooldown", function() {
        var stubLink = new LinkStub.default();
        stubLink.cooldown = 1;

        var link = new Link.default(stubLink);
        assert.equal(link.Run(), false, "Link run did not exit");
    });

    it("Run returns false if energy < 50%", function() {
        var stubLink = new LinkStub.default();
        stubLink.energy = 1;
        stubLink.energyCapacity = 3;
        
        var link = new Link.default(stubLink);
        assert.equal(link.Run(), false, "Link run did not exit");
    });

    it("Run returns false if it doent find a target", function() {
        var stubLink = new LinkStub.default();
        stubLink.pos.findClosestByRangeResult = undefined;
        
        var link = new Link.default(stubLink);
        assert.equal(link.Run(), false, "Link found a target?");
    });

    it("Run returns false if the target is full", function() {
        var stubLink = new LinkStub.default();
        stubLink.pos.findClosestByRangeResult = {energy: 1, energyCapacity: 1};
        
        var link = new Link.default(stubLink);
        assert.equal(link.Run(), false, "Link target wasn't full?");
    });

    it("Run returns false if the transfer fails", function() {
        var stubLink = new LinkStub.default();
        stubLink.pos.findClosestByRangeResult = {energy: 1, energyCapacity: 1};
        
        var link = new Link.default(stubLink);
        assert.equal(link.Run(), false, "Link transfer unsuccessful");
    });

    it("Run completes successfully", function() {
        var stubLink = new LinkStub.default();
        stubLink.pos.findClosestByRangeResult = {energy: 0, energyCapacity: 1};
        stubLink.transferEnergyResults = OK;
        
        var link = new Link.default(stubLink);
        assert.equal(link.Run(), true, "Link run complete");
    });
});
