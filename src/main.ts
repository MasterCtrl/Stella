import * as MemoryController from "./Controllers/MemoryController";
import RoomController from "./Controllers/RoomController";
import GC from "./GC";
import Profiler from "./Profiling";

export const loop = () => {
    if (Profiler) {
        Profiler.wrap(mainLoop);
    } else {
        mainLoop();
    }
};

const mainLoop = () => {
    MemoryController.Run();
    RoomController.RunRooms(Game.rooms);
    GC.SyncAll();
};
