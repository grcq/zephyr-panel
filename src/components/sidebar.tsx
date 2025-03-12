"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight, DatabaseIcon, HomeIcon, LayersIcon, ServerIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client";

type SidebarItemProps = {
    name: string;
    icon: React.ComponentType<any>;
    path: string;
    exact?: boolean;
    expanded?: boolean;
};
function SidebarItem({ name, path, exact = false, expanded = false, icon: Icon }: SidebarItemProps) {
    const pathname = usePathname();
    return (
        <Button variant={(exact ? pathname == path : pathname.startsWith(path) ) ? "default" : "ghost"} className={cn("lg:w-full", expanded ? 'w-full' : 'w-12')}>
            <Link href={path} className="flex w-full items-center">
                <Icon className="mr-2" />
                <span className={cn("lg:flex", expanded ? 'flex' : 'hidden')}>{name}</span>
            </Link>
        </Button>
    );
}

export function Sidebar() {
    const [expanded, setExpanded] = useState(false);
    return (
        <aside className={cn("lg:w-64 h-[100vh] space-y-8 p-4 bg-background", expanded ? "w-64 absolute" : "w-fit")}>
            <div id="header" className="text-center mt-4 hidden lg:block">
                <h1 className="font-bold text-3xl">Zephyr</h1>
            </div>
            <Button variant="ghost" className="lg:hidden w-12" onClick={() => setExpanded(!expanded)}>
                <ArrowRight />
            </Button>
            <div id="items" className="flex flex-col w-full gap-2">
                <SidebarItem name="Home" path="/" exact expanded={expanded} icon={HomeIcon} />
                <SidebarItem name="Servers" path="/servers" expanded={expanded} icon={ServerIcon} />
                <SidebarItem name="Templates" path="/templates" expanded={expanded} icon={LayersIcon} />
                <SidebarItem name="Database Hosts" path="/database" expanded={expanded} icon={DatabaseIcon} />
                <SidebarItem name="Settings" path="/settings" expanded={expanded} icon={SettingsIcon} />
            </div>
        </aside>
    );
}