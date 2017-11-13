/**
 * Logging class for dealing with console output.
 *
 * @export
 * @class Logger
 */
class Logger implements ILogger {
    constructor() {
        if (Memory.Settings === undefined) {
            Memory.Settings = {};
        }
        if (Memory.Settings.LogLevel === undefined) {
            Memory.Settings.LogLevel = LogLevel.INFO;
        }
    }

    /**
     * Gets or sets the log level to output
     *
     * @memberof Logger
     */
    public get LogLevel() {
        return Memory.Settings.LogLevel;
    }
    public set LogLevel(value: LogLevel) {
        Memory.Settings.LogLevel = value;
    }

    /**
     * Logs a message for the given room with the specified level/style.
     *
     * @param {string} message 
     * @param {string} room 
     * @param {LogLevel} level 
     * @param {string} [style=this.GetStyle(level)] 
     * @memberof Logger
     */
    public Log(message: string, level: LogLevel, room?: string, style: string = this.GetStyle(level)): void {
        if (level >= this.LogLevel) {
            const roomLink = room === undefined ? "" : `<a href='#!/room/${Game.shard.name}/${room}'>${room}</a>: `;
            console.log(`<span style='${style}'>[${LogLevel[level]}]</span> ${roomLink}${message}`);
        }
    }

    /**
     * Logs a message for the given room at the DEBUG level.
     *
     * @param {string} message 
     * @param {string} room 
     * @memberof Logger
     */
    public Debug(message: string, room?: string): void {
        this.Log(message, LogLevel.DEBUG, room);
    }

    /**
     * Logs a message for the given room at the INFO level.
     *
     * @param {string} message 
     * @param {string} room 
     * @memberof Logger
     */
    public Info(message: string, room?: string): void {
        this.Log(message, LogLevel.INFO, room);
    }

    /**
     * Logs a message for the given room at the WARNING level.
     *
     * @param {string} message 
     * @param {string} room 
     * @memberof Logger
     */
    public Warning(message: string, room?: string): void {
        this.Log(message, LogLevel.WARNING, room);
    }

    /**
     * Logs a message for the given room at the ERROR level.
     *
     * @param {string} message 
     * @param {string} room 
     * @memberof Logger
     */
    public Error(message: string, room?: string): void {
        this.Log(message, LogLevel.ERROR, room);
    }

    /**
     * Logs a message for the given room at the CRITICAL level.
     *
     * @param {string} message 
     * @param {string} room 
     * @memberof Logger
     */
    public Critical(message: string, room?: string): void {
        this.Log(message, LogLevel.CRITICAL, room);
    }

    private GetStyle(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return "color: darkblue";
            case LogLevel.WARNING:
                return "color: orange";
            case LogLevel.ERROR:
                return "color: red";
            case LogLevel.CRITICAL:
                return "color: yellow; background-color: red";
            case LogLevel.INFO:
            default:
                return "color: darkgreen";
        }
    }
}

/**
 * Log level enum.
 * 
 * @export
 * @enum {number}
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
    CRITICAL = 4
}

if (!global.Logger) {
    global.Logger = new Logger();
}
