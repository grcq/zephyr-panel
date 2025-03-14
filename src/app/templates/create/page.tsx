"use client";

import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, ChevronDown, ChevronUp, TrashIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { fetch } from "@tauri-apps/plugin-http";
import { v4 } from "uuid";

const templateSchema = z.object({
    name: z.string().nonempty().max(60),
    description: z.string().max(255).optional().default(""),
    startup: z.string().max(255),
    images: z.array(z.string().nonempty().regex(/^([\w\d\s]+\|)?[a-zA-Z0-9.-\_\/]+(:[a-zA-Z0-9.-\_\/]+)?$/, "Invalid Docker image.")).min(1, "At least one Docker image is required.").optional().default([]),

    stop_command: z.string().max(255).optional().default("stop"),
    start_config: z.string().nonempty().regex(/^{(.|\n)*}$/m),
    config_files: z.string().nonempty().regex(/^{(.|\n)*}$/m),

    variables: z.array(z.object({
        name: z.string().nonempty().max(60),
        description: z.string().max(255).optional().default(""),
        environment_name: z.string().max(60).nonempty(),
        default_value: z.string().max(255).optional().default(""),
        type: z.string().max(60).regex(/^(string|number|boolean)$/, "Type must be one of the following; string, number, boolean").default("string"),
        rules: z.string().optional().default(""),
    })).optional(),

    install_script: z.string().optional().default(""),
});

