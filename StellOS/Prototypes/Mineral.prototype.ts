Object.defineProperties(
    Mineral.prototype,
    {
        /**
         * Get if this mineral has an extractor.
         *
         * @type {boolean}
         * @memberof Mineral
         */
        HasExtractor: {
            get: function(): boolean {
                const mineral = this as Mineral;
                return mineral.pos.lookFor(STRUCTURE_EXTRACTOR).length === 1;
            },
            enumerable: true,
            configurable: true
        }
    }
);
