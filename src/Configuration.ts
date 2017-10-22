/**
 * Configuration file for common values
 *
 * @export
 * @class Configuration
 */
export default class Configuration {
    public static Profiling = true;
    public static Statistics = false;
    public static DrawVisuals = false;
    public static Defenses = {
        wall:       400000,
        rampart:    350000
    };
    public static Terminal = {
        H:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        O:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        Z:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        U:          {Minimum: 1000, Maximum: 10000, Packet: 1000},
        energy:     {Minimum: 50000, Maximum: 100000},
        Fallback:   {Minimum: 1000, Maximum: 10000, Packet: 1000}
    };
    public static TickRate = 11;
}
