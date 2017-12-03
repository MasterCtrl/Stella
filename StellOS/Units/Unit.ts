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
    private readonly log;
    private totalCarry: number;

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
        this.log = [];
        if (!this.Memory.DeathRow) {
            this.Memory.DeathRow = 0;
        }
        if (!this.Memory.initialized) {
            this.PushState(States.Initialize);
            this.Memory.initialized = true;
        }
        this.totalCarry = undefined;
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
        if (this.totalCarry === undefined) {
            this.totalCarry = _.sum(this.Unit.carry);
        }
        return this.totalCarry;
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
        if (Game.cpu.getUsed() > Game.cpu.limit * 0.99) {
            const message = "Unit execution aborted due to tick limit:" +
                `\n name=${this.Unit.name}` +
                `\n cpu=${Game.cpu.getUsed()}` +
                `\n count=${this.log.length}` +
                `\n stack=${JSON.stringify(this.log)}`;
            Logger.Error(message, this.Unit.room.name);
            return false;
        }
        const current = this.Stack[0];
        const method = `Run${current.State}`;
        if (!this[method]) {
            return false;
        }
        Logger.Debug(`${this.Unit.name} executing state: ${current.State}`);
        this.log.push(method);
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
     * @param {Context} [context] 
     * @returns {string} 
     * @memberof Unit
     */
    public PushState(state: string, context?: Context): string {
        if (this.Memory.DeathRow !== 0) {
            this.Memory.DeathRow = 0;
        }
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
        this.Memory.initialized = false;
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
        if (this.GetState(States.Initialize) !== States.Initialize) {
            // If we actually found another state to transition to then execute it immediately.
            this.Execute();
        }
    }

    /**
     * Moves the unit to the specified position.
     *
     * @protected
     * @param {*} context 
     * @memberof Unit
     */
    protected RunMoveTo(context: MoveContext): void {
        const { position, range } = context;
        const roomPosition = new RoomPosition(position.x, position.y, position.room || this.Unit.room.name);
        if (this.Unit.pos.inRangeTo(roomPosition, range)) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.travelTo(roomPosition, { range: range });
    }

    /**
     * Harvests a resource.
     *
     * @protected
     * @param {*} context 
     * @memberof Unit
     */
    protected RunHarvest(context: SourceContext): void {
        if (!this.InRange(context)) {
            return;
        }

        const source = Game.getObjectById<Source|Mineral>(context.sourceId);
        if (!source || this.IsFull) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.harvest(source);
        if (result === ERR_NOT_ENOUGH_RESOURCES) {
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
        if (!this.InRange(context)) {
            return;
        }

        const resource = Game.getObjectById<Resource>(context.targetId);
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
        if (!this.InRange(context)) {
            return;
        }

        const target = Game.getObjectById<Creep|Structure>(context.targetId);
        if (!target || this.IsEmpty) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.transfer(target, context.resource);
        if (result === ERR_FULL) {
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
        if (!this.InRange(context)) {
            return;
        }

        const target = Game.getObjectById<Structure>(context.targetId);
        if (!target || this.IsFull) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.withdraw(target, context.resource);
        if (result !== OK) {
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
        if (!this.InRange({ position: { x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, range: 3 })) {
            return;
        }
        if (this.IsEmpty) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.upgradeController(controller);
        if (result !== OK) {
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
        if (!this.InRange({ position: { x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, range: 1 })) {
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
        if (!this.InRange({ position: { x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, range: 1 })) {
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
        if (!this.InRange({ position: { x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, range: 1 })) {
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
        if (!this.InRange({ position: { x: controller.pos.x, y: controller.pos.y, room: controller.room.name }, range: 1 })) {
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
        if (!this.InRange(context)) {
            return;
        }

        const constructionSite = Game.getObjectById<ConstructionSite>(context.constructionSiteId);
        if (!constructionSite || this.IsEmpty) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.build(constructionSite);
        if (result !== OK) {
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
        if (!this.InRange(context)) {
            return;
        }

        const structure = Game.getObjectById<Structure>(context.targetId);
        if (!structure || this.IsEmpty || structure.hits >= (context.hits || structure.hitsMax)) {
            this.PopState();
            this.Execute();
            return;
        }

        const result = this.Unit.repair(structure);
        if (result !== OK) {
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
            this.Unit.travelTo(target, { range: range, movingTarget: true });
        }

        this.Unit.rangedHeal(target);
        if (target.hits >= target.hitsMax) {
            this.PopState();
            return;
        }
        if (this.Unit.hits < this.Unit.hitsMax) {
            this.PushState(States.Heal, { targetId: this.Unit.id });
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
            this.Unit.travelTo(target, { range: range, movingTarget: true });
        }

        this.Unit.heal(target);
        if (target.hits >= target.hitsMax) {
            this.PopState();
            return;
        }
        if (this.Unit.hits < this.Unit.hitsMax) {
            this.PushState(States.Heal, { targetId: this.Unit.id });
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
            this.Unit.travelTo(target, { range: range });
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
            this.PushState(States.Heal, { targetId: this.Unit.id });
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
            this.Unit.travelTo(target, { range: range });
        }
        this.Unit.attack(target);
        if (this.Unit.getActiveBodyparts(HEAL) && this.Unit.hits < this.Unit.hitsMax) {
            this.PushState(States.Heal, { targetId: this.Unit.id });
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
        if (context.range !== 0) {
            context.range = 0;
        }
        if (!this.InRange(context)) {
            return;
        }

        // the context is actually the recycle bin...
        const recycleBin = Game.getObjectById<StructureContainer>(context.targetId);
        if (!recycleBin) {
            this.Unit.suicide();
            return;
        }

        const spawn = recycleBin.pos.findClosestByRange<StructureSpawn>(FIND_MY_SPAWNS);
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
        if (!this.InRange(context)) {
            return;
        }

        const spawn = Game.getObjectById<StructureSpawn>(context.targetId);
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

    /**
     * Finds the closest source to harvest.
     *
     * @protected
     * @returns {SourceContext}
     * @memberof Unit
     */
    protected FindClosestSource(): SourceContext {
        if (!this.IsEmpty) {
            return undefined;
        }
        const source = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
        return source && source.pos ? { sourceId: source.id, position: { x: source.pos.x, y: source.pos.y, room: source.room.name }, range: 1 } : undefined;
    }

    /**
     * Finds the source this miner should harvest and where it should stand.
     *
     * @protected
     * @returns {SourceContext}
     * @memberof Unit
     */
    protected FindMinerSource(): SourceContext {
        if (!this.IsEmpty) {
            return undefined;
        }
        const sourceId = this.Unit.Source.sourceId;
        let sourceContext;
        if (this.Unit.room.IsContainerMining) {
            sourceContext = _.find(this.Unit.room.Containers, { sourceId: sourceId });
            sourceContext.range = 0;
        } else if (this.Unit.room.IsLinkMining) {
            sourceContext = _.find(this.Unit.room.Links, { sourceId: sourceId });
        }
        return sourceContext;
    }

    /**
     * Finds the pile of the given resource.
     *
     * @protected
     * @param {string} [resource] 
     * @returns {TargetContext} 
     * @memberof Unit
     */
    protected FindDroppedResource(resource?: string): TargetContext {
        if (!this.IsEmpty) {
            return undefined;
        }
        const assignedTargets = this.Unit.room.find<Creep>(FIND_MY_CREEPS).map((c) => c.CurrentTarget);
        const droppedResources = this.Unit.room.find<Resource>(FIND_DROPPED_RESOURCES, {
            filter: (r) => (!resource || r.resourceType === resource) && assignedTargets.indexOf(r.id) === -1 && r.amount > 20
        });
        if (droppedResources.length === 0) {
            return undefined;
        }
        const droppedResource = _.max(droppedResources, "amount");
        return { targetId: droppedResource.id, position: { x: droppedResource.pos.x, y: droppedResource.pos.y, room: droppedResource.room.name }, range: 1 };
    }

    /**
     * Finds a structure of the given types withdraw the specified resource from.
     *
     * @protected
     * @param {string[]} structures
     * @param {string} [resource=RESOURCE_ENERGY]
     * @returns {ResourceContext}
     * @memberof Unit
     */
    protected FindWithdrawSource(structures: string[], resource: string = RESOURCE_ENERGY): ResourceContext {
        if (!this.IsEmpty) {
            return undefined;
        }
        const upgraderSource = this.Unit.room.UpgraderSource || { targetId: undefined };
        const targets = this.Unit.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s) => (structures.indexOf(s.structureType) !== -1) && !s.IsEmpty(resource) && s.id !== upgraderSource.targetId
        });
        if (targets.length === 0) {
            return undefined;
        }
        const target = _.max(targets, (t) => t.StorePercentage(resource));
        return target && target.pos ? { targetId: target.id, resource: resource, position: { x: target.pos.x, y: target.pos.y, room: target.room.name }, range: 1 } : undefined;
    }

    /**
     * Finds the upgrader container in the room to withdraw energy from.
     *
     * @protected
     * @returns {ResourceContext}
     * @memberof Unit
     */
    protected FindUpgraderSource(): ResourceContext {
        if (!this.IsEmpty) {
            return undefined;
        }
        const containerContext = this.Unit.room.UpgraderSource;
        if (!containerContext) {
            return undefined;
        }
        const upgraderContainer = Game.getObjectById<StructureContainer>(containerContext.targetId);
        if (!upgraderContainer || upgraderContainer.IsEmpty(RESOURCE_ENERGY)) {
            return undefined;
        }
        return containerContext;
    }

    /**
     *  Finds a structure of the given types to transfer the specified resource to. 
     *
     * @protected
     * @param {string[]} structures 
     * @param {string} [resource=RESOURCE_ENERGY] 
     * @returns {ResourceContext} 
     * @memberof Unit
     */
    protected FindTransferTarget(structures: string[], resource: string = RESOURCE_ENERGY): ResourceContext {
        if (this.IsEmpty) {
            return undefined;
        }
        const target = this.Unit.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
            filter: (s) => (structures.indexOf(s.structureType) !== -1) && !s.IsFull
        });
        return target && target.pos ? { targetId: target.id, resource: resource, position: { x: target.pos.x, y: target.pos.y, room: target.room.name }, range: 1 } : undefined;
    }

    /**
     * Finds the upgrader container in the room to transfer energy to.
     *
     * @protected
     * @returns {ResourceContext} 
     * @memberof Unit
     */
    protected FindUpgraderTarget(): ResourceContext {
        if (this.IsEmpty) {
            return undefined;
        }
        const containerContext = this.Unit.room.UpgraderSource;
        if (!containerContext) {
            return undefined;
        }
        const upgraderContainer = Game.getObjectById<StructureContainer>(containerContext.targetId);
        if (!upgraderContainer || upgraderContainer.IsFull) {
            return undefined;
        }
        return containerContext;
    }

    /**
     * Finds the closest construction site.
     *
     * @protected
     * @returns {BuildContext}
     * @memberof Unit
     */
    protected FindConstructionSite(): BuildContext {
        if (this.IsEmpty) {
            return undefined;
        }

        const target = this.Unit.pos.findClosestByRange<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        return target && target.pos ? { constructionSiteId: target.id, position: { x: target.pos.x, y: target.pos.y, room: target.room.name }, range: 3 } : undefined;
    }

    /**
     * Finds a structure to repair given the list of excluded types.
     *
     * @protected
     * @param {string[]} [exclusions=[STRUCTURE_RAMPART, STRUCTURE_WALL]] 
     * @returns {RepairContext} 
     * @memberof Unit
     */
    protected FindRepair(exclusions: string[] = [STRUCTURE_RAMPART, STRUCTURE_WALL]): RepairContext {
        if (this.IsEmpty) {
            return undefined;
        }
        const assignedTargets = this.Unit.room.find<Creep>(FIND_MY_CREEPS).map((c) => c.CurrentTarget);
        const targets = this.Unit.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s) => (exclusions.indexOf(s.structureType) === -1) && assignedTargets.indexOf(s.id) === -1 && s.hits < s.hitsMax
        });
        if (targets.length === 0) {
            return undefined;
        }
        const target = _.min(targets, (t) => t.HitPercentage);
        return { targetId: target.id, position: { x: target.pos.x, y: target.pos.y, room: target.room.name }, range: 3 };
    }

    /**
     * Finds something to attack.
     *
     * @protected
     * @param {number[]} attackOrder
     * @returns {AttackContext}
     * @memberof Unit
     */
    protected FindHostile(attackOrder: number[]): AttackContext {
        for (const hostileType of attackOrder) {
            const hostile = this.Unit.pos.findClosestByPath<Creep | Structure>(hostileType);
            if (!hostile) {
                continue;
            }
            return { targetId: hostile.id };
        }
        return undefined;
    }

    /**
     * Finds an ally to heal;
     *
     * @protected
     * @returns {TargetContext} 
     * @memberof Unit
     */
    protected FindAlly(): TargetContext {
        const ally = this.Unit.pos.findClosestByPath<Creep>(FIND_MY_CREEPS, { filter: (c) => c.hits < (c.hitsMax * 0.75) });
        return ally ? { targetId: ally.id, range: 3, position: undefined } : undefined;
    }

    /**
     * Finds a flag to move to.
     *
     * @protected
     * @param {number} color
     * @param {string} [room]
     * @returns {MoveContext}
     * @memberof Unit
     */
    protected FindFlag(color: number, room?: string): MoveContext {
        const flag = _.find(Game.flags, (f) => f.color === color && (!room || f.room.name === room));
        if (!flag || !flag.pos || this.Unit.pos.inRangeTo(flag, 1)) {
            return undefined;
        }
        return { position: { x: flag.pos.x, y: flag.pos.y, room: flag.pos.roomName }, range: 1 };
    }

    /**
     * Finds the closest spawn.
     *
     * @protected
     * @returns {TargetContext}
     * @memberof Unit
     */
    protected FindSpawn(): TargetContext {
        const spawn = this.Unit.pos.findClosestByPath<StructureSpawn>(FIND_MY_SPAWNS);
        return spawn && spawn.pos ? { targetId: spawn.id, position: { x: spawn.pos.x, y: spawn.pos.y, room: spawn.room.name }, range: 1 } : undefined;
    }

    /**
     * Finds the closest mineral to harvest.
     *
     * @protected
     * @returns {SourceContext}
     * @memberof Unit
     */
    protected FindMineral(): SourceContext {
        if (!this.IsEmpty) {
            return undefined;
        }
        const mineral = this.Unit.pos.findClosestByPath<Mineral>(FIND_MINERALS, { filter: (m) => m.HasExtractor });
        return mineral && mineral.pos ? { sourceId: mineral.id, position: { x: mineral.pos.x, y: mineral.pos.y, room: mineral.room.name }, range: 1 } : undefined;
    }

    /**
     * Finds this units home room.
     *
     * @protected
     * @returns {MoveContext}
     * @memberof Unit
     */
    protected FindHomeRoom(): MoveContext {
        if (this.Unit.room.name === this.Memory.room) {
            return undefined;
        }
        return { position: { x: 25, y: 25, room: this.Memory.room }, range: 20 };
    }

    private InRange(context: MoveContext): boolean {
        if (!this.Unit.pos.inRangeTo(new RoomPosition(context.position.x, context.position.y, context.position.room), context.range)) {
            this.PushState(States.MoveTo, context);
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
        return room.Sources.length;
    }

    /**
     * Creates a default unit body based on the room.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof UnitDefinition
     */
    public CreateBody(room: Room): string[] {
        return this.GetPartsFromRoom(room, 8);
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
        const size = Math.max(Math.min(Math.floor(room.energyAvailable / cost), max), 1);
        return this.GetParts(size, parts);
    }

    /**
     * Builds a list of parts with a specific core and front/rear loaded with specific parts.
     * Example: in an attacker we want all the TOUGH parts at the front and in a healer we want all the HEAL parts in the rear.
     *
     * @protected
     * @param {Room} room 
     * @param {number} max 
     * @param {string[]} [front=[]] 
     * @param {string[]} [core=[]] 
     * @param {string[]} [rear=[]] 
     * @returns {string[]} 
     * @memberof UnitDefinition
     */
    protected GetSpecificParts(room: Room, max: number, front: string[] = [], core: string[] = [], rear: string[] = []): string[] {
        const frontCost = this.GetPartsCost(front);
        const middleCost = this.GetPartsCost(core);
        const rearCost = this.GetPartsCost(rear);
        const total = frontCost + middleCost + rearCost;
        const size = Math.max(Math.min(Math.floor(room.energyAvailable / total), max), 1);
        return this.GetParts(size, front, this.GetParts(size, core), rear);
    }

    /**
     * Builds a list of parts of the specified size
     *
     * @protected
     * @param {number} size 
     * @param {string[]} [front=this.MinimumParts] 
     * @param {string[]} [rear=[]] 
     * @returns {string[]} 
     * @memberof UnitDefinition
     */
    protected GetParts(size: number, front: string[] = [], core: string[] = [], rear: string[] = []): string[] {
        for (var index = 0; index < size; index++) {
            core = front.concat(core.concat(rear));
        }
        return core;
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
