"use client";

import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { CpuIcon, HardDriveIcon, MemoryStickIcon, NetworkIcon, PlusIcon } from "lucide-react";
import { fetch } from "@tauri-apps/plugin-http";
import { useEffect, useState } from "react";
import { Server } from "@/lib/types";
import { redirect } from "next/navigation";

async function getData() {
    const res = await fetch("http://127.0.0.1:8083/api/servers");
    const data = await res.json();
    return data;
}

function ServerItem({ server }: { server: Server }) {
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-sidebar rounded-md shadow-sm ease-in-out transition-colors duration-200 cursor-pointer hover:bg-secondary">
                    <div id="info">
                        <h2 className="font-bold text-lg">{server.name}</h2>
                        <p className="text-sm">{server.description}</p>
                    </div>
                    <div id="stats" className="flex items-center gap-8">
                        <div id="ip" className="text-neutral-300">
                            <p className="text-sm flex gap-2 items-center">
                                <NetworkIcon className="w-5 h-5" />
                                0.0.0.0:25565
                            </p>
                        </div>
                        <div id="cpu" className="text-neutral-300 space-y-1">
                            <p className="text-sm flex gap-2 items-center">
                                <CpuIcon className="w-5 h-5" />
                                0.00%
                            </p>
                            <p className="text-xs text-neutral-500 flex justify-center">
                                of 100%
                            </p>
                        </div>
                        <div id="memory" className="text-neutral-300 space-y-1">
                            <p className="text-sm flex gap-2 items-center">
                                <MemoryStickIcon className="w-5 h-5" />
                                0.00 GB
                            </p>
                            <p className="text-xs text-neutral-500 flex justify-center">
                                of 2 GB
                            </p>
                        </div>
                        <div id="disk" className="text-neutral-300 space-y-1">
                            <p className="text-sm flex gap-2 items-center">
                                <HardDriveIcon className="w-5 h-5" />
                                0.00 GB
                            </p>
                            <p className="text-xs text-neutral-500 flex justify-center">
                                of 10 GB
                            </p>
                        </div>
                        <div id="status" className="h-full">
                            <div className={cn("h-8 w-2 rounded-xl", false ? "bg-green-400" : "bg-red-400")}></div>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuLabel>{"Server Name"}</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem>
                    Manage
                </ContextMenuItem>
                <ContextMenuItem className="text-red-600">
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

export default function Servers() {
    const [data, setData] = useState<Server[]>([]);
    useEffect(() => {
        getData().then(setData);
    }, []);

    return (
        <>
            <div id="header" className="flex justify-between items-center mr-1">
                <h1 className="font-bold text-2xl">Servers</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={() => redirect("/servers/create")}>
                        <PlusIcon />
                        Create
                    </Button>
                </div>
            </div>
            <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-secondary scrollbar-thumb-rounded-full scrollbar-track-rounded-full pr-1">
                {data.map((server) => (
                    <ServerItem key={server.id} server={server} />
                ))}
            </div>
        </>
    )
}