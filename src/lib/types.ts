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