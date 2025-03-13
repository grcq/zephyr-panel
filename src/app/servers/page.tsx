import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { CpuIcon, HardDriveIcon, MemoryStickIcon, NetworkIcon, PlusIcon } from "lucide-react";

type ServerItemProps = {
    name: string;
    description: string;
    online?: boolean;
}
function ServerItem({ name, description, online }: ServerItemProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-sidebar rounded-md shadow-sm ease-in-out transition-colors duration-200 cursor-pointer hover:bg-secondary">
                    <div id="info">
                        <h2 className="font-bold text-lg">{name}</h2>
                        <p className="text-sm">{description}</p>
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
                            <div className={cn("h-8 w-2 rounded-xl", online ? "bg-green-400" : "bg-red-400")}></div>
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
    return (
        <>
            <div id="header" className="flex justify-between items-center mr-1">
                <h1 className="font-bold text-2xl">Servers</h1>
                <div className="flex items-center gap-2">
                    <Button>
                        <PlusIcon />
                        Create
                    </Button>
                </div>
            </div>
            <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-secondary scrollbar-thumb-rounded-full scrollbar-track-rounded-full pr-1">
                <ServerItem name="Server 1" description="This is a description of server 1." online={true} />
                <ServerItem name="Server 2" description="This is a description of server 2." />
                <ServerItem name="Server 3" description="This is a description of server 3." online={true} />
                <ServerItem name="Server 4" description="This is a description of server 4." online={true} />
                <ServerItem name="Server 5" description="This is a description of server 5." />
                <ServerItem name="Server 6" description="This is a description of server 6." />
                <ServerItem name="Server 7" description="This is a description of server 7." />
                <ServerItem name="Server 8" description="This is a description of server 8." />
                <ServerItem name="Server 9" description="This is a description of server 9." />
                <ServerItem name="Server 10" description="This is a description of server 10." />
            </div>
        </>
    )
}