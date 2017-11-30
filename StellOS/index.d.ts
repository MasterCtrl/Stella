interface IKernel {
    Load(): void;
    Unload(): void;
    FormatNumber(value: number): string;
    Reset(): void;
    Run(): void;
    readonly UnderLimit: boolean;
    CreateProcess<T extends IProcess>(processClass: any, identifier: string, priority: number, options?: { ParentId?: number, Memory?: any }): T;
    GetNextProcess(): IProcess;
    GetProcess<T extends IProcess>(options: any): T;
    GetChildren(parentProcessId: number): IProcess[];
    GetNextProcessId(): number;
    Terminate<T extends IProcess>(options: any, killChildren?: boolean): void;
    Status(): void;
    Resume(): void;
    Suspend(tick?: number): void;
}

interface IRegister {
    [type: string]: IProcess;
}

interface IProcess {
    readonly ProcessId: number;
    readonly Name: string;
    readonly Type: string;
    readonly ParentId: number;
    readonly Initialized: number;
    Priority: number;
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

interface IUnitOptions {
    Priority: number;
    Type: string;
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

declare const Logger: ILogger;

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

type PositionContext = { x: number, y: number, room?: string };
type MoveContext = { position: PositionContext, range?: number };
type SourceContext = { sourceId: string, position: PositionContext, range?: number };
type ResourceContext = { targetId: string, resource: string, position: PositionContext, range?: number };
type BuildContext = { constructionSiteId: string, position: PositionContext, range?: number };
type TargetContext = { targetId: string, position: PositionContext, range?: number };
type RepairContext = { targetId: string, position: PositionContext, hits?: number, range?: number };
type AttackContext = { targetId: string, range?: number };
type SignContext = { message: string };
type LinkContext = { targetId: string, resource: string, position: PositionContext, range: number, sourceId: string, center: boolean };
type ContainerContext = { targetId: string, resource: string, position: PositionContext, range: number, sourceId: string, upgrader: boolean, recycle: boolean };
type Context = MoveContext | SourceContext | ResourceContext | BuildContext | TargetContext | RepairContext | AttackContext | SignContext | LinkContext | ContainerContext;

interface Room {
    readonly Defcon: Defcon;
    readonly Sources: SourceContext[];
    readonly Spawn: PositionContext;
    readonly Containers: ContainerContext[];
    readonly IsContainerMining: boolean;
    readonly UpgraderSource: ContainerContext;
    readonly RecycleBin: ContainerContext;
    readonly Links: LinkContext[];
    readonly IsLinkMining: boolean;
    readonly CentralLink: LinkContext;
    FindSource(unit: Creep): SourceContext;
}

interface Defcon {
    level: number, 
    tick: number
}

interface Structure {
    readonly IsFull: boolean;
    readonly HitPercentage: number;
    IsEmpty(resource: string): boolean;
    StorePercentage(resource: string): number;
}

interface Creep {
    readonly Source: SourceContext;
    readonly CurrentTarget: string;
    travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
}

interface Mineral {
    readonly HasExtractor: boolean;
}

interface PathfinderReturn {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
}

interface TravelToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathfinderReturn;
    state?: TravelState;
    path?: string;
}

interface TravelToOptions {
    ignoreRoads?: boolean;
    ignoreCreeps?: boolean;
    ignoreStructures?: boolean;
    preferHighway?: boolean;
    highwayBias?: number;
    allowHostile?: boolean;
    allowSK?: boolean;
    range?: number;
    obstacles?: {pos: RoomPosition}[];
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    routeCallback?: (roomName: string) => number;
    returnData?: TravelToReturnData;
    restrictDistance?: number;
    useFindRoute?: boolean;
    maxOps?: number;
    movingTarget?: boolean;
    freshMatrix?: boolean;
    offRoad?: boolean;
    stuckValue?: number;
    maxRooms?: number;
    repath?: number;
    route?: {[roomName: string]: boolean};
    ensurePath?: boolean;
}

interface TravelData {
    state: any[];
    path: string;
}

interface TravelState {
    stuckCount: number;
    lastCoord: Coord;
    destination: RoomPosition;
    cpu: number;
}

type Coord = {x: number, y: number};
type HasPos = {pos: RoomPosition}

type ArchitectContext = { x: number, y: number, structureType: string };
