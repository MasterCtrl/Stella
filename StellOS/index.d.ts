interface IKernel {
    Load(): void;
    Unload(): void;
    Reset(): void;
    Run(): void;
    readonly UnderLimit: boolean;
    CreateProcess<T extends IProcess>(processClass: any, identifier: string, priority: number, options?: { ParentId?: number, Memory?: any }): T;
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
    readonly ProcessId: number;
    readonly Priority: number;
    readonly Name: string;
    readonly Type: string;
    readonly ParentId: number;
    readonly Initialized: number;
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
    Type: string;
    Memory?: any;
}

interface ProcessFindOptions<T extends IProcess> {
    Name?: string;
    ProcessId?: number;
    Find?: any; 
}

interface IUnitOptions {
    Priority: number;
    Type: string;
    Body: string[];
}

interface IUnitDefinition {
    Priority(room: Room): number;
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
    readonly Unit: Creep;
    readonly Kernel: IKernel;
    Memory: any;
    Stack: IState[];
    Execute(): boolean;
    GetState(defaultState?: string): string;
    SetState(state: string, context?: any): string;
    PushState(state: string, context?: any): string;
    PopState(): void;
    ClearState(): void;
}

interface IState {
    State: string;
    Context?: any;
}

type PositionContext = { x: number, y: number, room: string };
type SourceContext = { sourceId: string, position: PositionContext, range?: number };
type ResourceContext = { targetId: string, resource: string, position: PositionContext, range?: number };
type BuildContext = { constructionSiteId: string, resource: string, position: PositionContext, range?: number };
type TargetContext = { targetId: string, position: PositionContext, range?: number };
type RepairContext = { targetId: string, position: PositionContext, hits?: number, range?: number };
type AttackContext = { targetId: string, range?: number };
type SignContext = { message: string };

interface Room {
    readonly Defcon: Defcon;
    readonly IsLinkMining: boolean;
    readonly IsContainerMining: boolean;
}

interface Defcon {
    level: number, 
    tick: number
}
