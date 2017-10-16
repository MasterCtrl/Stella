module.exports = class LodashStub {
    constructor(pos) {
        Object.assign(global, { _: this });
    }

    sortBy(...values) {
        if (values.length < 1) {
            return;
        }
        return values[0];
    }
};