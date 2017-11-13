import { Unit, UnitDefinition, States } from "../Unit";
/**
 * Courier unit, used to move energy around the room.
 * 
 * @export
 * @class Courier
 * @extends {Unit}
 */
export class Courier extends Unit {
    /**
     * Initializes this unit.
     * 
     * @returns {void}
     * @memberof Courier
     */
    public InitializeState(): void {
        const droppedEnergyContext = this.FindDroppedResource();
        if (droppedEnergyContext) {
            this.PushState(States.Pickup, droppedEnergyContext);
        }

        const withdrawContext = this.FindWithdrawSource([STRUCTURE_CONTAINER]) ||
                                this.FindWithdrawSource([STRUCTURE_STORAGE]);
        if (withdrawContext) {
            this.PushState(States.Withdraw, withdrawContext);
        }

        const transferContext = this.FindTransferTarget([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]) ||
                                this.FindTransferTarget([STRUCTURE_STORAGE]);
        if (transferContext) {
            this.PushState(States.Transfer, transferContext);
            return;
        }

        const moveContext = this.FindFlag(COLOR_WHITE, this.Unit.room.name);
        if (moveContext) {
            this.PushState(States.MoveTo, moveContext);
        }
    }
}

/**
 * Courier definition.
 *
 * @export
 * @class CourierDefinition
 * @extends {UnitDefinition}
 */
export class CourierDefinition extends UnitDefinition {
    /**
     * Gets the courier population to maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof CourierDefinition
     */
    public Population(room: Room): number {
        return room.IsLinkMining || room.IsContainerMining ? room.Sources.length : 0;
    }

    /**
     * Creates a courier body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof CourierDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetPartsFromRoom(room, 4, [CARRY, MOVE, CARRY, MOVE]);
    }
}
