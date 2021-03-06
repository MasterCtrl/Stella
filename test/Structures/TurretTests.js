var assert = require("assert");
require("../global").Register();

var Turret = require("../../lib/Structures/Turret");
var LodashStub = require("../Stubs/LodashStub");
var TowerStub = require("../Stubs/TowerStub");

describe("Turret Tests", () => {
    var towerStub, lodashStub;

    beforeEach(() =>{
        towerStub = new TowerStub();
        lodashStub = new LodashStub();
    });
    
    describe("#AttackHostile", () => {
        it("Returns false there are no hostiles", () => {
            towerStub.room.findResult = [];

            var turret = new Turret.default(towerStub);
            assert.equal(turret.AttackHostile(), false, "Turret AttackHostile found a hostile?");
        });

        it("Returns false if the attack is not successful", () => {
            towerStub.attackResult = -1;

            var turret = new Turret.default(towerStub);
            assert.equal(turret.AttackHostile(), false, "Turret AttackHostile succeeded?");
        });

        it("Completes if the attack is successful", () => {
            var turret = new Turret.default(towerStub);
            assert.equal(turret.AttackHostile(), true, "Turret AttackHostile failed?");
        });
    });

    describe("#RepairStructure", () => {
        it("Returns false there are no structures", () => {
            lodashStub.minResult = undefined;

            var turret = new Turret.default(towerStub);
            assert.equal(turret.RepairStructure(), false, "Turret RepairStructure found a structure?");
        });

        it("Returns false if the repair is not successful", () => {
            towerStub.repairResult = -1;

            var turret = new Turret.default(towerStub);
            assert.equal(turret.RepairStructure(), false, "Turret RepairStructure succeeded?");
        });

        it("Completes if the repair is successful", () => {
            var turret = new Turret.default(towerStub);
            assert.equal(turret.RepairStructure(), true, "Turret RepairStructure failed?");
        });
    });
});