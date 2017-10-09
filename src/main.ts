import EntityController from "./Controllers/EntityController";
import RoomController from "./Controllers/RoomController";

const Profiler = require("screeps-profiler");
Profiler.enable();

export const loop = function() {
    Profiler.wrap(function() {
        EntityController.Sync(Memory.creeps, Game.creeps);
        RoomController.RunRooms(Game.rooms);    
    });
}