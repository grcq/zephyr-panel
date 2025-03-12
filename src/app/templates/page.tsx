"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ImportIcon, PlusIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns, Template } from "./columns";
import { fetch } from "@tauri-apps/plugin-http";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

async function getData(): Promise<Template[]> {
    try {
        const data = await fetch("http://127.0.0.1:8083/api/templates");
        if (!data.ok) {
            throw new Error("An error occurred while fetching templates. Code: " + data.status);
        }
        return data.json();
    } catch (err) {
        throw new Error("Failed to fetch templates. Is the daemon running?");
    }
}

const importSchema = z.object({
    file: z.instanceof(File).refine((val) => val.name.endsWith(".json"), { message: "File must be a JSON file." })
});

function ImportForm() {
    const form = useForm<z.infer<typeof importSchema>>({
        resolver: zodResolver(importSchema)
    });

    const onSubmit = (data: z.infer<typeof importSchema>) => {
        console.log(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="file" render={({ field }) => (
                    <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                            <Input placeholder="Choose a file" type="file" accept="application/json" />
                        </FormControl>
                        <FormDescription>Choose a JSON file to import.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit">Import</Button>
            </form>
        </Form>
    );
}

export default function Templates() {
    const [data, setData] = useState<Template[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getData()
            .then(setData)
            .catch((err) => {
                setError(err.message)
                setData([]);
            });
    }, []);
    if (!data) return (
        <>
            <div className="flex justify-between items-center">
                <Skeleton className="w-32 h-8" />

                <div className="flex gap-2">
                    <Skeleton className="w-20 h-8" />
                    <Skeleton className="w-20 h-8" />
                </div>
            </div>
            <div className="h-full space-y-2">
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-8" />
            </div>
        </>
    )

    return (
        <>
            <div id="header" className="flex justify-between items-center">
                <h1 className="font-bold text-2xl">Templates</h1>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <ImportIcon />
                                <span>Import</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Import Template</DialogTitle>
                                <DialogDescription>
                                    Import a template from a JSON file. It must match the schema for a template.
                                </DialogDescription>
                            </DialogHeader>
                            <ImportForm />
                        </DialogContent>
                    </Dialog>
                    <Button variant="default" onClick={() => redirect("/templates/create")}>
                        <PlusIcon />
                        <span>Create</span>
                    </Button>
                </div>
            </div>
            {error != null ? 
                (<Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>) : 
                (<div className="h-full">
                    <DataTable columns={columns} data={data} />
                </div>)
            }
        </>
    );
}
