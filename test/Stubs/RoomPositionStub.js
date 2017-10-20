module.exports = class RoomPositionStub {
    constructor() {
        this.findInRangeResults = [];
        this.findClosestByRangeResult = {energy: 0, energyCapacity: 1};
    }
    
    findInRange() {
        return this.findInRangeResults;
    }
    
    findClosestByRange() {
        return this.findClosestByRangeResult;
    }
};