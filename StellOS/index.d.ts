interface IKernel {
    Load(): void;
    Unload(): void;
    Reset(): void;
    Run(): void;
    UnderLimit: boolean;
    CreateProcess<T extends IProcess>(processClass: any, identifier: string, priority: number, parentId?: number): T;
    GetNextProcess(): IProcess;
    GetProcess<T extends IProcess>(options: ProcessFindOptions<T>): T;
    GetChildren(parentProcessId: number): IProcess[];
    GetNextProcessId(): number;
    Terminate<T extends IProcess>(options: ProcessFindOptions<T>, killChildren?: boolean): void;
    Status(): void;
}

interface IRegister {
    [type: string]: IProcess;
}

interface IProcess {
    Load(data: IData);
    ProcessId: number;
    Priority: number;
    Name: string;
    Type: string;
    ParentId: number;
    Initialized: number;
    State: State;
    Memory: any;
    Completed: boolean;
    Execute(): void;
    CheckState(): boolean;
    Resume(): void;
    Suspend(state?: State, suspendChildren?: boolean): void;
    Serialize(): IData;
    Dispose(): void;
}

interface IData {
    ProcessId: number;
    Priority: number;
    Name: string;
    ParentId: number;
    Initialized: number;
    State: State;
    Type?: string;
}

interface ProcessFindOptions<T extends IProcess> {
    Name?: string;
    ProcessId?: number;
    Find?: (p: T) => boolean; 
}

interface IUnitOptions {
    Priority: number;
    Type: string;
    Body: string[];
}

interface IUnitDefintion {
    Priority: number;
    Population(room: Room): number;
    CreateBody(room: Room): string[];
}

type State = string | number | boolean;

interface ILogger {
    LogLevel;
    Debug(message: string, room?: string): void;
    Info(message: string, room?: string): void;
    Warning(message: string, room?: string): void;
    Error(message: string, room?: string): void;
    Critical(message: string, room?: string): void;
}

declare namespace NodeJS {
    interface Global {
        Logger: ILogger;
        StellOS: IKernel;
    }    
}

interface IUnit {
    Execute(): void;
}
