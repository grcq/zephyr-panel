"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Template, TemplateVariable } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, PlusIcon, TrashIcon, Variable } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { fetch } from "@tauri-apps/plugin-http";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

async function getTemplates(): Promise<Template[] | null> {
    try {
        const response = await fetch("http://127.0.1:8083/api/templates");
        if (!response.ok) {
            throw new Error("Failed to fetch templates. Is the daemon running?");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching templates:", error);
        return null;
    }
}

export default function CreateServer() {
    return (
        <>
            <div id="header" className="flex justify-between items-center">
                <h1 className="font-bold text-2xl">Create Server</h1>
            </div>
            <div className="h-full space-y-4">
                <Button variant="outline" onClick={() => redirect("/servers")}>
                    <ArrowLeftIcon />
                    Back
                </Button>
                <CreateServerForm />
            </div>
        </>
    );
}

const serverSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(32, "Name cannot exceed 32 characters").nonempty("Name cannot be empty"),
    description: z.string().optional(),
    primaryAllocation: z.string().nonempty(),
    additionalAllocations: z.array(z.string()),

    template: z.number().int(),
    startup: z.string().min(1, "Startup command cannot be empty"),
    variables: z.record(z.string()),

    limits: z.object({
        memory: z.number().int().min(128, "Memory must be at least 128 MB"),
        disk: z.number().int().min(1024, "Disk space must be at least 1024 MB"),
        cpu: z.number().int().min(50, "CPU cores must be at least 50% of a single core"),
    }).required(),
    image: z.string().nonempty("Image cannot be empty"),
});

