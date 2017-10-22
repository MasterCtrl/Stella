module.exports = class MemoryStub {
    constructor(pos) {
        this.rooms = { B: { needs: [RESOURCE_ENERGY], targetLink: "" } };
        Object.assign(global, { Memory: this });
    }
};