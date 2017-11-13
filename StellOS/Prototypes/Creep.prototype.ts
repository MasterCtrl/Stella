Object.defineProperties(
    Creep.prototype,
    {
        /**
         * Gets the source this unit should harvest.
         *
         * @type {SourceContext}
         * @memberof Creep
         */
        Source: {
            get: function(): SourceContext {
                const creep = this as Creep;
                if (creep.memory.source === undefined) {
                    creep.memory.source = creep.room.FindSource(creep);
                }
                return creep.memory.source;
            },
            enumerable: true,
            configurable: true
        }
    }
);
