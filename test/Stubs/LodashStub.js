module.exports = class LodashStub {
    constructor(pos) {
        this.maxResult = {};
        this.minResult = {};
        Object.assign(global, { _: this });
    }

    sortBy(...values) {
        if (values.length < 1) {
            return;
        }
        return values[0];
    }

    max(...values) {
        return this.maxResult;
    }

    min(...values) {
        return this.minResult;
    }
};