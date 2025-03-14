"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { DownloadIcon, EditIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

export type Template = {
    id: number;
    name: string;
    description: string;
}

export const columns: ColumnDef<Template>[] = [
    {
        accessorKey: "id",
        header: "#",
        cell: (cell) => (<p className="font-medium opacity-80">{cell.getValue() as number}</p>)
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        <Link href="/templates/0" className="flex items-center">
                            <DownloadIcon className="mr-2" />
                            Export
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/templates/0/edit" className="flex items-center">
                            <EditIcon className="mr-2" />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/templates/0/delete" className="flex items-center text-red-600">
                            <TrashIcon className="mr-2 text-red-600" />
                            Delete
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
];