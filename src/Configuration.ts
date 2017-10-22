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
        H:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        O:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        Z:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        U:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        energy:     {Minimum: 50000, Maximum: 100000},
        Fallback:   {Minimum: 1000, Maximum: 10000, Packet: 1000}
    };
    static TickRate = 11;
}