function CreateServerForm() {
    const form = useForm<z.infer<typeof serverSchema>>({
        resolver: zodResolver(serverSchema),
    });

    const onSubmit = (data: z.infer<typeof serverSchema>) => {
        // Handle form submission, e.g., send data to an API
        console.log("Form submitted:", data);
    };

    const [templates, setTemplates] = useState<Template[]>([])

    // dummy allocations for demonstration purposes
    const [allocations, setAllocations] = useState([
        { ip: "127.0.0.1", port: 8080, selected: false },
        { ip: "127.0.0.1", port: 8081, selected: false },
        { ip: "0.0.0.0", port: 80, selected: false },
    ]);

    const { fields: alloFields, append: appendField, remove: removeField } = useFieldArray({
        control: form.control,
        // @ts-ignore
        name: "additionalAllocations",
        rules: {
            validate: (value) => value.length <= 5 || "You can only add up to 5 additional allocations."
        }
    });

    const [template, setTemplate] = useState<Template>();
    const [variables, setVariables] = useState<TemplateVariable[]>([]);
    const [image, setImage] = useState<string>("");

    useEffect(() => {
        getTemplates().then((data) => {
            if (data) {
                setTemplates(data || []);
            } else {
                console.error("Failed to fetch templates");
            }
        });
    }, []);

    return (
        <Tabs defaultValue="info">
            <TabsList className="w-full">
                <TabsTrigger value="info">
                    Server Info
                </TabsTrigger>
                <TabsTrigger value="template">
                    Template
                </TabsTrigger>
                <TabsTrigger value="env">
                    Environment
                </TabsTrigger>
            </TabsList>
            <Card>
                <CardContent>
                    <TabsContent value="info">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Server Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>Enter a name for your server.</FormDescription>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Server Description" {...field} style={{resize: "vertical"}} />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>Optional description for your server.</FormDescription>
                                    </FormItem>
                                )} />

                                <div className="flex items-start gap-8">
                                    <FormField control={form.control} name="primaryAllocation" render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Primary Allocation</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={(e) => {
                                                    if (!allocations.some(a => a.selected)) appendField("");
                                                    setAllocations((prev) => {
                                                        return prev.map((alloc) => ({
                                                            ...alloc,
                                                            selected: (alloc.selected && `${alloc.ip}:${alloc.port}` !== field.value
                                                            ) || (alloc.ip + ":" + alloc.port) === e
                                                        }));
                                                    });
                                                    field.onChange(e);
                                                }} value={field.value}>
                                                    <SelectTrigger className="w-full">
                                                        {field.value || "Select an allocation"}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allocations.filter(a => !a.selected).length === 0 && (
                                                            <SelectGroup>
                                                                <SelectLabel className="text-muted-foreground">
                                                                    No allocations available
                                                                </SelectLabel>
                                                            </SelectGroup>
                                                        )}
                                                        {allocations.filter(a => !a.selected).map((allocation, index) => (
                                                            <SelectItem key={index} value={allocation.ip + ":" + allocation.port}>
                                                                {allocation.ip}:{allocation.port}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="flex flex-col gap-2 w-full">
                                        <FormLabel>Additional Allocations</FormLabel>
                                        {alloFields.length === 0 && (
                                            <Select disabled>
                                                <SelectTrigger className="w-full">
                                                    No allocation selected
                                                </SelectTrigger>
                                                <SelectContent>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {alloFields.map((field, index) => (
                                            <FormField key={field.id} control={form.control} name={`additionalAllocations.${index}`} render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <Select onValueChange={(e) => {
                                                                setAllocations((prev) => {
                                                                    return prev.map((alloc) => ({
                                                                        ...alloc,
                                                                        selected: (alloc.selected && `${alloc.ip}:${alloc.port}` !== field.value
                                                                        ) || (alloc.ip + ":" + alloc.port) === e
                                                                    }));
                                                                });
                                                                field.onChange(e);
                                                            }} value={field.value}>
                                                                <SelectTrigger className="w-full">
                                                                    {field.value || "No allocation selected"}
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {allocations.filter(a => !a.selected).length === 0 && (
                                                                        <SelectGroup>
                                                                            <SelectLabel className="text-muted-foreground">
                                                                                No allocations available
                                                                            </SelectLabel>
                                                                        </SelectGroup>
                                                                    )}
                                                                    {allocations.filter(a => !a.selected).map((allocation, index) => (
                                                                        <SelectItem key={index} value={allocation.ip + ":" + allocation.port}>
                                                                            {allocation.ip}:{allocation.port}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {field.value && index == alloFields.length - 1 && (
                                                                <Button variant="secondary" onClick={() => {
                                                                    appendField("");
                                                                }}>
                                                                    <PlusIcon />
                                                                </Button>
                                                            )}
                                                            {field.value && (
                                                                <Button variant="destructive" onClick={() => {
                                                                    if (alloFields.length > 1) removeField(index);
                                                                    else form.setValue("additionalAllocations", [""]);

                                                                    setAllocations((prev) => prev.map((alloc) => ({
                                                                        ...alloc,
                                                                        selected: false
                                                                    })));
                                                                }}>
                                                                    <TrashIcon />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        ))}
                                    </div>
                                </div>
                                
                                <Button>
                                    Create
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="template">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField control={form.control} name="template" render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Template</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={(e) => {
                                                field.onChange(e);

                                                const template = templates.find(t => `${t.id}` == e);
                                                if (!template) return;

                                                form.setValue("image", "");
                                                setImage("");

                                                setTemplate(template);
                                                form.setValue("startup", template.docker.start_command);
                                                setVariables(template.variables || []);
                                            }}>
                                                <SelectTrigger className="w-full">
                                                    {templates.find(t => t.id == field.value)?.name || "Select a template"}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates.length === 0 && (
                                                        <SelectGroup>
                                                            <SelectLabel className="text-muted-foreground">
                                                                No templates available
                                                            </SelectLabel>
                                                        </SelectGroup>
                                                    )}
                                                    {templates.map((template) => (
                                                        <SelectItem key={template.id} value={template.id.toString()}>
                                                            {template.name} - {(template.description.length > 36 ? template.description.slice(0, 36) : template.description) || "No description"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {template && (
                                    <>
                                        <FormField control={form.control} name="startup" render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Startup Command</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Startup command" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <div id="variables" className="space-y-2">
                                            <Accordion type="single" collapsible className="w-full border-border rounded-lg border px-6" defaultValue="variables">
                                                <AccordionItem value="variables" defaultChecked>
                                                    <AccordionTrigger>
                                                        Variables
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="grid grid-cols-2 gap-4 py-2">
                                                            {variables.map((variable, index) => (
                                                                <FormField key={index} control={form.control} name={`variables.${variable.environment_name}`} render={({ field }) => (
                                                                    <FormItem className="w-full">
                                                                        <FormLabel>{variable.name}</FormLabel>
                                                                        <FormControl>
                                                                            <div className="flex">
                                                                                <span className="flex px-4 rounded-s-md border-border border-e-0 border items-center text-md text-muted-foreground bg-muted">
                                                                                    {`{{${variable.environment_name}}}`}
                                                                                 </span>
                                                                                <Input className="rounded-s-none" {...field} />
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                        <FormDescription>{variable.description || "No description"} - Rules: <code>{[variable.type, ...variable.rules].join("|")}</code></FormDescription>
                                                                    </FormItem>
                                                                )} />
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>
                                    </>
                                )}
                                <Button>
                                    Create
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="env">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div id="resources">
                                    <h2 className="font-bold text-lg">Resource Limits</h2>
                                    <p className="text-sm text-muted-foreground mb-4">Set the resource limits for your server.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-2">
                                        <FormField control={form.control} name="limits.memory" render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Memory Limit</FormLabel>
                                                <FormControl>
                                                    <div className="flex">
                                                        <Input type="number" {...field} className="rounded-e-none" />
                                                        <span className="px-4 flex items-center text-muted-foreground border border-border rounded-e-md bg-muted border-s-0">
                                                            MB
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>Minimum: 128 MB</FormDescription>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="limits.disk" render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Disk Space</FormLabel>
                                                <FormControl>
                                                    <div className="flex">
                                                        <Input type="number" {...field} className="rounded-e-none" />
                                                        <span className="px-4 flex items-center text-muted-foreground border border-border rounded-e-md bg-muted border-s-0">
                                                            MB
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>Minimum: 1024 MB</FormDescription>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="limits.cpu" render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>CPU Cores</FormLabel>
                                                <FormControl>
                                                    <div className="flex">
                                                        <Input type="number" {...field} className="rounded-e-none" />
                                                        <span className="px-4 flex items-center text-muted-foreground border border-border rounded-e-md bg-muted border-s-0">
                                                            %
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                                <FormDescription>Minimum: 50%</FormDescription>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div id="docker">
                                    <h2 className="font-bold text-lg">Docker Settings</h2>
                                    <p className="text-sm text-muted-foreground mb-3">Configure the Docker image for your server.</p>

                                    {!template && (<p className="text-sm text-destructive my-2">Select a template to configure Docker settings.</p>)}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col space-y-2 w-full">
                                            <Label className="py-1">Image Name</Label>
                                            <Select onValueChange={(e) => {
                                                const split = e.split("|");
                                                setImage(split.length > 1 ? split[0] : e);
                                                form.setValue("image", split.length > 1 ? split[1] : e);
                                            }} disabled={!template}>
                                                <SelectTrigger className="w-full">
                                                    {image || "Select an image"}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel className="text-muted-foreground">
                                                            Available Images
                                                        </SelectLabel>
                                                        {template?.docker?.images?.map((image, index) => (
                                                            <SelectItem key={index} value={image}>
                                                                {image.split("|").length > 1 ? image.split("|")[0] : image}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="Custom Image|">
                                                            Custom Image
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormField control={form.control} name="image" disabled={!template || image != "Custom Image"} render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Docker Image</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Docker Image" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div> 
                                </div>
                                <Button>Create</Button>
                            </form>
                        </Form>
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
}