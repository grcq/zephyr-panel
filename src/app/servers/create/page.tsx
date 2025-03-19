"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { redirect } from "next/navigation";

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
            </div>
        </>
    );
}