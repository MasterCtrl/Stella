import {Unit, UnitDefinition, States} from "../Unit";
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

        const transferContext = this.FindCourierTarget();
        if (transferContext) {
            this.PushState(States.Transfer, transferContext);
            return;
        }

        const moveContext = this.FindFlag(COLOR_WHITE, this.Unit.room.name);
        if (moveContext) {
            this.PushState(States.MoveTo, moveContext);
        }
    }

    private FindCourierTarget(): ResourceContext {
        let targetQueue = [() => this.FindTransferTarget([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]),
                           () => this.FindTransferTarget([STRUCTURE_TOWER])];
        if (this.Unit.room.Defcon.level > 2 && (this.Unit.room.energyAvailable / this.Unit.room.energyCapacityAvailable) > 0.5) {
            targetQueue = targetQueue.reverse();
        }
        targetQueue.push(() => this.FindUpgraderTarget());
        targetQueue.push(() => this.FindTransferTarget([STRUCTURE_STORAGE]));
        targetQueue.push(() => this.FindTransferTarget([STRUCTURE_TERMINAL]));
        for (const target of targetQueue) {
            const transferContext = target();
            if (transferContext) {
                return transferContext;
            }
        }
        return undefined;
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
     * Gets the priority of this unit.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof UnitDefinition
     */
    public Priority(room: Room): number {
        return 5;
    }

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
