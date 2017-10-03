import Manager from "./Manager";
import RoomController from "./RoomController";

export const loop = function () {
    Manager.Sync(Memory.creeps, Game.creeps);
    RoomController.RunRooms(Game.rooms);
}