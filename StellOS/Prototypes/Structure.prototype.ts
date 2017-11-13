Object.defineProperties(
    Structure.prototype,
    {
        /**
         * Gets if this structure is full.
         * 
         * @type {boolean}
         * @memberof Structure
         */
        IsFull: {
            get: function(): boolean {
                if (this.store) {
                    return _.sum(this.store) >= this.storeCapacity;
                }
                if (this.energy) {
                    return this.energy >= this.energyCapacity;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        }
    }
);

/**
 * Gets if this structure has no more of the given resource.
 *
 * @param {string} resource
 * @returns {boolean}
 * @memberof Structure
 */
Structure.prototype.IsEmpty = function(resource: string): boolean {
    if (this.store && resource) {
        return this.store[resource] !== 0;
    }
    if (this.energy) {
        return this.energy !== 0;
    }
    return false;
};
