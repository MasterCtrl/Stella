import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Medic unit, used to heal allied units.
 *
 * @export
 * @class Medic
 * @extends {Unit}
 */
export class Medic extends Unit {
    /**
     * Initializes this unit.
     *
     * @memberof Medic
     */
    public InitializeState(): void {
        if (this.Unit.room.Defcon.level < 4) {
            const flagContext = this.FindFlag(FlagColor);
            if (flagContext && flagContext.position.room !== this.Unit.room.name) {
                this.PushState(States.MoveTo, flagContext);
                return;
            }
        }

        const healContext = this.FindAlly();
        if (healContext) {
            this.PushState(States.RangedHeal, healContext);
        }

        const hostileContext = this.FindHostile([FIND_HOSTILE_CREEPS]);
        if (hostileContext) {
            this.PushState(States.MeleeAttack, hostileContext);
            return;
        }
    }
}

/**
 * Medic definition.
 *
 * @export
 * @class MedicDefinition
 * @extends {UnitDefinition}
 */
export class MedicDefinition extends UnitDefinition {
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
     * @memberof MedicDefinition
     */
    public Population(room: Room): number {
        return Math.min(Math.floor(room.Defcon.level / 4), 2) ||
               _.filter(Game.flags, (f) => f.color === FlagColor).length - _.filter(Memory.creeps, (c) => c.type === Medic.name).length;
    }

    /**
     * Creates a attacking body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof MedicDefinition
     */
    public CreateBody(room: Room): string[] {
        // Need to front load the tough parts and rear load the heal parts
        return this.GetSpecificParts(room, 3, [TOUGH], [MOVE, MOVE, MOVE], [HEAL, HEAL]);
    }
}

const FlagColor = COLOR_RED;
