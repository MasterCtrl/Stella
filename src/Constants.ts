/**
 * Constants file
 *
 * @export
 * @class Constants
 */
export default class Constants {
    public static STATE_SUICIDE: number = -1;
    public static STATE_SPAWNING: number = 0;
    public static STATE_MOVING: number = 1;
    public static STATE_HARVESTING: number = 2;
    public static STATE_PICKUP: number = 3;
    public static STATE_TRANSFERRING: number = 4;
    public static STATE_UPGRADING: number = 5;
    public static STATE_BUILDING: number = 6;
    public static STATE_REPAIRING: number = 7;
    public static STATE_WITHDRAWING: number = 8;
    public static STATE_IDLE: number = 9;
    public static STATE_CLAIM: number = 10;
    public static STATE_RESET: number = 11;
    public static STATE_ATTACK: number = 12;
    public static STATE_RANGED_ATTACK: number = 13;
    public static STATE_MELEE_ATTACK: number = 14;
    public static STATE_HEAL: number = 15;
}
