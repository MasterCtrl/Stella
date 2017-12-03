import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Raider unit, used to attack another room.
 *
 * @export
 * @class Raider
 * @extends {Unit}
 */
export class Raider extends Unit {
    /**
     * Initializes this unit.
     *
     * @memberof Raider
     */
    public InitializeState(): void {
        const flagContext = this.FindFlag(FlagColor);
        if (flagContext && flagContext.position.room !== this.Unit.room.name) {
            this.PushState(States.MoveTo, flagContext);
            return;
        }

        // May need something to get through walls
        const hostileContext = this.FindHostile([FIND_HOSTILE_CREEPS, FIND_HOSTILE_STRUCTURES]);
        if (hostileContext) {
            this.PushState(States.RangedAttack, hostileContext);
            return;
        }
    }
}

/**
 * Raider definition.
 *
 * @export
 * @class RaiderDefinition
 * @extends {UnitDefinition}
 */
export class RaiderDefinition extends UnitDefinition {
    /**
     * Gets the global unit population to maintain. 
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof RaiderDefinition
     */
    public Population(room: Room): number {
        return _.filter(Game.flags, (f) => f.color === FlagColor).length - _.filter(Memory.creeps, (c) => c.type === Raider.name).length;
    }

    /**
     * Creates a attacking body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof RaiderDefinition
     */
    public CreateBody(room: Room): string[] {
        // Need to front load the tough parts and rear load the heal parts
        return this.GetSpecificParts(room, 8, [TOUGH], [RANGED_ATTACK, MOVE, MOVE]);
    }
}

const FlagColor = COLOR_RED;
