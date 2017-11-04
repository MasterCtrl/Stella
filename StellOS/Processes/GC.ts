import Process from "../os/Process";

/**
 * Garbage collector for cleaning up unused memory.
 *
 * @export
 * @class GC
 * @extends {Process}
 */
export default class GC extends Process {
    /**
     * Executes the garbage collection process.
     * 
     * @memberof Council
     */
    public Execute(): void {
        this.Sync(Memory.creeps, Game.creeps);
        this.Sync(Memory.rooms, Game.rooms);
    }

    private Sync(memory: any, game: any) {
        for (const p in memory) {
            if (!game[p]) {
                delete memory[p];
            }
        }
    }
}
