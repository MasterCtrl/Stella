/**
 * Unit base class, contains common unit logic.
 * TODO: this is just the tutorial code... just for testing, probably want a base class for some common stuff and preferably use warinternals
 * pushdown automata example: https://screeps.slack.com/files/U1XTCBJ9L/F7KTF6KMJ/Pushdown_Automata_-_Stack_machine_prototypes__with_examples_.js
 *
 * @export
 * @abstract
 * @class Unit
 * @implements {IUnit}
 */
export default abstract class Unit implements IUnit {
    private readonly unit;
    private readonly kernel;

    /**
     * Creates an instance of Unit.
     * 
     * @param {Creep} unit 
     * @param {IKernel} kernel 
     * @memberof Unit
     */
    public constructor(unit: Creep, kernel: IKernel) {
        this.unit = unit;
        this.kernel = kernel;
        if (!this.Unit.memory.initalized) {
            this.PushState("Initialization");
            this.Unit.memory.initalized = true;
        }
    }

    /**
     * Gets the unit.
     *
     * @readonly
     * @type {Creep}
     * @memberof Unit
     */
    public get Unit(): Creep {
        return this.unit;
    }

    /**
     * Gets the kernel. 
     *
     * @readonly
     * @type {IKernel}
     * @memberof Unit
     */
    public get Kernel(): IKernel {
        return this.kernel;
    }

    /**
     * Gets or sets the memory of this unit.
     *
     * @type {*}
     * @memberof Unit
     */
    public get Memory(): any {
        return this.Unit.memory || (this.Unit.memory = {});
    }
    public set Memory(value: any) {
        this.Unit.memory = value;
    }

    /**
     * Gets or sets the state stack of this unit
     *
     * @type {IState[]}
     * @memberof Unit
     */
    public get Stack(): IState[] {
        return this.Memory.stack || (this.Memory.stack = []);
    }
    public set Stack(value: IState[]) {
        this.Memory.stack = value;
    }

    /**
     * Gets if the units is empty.
     *
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Minion
     */
    protected get IsEmpty(): boolean {
        return this.TotalCarry === 0;
    }

    /**
     * Gets if the units carry capacity is full.
     *
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Minion
     */
    protected get IsFull(): boolean {
        return !this.IsEmpty && this.Unit.getActiveBodyparts(WORK) * 2 >= this.Unit.carryCapacity - this.TotalCarry;
    }

    /**
     * Gets the total of all resources on this minion.
     *
     * @readonly
     * @protected
     * @type {number}
     * @memberof Minion
     */
    protected get TotalCarry(): number {
        return _.sum(this.Unit.carry);
    }

    /**
     * Executes this unit.
     *
     * @memberof Unit
     */
    public Execute(): void {
        this.InvokeState();
    }

    /**
     * Invokes the state on top of the stack.
     *
     * @returns {boolean}
     * @memberof Unit
     */
    public InvokeState(): boolean {
        if (!this.Stack || !this.Stack.length) {
            this.Unit.say("🚬");
            return false;
        }
        const current = this.Stack[0];
        const method = `Run${current.State}`;
        if (!this[method]) {
            return false;
        }
        this[method](current.Context);
        return true;
    }

    /**
     * Gets the state on top of the stack.
     *
     * @param {string} [defaultState="I"]
     * @returns {string}
     * @memberof Unit
     */
    public GetState(defaultState: string = "I"): string {
        if (!this.Stack) {
            return defaultState;
        }
        return this.Stack[0].State || defaultState;
    }

    /**
     * Sets the state at the top of the stack.
     *
     * @param {string} state
     * @param {*} context
     * @returns {string}
     * @memberof Unit
     */
    public SetState(state: string, context: any): string {
        this.Stack[0] = { State: state, Context: context };
        return state;
    }

    /**
     * Pushes a state onto the stack.
     *
     * @param {string} state
     * @param {*} [context={}]
     * @returns {string}
     * @memberof Unit
     */
    public PushState(state: string, context?: any): string {
        const method = `Run${state}`;
        if (!this[method]) {
            throw new Error(`${method} is not a valid state.`);
        }
        if (this.Stack.length >= 50) {
            throw new Error("Stack limit exceeded");
        }
        this.Stack.unshift({ State: state, Context: context });
        return state;
    }

    /**
     * Pops the current state off the stack.
     *
     * @returns {void}
     * @memberof Unit
     */
    public PopState(): void {
        if (!this.Stack || !this.Stack.length) {
            return;
        }
        const current = this.Stack.shift();
        if (!this.Stack.length) {
            this.Stack = undefined;
        }
    }

    /**
     * Clears the stack.
     *
     * @memberof Unit
     */
    public ClearState(): void {
        this.Stack = undefined;
    }

    /**
     * Moves the unit to the specified position.
     *
     * @protected
     * @param {*} context 
     * @memberof Unit
     */
    protected RunMoveTo(context: any): void {
        const { position, range = 1 } = context;
        const roomPos = new RoomPosition(position.x, position.y, position.room || this.Unit.room.name);
        const result = this.Unit.moveTo(roomPos, { range: range });
        if (result === ERR_NO_PATH) {
            this.PopState();
        }
    }

    /**
     * Harvests a resource.
     *
     * @protected
     * @param {*} context 
     * @memberof Unit
     */
    protected RunHarvesting(context: any): void {
        const { sourceId } = context;
        const source = Game.getObjectById<Source|Mineral>(sourceId);
        if (!source) {
            this.PopState();
        }
        const result = this.Unit.harvest(source);
        if (this.IsFull || result === ERR_NOT_ENOUGH_RESOURCES) {
            this.PopState();
        }
    }

    /**
     * Transfers resources to a target.
     *
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunTransfering(context: any): void {
        const { targetId, resource } = context;
        const target = Game.getObjectById<Creep|Structure>(targetId);
        if (!target) {
            this.PopState();
        }
        const result = this.Unit.transfer(target, resource);
        if (this.IsEmpty || result === ERR_FULL) {
            this.PopState();
        }
    }

    /**
     * Upgrades a room controller.
     *
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunUpgrading(context: any): void {
        const result = this.Unit.upgradeController(this.Unit.room.controller);
        if (this.IsEmpty || result !== OK) {
            this.PopState();
        }
    }

    /**
     * Builds a structure.
     *
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunBuilding(context: any): void {
        const { constructionSiteId } = context;
        const constructionSite = Game.getObjectById<ConstructionSite>(constructionSiteId);
        if (!constructionSite) {
            this.PopState();
        }
        const result = this.Unit.build(constructionSite);
        if (this.IsEmpty || result !== OK) {
            this.PopState();
        }
    }

    /**
     * Runs the Initialization for this unit.
     *
     * @abstract
     * @memberof Unit
     */
    public abstract RunInitialization(): void;
}
