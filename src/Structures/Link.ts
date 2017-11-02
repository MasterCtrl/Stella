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
     * Gets if this link is a target
     *
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Link
     */
    public get IsTarget(): boolean {
        return this.link.room.memory.linkTarget === this.link.id;
    }

    /**
     * Runs the Link
     *
     * @returns {boolean}
     * @memberof Link
     */
    public Run(): boolean {
        if (this.IsOnCooldown || this.IsTarget || this.link.energy / this.link.energyCapacity < 0.5) {
            return false;
        }

        const target = this.link.pos.findClosestByRange<StructureLink>(FIND_STRUCTURES, {
            filter: (l) => l.structureType === STRUCTURE_LINK && l.id === this.link.room.memory.linkTarget
        });
        if (!target || target.energy === target.energyCapacity) {
            return false;
        }

        return this.TransferToTarget(target, target.energyCapacity - target.energy);
    }

    private TransferToTarget(target: StructureLink, targetFreeSpace: number) {
        const result = this.link.transferEnergy(target, targetFreeSpace > this.link.energy ? this.link.energy : targetFreeSpace);
        return result === OK;
    }
}
