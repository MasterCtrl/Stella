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
        },

        /**
         * Gets the containers in ths room.
         *
         * @type {ContainerContext[]}
         * @memberof Room
         */
        Containers: {
            get: function(): ContainerContext[] {
                const room = this as Room;
                if (room.memory.containers === undefined) {
                    let containers = new Array<ContainerContext>();
                    for (const container of room.find<StructureContainer>(FIND_STRUCTURES, { filter: (c) => c.structureType === STRUCTURE_CONTAINER })) {
                        const sources = container.pos.findInRange<Source>(FIND_SOURCES, 2);
                        containers.push({
                            targetId: container.id,
                            resource: RESOURCE_ENERGY,
                            position: { x: container.pos.x, y: container.pos.y, room: container.room.name },
                            range: 1,
                            sourceId: sources.length === 1 ? sources[0].id : undefined, // Is 1 source within 2 of this container => Source
                            upgrader: container.pos.getRangeTo(room.controller) <= 4, // Is the controller with 4 of this container => Upgrader source
                            recycle: container.pos.findInRange(FIND_MY_SPAWNS, 1).length > 0 // Is a spawn within 2 of this container => Recycle bin
                        });
                    }
                    room.memory.containers = containers;
                }
                return room.memory.containers;
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
                    room.memory.containerMining = _.filter(room.Containers, "sourceId").length > room.Sources.length;
                }
                return room.memory.containerMining;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the container an upgrader should use as its source.
         * 
         * @type {ContainerContext}
         * @memberof Room
         */
        UpgraderSource: {
            get: function(): ContainerContext {
                const room = this as Room;
                return _.find(room.Containers, "upgrader");
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the recycle bin for the room.
         *
         * @type {ContainerContext}
         * @memberof Room
         */
        RecycleBin: {
            get: function(): ContainerContext {
                const room = this as Room;
                return _.find(room.Containers, "recycle");
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the links in this room.
         *
         * @type {LinkContext[]}
         * @memberof Room
         */
        Links: {
            get: function(): LinkContext[] {
                const room = this as Room;
                if (room.memory.links === undefined) {
                    let links = new Array<LinkContext>();
                    for (const link of room.find<StructureLink>(FIND_MY_STRUCTURES, { filter: (l) => l.structureType === STRUCTURE_LINK })) {
                        const sources = link.pos.findInRange<Source>(FIND_SOURCES, 2);
                        links.push({
                            targetId: link.id,
                            resource: RESOURCE_ENERGY,
                            position: { x: link.pos.x, y: link.pos.y, room: link.room.name },
                            range: 1,
                            sourceId: sources.length === 1 ? sources[0].id : undefined, // Is 1 source within 2 of this container => Source
                            center: link.pos.findInRange(FIND_MY_SPAWNS, 2).length >= 0 // Is there a spawn within 2 of this container => Center
                        });
                    }
                    room.memory.links = links;
                }
                return room.memory.links;
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
                    room.memory.linkMining = _.filter(room.Containers, "sourceId").length > room.Sources.length;
                }
                return room.memory.linkMining;
            },
            enumerable: true,
            configurable: true
        },

        /**
         * Gets the central link in this room.
         *
         * @type {TargetContext}
         * @memberof Room
         */
        CentralLink: {
            get: function(): TargetContext {
                const room = this as Room;
                return _.find(room.Links, "center");
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
