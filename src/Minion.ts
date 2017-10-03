import * as Constants from "./Constants"
import Configuration from "./Configuration"

export default abstract class Minion {
    readonly minion: Creep;

    protected constructor(minion: Creep) {
        this.minion = minion;
    }

    abstract Initialize();

    Run() {
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
        if (this.minion.pos.getRangeTo(roomPosition) <= this.minion.memory.range) {
            this.minion.memory.state = transitionState;
            return;
        }
        this.minion.moveTo(roomPosition);
    }

    private RunHarvesting(transitionState: number) {
        if (this.IsFull) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let source: Source = Game.getObjectById(this.minion.memory.source_id);
        if (!source) {
            source = Game.getObjectById(this.minion.memory.destination_id);
        }
        if (source.energy == 0) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        this.minion.harvest(source);
    }

    private RunPickup(transitionState: number) {
        let source: Resource = Game.getObjectById(this.minion.memory.destination_id);
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
        let storage: any = Game.getObjectById(this.minion.memory.destination_id);
        if (storage.energy >= storage.energyCapacity) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        this.minion.transfer(storage, RESOURCE_ENERGY);
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
        let constructionSite: ConstructionSite = Game.getObjectById(this.minion.memory.destination_id);
        if (!constructionSite) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;            
        }
        this.minion.build(constructionSite);
    }

    private RunRepairing(transitionState: number) {
        if (this.IsEmpty) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let structure: Structure = Game.getObjectById(this.minion.memory.destination_id);
        this.minion.repair(structure);
    }

    private RunWithdrawing(transitionState: number) {
        if (this.IsFull) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            return;
        }
        let structure: Container = Game.getObjectById(this.minion.memory.destination_id);
        if (!structure || this.minion.withdraw(structure, RESOURCE_ENERGY) != OK) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
        }
    }

    private RunMovingRoom(transitionState: number) {
        let flag: Flag = Game.flags[this.minion.memory.claimed];
        if (!this.minion.memory.claimed || !this.minion.room.controller || this.minion.pos.getRangeTo(flag) == 0) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;            
        }
        this.minion.moveTo(Game.flags[this.minion.memory.claimed]);
    }

    private RunClaiming(transitionState: number) {
        if (this.minion.claimController(this.minion.room.controller) == OK) {
            this.minion.memory.claimed = true;
            this.minion.memory.initialized = false;
        }
    }

    private RunIdle(transitionState: number) {
        this.minion.memory.initialized = false;        
        this.minion.memory.state = transitionState;
    }

    private RunSuicide() {
        if (this.minion.carry.energy != 0) {
            this.minion.drop(RESOURCE_ENERGY);
        }
        this.minion.suicide();
    }

    protected get Name(): string{
        return this.minion.name;
    }

    protected get IsEmpty(): boolean {
        return this.minion.carry.energy == 0;
    }

    protected get IsFull(): boolean {
        return !this.IsEmpty && this.minion.carry.energy >= this.minion.carryCapacity;
    }

    protected get Type(): string {
        return this.minion.memory.type;
    }

    protected FindEnergy(index: number): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        return this.FindSource(index) || this.FindDroppedEnergy();
    }

    protected FindSource(index: number): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        let source: Source = null;
        if (index != -1) {
            let sources: Source[] = this.minion.room.find(FIND_SOURCES);
            if (sources.length > 0) {
                source = sources[index];
            }
        } else {
            source = this.minion.pos.findClosestByRange(FIND_SOURCES);
        }
        if (source) {
            this.SetDestination(source.pos.x, source.pos.y, 1, source.id, source.room.name);
            this.minion.memory.postMovingState = Constants.STATE_HARVESTING;
            return true;
        }
        return false;
    }

    protected FindUnoccupiedSource(): boolean {
        if (this.IsFull) {
            return false;
        }

        let closestSource: Source;
        if (!this.minion.memory.source_id) {
            let occupiedSources = _.filter(Game.creeps, creep => creep.memory.source_id).map(creep => creep.memory.source_id);
            closestSource = this.minion.pos.findClosestByRange(FIND_SOURCES, {
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

        let container: Container = closestSource.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: container => container.structureType == STRUCTURE_CONTAINER ||container.structureType == STRUCTURE_STORAGE
        });
        if (container && closestSource.pos.getRangeTo(container.pos) == 1) {
            this.SetDestination(container.pos.x, container.pos.y, 0, container.id, container.room.name);
            this.minion.memory.source_id = closestSource.id;
            this.minion.memory.postMovingState = Constants.STATE_HARVESTING;
            return true;    
        }

        return false;
    }

    protected FindDroppedEnergy(): boolean {
        if (!this.IsEmpty || Minion.UnderAttack(this.minion.room.name)) {
            return false;
        }
        let occupiedSources = _.filter(Game.creeps, creep => creep.memory.destination_id).map(creep => creep.memory.destination_id);
        let energy: Source= this.minion.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: energy => (occupiedSources.indexOf(energy.id) == -1 || energy.energy > 500) && this.minion.room.name == energy.room.name
        });
        if (energy) {
            this.SetDestination(energy.pos.x, energy.pos.y, 1, energy.id, energy.room.name);
            this.minion.memory.postMovingState = Constants.STATE_PICKUP;
            return true;
        }
        return false;
    }

    protected FindStorage(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let occupiedDestinations = _.filter(Game.creeps, creep => creep.memory.destination_id).map(creep => creep.memory.destination_id);
        let storage: Structure = this.minion.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => occupiedDestinations.indexOf(structure.id) == -1 &&
                                 (structure.structureType == STRUCTURE_EXTENSION ||
                                  structure.structureType == STRUCTURE_SPAWN ||
                                  structure.structureType == STRUCTURE_TOWER) &&
                                  structure.energy < structure.energyCapacity 
        });
        if (storage) {
            this.SetDestination(storage.pos.x, storage.pos.y, 1, storage.id, storage.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    protected FindStorageTarget(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let storage: Storage = this.minion.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] < structure.storeCapacity 
        });
        if (storage) {
            this.SetDestination(storage.pos.x, storage.pos.y, 1, storage.id, storage.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    protected FindStorageSource(): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        let storage: Storage = this.minion.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] != 0 
        });
        if (storage) {
            this.SetDestination(storage.pos.x, storage.pos.y, 1, storage.id, storage.room.name);
            this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
            return true;
        }
        return false;
    }

    protected FindContainerTarget(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let container: Container = this.minion.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
        });
        if (container) {
            this.SetDestination(container.pos.x, container.pos.y, 1, container.id, container.room.name);
            this.minion.memory.postMovingState = Constants.STATE_TRANSFERRING;
            return true;
        }
        return false;
    }

    protected FindContainerSource(): boolean {
        if (!this.IsEmpty) {
            return false;
        }

        let containers: Container[] = this.minion.room.find(FIND_STRUCTURES, { 
            filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] != 0
        });
        containers = _.sortBy(containers, structure => structure.store[RESOURCE_ENERGY]).reverse();
        if (containers.length) {
            let container = containers[0];
            this.SetDestination(container.pos.x, container.pos.y, 1, container.id);
            this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
            return true;
        }
        return false;
    }

    protected FindController(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let controller: Controller = this.minion.room.controller;
        if (controller) {
            this.SetDestination(controller.pos.x, controller.pos.y, 3, controller.id);
            this.minion.memory.postMovingState = Constants.STATE_UPGRADING;
            return true;
        }
        return false;
    }

    protected FindConstructionSite(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let constructionSite: ConstructionSite = this.minion.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            this.SetDestination(constructionSite.pos.x, constructionSite.pos.y, 3, constructionSite.id);
            this.minion.memory.postMovingState = Constants.STATE_BUILDING;
            return true;
        }
        return false;
    }

    protected FindStructureToRepair(): boolean {
        if (this.IsEmpty) {
            return false;
        }
        let structure: Structure = this.minion.pos.findClosestByRange(FIND_STRUCTURES, { 
            filter: (structure) => (structure.structureType != STRUCTURE_WALL && 
                                    structure.structureType != STRUCTURE_RAMPART) && 
                                   (structure.hits / structure.hitsMax) < 0.5
            }
        );
        if (structure) {
            this.SetDestination(structure.pos.x, structure.pos.y, 3, structure.id, structure.room.name);
            this.minion.memory.postMovingState = Constants.STATE_REPAIRING;
            return true;                
        } 

        let rampart: Structure = this.minion.pos.findClosestByRange(FIND_STRUCTURES, { 
            filter: structure => structure.structureType == STRUCTURE_RAMPART && structure.hits < Configuration.RampartHp
        });
        if (rampart) {
            this.SetDestination(rampart.pos.x, rampart.pos.y, 3, rampart.id, rampart.room.name);
            this.minion.memory.postMovingState = Constants.STATE_REPAIRING;
            return true;                
        }

        let wall: Structure = this.minion.pos.findClosestByRange(FIND_STRUCTURES, { 
            filter: structure => structure.structureType == STRUCTURE_WALL && structure.hits < Configuration.WallHp
        });
        if (wall) {
            this.SetDestination(wall.pos.x, wall.pos.y, 3, wall.id, wall.room.name);
            this.minion.memory.postMovingState = Constants.STATE_REPAIRING;
            return true;
        }

        return false;
    }

    protected FindFlaggedRoom(flagName: string): boolean {
        if (this.minion.memory.claimed || !flagName) {
            return false;
        }
        //let coodinates = this.minion.room.name.match("(\\D)(\\d{2})(\\D)(\\d{2})");
        this.minion.memory.claimed = flagName;
        let flag = Game.flags[flagName];
        this.SetDestination(flag.pos.x, flag.pos.y, 1, null, flag.room.name);
        this.minion.memory.state = Constants.STATE_MOVING; 
        return true;
    }

    protected FindUnclaimedController(): boolean {
        if (!this.minion.memory.claimed || this.minion.room.controller.my) {
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

    protected Rally() {
        let spawn: Spawn = this.minion.pos.findClosestByPath(FIND_MY_SPAWNS);
        this.SetDestination(spawn.pos.x, spawn.pos.y, 1, spawn.room.name);
        this.minion.memory.postMovingState = Constants.STATE_IDLE;
    }

    protected SetDestination(x: number, y: number, range: number, id?: string, room?: string) {
        this.minion.memory.destination_x = x;
        this.minion.memory.destination_y = y;
        this.minion.memory.destination_id = id;
        this.minion.memory.destination_room = room;
        this.minion.memory.range = range;
    }

    private static roomsUnderAttack:  { [roomName: string]: boolean; } = {};

    private static UnderAttack(room: string): boolean {
        let underAttack: boolean; 
        if (!this.roomsUnderAttack.hasOwnProperty(room)) {
            let hostiles = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
            underAttack = hostiles.length != 0;
            this.roomsUnderAttack[room] = underAttack;
        } else {
            underAttack = this.roomsUnderAttack[room];
        }
        return underAttack;
    }
    
    private static MinimumParts: string[] = [WORK, CARRY, MOVE];

    static GetParts(rcl: number, partsToAdd?: string[]): string[] {
        let parts = [];
        if (!partsToAdd) {
            partsToAdd = this.MinimumParts;
        }
        for (var index = 0; index < rcl; index++) {
            partsToAdd.forEach(element => {
                parts.push(element);
            });
        }
        return parts
    }
}