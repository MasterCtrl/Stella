import Logger from "../../os/Logger";
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
        const hostile = this.Unit.pos.findClosestByPath<Creep>(FIND_HOSTILE_CREEPS);
        if (hostile) {
            this.PushState(
                States.RangedAttack,
                { targetId: hostile.id }
            );
            return;
        }
        const flag = _.find(Game.flags, (f) => f.color === COLOR_WHITE && f.room.name === this.Unit.room.name);
        if (flag) {
            this.PushState(
                States.MoveTo,
                { position: { x: flag.pos.x, y: flag.pos.y, room: flag.pos.roomName }, range: 1 }
            );
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
        return this.GetPartsFromRoom(room, 4, [TOUGH, RANGED_ATTACK, MOVE, MOVE]);
    }
 }
