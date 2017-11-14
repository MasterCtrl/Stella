import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Filler unit, used to move energy from the source link.
 *
 * @export
 * @class Filler
 * @extends {Unit}
 */
export class Filler extends Unit {
    /**
     * Initializes this unit.
     *
     * @returns {void}
     * @memberof Filler
     */
    public InitializeState(): void {
        if (this.Unit.ticksToLive <= 50) {
            this.PushState(States.Renew, this.FindSpawn());
            return;
        }

        const withdrawContext = this.Unit.room.CentralLink;
        if (withdrawContext) {
            this.PushState(States.Withdraw, withdrawContext);
            return;
        }

        const transferContext = this.FindTransferTarget([STRUCTURE_STORAGE]);
        if (transferContext) {
            this.PushState(States.Transfer, transferContext);
        }
    }
}

/**
 * Filler definition.
 *
 * @export
 * @class FillerDefinition
 * @extends {UnitDefinition}
 */
export class FillerDefinition extends UnitDefinition {
    /**
     * Gets the filler population to maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof FillerDefinition
     */
    public Population(room: Room): number {
        return room.IsLinkMining ? 1 : 0;
    }

    /**
     * Creates a filler body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof FillerDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetPartsFromRoom(room, 4, [CARRY, CARRY, CARRY, MOVE]);
    }
}
