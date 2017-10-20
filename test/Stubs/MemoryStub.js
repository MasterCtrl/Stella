module.exports = class MemoryStub {
    constructor(pos) {
        this.rooms = { B: { needRelief: true, targetLink: "" } };
        Object.assign(global, { Memory: this });
    }
};