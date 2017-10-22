/**
 * Configuration file for common values
 * 
 * @export
 * @class Configuration
 */
export default class Configuration {
    static Profiling = true;
    static Statistics = false;
    static DrawVisuals = false;
    static Defenses = {
        wall:       400000,
        rampart:    350000
    };
    static Terminal = {
        Z:          {Threshold : 10000, Packet: 1000},
        O:          {Threshold : 10000, Packet: 1000},
        U:          {Threshold : 10000, Packet: 1000},
        Fallback:   {Threshold : 10000, Packet: 1000},
        energy:     100000
    };
    static TickRate = 7;
}