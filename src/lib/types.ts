/**
 * Template type
 */
export interface Template {
    id: number;
    uuid: string;
    name: string;
    description: string;
    docker: TemplateDocker;
    variables: TemplateVariable[];
    install_script: string;
}

export interface TemplateVariable {
    name: string;
    description: string;
    environment_variable: string;
    default_value: string;
    type: "string" | "number" | "boolean";
    rules: string[];
}

export type TemplateDocker = {
    images: string[];
    start_command: string;
    stop_command: string;
    start_config: string;
    config_files: TemplateConfigFile[];
}

export type TemplateConfigFile = {
    path: string;
    content: string;
}

/**
 * Server type
 */
export interface Server {
    id: string;
    uuid: string;
    docker_id: string;
    name: string;
    description: string;
    template: number;
    
    container: ServerContainer;
    resources: ServerResources;
    allocations: ServerAllocation[];

    createdAt: number;
    updatedAt: number;

    state: number;
}

export const ServerState: string[] = [
    "Running",
    "Stopped",
    "Starting",
    "Stopping",
    "Unknown",
]

export interface ServerContainer {
    startup_command: string;
    image: string;
    installed: boolean;
    variables: { [key: string]: string };
}

export interface ServerResources {
    memory: number;
    cpu: number;
    disk: number;
}

export interface ServerAllocation {
    ip: string;
    port: number;
    primary: boolean;
}