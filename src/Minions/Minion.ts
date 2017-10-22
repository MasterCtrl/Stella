import RoomController from "../Controllers/RoomController"
import Configuration from "../Configuration"
import Constants from "../Constants"
type TargetQueue = ((d: string[]) => boolean)[];

/**
 * Minion base class, holds all the common logic for all the minion types.
 * 
 * @class Minion
 */
export default abstract class Minion {
    protected readonly minion: Creep;

    /**
     * Creates an instance of Minion.
     * @param {Creep} minion 
     * @memberof Minion
     */
    protected constructor(minion: Creep) {
        this.minion = minion;
    }

    /**
     * Initializes the minion, sets state and destination.
     * 
     * @returns 
     * @memberof Minion
     */
    public abstract Initialize();

    /**
     * Runs the minion
     * 
     * @memberof Minion
     */
    public Run() {
        if (!this.minion.memory.state) {
            this.minion.memory.state = Constants.STATE_SPAWNING;
        }

        if (!this.minion.memory.initialized) {
            this.Initialize();
        }


        switch (this.minion.memory.state) {
            case Constants.STATE_SPAWNING:
                this.RunSpawning(Constants.STATE_MOVING);
                break;

            case Constants.STATE_MOVING:
                this.RunMoving(this.minion.memory.postMovingState);
                break;

            case Constants.STATE_HARVESTING:
                this.RunHarvesting(Constants.STATE_MOVING);
                break;

            case Constants.STATE_PICKUP:
                this.RunPickup(Constants.STATE_MOVING);
                break;

            case Constants.STATE_TRANSFERRING:
                this.RunTransfer(Constants.STATE_MOVING);
                break;

            case Constants.STATE_UPGRADING:
                this.RunUpgrading(Constants.STATE_MOVING);
                break;
            
            case Constants.STATE_BUILDING:
                this.RunBuilding(Constants.STATE_MOVING);
                break;
            
            case Constants.STATE_REPAIRING:
                this.RunRepairing(Constants.STATE_MOVING);
                break;

            case Constants.STATE_WITHDRAWING:
                this.RunWithdrawing(Constants.STATE_MOVING);
                break;
            
            case Constants.STATE_CLAIM:
                this.RunClaiming(Constants.STATE_MOVING);
                break;

            case Constants.STATE_IDLE:
                this.RunIdle(Constants.STATE_MOVING);
                break;

            case Constants.STATE_RESET:
                this.RunReset(Constants.STATE_MOVING);
                break;

            case Constants.STATE_RANGED_ATTACK:
                this.RunRangedAttack();
                break;
            
            case Constants.STATE_MELEE_ATTACK:
                this.RunMeleeAttack();
                break;

            case Constants.STATE_HEAL:
                this.RunHeal();
                break;

            case Constants.STATE_SUICIDE:
                this.RunSuicide();
                break;
        }
    }

    private RunSpawning(transitionState: number) {
        if (!this.minion.spawning) {
            this.minion.memory.state = transitionState;
            this.Run();
            return;
        }
    }

    private RunMoving(transitionState: number) {
        let roomPosition = new RoomPosition(
            this.minion.memory.destination_x, 
            this.minion.memory.destination_y, 
            this.minion.memory.destination_room || this.minion.room.name
        );
        if (this.minion.pos.inRangeTo(roomPosition, this.minion.memory.range)) {
            this.minion.memory.state = transitionState;
            this.Run();
            return;
        }
        if (this.minion.fatigue > 0) {
            return;
        }
        let visuals = undefined;
        if (Configuration.DrawVisuals) {
            visuals = {visualizePathStyle: {stroke: '#ffffff'}};
        }
        this.minion.moveTo(roomPosition, visuals);
    }

