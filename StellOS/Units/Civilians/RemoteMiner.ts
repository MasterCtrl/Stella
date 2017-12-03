import {Unit, UnitDefinition, States} from "../Unit";

/**
 * RemoteMiner minion, used to mine a remote room.
 *
 * @export
 * @class RemoteMiner
 * @extends {Unit}
 */
export class RemoteMiner extends Unit {
    /**
     * Initializes the units state stack.
     *
     * @memberof RemoteMiner
     */
    public InitializeState(): void {
        if (this.IsEmpty) {
            const flagContext = this.FindFlag(FlagColor);
            if (flagContext && flagContext.position.room !== this.Unit.room.name) {
                this.PushState(States.MoveTo, flagContext);
                return;
            }

            const sourceContext = this.FindClosestSource();
            if (sourceContext) {
                this.PushState(States.Harvest, sourceContext);
                return;
            }
        } else {
            const moveContext = this.FindHomeRoom();
            if (moveContext) {
                this.PushState(States.MoveTo, moveContext);
                return;
            }

            const transferContext = this.FindTransferTarget([STRUCTURE_STORAGE]);
            if (transferContext) {
                this.PushState(States.Transfer, transferContext);
                return;
            }
        }
    }
}

/**
 * RemoteMiner definition.
 *
 * @export
 * @class RemoteMinerDefinition
 * @extends {UnitDefinition}
 */
export class RemoteMinerDefinition extends UnitDefinition {
    /**
     * Gets the RemoteMiner population for this room.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof RemoteMinerDefinition
     */
    public Population(room: Room): number {
        return _.filter(Game.flags, (f) => f.color === FlagColor).length - _.filter(Memory.creeps, (c) => c.type === RemoteMiner.name).length;
    }

    /**
     * Creates a RemoteMiner body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof RemoteMinerDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetPartsFromRoom(room, 8, [WORK, CARRY, CARRY, MOVE]);
    }
}

const FlagColor = COLOR_CYAN;
