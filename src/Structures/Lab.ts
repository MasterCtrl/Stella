/**
 * Lab, used to process minerals and boost minions.
 *
 * @export
 * @class Lab
 */
export default class Lab {
    private readonly lab: StructureLab;

    /**
     * Creates an instance of Lab.
     * @param {StructureLab} lab
     * @memberof Lab
     */
    constructor(lab: StructureLab) {
        this.lab = lab;
    }

    /**
     * Gets if the lab is on cooldown
     *
     * @readonly
     * @type {boolean}
     * @memberof lab
     */
    public get IsOnCooldown(): boolean {
        return this.lab.cooldown > 0;
    }

    /**
     * Runs the lab.
     *
     * @returns {boolean}
     * @memberof Lab
     */
    public Run(): boolean {
        if (this.IsOnCooldown || this.lab.energy === 0) {
            return false;
        }
        return false;
    }
}
