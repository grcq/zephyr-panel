"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const templateSchema = z.object({
    name: z.string().nonempty().max(60),
    description: z.string().max(255),
    statup: z.string().max(255).optional(),
});

function TemplateForm() {
    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema)
    });

    const onSubmit = (data: z.infer<typeof templateSchema>) => {
        console.log(data);
    }

    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General Information</TabsTrigger>
                <TabsTrigger value="server">Server Configuration</TabsTrigger>
                <TabsTrigger value="variables">Template Variables</TabsTrigger>
                <TabsTrigger value="script">Install Script</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
                <Card>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="flex gap-4 w-full items-center">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Name <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter a name" required />
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
                                <FormField control={form.control} name="statup" render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Statup Command <span className="text-red-400">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Enter a statup command" className="resize-none" required />
                                        </FormControl>
                                        <FormDescription>Enter a statup command for the template.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button>Create</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

function GeneralInformation() {
    return (
        <>
            
        </>
    );
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