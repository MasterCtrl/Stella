module.exports = class MemoryStub {
    constructor(pos) {
        this.rooms = { B: { needRelief: true } };
        Object.assign(global, { Memory: this });
    }
};