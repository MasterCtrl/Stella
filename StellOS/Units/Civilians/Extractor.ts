import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Extractor unit, used to harvest minerals.
 *
 * @export
 * @class Extractor
 * @extends {Unit}
 */
export class Extractor extends Unit {
    /**
     * Initializes this unit.
     *
     * @returns {void}
     * @memberof Extractor
     */
    public InitializeState(): void {
        const sourceContext = this.FindMineral();
        if (sourceContext) {
            this.PushState(States.Harvest, sourceContext);
            return;
        }

        const transferContext = this.FindTransferTarget([STRUCTURE_TERMINAL]) || this.FindTransferTarget([STRUCTURE_SPAWN]);
        if (transferContext) {
            this.PushState(States.Transfer, transferContext);
            return;
        }

        if (this.Memory.DeathRow < 3) {
            this.Memory.DeathRow++;
            return;
        }

        if (this.Unit.room.RecycleBin) {
            this.PushState(States.Recycle, this.Unit.room.RecycleBin);
        } else {
            this.ClearState();
            this.Unit.suicide();
        }
    }
}

/**
 * Extractor definition.
 *
 * @export
 * @class ExtractorDefinition
 * @extends {UnitDefinition}
 */
export class ExtractorDefinition extends UnitDefinition {
    /**
     * Gets the Extractor population to maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof ExtractorDefinition
     */
    public Population(room: Room): number {
        const mineral = _.first(room.find<Mineral>(FIND_MINERALS));
        return mineral && mineral.HasExtractor && mineral.mineralAmount > 0 ? 1 : 0;
    }
}
