'use client';

import ConsoleContainer from "./console";
import { useParams } from "next/navigation";
import StatsContainer from "./stats";
import { Button } from "@/components/ui/button";
import MenuBar from "../menubar";

export default function ConsoleView() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;

    return (
        <>
            <MenuBar id={id} />
            <div id="header" className="flex justify-between items-center">
                <h1 className="font-bold text-2xl">Console</h1>
                <div id="actions" className="flex items-center gap-2">
                    <Button variant="ghost" className="bg-green-600 hover:bg-green-700 not-disabled:cursor-pointer" disabled>
                        Start
                    </Button>
                    <Button variant="outline" className="not-disabled:cursor-pointer">
                        Restart
                    </Button>
                    <Button variant="ghost" className="bg-red-500 hover:bg-red-600 not-disabled:cursor-pointer">
                        Stop
                    </Button>
                </div>
            </div>
            <div className="flex gap-4">
                <ConsoleContainer serverId={id} />
                <StatsContainer serverId={id} />
            </div>
        </>
    )
}