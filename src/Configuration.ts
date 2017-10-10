/**
 * Configuration file for common values
 * 
 * @export
 * @class Configuration
 */
export default class Configuration {
    static Defenses = {
        wall:       400000,
        rampart:    350000
    }
    static Terminal = {
        Z:          {Threshold : 3000, Packet: 500},
        O:          {Threshold : 2500, Packet: 500},
        U:          {Threshold : 2000, Packet: 500},
        Fallback:   {Threshold : 2000, Packet: 500},
        energy:     1000
    }
}