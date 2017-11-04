interface IKernel {
    Load(): void;
    Unload(): void;
    Reset(): void;
    Run(): void;
    UnderLimit: boolean;
    CreateProcess(priority: number, name: string, type: string, parentId?: number): IProcess;
    GetNextProcess(): IProcess;
    GetProcess(type: string): IProcess;
    GetChildren(parentProcessId: number): IProcess[];
    GetNextProcessId(): number;
    ActivateProcess(data: IData): IProcess
    Terminate(name: string, killChildren?: boolean): void;
    Status(): void;
}

interface IRegister {
    [type: string]: IProcess;
}

interface IProcess {
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
    Type: string;
    ParentId: number;
    Initialized: number;
    State: State;
}

interface IUnitOptions {
    Priority: number;
    Type: string;
    Body: string[];
}

interface IUnitDefintion {
    Priority: number;
    Type: string;
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
