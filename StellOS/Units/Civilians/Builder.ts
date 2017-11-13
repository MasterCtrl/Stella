import { Unit, UnitDefinition, States } from "../Unit";

/**
 * Builder minion, used to build and repair structures.
 *
 * @export
 * @class Builder
 * @extends {Unit}
 */
export class Builder extends Unit {
    /**
     * Initializes the units state stack.
     *
     * @memberof Builder
     */
    public InitializeState(): void {
        const sourceContext = this.Unit.Source || this.FindClosestSource();
        if (sourceContext) {
            this.PushState(States.Harvest, sourceContext);
            return;
        }

        const buildContext = this.FindConstructionSite();
        if (buildContext) {
            this.PushState(States.Build, buildContext);
            return;
        }

        if (this.Unit.room.RecycleBin) {
            this.PushState(States.Recycle, this.Unit.room.RecycleBin);
        } else {
            this.Unit.suicide();
        }
    }
}

/**
 * Builder definition.
 *
 * @export
 * @class BuilderDefinition
 * @extends {UnitDefinition}
 */
export class BuilderDefinition extends UnitDefinition {
    /**
     * Gets the builder population for this room.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof BuilderDefinition
     */
    public Population(room: Room): number {
        return room.find(FIND_CONSTRUCTION_SITES).length > 0 ? room.find(FIND_SOURCES).length : 0;
    }
}
