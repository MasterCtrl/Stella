import RoomProcess from "./RoomProcess";

/**
 * Artillery process responsible for coordinating the towers in the room.
 *
 * @export
 * @class Artillery
 * @extends {RoomProcess}
 */
export default class Artillery extends RoomProcess {
    /**
     * Executes the Artillery process.
     *
     * @memberof Artillery
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

        for (const tower of this.Room.find<StructureTower>(FIND_MY_STRUCTURES, { filter: (t) => t.structureType === STRUCTURE_TOWER })) {
            const hostiles = tower.room.find<Creep>(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                const hostile = hostiles[Math.floor(Math.random() * hostiles.length)];
                tower.attack(hostile);
                continue;
            }
            const structures = tower.room.find<Structure>(FIND_STRUCTURES, {
                filter: (s) => s.structureType !== STRUCTURE_WALL &&
                               s.structureType !== STRUCTURE_RAMPART &&
                               s.hits < s.hitsMax
            });
            const structure = _.min(structures, (s) => s.HitPercentage);
            if (structure) {
                tower.repair(structure);
                continue;
            }
        }

        if (this.Room.Defcon.level >= 2) {
            // if we are being attacked then kick up the priority
            this.Priority = 1;
        } else {
            // if we aren't being attacked, reduce the priority and suspend for a while
            this.Priority = 5;
            this.Suspend(5);
        }
    }
}