function TemplateForm() {
    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            images: [],
            variables: [],
            start_config: "{}",
            config_files: "{}",
            stop_command: "stop",
        }
    });

    const [openStates, setOpenStates] = useState<boolean[]>([]);
    const toggleCollapsible = (index: number) => {
        setOpenStates((prev) => {
            const newStates = [...prev];
            newStates[index] = !newStates[index];
            return newStates;
        });
    };

    const { control, handleSubmit } = form;
    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control,
        // @ts-ignore
        name: "images"
    });

    const { fields: variableFields, append: appendVariable, remove: removeVariable } = useFieldArray({
        control,
        name: "variables"
    });

    const onSubmit = async (data: z.infer<typeof templateSchema>) => {
        const templates: Response = await fetch("http://127.0.0.1:8083/api/templates");
        const templatesJson = await templates.json();
        let id = 1;
        for (const template of templatesJson) {
            if (template.id >= id) {
                id = template.id + 1;
            }
        }

        const uuid = v4();

        const configFiles = JSON.parse(data.config_files);
        let config_files = [];

        for (const [key, value] of Object.entries(configFiles)) {
            config_files.push({
                path: key,
                content: value,
            });
        }

        const variables = (data.variables || []).map((variable) => ({
            name: variable.name,
            description: variable.description,
            environment_name: variable.environment_name,
            default_value: variable.default_value,
            type: variable.type,
            rules: variable.rules.split(",").filter((rule) => rule.trim() !== ""),
        }));
        await fetch("http://127.0.0.1:8083/api/templates/add", {
            method: "POST",
            body: JSON.stringify({
                id,
                uuid,
                name: data.name,
                description: data.description,
                docker: {
                    images: data.images,
                    start_command: data.startup,
                    stop_command: data.stop_command,
                    start_config: data.start_config,
                    config_files,
                },
                variables,
                install_script: data.install_script,
            }),
        })
        redirect("/templates");
    }

    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General Information</TabsTrigger>
                <TabsTrigger value="process">Process Management</TabsTrigger>
                <TabsTrigger value="variables">Template Variables</TabsTrigger>
                <TabsTrigger value="script">Install Script</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
                <Card>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <div className="flex gap-4 w-full items-center">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Name <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter a name" />
                                            </FormControl>
                                            <FormDescription>Enter a name for the template.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Enter a description" className="resize-none" />
                                        </FormControl>
                                        <FormDescription>Enter a description for the template.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="startup" render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Startup Command <span className="text-red-400">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter a startup command" className="resize-none" />
                                        </FormControl>
                                        <FormDescription>Enter a startup command for the template.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="space-y-2">
                                    <FormLabel>Images <span className="text-red-400">*</span></FormLabel>
                                    {imageFields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={control}
                                            name={`images.${index}`}
                                            render={({ field }) => (
                                                <FormItem className="flex gap-2">
                                                    <div className="w-full">
                                                        <FormControl>
                                                            <Input {...field} placeholder="Enter an image URL" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                    <Button type="button" variant="destructive" onClick={() => removeImage(index)}>
                                                        Remove
                                                    </Button>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                    <Button type="button" variant="outline" onClick={() => 
                                        // @ts-ignore
                                        appendImage("")
                                    } className="mt-2">
                                        Add Image
                                    </Button>
                                </div>
                                <Button>Create</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="process">
                <Card>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={control}
                                    name="stop_command"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Stop Command</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter a stop command" />
                                            </FormControl>
                                            <FormDescription>Enter a stop command for the template.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-4">
                                    <FormField
                                        control={control}
                                        name="start_config"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Start Config</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Enter a start config" className="resize-none h-64 text-xl" />
                                                </FormControl>
                                                <FormDescription>Enter a start config for the template. This should be in a JSON format.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="config_files"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Config Files</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Enter config files" className="resize-none h-64" />
                                                </FormControl>
                                                <FormDescription>Enter config files for the template. This should be in a JSON format.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button>Create</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="variables">
                <Card>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="flex justify-between">
                                    <FormLabel>Variables</FormLabel>
                                    <Button type="button" variant="outline" onClick={() => appendVariable({ name: "unnamed variable", description: "", type: "string", environment_name: "", default_value: "", rules: "" })}>
                                        Add Variable
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {variableFields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={control}
                                            name={`variables.${index}`}
                                            render={({ field }) => (
                                                <Collapsible open={openStates[index]} onToggle={() => toggleCollapsible(index)}>
                                                    <CollapsibleTrigger asChild>
                                                        <div className={cn("flex justify-between items-center bg-sidebar border border-solid border-secondary rounded-lg p-2 px-4 cursor-pointer select-none", openStates[index] && "rounded-b-none")} onClick={() => toggleCollapsible(index)}>
                                                            <p className="font-medium">{field.value.name}</p>
                                                            <div className="flex gap-2 items-center">
                                                                <Button type="button" size="sm" variant="destructive" onClick={() => removeVariable(index)}>
                                                                    <TrashIcon />
                                                                </Button>
                                                                <Button type="button" size="sm" variant="ghost">
                                                                    {openStates[index] ? <ChevronUp /> : <ChevronDown />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="bg-sidebar p-4 rounded-b-lg border-solid border border-t-0 space-y-4">
                                                        <FormField
                                                            control={control}
                                                            name={`variables.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Name <span className="text-red-400">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter a name" />
                                                                    </FormControl>
                                                                    <FormDescription>Enter a name for the variable.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`variables.${index}.description`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Description</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea {...field} placeholder="Enter a description" className="resize-none" />
                                                                    </FormControl>
                                                                    <FormDescription>Enter a description for the variable.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`variables.${index}.environment_name`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Environment Name <span className="text-red-400">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter an environment name" />
                                                                    </FormControl>
                                                                    <FormDescription>Enter an environment name for the variable.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`variables.${index}.default_value`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Default Value</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter a default value" />
                                                                    </FormControl>
                                                                    <FormDescription>Enter a default value for the variable.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField 
                                                            control={control}
                                                            name={`variables.${index}.type`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Type</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter a type" />
                                                                    </FormControl>
                                                                    <FormDescription>Enter a type for the variable.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`variables.${index}.rules`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Rules</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea {...field} placeholder="Enter rules" className="resize-none" />
                                                                    </FormControl>
                                                                    <FormDescription>Enter rules for the variable.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )}
                                        />
                                    ))}
                                </div>
                                <Button>Create</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="script">
                <Card>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={control}
                                    name="install_script"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Install Script</FormLabel>
                                            <FormControl>
                                                <Editor
                                                    {...field}
                                                    height="50vh"
                                                    defaultLanguage="shell"
                                                    defaultValue=""
                                                    theme="vs-dark"
                                                />
                                            </FormControl>
                                            <FormDescription>Enter an install script for the template.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button>Create</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function CreateTemplate() {
    return (
        <>
            <div id="header" className="flex justify-between items-center">
                <h1 className="font-bold text-2xl">Create Template</h1>
            </div>
            <div className="h-full space-y-4">
                <Button variant="outline" onClick={() => redirect("/templates")}>
                    <ArrowLeftIcon />
                    Back
                </Button>
                <TemplateForm />
            </div>
        </>
    )
}