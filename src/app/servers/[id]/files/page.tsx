'use client';

import { redirect, useParams } from "next/navigation";
import MenuBar from "../menubar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileIcon, FolderIcon, MoreVerticalIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";

export const EDITABLE_FILE_EXTENSIONS = ["txt", "md", "json", "js", "ts", "html", "css", "py", "java", "c", "cpp", "go", "rs", "sh", "bash", "yaml", "yml", "xml", "conf", "cfg", "ini", "log", "properties", "env", "csv", "old", "tmp"];

type FileEntry = {
    name: string;
    size: number;
    last_modified: string;
    is_dir: boolean;
};

function getColumns(id: string, path: string[], setPath: Dispatch<SetStateAction<string[]>>): ColumnDef<FileEntry>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const name = row.getValue<string>("name");
                const extension = name.split('.').pop()?.toLowerCase() || "";
                const isDir = row.getValue<boolean>("is_dir");
                const accessible = EDITABLE_FILE_EXTENSIONS.includes(extension);

                return (
                    <span className={"mx-2 flex items-center text-sm text-foreground hover:text-primary transition-colors duration-200 select-none" +
                        (accessible || isDir ? " cursor-pointer" : " cursor-default")}
                        onClick={() => {
                            if (!isDir && accessible)
                                redirect(`/servers/${id}/files/edit?path=${encodeURIComponent((path.length > 0 ? "/" : "") + path.join("/") + "/" + name)}`);
                            else if (isDir) setPath((prev) => [ ...prev, name ]);
                        }}
                    >
                        {row.getValue<boolean>("is_dir") ? (
                            <FolderIcon className="mr-2 h-5 w-5" />
                        ) : (
                            <FileIcon className="mr-2 h-5 w-5" />
                        )}
                        {row.getValue("name")}
                    </span>
                )
            },
        },
        {
            accessorKey: "is_dir",
            header: "",
            cell: () => (<></>),
        },
        {
            accessorKey: "size",
            header: "Size",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue<boolean>("is_dir") ? "" : `${(row.getValue<number>("size") / 1024).toFixed(2)} KB`}
                </span>
            ),
        },
        {
            accessorKey: "last_modified",
            header: "Last Modified",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue("last_modified")}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="p-1">
                            <MoreVerticalIcon className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => console.log("Download", row.getValue("name"))}>
                            Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Delete", row.getValue("name"))}>
                            Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Rename", row.getValue("name"))}>
                            Rename
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ];
}

export default function FilesView() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;

    const [path, setPath] = useState<string[]>([]);
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8083/api/servers/${id}/files?path=${"/" + path.join("/")}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching files: ${response.statusText}`);
            }
            const data = await response.json();
            const entries: FileEntry[] = (data.entries as FileEntry[] || []).sort((a, b) => {
                if (a.is_dir && !b.is_dir) return -1; // Directories first
                if (!a.is_dir && b.is_dir) return 1; // Files after directories
                return a.name.localeCompare(b.name); // Sort alphabetically
            });

            setFiles(entries);

            console.log("Fetched files:", data.entries);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch files:", error);
        }
    }

    useEffect(() => {
        console.log("Fetching files for path:", path.join("/"));
        fetchFiles();
    }, [path]);

    const columns = getColumns(id, path, setPath);
    return (
        <>
            <MenuBar id={id} />
            <div id="header" className="flex justify-between items-center">
                <h1 className="font-bold text-2xl">Files</h1>
                <div className="flex gap-2 items-center">
                    <Button className="cursor-pointer">
                        Upload
                    </Button>
                </div>
            </div>
            <Breadcrumb className="mb-4 select-none">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        home
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink onClick={() => setPath([])}>
                            container
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    { path.map((segment, index) => (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem key={index}>
                                <BreadcrumbLink onClick={() => setPath(path.slice(0, index + 1))}>
                                    {segment}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    )) }
                </BreadcrumbList>
            </Breadcrumb>
            <DataTable columns={columns} data={files} isLoading={loading} />
        </>
    )
}