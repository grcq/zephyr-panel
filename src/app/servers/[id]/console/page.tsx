'use client';

import ConsoleContainer from "./console";
import { useParams } from "next/navigation";
import StatsContainer from "./stats";
import { Button } from "@/components/ui/button";
import MenuBar from "../menubar";
import { useEffect, useRef, useState } from "react";
import { Event } from "@/lib/events";
import { capitalize } from "@/lib/utils";
import { EventWSClient } from "@/lib/ws";

export default function ConsoleView() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;

    const [stats, setStats] = useState({
        status: "Unknown",
        cpu: {
            usage: "0.00%",
            max: "0.00%",
        },
        memory: {
            usage: "0.00 GB",
            max: "0.00 GB",
        },
        disk: {
            usage: "0.00 GB",
            max: "0.00 GB",
        }
    });

    const wsRef = useRef<EventWSClient | null>(null);
    const [logs, setLogs] = useState<[string, boolean][]>([]);

    useEffect(() => {
        const ws = new EventWSClient(`/api/servers/${id}/console`)
            .open(() => {
                stats();
                ws.send(Event.ServerLog);
            })
            .on(Event.ErrorEvent, (data) => {
                console.error("WebSocket error:", data);
            })
            .on(Event.ServerStats, (data) => {
                setStats({
                    status: capitalize(data.status),
                    cpu: {
                        usage: `${(data.cpu_usage / 1024 / 1024 / 1024).toFixed(2)}%`,
                        max: `${data.cpu_max}%`
                    },
                    memory: {
                        usage: `${(data.memory_usage / 1024 / 1024 / 1024).toFixed(2)} GB`,
                        max: `${(data.memory_max / 1024 / 1024 / 1024 / 1024).toFixed(2)} GB`
                    },
                    disk: {
                        usage: `${(data.disk_usage / 1024 / 1024 / 1024).toFixed(2)} GB`,
                        max: `${(data.disk_max / 1024 / 1024 / 1024 / 1024).toFixed(2)} GB`
                    }
                });
            })
            .on(Event.ServerLog, (data) => {
                if (data.previous && data.lines) {
                    const mapped = data.lines.map((line: string) => [line, data.daemon]);
                    setLogs(mapped);
                    return;
                }

                setLogs((prev) => [
                    ...prev,
                    [data.message, data.daemon]
                ]);
            })
            .on(Event.InstallFinished, (data) => {
                console.log("Installation finished:", data);
            })
            .on(Event.PowerEvent, (data) => {
                if (data.action === "start" && data.status === "starting") {
                    setTimeout(() => {
                        ws.send(Event.ServerLog);
                    });
                }

                setStats(prev => ({
                    ...prev,
                    status: capitalize(data.status)
                }));
            })
            .connect();

        function stats() {
            ws.send(Event.ServerStats);
        }

        wsRef.current = ws;
        const fetchStats = setInterval(stats, 2000);

        return () => {
            clearInterval(fetchStats);
            ws.close();
        };
    }, []);

    const power = (action: "start" | "stop" | "restart" | "kill") => {
        if (!wsRef.current) return;

        wsRef.current.send(Event.PowerEvent, action);
    }

    return (
        <>
            <MenuBar id={id} />
            <div id="header" className="flex justify-between items-center">
                <h1 className="font-bold text-2xl">Console</h1>
                <div id="actions" className="flex items-center gap-2">
                    <Button variant="ghost" className="bg-green-600 hover:bg-green-700 not-disabled:cursor-pointer" 
                        disabled={stats.status != "Stopped"}
                        onClick={() => power("start")}
                    >
                        Start
                    </Button>
                    <Button variant="outline" className="not-disabled:cursor-pointer" 
                        disabled={stats.status !== "Running" && stats.status !== "Starting"}
                        onClick={() => power("restart")}
                    >
                        Restart
                    </Button>
                    {stats.status === "Stopping" ? (
                        <Button variant="destructive" className="not-disabled:cursor-pointer"
                            onClick={() => power("kill")}
                        >
                            Kill
                        </Button>
                    ) : (
                        <Button variant="ghost" className="bg-red-500 hover:bg-red-600 not-disabled:cursor-pointer" 
                            disabled={stats.status !== "Running" && stats.status !== "Starting"}
                            onClick={() => power("stop")}
                        >
                            Stop
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex gap-4">
                <ConsoleContainer serverId={id} status={stats.status} logs={logs} ws={wsRef.current} />
                <StatsContainer status={stats.status} cpu={stats.cpu} memory={stats.memory} disk={stats.disk} />
            </div>
        </>
    )
}