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
        if (!this.Memory) {
            this.Initialize();
        }
    }

    /**
     * Gets the memory of this lab.
     * 
     * @readonly
     * @type {*}
     * @memberof Lab
     */
    public get Memory(): any {
        return this.lab.room.memory.labs[this.lab.id];
    }

    /**
     * Gets the resource this lab should create/store.
     *
     * @readonly
     * @type {string}
     * @memberof Lab
     */
    public get Resource(): string {
        return this.lab.mineralType || this.Memory.resource;
    }

    /**
     * Gets if this lab can boost minions.
     *
     * @readonly
     * @type {boolean}
     * @memberof Lab
     */
    public get IsBooster(): boolean {
        return !this.Memory.inert;
    }

    /**
     * Runs the lab.
     *
     * @returns {boolean}
     * @memberof Lab
     */
    public Run(): boolean {
        if (this.lab.cooldown !== 0 || this.lab.energy === 0) {
            return false;
        }

        if (this.RunReaction()) {
            return true;
        }

        if (this.RunBoost()) {
            return true;
        }

        return false;
    }

    private Initialize() {
        const memory = {
            resource: undefined,
            inert: true
        };

        const assignedResources = _.filter(this.lab.room.memory.labs, (l: any) => l.resource).map((l) => l.resource);
        for (const mineral of Memory.Minerals.Inert) {
            if (assignedResources.indexOf(mineral) !== -1) {
                continue;
            }

            memory.resource = mineral;
            break;
        }

        this.lab.room.memory.labs[this.lab.id] = memory;
    }

    private RunReaction(): boolean {
        if (this.lab.mineralAmount >= this.lab.mineralCapacity) {
            return false;
        }
        const reagents = Memory.Minerals.Reactions[this.Resource];
        if (reagents && reagents.length === 2) {
            const labs = new Array<StructureLab>();
            for (const id in this.lab.room.memory.labs) {
                const memory = this.lab.room.memory.labs[id];
                if (!memory || reagents.indexOf(memory.resource) === -1) {
                    continue;
                }
                labs.push(Game.getObjectById(id));
            }

            if (labs.length === 2) {
                const result = this.lab.runReaction(labs[0], labs[1]);
                return result === OK;
            }
        }
        return false;
    }

    private RunBoost(): boolean {
        if (!this.IsBooster) {
            return false;
        }

        const part = Memory.Minerals.Boosts[this.Resource];
        if (part) {
            const minions = this.lab.pos.findInRange<Creep>(FIND_MY_CREEPS, 1, {
                filter: (m: Creep) => m.getActiveBodyparts(part) > 0
            });

            if (minions.length > 0) {
                const result = this.lab.boostCreep(minions[0]);
                return result === OK;
            }
        }

        return false;
    }
}