    private RunHarvesting(transitionState: number) {
        if (this.IsFull) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
            return;
        }
        let target: any = Game.getObjectById(this.minion.memory.source_id);
        if (!target) {
            target = Game.getObjectById(this.minion.memory.destination_id);
        }
        if (target.energy == 0 || target.mineralAmount == 0) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
            return;
        }
        this.minion.harvest(target);
    }

    private RunPickup(transitionState: number) {
        let source = Game.getObjectById<Resource>(this.minion.memory.destination_id);
        if (source) {
            this.minion.pickup(source);            
        }
        this.minion.memory.state = transitionState;
        this.minion.memory.initialized = false;
    }

    private RunTransfer(transitionState: number) {
        if (this.IsEmpty) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
            return;
        }
        let target = Game.getObjectById<any>(this.minion.memory.destination_id);
        if (!target) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
            return;
        }
        if (target.energy >= target.energyCapacity || this.TotalCarry >= target.storeCapacity) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        for (var resource in this.minion.carry) {
            this.minion.transfer(target, resource);
        }
    }

    private RunUpgrading(transitionState: number) {
        if (this.IsEmpty) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        this.minion.upgradeController(this.minion.room.controller);
    }

    private RunBuilding(transitionState: number) {
        if (this.IsEmpty) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let constructionSite = Game.getObjectById<ConstructionSite>(this.minion.memory.destination_id);
        if (!constructionSite) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let result = this.minion.build(constructionSite);
        if (result == ERR_INVALID_TARGET) {
            this.minion.move(BOTTOM);
        }
    }

    private RunRepairing(transitionState: number) {
        if (this.IsEmpty) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let structure = Game.getObjectById<Structure>(this.minion.memory.destination_id);
        if (!structure || structure.hits == structure.hitsMax) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        this.minion.repair(structure);
    }

    private RunWithdrawing(transitionState: number) {
        if (this.IsFull) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let structure = Game.getObjectById<any>(this.minion.memory.destination_id);
        if (!structure || this.minion.withdraw(structure, RESOURCE_ENERGY) != OK) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
        }
    }

    private RunClaiming(transitionState: number) {
        if (this.minion.claimController(this.minion.room.controller) == OK) {
            console.log(this.minion.room.name + ": Controller claimed!");
            this.minion.memory.initialized = false;
        }
        if (this.minion.reserveController(this.minion.room.controller) == OK) {
            this.minion.memory.initialized = false;
        }
        if (this.minion.room.controller.upgradeBlocked > 0) {
            this.minion.attackController(this.minion.room.controller);            
        }
    }

    private RunIdle(transitionState: number) {
        if (this.minion.memory.idle != undefined && this.minion.memory.idle > 0) {
            this.minion.say("🚬");
            this.minion.memory.idle--;
            return;
        }
        this.minion.memory.initialized = false;
        this.minion.memory.state = transitionState;
    }

    private RunReset(transitionState: number) {
        this.minion.memory.state = transitionState;
        this.minion.memory.initialized = false;
        this.Run();
    }

    private RunRangedAttack() {
        if (!this.minion.memory.attackTarget || this.NeedToHeal) {
            this.minion.memory.initialized = false;
            return;
        }

        let target = this.GetAttackTarget();
        if (!target) {
            this.minion.memory.attackTarget = undefined;
            this.minion.memory.initialized = false;
            return;
        }
        let range = this.minion.pos.getRangeTo(target);
        if (range > 3) {
            if (this.minion.fatigue > 0) {
                //we are out of range and cant move... take a turn off
                return;
            }
            this.minion.moveTo(target);
        } else if (range < 3 && this.minion.fatigue == 0) {
            //kite only if we are too close and have 0 fatigue
            var targetDirection = this.minion.pos.getDirectionTo(target);
            var kiteDirection = (targetDirection + 4) % 8;
            if (kiteDirection == 0) {
                kiteDirection = 8;
            }
            //this should be directly away from the target?
            this.minion.move(kiteDirection);
        }
        this.minion.rangedAttack(target);
    }

    private RunMeleeAttack() {
        if (!this.minion.memory.attackTarget || this.NeedToHeal) {
            this.minion.memory.initialized = false;
            return;
        }
        let target = this.GetAttackTarget();
        if (!target) {
            this.minion.memory.attackTarget = undefined;
            this.minion.memory.initialized = false;
            return;
        }
        if (this.minion.pos.getRangeTo(target) > 1) {
            if (this.minion.fatigue > 0) {
                //we are out of range and cant move... take a turn off
                return;
            }
            this.minion.moveTo(target);
        }
        this.minion.attack(target);
    }

    private GetAttackTarget(): Creep|Structure{
        switch(this.minion.memory.attackTarget.type) {
            case "structure":
                return Game.getObjectById(this.minion.memory.attackTarget.id);
            case "minion":
                return this.minion.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        }
        return undefined;
    }

    private RunHeal() {
        if (this.IsFullHealth) {
            this.minion.memory.initialized = false;
            return;
        }
        this.minion.heal(this.minion);
    }

    private RunSuicide() {
        this.minion.suicide();
    }

    /**
     * Gets the Name of the minion
     * 
     * @readonly
     * @protected
     * @type {string}
     * @memberof Minion
     */
    protected get Name(): string {
        return this.minion.name;
    }

    /**
     * Gets if the minions energy is empty
     * 
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Minion
     */
    protected get IsEmpty(): boolean {
        return this.TotalCarry == 0;
    }

    /**
     * Gets if the minions energy is full
     * 
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Minion
     */
    protected get IsFull(): boolean {
        return !this.IsEmpty && this.minion.getActiveBodyparts(WORK) * 2 >= this.minion.carryCapacity - this.TotalCarry;
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
        if (this.totalCarry == undefined) {
            this.totalCarry = 0;
            for (var resource in this.minion.carry) {
                this.totalCarry += this.minion.carry[resource];
            }
        }
        return this.totalCarry;
    }
    private totalCarry: number;

    /**
     * Gets if this minion needs to heal, returns false ONLY if it can actually do anything about it aka it has heal parts.
     * 
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Minion
     */
    protected get NeedToHeal(): boolean {
        return this.minion.getActiveBodyparts(HEAL) > 0 && !this.IsFullHealth;
    }

    /**
     * Gets if this minion is at full heath.
     * 
     * @readonly
     * @protected
     * @type {boolean}
     * @memberof Minion
     */
    protected get IsFullHealth(): boolean {
        return this.minion.hits < this.minion.hitsMax;
    }

    /**
     * Gets the minions type
     * 
     * @readonly
     * @protected
     * @type {string}
     * @memberof Minion
     */
    protected get Type(): string {
        return this.minion.memory.type;
    }

    /**
     * Finds the least populated source to mine and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindSource(): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        let source: Source;
        if(!this.minion.memory.source_id){
            let assignedSources = _.countBy(this.minion.room.find<Creep>(FIND_MY_CREEPS, { filter: creep => creep.memory.source_id }), creep => creep.memory.source_id);
            let sources = this.minion.room.find<Source>(FIND_SOURCES);
            let lowestCount = _.min(assignedSources);
            for (var i in sources) {
                let currentSource = sources[i];
                let count = assignedSources[currentSource.id];
                if (!count || count == lowestCount) {
                    source = currentSource;
                    break;
                }
            }    
        } else {
            source = Game.getObjectById(this.minion.memory.source_id);
        }

        if (source) {
            this.SetDestination(source.pos.x, source.pos.y, 1, source.id, source.room.name);
            this.minion.memory.source_id = source.id;
            this.minion.memory.postMovingState = Constants.STATE_HARVESTING;
            return true;
        }
        return false;
    }

    /**
     * Finds an unoccupied source to mine from and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindUnoccupiedSource(): boolean {
        if (this.IsFull) {
            return false;
        }

        let closestSource: Source;
        if (!this.minion.memory.source_id) {
            let occupiedSources = _.filter(Game.creeps, creep => creep.memory.source_id && creep.memory.type == this.Type).map(creep => creep.memory.source_id);
            closestSource = this.minion.pos.findClosestByPath(FIND_SOURCES, {
                filter: source => occupiedSources.indexOf(source.id) == -1
            });
            if (!closestSource) {
                return false;
            }    
        } else {
            closestSource = Game.getObjectById(this.minion.memory.source_id);
        }

        if (closestSource.energy == 0) {
            return false;
        }

        if (RoomController.AreWeLinkMining(this.minion.room)) {
            if (this.minion.room.memory.sources) {
                let source = this.minion.room.memory.sources[closestSource.id];
                this.SetDestination(source.x, source.y, 0, closestSource.id, closestSource.room.name);
            } else {
                this.SetDestination(closestSource.pos.x, closestSource.pos.y, 1, closestSource.id, closestSource.room.name);
            }
            this.minion.memory.source_id = closestSource.id;
            this.minion.memory.postMovingState = Constants.STATE_HARVESTING;    
            return true;    
        }

        if (RoomController.AreWeContainerMining(this.minion.room)) {
            let container = closestSource.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
                filter: container => container.structureType == STRUCTURE_CONTAINER
            });
            if (container && closestSource.pos.inRangeTo(container.pos, 1)) {
                this.SetDestination(container.pos.x, container.pos.y, 0, container.id, container.room.name);
                this.minion.memory.source_id = closestSource.id;
                this.minion.memory.postMovingState = Constants.STATE_HARVESTING;
                return true;    
            }    
        }

        return false;
    }

    /**
     * Finds a dropped energy source and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindDroppedEnergy(): boolean {
        if (!this.IsEmpty || RoomController.GetDefcon(this.minion.room).level > 0) {
            return false;
        }
        let occupiedSources = _.filter(Game.creeps, creep => creep.memory.destination_id).map(creep => creep.memory.destination_id);
        let energy = this.minion.pos.findClosestByPath<Resource>(FIND_DROPPED_RESOURCES, {
            filter: energy => energy.resourceType == RESOURCE_ENERGY && (occupiedSources.indexOf(energy.id) == -1 || energy.amount > 500) && this.minion.room.name == energy.room.name
        });
        if (energy && energy.amount > 20) {
            this.SetDestination(energy.pos.x, energy.pos.y, 1, energy.id, energy.room.name);
            this.minion.memory.postMovingState = Constants.STATE_PICKUP;
            return true;
        }
        return false;
    }

    /**
     * Finds a dropped resource and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindDroppedResource(): boolean {
        if (!this.IsEmpty || RoomController.GetDefcon(this.minion.room).level > 0) {
            return false;
        }
        let occupiedSources = _.filter(Game.creeps, creep => creep.memory.destination_id).map(creep => creep.memory.destination_id);
        let resource = this.minion.pos.findClosestByPath<Resource>(FIND_DROPPED_RESOURCES, {
            filter: resource =>  resource.resourceType != RESOURCE_ENERGY && (occupiedSources.indexOf(resource.id) == -1 || resource.energy > 500) && this.minion.room.name == resource.room.name
        });
        if (resource) {
            this.SetDestination(resource.pos.x, resource.pos.y, 1, resource.id, resource.room.name);
            this.minion.memory.postMovingState = Constants.STATE_PICKUP;
            return true;
        }
        return false;
    }

    /**
     * Finds somewhere to store energy and sets it as the destination.
     * One of Spawn, Extension, Tower, or Terminal that doesn't already have a minion delivering to it.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindStorage(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let occupiedDestinations = _.filter(Game.creeps, creep => creep.memory.destination_id).map<string>(creep => creep.memory.destination_id);
        let targetQueue: TargetQueue = [d => this.FindSpawnStorage(d), d => this.FindTurretStorage(d)];
        let defcon = RoomController.GetDefcon(this.minion.room);
        if (defcon.level > 2 && (this.minion.room.energyAvailable / this.minion.room.energyCapacityAvailable) > 0.5) {
            targetQueue = targetQueue.reverse();
        }
        targetQueue.push(d => this.FindLabStorage(d));
        targetQueue.push(d => this.FindTerminalStorage());
        for (var i in targetQueue) {
            let target = targetQueue[i];
            if (target(occupiedDestinations)) {
                return true;
            }
        }
        return false;
    }

    private FindTurretStorage(occupiedDestinations: string[]): boolean {
        let turret = this.minion.pos.findClosestByPath<StructureTower>(FIND_STRUCTURES, {
            filter: turret => turret.structureType == STRUCTURE_TOWER &&
                              occupiedDestinations.indexOf(turret.id) == -1 &&
                              turret.energy < turret.energyCapacity 
        });
        if (turret) {
            this.SetDestination(turret.pos.x, turret.pos.y, 1, turret.id, turret.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    private FindSpawnStorage(occupiedDestinations: string[]): boolean {
        let storage = this.minion.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
            filter: structure => (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                 occupiedDestinations.indexOf(structure.id) == -1 &&
                                 structure.energy < structure.energyCapacity 
        });
        if (storage) {
            this.SetDestination(storage.pos.x, storage.pos.y, 1, storage.id, storage.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    private FindLabStorage(occupiedDestinations: string[]): boolean {
        let lab = this.minion.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
            filter: lab => lab.structureType == STRUCTURE_LAB &&
                           occupiedDestinations.indexOf(lab.id) == -1 &&
                           lab.energy < lab.energyCapacity 
        });
        if (lab) {
            this.SetDestination(lab.pos.x, lab.pos.y, 1, lab.id, lab.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    private FindTerminalStorage() {
        if (this.minion.room.memory.needs.indexOf(RESOURCE_ENERGY) != -1) {
            return false;
        }
        let terminal = this.minion.room.terminal;
        if (terminal && terminal.store[RESOURCE_ENERGY] < Configuration.Terminal.energy.Maximum) {
            this.SetDestination(terminal.pos.x, terminal.pos.y, 1, terminal.id, terminal.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    /**
     * Finds a Storage structure to store energy in and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindStorageTarget(): boolean {
        if (this.IsEmpty || (RoomController.AreWeLinkMining(this.minion.room) && this.Type != "Filler")) {
            return false;
        }
        let storage = this.minion.room.storage;
        if (storage && _.sum(storage.store) < storage.storeCapacity) {
            this.SetDestination(storage.pos.x, storage.pos.y, 1, storage.id, storage.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    /**
     * Finds a Storage structure to withdraw energy from and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindStorageSource(): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        let storage = this.minion.room.storage;
        if (storage && storage.store[RESOURCE_ENERGY] != 0 ) {
            this.SetDestination(storage.pos.x, storage.pos.y, 1, storage.id, storage.room.name);
            this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
            return true;
        }
        return false;
    }

    /**
     * Finds a Container structure to store energy in and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindContainerTarget(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let container = this.minion.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
        });
        if (container) {
            this.SetDestination(container.pos.x, container.pos.y, 1, container.id, container.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    /**
     * Finds a Storage structure to withdraw energy from and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindContainerSource(): boolean {
        if (!this.IsEmpty || RoomController.AreWeLinkMining(this.minion.room)) {
            return false;
        }

        let containers = this.minion.room.find<StructureContainer>(FIND_STRUCTURES, { 
            filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] != 0
        });
        let container = _.max(containers, container =>  container.store[RESOURCE_ENERGY]);
        if (container && container.pos) {
            this.SetDestination(container.pos.x, container.pos.y, 1, container.id, container.room.name);
            this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
            return true;
        }
        return false;
    }

    /**
     * Finds the controller to upgrade and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindController(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let controller = this.minion.room.controller;
        if (controller) {
            this.SetDestination(controller.pos.x, controller.pos.y, 3, controller.id, controller.room.name);
            this.minion.memory.postMovingState = Constants.STATE_UPGRADING;
            return true;
        }
        return false;
    }

    /**
     * Finds the closest construction site and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindConstructionSite(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let constructionSite = this.minion.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            this.SetDestination(constructionSite.pos.x, constructionSite.pos.y, 3, constructionSite.id, constructionSite.room.name);
            this.minion.memory.postMovingState = Constants.STATE_BUILDING;
            return true;
        }
        return false;
    }

    /**
     * Finds the closest structure to repair and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindStructureToRepair(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let structures = this.minion.room.find<Structure>(FIND_STRUCTURES, { 
            filter: structure => (structure.structureType != STRUCTURE_WALL && 
                                  structure.structureType != STRUCTURE_RAMPART &&
                                  structure.structureType != STRUCTURE_ROAD) && 
                                 (structure.hits / structure.hitsMax) < 0.5
            }
        );
        let structure = _.min(structures, s => s.hits);
        if (structure && structure.pos) {
            this.SetDestination(structure.pos.x, structure.pos.y, 3, structure.id, structure.room.name);
            this.minion.memory.postMovingState = Constants.STATE_REPAIRING;
            return true;                
        } 

        let walls = this.minion.room.find<StructureRampart>(FIND_STRUCTURES, { 
            filter: wall => (wall.structureType == STRUCTURE_RAMPART && wall.hits < Configuration.Defenses.rampart) ||
                            (wall.structureType == STRUCTURE_WALL && wall.hits < Configuration.Defenses.wall)
        });
        let wall = _.min(walls, r => r.hits);
        if (wall && wall.pos) {
            this.SetDestination(wall.pos.x, wall.pos.y, 3, wall.id, wall.room.name);
            this.minion.memory.postMovingState = Constants.STATE_REPAIRING;
            return true;                
        }

        return false;
    }

    /**
     * Finds an unoccupied flag of the specified color and sets it as the destination.
     * 
     * @protected
     * @param {number} flagColor 
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindUnoccupiedRoom(flagColor: number): boolean {
        if (this.minion.memory.flag) {
            return false;
        }
        let occupiedFlags = _.filter(Game.creeps, creep => creep.memory.flag).map(creep => creep.memory.flag);
        let flags = _.filter(Game.flags, flag => flag.color == flagColor && occupiedFlags.indexOf(flag.name) == -1);
        if (flags.length == 0) {
            return false;
        }
        let flag = flags[0];
        this.minion.memory.flag = flag.name;
        this.SetDestination(flag.pos.x, flag.pos.y, 1, undefined, flag.pos.roomName);
        this.minion.memory.postMovingState = Constants.STATE_RESET;
        return true;
    }

    /**
     * Finds a flag of the specified color and sets it as the destination.
     * 
     * @protected
     * @param {number} flagColor 
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindFlag(flagColor: number): boolean {
        if (this.minion.memory.flag) {
            return false;
        }
        let flags = _.filter(Game.flags, flag => flag.color == flagColor);
        if (flags.length == 0) {
            return false;
        }
        let flag = flags[0];
        this.minion.memory.flag = flag.name;
        this.SetDestination(flag.pos.x, flag.pos.y, 1, undefined, flag.pos.roomName);
        this.minion.memory.postMovingState = Constants.STATE_RESET;
        return true;
    }

    /**
     * Finds an unclaimed controller in the room and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindUnclaimedController(): boolean {
        if (!this.minion.memory.flag || this.minion.room.controller.my) {
            return false;
        }
        let controller = this.minion.room.controller;
        if (controller) {
            this.minion.memory.postMovingState = Constants.STATE_CLAIM;
            this.SetDestination(controller.pos.x, controller.pos.y, 1, controller.id);
            return true;
        }
        return false;
    }

    /**
     * Finds the closest link to put energy into.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindLinkTarget(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let link = this.minion.pos.findClosestByPath<StructureLink>(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK});
        if (link && link.energy < link.energyCapacity) {
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            this.SetDestination(link.pos.x, link.pos.y, 1, link.id, link.room.name);
            return true;
        }
        return false;
    }

    /**
     * Finds the closest link to get energy from.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindLinkSource(): boolean {
        if (this.IsFull) {
            return false;
        }
        let link = this.minion.pos.findClosestByPath<StructureLink>(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK});
        //todo: change this to find the link near the storage/terminal and save its id into room memory, then stand in the closest unoccupied rampart
        if (link && link.energy != 0) {
            this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
            this.SetDestination(link.pos.x, link.pos.y, 1, link.id, link.room.name);
            return true;
        }
        return false;
    }

    /**
     * Finds an extractor in the room.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindExtractor(): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        let minerals = this.minion.pos.findClosestByPath<Mineral>(FIND_MINERALS, {filter : mineral => mineral.mineralAmount != 0});
        if (minerals) {
            this.SetDestination(minerals.pos.x, minerals.pos.y, 1, minerals.id, minerals.room.name);
            this.minion.memory.postMovingState = Constants.STATE_HARVESTING;
            return true;
        }
        return false;
    }

    /**
     * Finds the terminal to put energy into.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindTerminalTarget(): boolean {
        if (this.IsEmpty || this.minion.room.memory.needs.indexOf(RESOURCE_ENERGY) != -1) {
            return false;
        }
        let terminal = this.minion.room.terminal;
        if (terminal && _.sum(terminal.store) < terminal.storeCapacity) {
            this.SetDestination(terminal.pos.x, terminal.pos.y, 1, terminal.id, terminal.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    /**
     * Finds the terminal in the room.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindTerminalSource(): boolean {
        if (this.IsFull || !this.minion.room.terminal || (this.minion.room.memory.needs.indexOf(RESOURCE_ENERGY) == -1 && this.minion.room.terminal.store.energy < (Configuration.Terminal.energy.Maximum * 1.1))) {
            return false;
        }
        this.SetDestination(this.minion.room.terminal.pos.x, this.minion.room.terminal.pos.y, 1, this.minion.room.terminal.id);
        this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
        return true;
    }

    /**
     * Finds a hostile spawn to attack.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindHostileSpawn(): boolean {
        let hostile = this.minion.pos.findClosestByPath<Structure>(FIND_HOSTILE_SPAWNS);
        if (!hostile) {
            return false;            
        }
        this.minion.memory.attackTarget = {type: "structure", id: hostile.id};
        this.minion.memory.state = Constants.STATE_RANGED_ATTACK;
        return true;
    }


    /**
     * Finds a hostile minion to attack.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindHostileMinion(): boolean {
        let hostiles = this.minion.room.find<Creep>(FIND_HOSTILE_CREEPS);
        if (hostiles.length <= 0) {
            return false;            
        }
        this.minion.memory.attackTarget = {type: "minion"};
        this.SetMinionAttackState();
        return true;
    }

    /**
     * Finds a hostile structure to attack.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindHostileStructure(): boolean {
        let hostile = this.minion.pos.findClosestByPath<Structure>(FIND_HOSTILE_STRUCTURES);
        if (!hostile) {
            return false;            
        }
        this.minion.memory.attackTarget = {type: "structure", id: hostile.id};
        this.SetMinionAttackState();
        return true;
    }

    private SetMinionAttackState() {
        if (this.minion.getActiveBodyparts(RANGED_ATTACK) > 0) {
            this.minion.memory.state = Constants.STATE_RANGED_ATTACK;            
        } else {
            this.minion.memory.state = Constants.STATE_MELEE_ATTACK;            
        }
    }

    /**
     * Rallies the minion to the closest rally flag
     * 
     * @protected
     * @memberof Minion
     */
    protected Rally() {
        let flags = _.filter(Game.flags, flag => flag.pos.roomName == this.minion.pos.roomName && flag.color == COLOR_WHITE);
        if (flags.length == 0) {
            this.minion.memory.state = Constants.STATE_IDLE;
        } else {
            let flag = flags[0];
            this.SetDestination(flag.pos.x, flag.pos.y, 1, null, flag.room.name);            
            this.minion.memory.postMovingState = Constants.STATE_IDLE;
        }
        this.minion.memory.idle = 5;
    }

    /**
     * Sets the destination for the minion
     * 
     * @protected
     * @param {number} x 
     * @param {number} y 
     * @param {number} range 
     * @param {string} [id] 
     * @param {string} [room] 
     * @memberof Minion
     */
    protected SetDestination(x: number, y: number, range: number, id?: string, room: string = this.minion.room.name) {
        this.minion.memory.destination_x = x;
        this.minion.memory.destination_y = y;
        this.minion.memory.destination_id = id;
        this.minion.memory.destination_room = room;
        this.minion.memory.range = range;
    }

    /**
     * Removes the flag of the specified color from the room then suicides the minion.
     * 
     * @protected
     * @param {number} flagColor 
     * @memberof Minion
     */
    protected RemoveFlagAndSuicide(flagColor: number) {
        for (var f in Game.flags) {
            let flag = Game.flags[f];
            if (flag.color == flagColor && flag.pos.roomName == this.minion.room.name) {
                flag.remove();
                break;
            }
        }
        this.minion.suicide();
    }
   
    /**
     * Builds a list of parts based on the room
     * 
     * @static
     * @param {Room} room 
     * @param {number} max
     * @param {string[]} [parts] 
     * @returns {string[]} 
     * @memberof Minion
     */
    public static GetPartsFromRoom(room: Room, max: number, parts: string[] = this.MinimumParts): string[] {
        let cost = this.GetPartsCost(parts);
        let size = 1;
        if (room.memory.needs.indexOf(RESOURCE_ENERGY) == -1) {
            let shiftingSize = max * cost;
            if (room.storage) {
                shiftingSize = ((room.storage.store.energy + 1) / room.storage.storeCapacity) * shiftingSize;
            }
            if (shiftingSize > room.energyAvailable) {
                size = Math.floor(room.energyAvailable / cost);                
            } else {
                size = Math.ceil(shiftingSize / cost);                
            }
        }
        return this.GetParts(size, parts);
    }

    /**
     * Builds a list of parts of the specified size
     * 
     * @static
     * @param {number} size 
     * @param {string[]} [partsToAdd] 
     * @returns {string[]} 
     * @memberof Minion
     */
    public static GetParts(size: number, partsToAdd: string[] = this.MinimumParts): string[] {
        let parts = [];
        for (var index = 0; index < size; index++) {
            parts = parts.concat(partsToAdd);
        }
        return parts;
    }

    private static GetPartsCost(parts: string[]): number {
        let cost = 0;
        for (var i in parts) {
            cost += BODYPART_COST[parts[i]];
        }
        return cost;
    }
    private static MinimumParts: string[] = [WORK, CARRY, MOVE];
}