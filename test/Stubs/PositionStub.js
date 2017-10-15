class PositionStub {
    constructor() {
        this.findInRangeResults = [];
        this.findClosestByRangeResult = {};
    }
    
    findInRange() {
        return this.findInRangeResults;
    }
    
    findClosestByRange() {
        return this.findClosestByRangeResult;
    }
};

exports.default = PositionStub;