"use client";

import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { CpuIcon, HardDriveIcon, MemoryStickIcon, NetworkIcon, PlusIcon } from "lucide-react";
import { fetch } from "@tauri-apps/plugin-http";
import { useEffect, useRef, useState } from "react";
import { Server } from "@/lib/types";
import { redirect } from "next/navigation";
import { EventWSClient } from "@/lib/ws";
import { Event } from "@/lib/events";

const stateColors: { [key: number]: string } = {
    0: "bg-green-400",
    1: "bg-red-400",
    2: "bg-yellow-400",
    3: "bg-red-300",
    4: "bg-yellow-300",
    5: "bg-gray-400",
};

async function getData(): Promise<Server[]> {
    const res = await fetch("http://127.0.0.1:8083/api/servers");
    const data = await res.json();
    return data;
}

function ServerItem({ server }: { server: Server }) {
    const [stats, setStats] = useState({
        cpu_usage: "???",
        cpu_max: "???",
        memory_usage: "???",
        memory_max: "???",
        disk_usage: "???",
        disk_max: "???"
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`http://127.0.1:8083/api/servers/${server.id}/stats`);
                if (!res.ok) {
                    throw new Error(`Error fetching stats: ${res.statusText}`);
                }
                const data = await res.json();
                setStats({
                    cpu_usage: (data.cpu_usage / 1024 / 1024 / 1024).toFixed(2),
                    cpu_max: data.cpu_max.toFixed(2),
                    memory_usage: (data.memory_usage / 1024 / 1024 / 1024).toFixed(2),
                    memory_max: (data.memory_max / 1024 / 1024 / 1024 / 1024).toFixed(2),
                    disk_usage: (data.disk_usage / 1024 / 1024 / 1024).toFixed(2),
                    disk_max: (data.disk_max / 1024 / 1024 / 1024 / 1024).toFixed(2)
                });
            } catch (error) {
                console.error("Failed to fetch server stats:", error);
                setStats({
                    cpu_usage: "Error",
                    cpu_max: "Error",
                    memory_usage: "Error",
                    memory_max: "Error",
                    disk_usage: "Error",
                    disk_max: "Error"
                });
            }
        }
        fetchStats();
    }, []);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className="flex select-none items-center justify-between p-4 bg-sidebar rounded-md shadow-sm ease-in-out transition-colors duration-200 cursor-pointer hover:bg-secondary"
                    onClick={() => redirect(`/servers/${server.id}/console`)}>
                    <div id="info">
                        <h2 className="font-bold text-lg">{server.name}</h2>
                        <p className="text-sm">{server.description}</p>
                    </div>
                    <div id="stats" className="flex items-center gap-8">
                        <div id="ip" className="text-neutral-300">
                            <p className="text-sm flex gap-2 items-center">
                                <NetworkIcon className="w-5 h-5" />
                                {server.allocations[0].ip}:{server.allocations[0].port}
                            </p>
                        </div>
                        <div id="cpu" className="text-neutral-300 space-y-1">
                            <p className="text-sm flex gap-2 items-center">
                                <CpuIcon className="w-5 h-5" />
                                {stats.cpu_usage}%
                            </p>
                            <p className="text-xs text-neutral-500 flex justify-center">
                                of {stats.cpu_max}%
                            </p>
                        </div>
                        <div id="memory" className="text-neutral-300 space-y-1">
                            <p className="text-sm flex gap-2 items-center">
                                <MemoryStickIcon className="w-5 h-5" />
                                {stats.memory_usage} GB
                            </p>
                            <p className="text-xs text-neutral-500 flex justify-center">
                                of {stats.memory_max} GB
                            </p>
                        </div>
                        <div id="disk" className="text-neutral-300 space-y-1">
                            <p className="text-sm flex gap-2 items-center">
                                <HardDriveIcon className="w-5 h-5" />
                                {stats.disk_usage} GB
                            </p>
                            <p className="text-xs text-neutral-500 flex justify-center">
                                of {stats.disk_max} GB
                            </p>
                        </div>
                        <div id="status" className="h-full">
                            <div className={cn("h-8 w-2 rounded-xl", stateColors[server.state])}></div>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuLabel>{server.name}</ContextMenuLabel>
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

    const wsRef = useRef<EventWSClient | null>(null);
    useEffect(() => {
        const ws = new EventWSClient("/api/ws")
            .on(Event.ServerCreated, (data) => {
                const serverData = data as Server;
                setData(prev => [...prev, serverData as Server]);
            })
            .on(Event.ServerDeleted, (data) => {
                const serverId = data as string;
                setData(prev => prev.filter(server => server.id !== serverId));
            })
            .connect();

        wsRef.current = ws;
        return () => {
            ws.close();
        };
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