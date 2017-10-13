import EntityController from "./Controllers/EntityController";
import RoomController from "./Controllers/RoomController";
import Profiler from "./Profiling"


export const loop = function() {
    if (Profiler) {
        Profiler.wrap(mainLoop);
    } else {
        mainLoop();
    }
}

let mainLoop = function() {
    EntityController.Sync(Memory.creeps, Game.creeps);
    RoomController.RunRooms(Game.rooms);
}