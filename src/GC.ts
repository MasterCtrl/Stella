/**
 * Garbage collector
 * 
 * @export
 * @class GC
 */
export default class GC {
    /**
     * Syncs all memory caches with the actual entities.
     * 
     * @static
     * @memberof GC
     */
    public static SyncAll() {
        GC.Sync(Memory.creeps, Game.creeps);
        GC.Sync(Memory.rooms, Game.rooms);    
    }

    /**
     * Syncs a in memory cache with the actual entities.
     * 
     * @static
     * @param {RoomHash} inMemory 
     * @param {Room} inGame 
     * @memberof RoomController
     */
    public static Sync(inMemory: any, inGame: any) {
        for (var name in inMemory) {
            if(!inGame[name]) {
                delete inMemory[name];
            }
        }
    }
}