import MinionController from "./Controllers/MinionController";
import RoomController from "./Controllers/RoomController";

const Profiler = require("screeps-profiler");
Profiler.enable();

export const loop = function() {
    Profiler.wrap(function() {
        MinionController.Sync(Memory.creeps, Game.creeps);
        RoomController.RunRooms(Game.rooms);    
    });
}