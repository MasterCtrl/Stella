Object.defineProperties(
    Room.prototype,
    {
        /**
         * Gets the threat level in this room.
         *
         * Defcon 0  => no threat.
         *        1  => hostiles in room, turrets fire every tick.
         *        2  => 60 ticks under siege, rooms spawns 2 guardians to defend.
         *        3  => 120 ticks under siege, same as defcon 2.
         *        4+ => 180 ticks under siege, rooms spawns 2 additional guardians to defend
         *
         * @type {Defcon}
         * @memberof Room
         */
        Defcon: {
            get: function(): Defcon {
                const room = this as Room;
                const current = (room.memory.defcon || { level: 0, tick: Game.time }) as Defcon;
                const tick = Game.time - current.tick;
                if (tick !== 0 && tick % 60 === 0) {
                    const hostiles = room.find<Creep>(FIND_HOSTILE_CREEPS);
                    if (hostiles.length > 0) {
                        current.level = Math.min(8, current.level + 1);
                        Logger.Info(`Upgrading defcon to ${current.level}`, room.name);
                    } else if (current.level !== 0) {
                        current.level = 0;
                        Logger.Info(`Downgrading defcon to ${current.level}`, room.name);
                    }
                    current.tick = Game.time;
                }
                return room.memory.defcon = current;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets if we are link mining in this room.
         *
         * @type {boolean} 
         * @memberof Room
         */
        IsLinkMining: {
            get: function(): boolean {
                const room = this as Room;
                if (room.memory.linkMining === undefined) {
                    const sources = room.find(FIND_SOURCES).length;
                    const links = room.find(FIND_MY_STRUCTURES, { filter: (l) => l.structureType === STRUCTURE_LINK }).length;
                    room.memory.linkMining = links > sources;
                }
                return room.memory.linkMining;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets if we are container mining in this room.
         *
         * @type {boolean} 
         * @memberof Room
         */
        IsContainerMining: {
            get: function(): boolean {
                const room = this as Room;
                if (room.memory.containerMining === undefined) {
                    let isContainerMining = false;
                    for (var source of room.find<Source>(FIND_SOURCES)) {
                        if (!source.pos.findInRange(FIND_STRUCTURES, 1, { filter: (c) => c.structureType === STRUCTURE_CONTAINER })) {
                            isContainerMining = false;
                            break;
                        }
                    }
                    room.memory.containerMining = isContainerMining;
                }
                return room.memory.containerMining;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the resources this room needs.
         *
         * @type {string[]} 
         * @memberof Room
         */
        Needs: {
            get: function(): string[] {
                const room = this as Room;
                if (room.memory.needs === undefined) {
                    room.memory.needs = [];
                    if (room.storage && room.storage.store.energy < 50000) {
                        room.memory.needs.push(RESOURCE_ENERGY);
                    }
                    if (room.terminal) {
                        for (var mineral in MINERAL_MIN_AMOUNT) {
                            if (room.terminal.store[mineral] >= 1000) {
                                continue;
                            }
                            room.memory.needs.push(mineral);
                        }
                    }
                }
                return room.memory.needs;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the container an upgrader should use as its source.
         * 
         * @type {ResourceContext}
         * @memberof Room
         */
        UpgraderSource: {
            get: function(): ResourceContext {
                const room = this as Room;
                if (room.memory.upgraderSource === undefined) {
                    const containers = room.controller.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 4, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
                    if (containers.length !== 1) {
                        room.memory.upgraderSource = null;
                    } else {
                        const container = containers[0];
                        room.memory.upgraderSource = {
                            sourceId: container.id,
                            resource: RESOURCE_ENERGY,
                            position: { x: container.pos.x, y: container.pos.y, room: room.name },
                            range: 1
                        };
                    }
                }
                return room.memory.upgraderSource;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the recycle bin for the room.
         *
         * @type {TargetContext}
         * @memberof Room
         */
        RecycleBin: {
            get: function(): ResourceContext {
                const room = this as Room;
                if (room.memory.recycleBin === undefined) {
                    const spawns = room.find<StructureSpawn>(FIND_MY_SPAWNS);
                    let container: StructureContainer;
                    for (const spawn of spawns) {
                        const containers = spawn.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, { filter: (s) => s.structureType === STRUCTURE_CONTAINER });
                        if (containers.length === 1) {
                            container = containers[0];
                            break;
                        }
                    }
                    if (container) {
                        room.memory.recycleBin = {
                            targetId: container.id,
                            position: { x: container.pos.x, y: container.pos.y, room: room.name },
                            range: 0
                        };
                    }
                }
                return room.memory.recycleBin;
            },
            enumerable: true,
            configurable: true
        },
        /**
         * Gets the sources in this room.
         *
         * @type {SourceContext[]}
         * @memberof Room
         */
        Sources: {
            get: function(): SourceContext[] {
                const room = this as Room;
                if (room.memory.sources === undefined) {
                    let sources: SourceContext[] = [];
                    for (const source of room.find<Source>(FIND_SOURCES)) {
                        sources.push({
                            sourceId: source.id,
                            position: { x: source.pos.x, y: source.pos.y, room: room.name },
                            range: 1
                        });
                    }
                    room.memory.sources = sources;
                }
                return room.memory.sources;
            },
            enumerable: true,
            configurable: true
        }
    }
);

/**
 * Finds the least populated source for this unit to harvest.
 *
 * @param {Creep} unit
 * @returns {SourceContext}
 * @memberof Room
 */
Room.prototype.FindSource = function(unit: Creep): SourceContext {
    const room = this as Room;
    if (!unit || unit.room.name !== room.name || unit.memory.source) {
        return undefined;
    }
    const assignedUnits = room.find<Creep>(FIND_MY_CREEPS, { filter: (u) => u.memory.source && u.memory.type === unit.memory.type });
    const assignedSources = assignedUnits.map((u) => u.Source.sourceId);

    let source: SourceContext = room.Sources.find((s) => assignedSources.indexOf(s.sourceId) === -1);
    if (!source) {
        const unitCount = _.countBy(assignedSources);
        const lowestCount = _.min(unitCount);
        for (const currentSource of room.Sources) {
            const count = unitCount[currentSource.sourceId];
            if (count === lowestCount) {
                source = currentSource;
                break;
            }
        }
    }
    return source;
};
