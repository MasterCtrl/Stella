module.exports = class RoomStub {
    constructor(name) {
        this.name = name;
        this.memory = { index: 1 };
        this.findResult = [{}];
    }

    find() {
        return this.findResult;
    }
};