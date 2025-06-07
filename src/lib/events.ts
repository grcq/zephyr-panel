export enum Event {
    ErrorEvent = "error",
    PowerEvent = "server power event",

    InstallStarted = "server install started",
    InstallFinished = "server install finished",

    ServerCommand = "send command",
    ServerCreated = "server created",
    ServerDeleted = "server deleted",
    ServerStats = "send server stats",
    ServerLog = "send console log",
}