import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Miner unit, used to harvest energy.
 *
 * @export
 * @class Miner
 * @extends {Unit}
 */
export class Miner extends Unit {
    /**
     * Initializes this unit.
     *
     * @returns {void}
     * @memberof Miner
     */
    public InitializeState(): void {
        const sourceContext = this.FindMinerSource();
        if (sourceContext) {
            this.PushState(States.Harvest, sourceContext);
            return;
        }

        if (!this.Unit.room.IsLinkMining || this.Unit.getActiveBodyparts(CARRY) === 0 || this.IsEmpty) {
            return;
        }

        const transferContext = _.find(this.Unit.room.Links, { sourceId: this.Unit.Source.sourceId });
        if (transferContext) {
            this.PushState(States.Transfer, transferContext);
        }
    }
}

/**
 * Miner definition.
 *
 * @export
 * @class MinerDefinition
 * @extends {UnitDefinition}
 */
export class MinerDefinition extends UnitDefinition {
    /**
     * Gets the Miner population to maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof MinerDefinition
     */
    public Population(room: Room): number {
        return room.IsContainerMining || room.IsLinkMining ? room.Sources.length : 0;
    }

    /**
     * Creates a Miner body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof MinerDefinition
     */
    public CreateBody(room: Room): string[] {
        let body: string[];
        let max: number;
        if (room.IsContainerMining) {
            body = [WORK, WORK, MOVE];
        } else if (room.IsLinkMining) {
            body = [WORK, CARRY, MOVE];
        } else {
            return [];
        }
        const baseCost = this.GetPartsCost(body);
        let energy = room.energyAvailable - baseCost;
        while (energy >= BODYPART_COST[WORK]) {
            body.unshift(WORK);
            energy -= BODYPART_COST[WORK];
        }

        return body;
    }
}
