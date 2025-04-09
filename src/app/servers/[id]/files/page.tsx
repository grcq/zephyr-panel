'use client';

import { useParams } from "next/navigation";
import MenuBar from "../menubar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default function FilesView() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;

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
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        home
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        container
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="rounded bg-secondary">
                <div className="bg-[rgb(22,22,22)] rounded-t flex items-center justify-between">
                    <div className="flex items-center justify-between p-2 w-full">
                        <h1 className="font-medium text-md min-w-64">Name</h1>
                        <h1 className="font-medium text-md min-w-64">Size</h1>
                        <h1 className="font-medium text-md min-w-64">Last Modified</h1>
                    </div>
                </div>
                <div id="files" className="p-2">
                    <p className="text-sm opacity-80 text-center py-4">Looks a little empty in here...</p>
                </div>
            </div>
        </>
    )
}