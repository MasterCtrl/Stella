﻿import Configuration from "../Configuration"
import Constants from "../Constants"

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
                this.RunReset(this.minion.memory.postMovingState);
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
            this.Run();
            return;
        }
        if (this.minion.fatigue > 0) {
            return;
        }
        this.minion.moveTo(roomPosition);
    }

    private RunHarvesting(transitionState: number) {
        if (this.IsFull) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
            return;
        }
        let source: Source = Game.getObjectById(this.minion.memory.source_id);
        if (!source) {
            source = Game.getObjectById(this.minion.memory.destination_id);
        }
        if (source.energy == 0) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
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
        if (!storage) {
            this.minion.memory.state = transitionState;
            this.minion.memory.initialized = false;
            this.Run();
            return;
        }
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

    private RunClaiming(transitionState: number) {
        if (this.minion.claimController(this.minion.room.controller) == OK) {
            this.minion.memory.initialized = false;
        }
        this.minion.reserveController(this.minion.room.controller);
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

    private RunSuicide() {
        if (this.minion.carry.energy != 0) {
            this.minion.drop(RESOURCE_ENERGY);
        }
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
    protected get Name(): string{
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
        return this.minion.carry.energy == 0;
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
        return !this.IsEmpty && this.minion.getActiveBodyparts(WORK) * 2 >= this.minion.carryCapacity - this.minion.carry.energy;
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
     * Finds the lests populated source to mine and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindSource(): boolean {
        if (!this.IsEmpty) {
            return false;
        }
        let source: Source = null;
        if(!this.minion.memory.source_id){
            let assignedSources = _.countBy(this.minion.room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.source_id }), (creep: Creep) => creep.memory.source_id);
            let sources: Source[] = this.minion.room.find(FIND_SOURCES);
            let lowestCount: number = Object.keys(assignedSources).length < sources.length ? 0 :_.sortBy(assignedSources)[0];
            for (let i in sources) {
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

        if (Minion.AreWeLinkMining(this.minion.room)) {
            this.SetDestination(closestSource.pos.x, closestSource.pos.y, 1, closestSource.id, closestSource.room.name);
            this.minion.memory.source_id = closestSource.id;
            this.minion.memory.postMovingState = Constants.STATE_HARVESTING;
            return true;    
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

    /**
     * Finds a dropped energy source and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindDroppedEnergy(): boolean {
        if (!this.IsEmpty || Minion.UnderAttack(this.minion.room.name)) {
            return false;
        }
        let occupiedSources = _.filter(Game.creeps, creep => creep.memory.destination_id).map(creep => creep.memory.destination_id);
        let energy: Source= this.minion.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: energy => (occupiedSources.indexOf(energy.id) == -1 || energy.energy > 500) && this.minion.room.name == energy.room.name
        });
        if (energy && energy.energy > 20) {
            this.SetDestination(energy.pos.x, energy.pos.y, 1, energy.id, energy.room.name);
            this.minion.memory.postMovingState = Constants.STATE_PICKUP;
            return true;
        }
        return false;
    }

    /**
     * Finds somewhere to store energy and sets it as the destination.
     * One of Spawn, Extension, or Tower that doesn't already have a minion delivering to it.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
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

    /**
     * Finds a Storage structure to store energy in and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindStorageTarget(): boolean {
        if (this.IsEmpty || (Minion.AreWeLinkMining(this.minion.room) && this.Type != "Filler")) {
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

    /**
     * Finds a Storage structure to withdraw energy from and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindStorageSource(): boolean {
        if (!this.IsEmpty || !Minion.AreWeLinkMining(this.minion.room)) {
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

    /**
     * Finds a Storage structure to withdraw energy from and sets it as the destination.
     * 
     * @protected
     * @returns {boolean} 
     * @memberof Minion
     */
    protected FindContainerSource(): boolean {
        if (!this.IsEmpty || Minion.AreWeLinkMining(this.minion.room)) {
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
        let controller: Controller = this.minion.room.controller;
        if (controller) {
            this.SetDestination(controller.pos.x, controller.pos.y, 3, controller.id);
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
        let constructionSite: ConstructionSite = this.minion.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            this.SetDestination(constructionSite.pos.x, constructionSite.pos.y, 3, constructionSite.id);
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

        let ramparts: StructureRampart[] = this.minion.room.find(FIND_STRUCTURES, { 
            filter: rampart => rampart.structureType == STRUCTURE_RAMPART && rampart.hits < Configuration.RampartHp
        });
        if (ramparts.length > 0) {
            let rampart: StructureRampart = ramparts.length != 1 ? _.sortBy(ramparts, r => r.hits)[0] : ramparts[0];                
            this.SetDestination(rampart.pos.x, rampart.pos.y, 3, rampart.id, rampart.room.name);
            this.minion.memory.postMovingState = Constants.STATE_REPAIRING;
            return true;                
        }

        let wall: StructureWall = this.minion.pos.findClosestByRange(FIND_STRUCTURES, { 
            filter: wall => wall.structureType == STRUCTURE_WALL && wall.hits < Configuration.WallHp
        });
        if (wall) {
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
        this.SetDestination(flag.pos.x, flag.pos.y, 1, null, flag.pos.roomName);
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
        this.SetDestination(flag.pos.x, flag.pos.y, 1, null, flag.pos.roomName);
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
        let link: Link = this.minion.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK});
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
        let link: Link = this.minion.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK});
        if (link && link.energy != 0) {
            this.minion.memory.postMovingState = Constants.STATE_WITHDRAWING;
            this.SetDestination(link.pos.x, link.pos.y, 1, link.id, link.room.name);
            return true;
        }
        return false;
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
            this.SetDestination(flag.pos.x, flag.pos.y, 1, flag.room.name);            
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
    protected SetDestination(x: number, y: number, range: number, id?: string, room?: string) {
        this.minion.memory.destination_x = x;
        this.minion.memory.destination_y = y;
        this.minion.memory.destination_id = id;
        this.minion.memory.destination_room = room;
        this.minion.memory.range = range;
    }
   
    /**
     * Builds a list of parts based on the rcl of the room
     * 
     * @static
     * @param {number} rcl 
     * @param {string[]} [partsToAdd] 
     * @returns {string[]} 
     * @memberof Minion
     */
    public static GetParts(rcl: number, partsToAdd?: string[]): string[] {
        let parts = [];
        if (!partsToAdd) {
            partsToAdd = this.MinimumParts;
        }
        for (var index = 0; index < rcl; index++) {
            partsToAdd.forEach(e => {
                parts.push(e);
            });
        }
        return parts
    }
    private static MinimumParts: string[] = [WORK, CARRY, MOVE];

    /**
     * Gets if we are link mining in this room
     * 
     * @static
     * @param {Room} room 
     * @returns {boolean} 
     * @memberof Minion
     */
    public static AreWeLinkMining(room: Room): boolean {
        let areWeLinkMining: boolean; 
        if (!this.areWeLinkMining.hasOwnProperty(room.name)) {
            let sources = room.find(FIND_SOURCES).length;
            let links = room.find(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK}).length;
            areWeLinkMining = links > sources;
            this.areWeLinkMining[room.name] = areWeLinkMining;
        } else {
            areWeLinkMining = this.areWeLinkMining[room.name];
        }
        return areWeLinkMining;
    }
    private static areWeLinkMining: { [roomName: string]: boolean; } = {};

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
    private static roomsUnderAttack: { [roomName: string]: boolean; } = {};
}

require("screeps-profiler").registerClass(Minion, "Minion");