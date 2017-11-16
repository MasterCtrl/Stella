import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Guardian unit, used defend rooms.
 *
 * @export
 * @class Guardian
 * @extends {Unit}
 */
export class Guardian extends Unit {
    /**
     * Initializes this unit.
     *
     * @memberof Guardian
     */
    public InitializeState(): void {
        const hostileContext = this.FindHostile([FIND_HOSTILE_CREEPS]);
        if (hostileContext) {
            this.PushState(States.RangedAttack, hostileContext);
            return;
        }

        const flagContext = this.FindFlag(COLOR_WHITE, this.Unit.room.name);
        if (flagContext) {
            this.PushState(States.MoveTo, flagContext);
            return;
        }
    }
}

/**
 * Guardian definition.
 *
 * @export
 * @class GuardianDefinition
 * @extends {UnitDefinition}
 */
export class GuardianDefinition extends UnitDefinition {
    /**
     * Gets the priority of this unit.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof GuardianDefinition
     */
    public Priority(room: Room): number {
        return 9 - room.Defcon.level;
    }

    /**
     * Gets the global unit population to maintain. 
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof GuardianDefinition
     */
    public Population(room: Room): number {
        const defcon = room.Defcon;
        return !defcon ? 0 : Math.min(Math.floor(defcon.level / 2), 4) * 2;
    }

    /**
     * Creates a claiming body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof GuardianDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetSpecificParts(room, 4, [TOUGH], [RANGED_ATTACK, MOVE, MOVE]);
    }
 }
