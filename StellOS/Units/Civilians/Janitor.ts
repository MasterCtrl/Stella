import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Janitor unit, used to repair structures around the room.
 *
 * @export
 * @class Janitor
 * @extends {Unit}
 */
export class Janitor extends Unit {
    /**
     * Initializes this unit.
     *
     * @returns {void}
     * @memberof Janitor
     */
    public InitializeState(): void {
        const droppedEnergyContext = this.FindDroppedResource(RESOURCE_ENERGY);
        if (droppedEnergyContext) {
            this.PushState(States.Pickup, droppedEnergyContext);
            return;
        }

        const withdrawContext = this.FindWithdrawSource([STRUCTURE_CONTAINER]) ||
                                this.FindWithdrawSource([STRUCTURE_STORAGE]);
        if (withdrawContext) {
            this.PushState(States.Withdraw, withdrawContext);
            return;
        }

        if (this.IsEmpty && this.Unit.Source) {
            this.PushState(States.Harvest, this.Unit.Source);
            return;
        }

        const repairContext = this.FindRepair([STRUCTURE_ROAD]) ||
                              this.FindRepair([]);
        if (repairContext) {
            this.PushState(States.Repair, repairContext);
            return;
        }

        this.PushState(States.Upgrade);
    }
}

/**
 * Janitor definition.
 *
 * @export
 * @class JanitorDefinition
 * @extends {UnitDefinition}
 */
export class JanitorDefinition extends UnitDefinition {
    /**
     * Gets the priority of this unit.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof UnitDefinition
     */
    public Priority(room: Room): number {
        return 8;
    }
    /**
     * Gets the Janitor population to maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof JanitorDefinition
     */
    public Population(room: Room): number {
        return 1;
    }

    /**
     * Creates a RemoteMiner body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof RemoteMinerDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetPartsFromRoom(room, 3, [WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
    }
}
