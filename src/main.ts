import Manager from "./Manager";
import RoomController from "./RoomController";

const Profiler = require("screeps-profiler");
Profiler.enable();

export const loop = function() {
    Profiler.wrap(function() {
        Manager.Sync(Memory.creeps, Game.creeps);
        RoomController.RunRooms(Game.rooms);    
    });
}