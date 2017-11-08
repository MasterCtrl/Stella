import Logger from "../os/Logger";

/**
 * Unit base class, contains common unit logic.
 * This is my implementation of warinternal's push down automata example: 
 * https://screeps.slack.com/files/U1XTCBJ9L/F7KTF6KMJ/Pushdown_Automata_-_Stack_machine_prototypes__with_examples_.js
 *
 * @export
 * @abstract
 * @class Unit
 * @implements {IUnit}
 */
export abstract class Unit implements IUnit {
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
        if (!this.Unit.memory.initialized) {
            this.PushState(States.Initialize);
            this.Unit.memory.initialized = true;
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
     * Executes the state on top of the stack.
     *
     * @returns {boolean}
     * @memberof Unit
     */
    public Execute(): boolean {
        if (!this.Stack || !this.Stack.length) {
            this.Unit.say("🚬");
            return false;
        }
        const current = this.Stack[0];
        const method = `Run${current.State}`;
        if (!this[method]) {
            return false;
        }
        Logger.Current.Debug(`${this.Unit.name} executing state: ${current.State}`);
        this[method](current.Context);
        return true;
    }

    /**
     * Gets the state on top of the stack.
     *
     * @param {string} [defaultState=""]
     * @returns {string}
     * @memberof Unit
     */
    public GetState(defaultState: string = ""): string {
        if (!this.Stack) {
            return defaultState;
        }
        return this.Stack[0].State || defaultState;
    }

    /**
     * Sets the state at the top of the stack.
     *
     * @param {string} state 
     * @param {*} [context] 
     * @returns {string} 
     * @memberof Unit
     */
    public SetState(state: string, context?: any): string {
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
        this.Unit.memory.initialized = false;
    }

    /**
     * Initializes the units state stack.
     *
     * @abstract
     * @memberof Unit
     */
    public abstract InitializeState(): void;

    /**
     * Initializes this unit.
     * 
     * @protected
     * @memberof Unit
     */
    protected RunInitialize(): void {
        this.InitializeState();
        this.Execute();
    }

    /**
     * Moves the unit to the specified position.
     *
     * @protected
     * @param {*} context 
     * @memberof Unit
     */
    protected RunMoveTo(context: any): void {
        const { position, range } = context;
        const result = this.Unit.moveTo(new RoomPosition(position.x, position.y, position.room || this.Unit.room.name), { range: range });
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
    protected RunHarvest(context: SourceContext): void {
        const { sourceId, position, range = 1 } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const source = Game.getObjectById<Source|Mineral>(sourceId);
        if (!source) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.harvest(source);
        if (this.IsFull || result === ERR_NOT_ENOUGH_RESOURCES) {
            this.PopState();
        }
    }

    /**
     * Picks up a dropped resource.
     *
     * @protected
     * @param {TargetContext} context
     * @returns {void}
     * @memberof Unit
     */
    protected RunPickup(context: TargetContext): void {
        const { targetId, position, range = 1 } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const resource = Game.getObjectById<Resource>(targetId);
        const result = this.Unit.pickup(resource);
        this.PopState();
    }

    /**
     * Transfers resources to a target.
     *
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunTransfer(context: ResourceContext): void {
        const { targetId, resource, position, range = 1  } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const target = Game.getObjectById<Creep|Structure>(targetId);
        if (!target) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.transfer(target, resource);
        if (this.IsEmpty || result === ERR_FULL) {
            this.PopState();
        }
    }

    /**
     * Withdraws resources from a target.
     *
     * @protected
     * @param {ResourceContext} context
     * @memberof Unit
     */
    protected RunWithdraw(context: ResourceContext): void {
        const { targetId, resource, position, range = 1  } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const target = Game.getObjectById<Structure>(targetId);
        if (!target) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.withdraw(target, resource);
        if (this.IsFull || result !== OK) {
            this.PopState();
        }
    }

    /**
     * Upgrades the room controller.
     *
     * @protected
     * @memberof Unit
     */
    protected RunUpgrade(): void {
        const controller = this.Unit.room.controller;
        if (!this.InRange({ x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, 3)) {
            return;
        }

        const result = this.Unit.upgradeController(controller);
        if (this.IsEmpty || result !== OK) {
            this.PopState();
        }
    }

    /**
     * Signs the room controller.
     *
     * @protected
     * @param {SignContext} context
     * @returns {void}
     * @memberof Unit
     */
    protected RunSign(context: SignContext): void {
        const controller = this.Unit.room.controller;
        if (!this.InRange({ x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, 1)) {
            return;
        }

        const result = this.Unit.signController(controller, context.message);
        this.PopState();
    }

    /**
     * Claims the room controller.
     *
     * @protected
     * @returns {void}
     * @memberof Unit
     */
    protected RunClaim(): void {
        const controller = this.Unit.room.controller;
        if (!this.InRange({ x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, 1)) {
            return;
        }

        const result = this.Unit.claimController(controller);
        if (result === OK) {
            this.PopState();
        }
    }

    /**
     * Reserves the room controller.
     * Pushes to claim when gcl is high enough.
     *
     * @protected
     * @returns {void}
     * @memberof Unit
     */
    protected RunReserve(): void {
        const controller = this.Unit.room.controller;
        if (!this.InRange({ x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, 1)) {
            return;
        }
        if (Game.gcl.level > _.filter(Game.rooms, (r) => r.controller.my).length) {
            this.SetState(States.Claim);
            this.Execute();
            return;
        }

        this.Unit.reserveController(controller);
    }

    /**
     * Attacks the room controller.
     * Pushes to reserve when the controller is at level 0.
     *
     * @protected
     * @returns {void}
     * @memberof Unit
     */
    protected RunAttackController(): void {
        const controller = this.Unit.room.controller;
        if (!this.InRange({ x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, 1)) {
            return;
        }
        if (controller.level === 0) {
            this.SetState(States.Reserve);
            this.Execute();
            return;
        }

        this.Unit.attackController(controller);
    }

    /**
     * Builds a structure.
     *
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunBuild(context: BuildContext): void {
        const { constructionSiteId, position, range = 3 } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const constructionSite = Game.getObjectById<ConstructionSite>(constructionSiteId);
        if (!constructionSite) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.build(constructionSite);
        if (this.IsEmpty || result !== OK) {
            this.PopState();
        }
    }

    /**
     * Repairs the target.
     *
     * @protected
     * @param {RepairContext} context 
     * @returns {void}
     * @memberof Unit
     */
    protected RunRepair(context: RepairContext): void {
        const { targetId, position, hits, range = 3  } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const structure = Game.getObjectById<Structure>(targetId);
        if (!structure) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.repair(structure);
        if (this.IsEmpty || result !== OK || structure.hits > (hits || structure.hitsMax)) {
            this.PopState();
        }
    }

    /**
     * Heals the target/self from range.
     *
     * @protected
     * @returns {void}
     * @memberof Unit
     */
    protected RunRangedHeal(context: TargetContext): void {
        const { targetId, range = 3 } = context;
        const target = targetId ? Game.getObjectById<Creep>(targetId) : this.Unit;
        if (!targetId && !this.Unit.pos.inRangeTo(target, range)) {
            this.Unit.moveTo(target);
        }

        this.Unit.rangedHeal(target);
        if (target.hits >= target.hitsMax) {
            this.PopState();
            return;
        }
    }

    /**
     * Heals the target/self.
     *
     * @protected
     * @returns {void}
     * @memberof Unit
     */
    protected RunHeal(context: TargetContext): void {
        const { targetId, range = 1 } = context;
        const target = targetId ? Game.getObjectById<Creep>(targetId) : this.Unit;
        if (!targetId && !this.Unit.pos.inRangeTo(target, range)) {
            this.Unit.moveTo(target);
        }

        this.Unit.heal(target);
        if (target.hits >= target.hitsMax) {
            this.PopState();
            return;
        }
    }

    /**
     * Attacks the target from range.
     * Attacking states are a bit different because the target can be moving so we want to be able to react immediately.
     *
     * @protected
     * @param {AttackContext} context
     * @returns {void}
     * @memberof Unit
     */
    protected RunRangedAttack(context: AttackContext): void {
        const { targetId, range = 3 } = context;
        const target = Game.getObjectById<Creep | Structure>(targetId);
        if (!target) {
            this.PopState();
            this.Execute();
            return;
        }
        const distance = this.Unit.pos.getRangeTo(target.pos.x, target.pos.y);
        if (distance > range) {
            this.Unit.moveTo(target);
        } else if (distance < range) {
            const targetDirection = this.Unit.pos.getDirectionTo(target);
            let kiteDirection = (targetDirection + 4) % 8;
            if (kiteDirection === 0) {
                kiteDirection = TOP_LEFT;
            }
            this.Unit.move(kiteDirection);
        }
        this.Unit.rangedAttack(target);
        if (this.Unit.getActiveBodyparts(HEAL) && this.Unit.hits < this.Unit.hitsMax) {
            this.PushState(States.Heal);
        }
    }

    /**
     * Melee attacks the target.
     * Attacking states are a bit different because the target can be moving so we want to be able to react immediately.
     *
     * @protected
     * @param {AttackContext} context
     * @returns {void}
     * @memberof Unit
     */
    protected RunMeleeAttack(context: AttackContext): void {
        const { targetId, range = 1 } = context;
        const target = Game.getObjectById<Creep | Structure>(targetId);
        if (!target) {
            this.PopState();
            this.Execute();
            return;
        }
        if (!this.Unit.pos.inRangeTo(target, range)) {
            this.Unit.moveTo(target);
        }
        this.Unit.attack(target);
        if (this.Unit.getActiveBodyparts(HEAL) && this.Unit.hits < this.Unit.hitsMax) {
            this.PushState(States.Heal);
        }
    }

    /**
     * Recycles the unit.
     *
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunRecycle(context: TargetContext): void {
        const { targetId, position, range = 1  } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const spawn = Game.getObjectById<StructureSpawn>(targetId);
        if (!spawn) {
            this.Unit.suicide();
            return;
        }

        spawn.recycleCreep(this.unit);
        this.ClearState();
    }

    /**
     * Renews this units life.
     * 
     * @protected
     * @param {*} context
     * @memberof Unit
     */
    protected RunRenew(context: TargetContext): void {
        const { targetId, position, range = 1  } = context;
        if (!this.InRange(position, range)) {
            return;
        }

        const spawn = Game.getObjectById<StructureSpawn>(targetId);
        if (!spawn) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = spawn.renewCreep(this.unit);
        if (result === OK) {
            this.PopState();
        }
    }

    private InRange(position: PositionContext, range: number): boolean {
        if (!this.Unit.pos.inRangeTo(new RoomPosition(position.x, position.y, position.room), range)) {
            this.PushState(States.MoveTo, { position, range });
            this.Execute();
            return false;
        }
        return true;
    }
}

/**
 * Unit states.
 *
 * @export
 * @enum {number}
 */
export enum States {
    Initialize = "Initialize",
    MoveTo = "MoveTo",
    Harvest = "Harvest",
    Pickup = "Pickup",
    Transfer = "Transfer",
    Withdraw = "Withdraw",
    Upgrade = "Upgrade",
    Sign = "Sign",
    Claim = "Claim",
    Reserve = "Reserve",
    AttackController = "AttackController",
    Build = "Build",
    Repair = "Repair",
    RangedHeal = "RangedHeal",
    Heal = "Heal",
    RangedAttack = "RangedAttack",
    MeleeAttack = "MeleeAttack",
    Recycle = "Recycle",
    Renew = "Renew"
}

/**
 * Unit definition base class.
 * 
 * @export
 * @abstract
 * @class UnitDefinition
 * @implements {IUnitDefinition}
 */
export abstract class UnitDefinition implements IUnitDefinition {
    private MinimumParts: string[] = [WORK, CARRY, MOVE];

    /**
     * Gets the default priority of this unit.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof UnitDefinition
     */
    public Priority(room: Room): number {
        return 9;
    }

    /**
     * Gets the default unit population this room should maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof UnitDefinition
     */
    public Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    }

    /**
     * Creates a default unit body based on the room.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof UnitDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetPartsFromRoom(room, 5);
    }

    /**
     * Builds a list of parts based on the room
     *
     * @protected
     * @param {Room} room 
     * @param {number} max 
     * @param {string[]} [parts=this.MinimumParts] 
     * @returns {string[]} 
     * @memberof UnitDefinition
     */
    protected GetPartsFromRoom(room: Room, max: number, parts: string[] = this.MinimumParts): string[] {
        const cost = this.GetPartsCost(parts);
        const size = Math.max(Math.floor(room.energyAvailable / cost), 1);
        return this.GetParts(size, parts);
    }

    /**
     * Builds a list of parts of the specified size
     *
     * @protected
     * @param {number} size 
     * @param {string[]} [partsToAdd=this.MinimumParts] 
     * @returns {string[]} 
     * @memberof UnitDefinition
     */
    protected GetParts(size: number, partsToAdd: string[] = this.MinimumParts): string[] {
        let parts = [];
        for (var index = 0; index < size; index++) {
            parts = parts.concat(partsToAdd);
        }
        return parts;
    }

    /**
     * Gets the cost of a list of parts
     *
     * @protected
     * @param {string[]} parts 
     * @returns {number} 
     * @memberof UnitDefinition
     */
    protected GetPartsCost(parts: string[]): number {
        let cost = 0;
        for (var part of parts) {
            cost += BODYPART_COST[part];
        }
        return cost;
    }
}
