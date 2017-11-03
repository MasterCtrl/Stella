interface IKernel {
    Load();
    Unload();
    Run();
    UnderLimit: boolean;
    CreateProcess(priority: number, name: string, type: string, parentId?: number): IProcess;
    GetNextProcess(): IProcess;
    GetProcess(type: string): IProcess;
    GetChildren(parentProcessId: number): IProcess[];
    GetNextProcessId(): number;
    ActivateProcess(data: IData): IProcess
    Terminate(name: string, killChildren?: boolean);
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
    Execute();
    CheckState(): boolean;
    Resume();
    Suspend(state?: State, suspendChildren?: boolean);
    Serialize(): IData;
    Dispose();
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
    Debug(message: string, room?: string);
    Info(message: string, room?: string);
    Warning(message: string, room?: string);
    Error(message: string, room?: string);
    Critical(message: string, room?: string);
}

interface IGlobal extends NodeJS.Global {
    Logger: ILogger;
}

declare var global: IGlobal;
