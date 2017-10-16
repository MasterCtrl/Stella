module.exports = class MarketStub {
    constructor() {
        this.getAllOrdersResult = [{roomName: ""}];
        this.calcTransactionCostResult = 0;
        this.dealResult = OK;
    }
    getAllOrders() {
        return this.getAllOrdersResult;
    }
    calcTransactionCost() {
        return this.calcTransactionCostResult;
    }
    deal(){
        return this.dealResult;
    }
};