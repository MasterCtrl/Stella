/**
 * Constants file
 * 
 * @export
 * @class Constants
 */
export default class Constants {
    static STATE_SUICIDE: number = -1;
    static STATE_SPAWNING: number = 0;
    static STATE_MOVING: number = 1;
    static STATE_HARVESTING: number = 2;
    static STATE_PICKUP: number = 3;
    static STATE_TRANSFERRING: number = 4;
    static STATE_UPGRADING: number = 5;
    static STATE_BUILDING: number = 6;
    static STATE_REPAIRING: number = 7;
    static STATE_WITHDRAWING: number = 8;
    static STATE_IDLE: number = 9;
    static STATE_CLAIM: number = 10;
    static STATE_RESET: number = 11;
    static STATE_ATTACK: number = 12;
    static STATE_RANGED_ATTACK: number = 13;
    static STATE_MELEE_ATTACK: number = 14;
    static STATE_HEAL: number = 15;
}