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
        // TODO
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
        const minerals: Mineral[] = room.find(FIND_MINERALS);
        // TODO: this sucks
        if (minerals.length > 0 && minerals[0].mineralAmount > 0 && room.find(FIND_STRUCTURES, { filter: (e) => e.structureType === STRUCTURE_EXTRACTOR }).length === 1) {
            return 1;
        }
        return 0;
    }
}
