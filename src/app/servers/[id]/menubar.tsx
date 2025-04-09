'use client';

import Link from "next/link";
import classNames from "classnames";
import { usePathname } from "next/navigation";

type MenuBarProps = { id: string; }
type MenuBarItemProps = { id: string, name: string; href: string; }

function MenuBarItem({ id, name, href }: MenuBarItemProps) {
    const pathname = usePathname();
    const isActive = pathname.includes(href) || pathname === "/servers/" + id + href;
    return (
        <Link className={classNames("px-4 py-2 rounded transition-colors ease-in-out duration-200 hover:bg-[rgba(0,0,0,0.4)]", isActive && "bg-[rgba(0,0,0,0.4)]")} href={"/servers/" + id + href}>
            <span>
                {name}
            </span>
        </Link>
    )
}


export default function MenuBar({ id }: MenuBarProps) {
    return (
        <nav className="rounded-md bg-secondary p-1">
            <div className="flex items-center gap-1">
                <MenuBarItem id={id} name="Console" href="/console" />
                <MenuBarItem id={id} name="Files" href="/files" />
                <MenuBarItem id={id} name="Databases" href="/databases" />
                <MenuBarItem id={id} name="Backups" href="/backups" />
                <MenuBarItem id={id} name="Startup" href="/startup" />
                <MenuBarItem id={id} name="Settings" href="/settings" />
            </div>
        </nav>
    )
}