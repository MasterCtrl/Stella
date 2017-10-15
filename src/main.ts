import EntityController from "./Controllers/EntityController";
import RoomController from "./Controllers/RoomController";
import GC from "./GC"
import Profiler from "./Profiling"


export const loop = function() {
    if (Profiler) {
        Profiler.wrap(mainLoop);
    } else {
        mainLoop();
    }
}

let mainLoop = function() {
    RoomController.RunRooms(Game.rooms);
    GC.SyncAll();
}