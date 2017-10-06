import Filler from "../Minions/Filler"

/**
 * Link, used to send resources around a room.
 * 
 * @export
 * @class Link
 */
export default class Link {
    private readonly link: StructureLink;

    /**
     * Creates an instance of Link.
     * @param {Link} link 
     * @memberof Link
     */
    constructor(link: StructureLink) {
        this.link = link;
    }

    /**
     * Gets if the link is on cooldown
     * 
     * @readonly
     * @type {boolean}
     * @memberof Link
     */
    public get IsOnCooldown(): boolean {
        return this.link.cooldown > 0;
    }

    /**
     * Gets if this link is a source
     * 
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Link
     */
    public get IsSource(): boolean {
        return this.link.pos.findInRange(FIND_SOURCES, 3).length > 0;
    }

    /**
     * Runs the Link
     * 
     * @memberof Link
     */
    public Run() {
        if (this.IsOnCooldown) {
            return;
        }

        if (this.IsSource) {
            let percentage = this.link.energy / this.link.energyCapacity;
            if (percentage < 0.5) {
                return;
            }
            let target: StructureLink = this.link.pos.findClosestByRange(FIND_STRUCTURES, {
                filter : (link: StructureLink) => link.structureType == STRUCTURE_LINK && link.id != this.link.id
            });
            if (!target || target.energy == target.energyCapacity) {
                return;
            }
            this.TransferToTarget(target, target.energyCapacity - target.energy);
        }
    }

    private TransferToTarget(target: StructureLink | Creep, targetFreeSpace: number) {
        this.link.transferEnergy(target, targetFreeSpace > this.link.energy ? this.link.energy : targetFreeSpace);
    }
}

require("screeps-profiler").registerClass(Link, "Link");