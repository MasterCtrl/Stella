import Configuration from "./Configuration"
import EntityController from "./Controllers/EntityController";
import RoomController from "./Controllers/RoomController";

let Profiler = undefined;
if (Configuration.Profiling) {
    Profiler = require("screeps-profiler");
    Profiler.enable();    
}

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