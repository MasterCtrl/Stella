import {Traveler} from "./Traveler";

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
        },

        /**
         * Gets the current target of this unit from its state stack.
         *
         * @type {string}
         * @memberof Creep
         */
        CurrentTarget: {
            get: function(): string {
                const creep = this as Creep;
                if (!creep.memory.stack || creep.memory.stack < 2) {
                    return undefined;
                }
                const current = creep.memory.stack[0];
                return current.targetId || current.sourceId || current.constructionSiteId;
            }
        }
    }
);

Creep.prototype.travelTo = function(destination: RoomPosition|{pos: RoomPosition}, options?: TravelToOptions) {
    return Traveler.travelTo(this, destination, options);
};
