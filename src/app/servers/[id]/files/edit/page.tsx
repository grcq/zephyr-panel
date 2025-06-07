"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Editor } from "@monaco-editor/react";
import { ArrowLeftIcon, Save, X } from "lucide-react";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const shortToLongExtension: { [key: string]: string } = {
    txt: "plaintext",
    md: "markdown",
    json: "json",
    js: "javascript",
    ts: "typescript",
    html: "html",
    css: "css",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    go: "go",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    conf: "properties",
    cfg: "properties",
    ini: "ini",
    log: "plaintext",
    properties: "properties",
    env: "plaintext",
    csv: "csv",
    old: "plaintext",
    tmp: "plaintext",
    "": "plaintext",
};

export default function EditFile() {
    const id = useParams<{ id: string }>().id;
    const search = useSearchParams();
    const path = decodeURIComponent(search.get("path")!);

    const pathSplit = path.split("/");
    const fileName = pathSplit.pop() || "";
    const fileSplit = fileName.split(".");
    const fileExtension = fileSplit.length > 1 ? fileSplit.pop()!.toLowerCase() : "";
    const [lang, setLang] = useState<string>(shortToLongExtension[fileExtension] || "plaintext");

    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFileContent = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8083/api/servers/${id}/files/content?path=${path}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch file content");
                }
                const text = await response.json();
                setContent(text.content);
            } catch (error) {
                console.error("Error fetching file content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFileContent();
    }, [path]);

    const langList = Object.entries(shortToLongExtension).filter(([short, long], index, self) => index === self.findIndex(([s, l]) => l === long))
        .map(([short, long]) => [short, long] as [string, string]);
    return (
        <div className="space-y-4">
            <Button variant="outline" onClick={() => redirect("/servers/" + id + "/files")} className="mb-4">
                <ArrowLeftIcon />
                Back
            </Button>
            <Card className="relative w-full">
                <Spinner visible={loading} rounded="xl" />
                <CardHeader>
                    <CardTitle>
                        Editing {fileName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                    <Editor
                        height="calc(100vh - 280px)"
                        language={lang}
                        value={content}
                        onChange={(value) => setContent(value || "")}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            fontSize: 14,
                            lineNumbers: "on",
                            automaticLayout: true,
                        }}
                    />
                </CardContent>
                <CardFooter className="flex justify-between items-end">
                    <div id="language">
                        <p className="text-muted-foreground text-xs mb-2">Language</p>
                        <Select onValueChange={(value) => setLang(value)} value={lang}>
                            <SelectTrigger>
                                {lang}
                            </SelectTrigger>
                            <SelectContent>
                                {langList.map(([short, long]) => (
                                    <SelectItem key={short} value={long}>
                                        {long}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div id="actions" className="flex gap-2">
                        <Button className="w-32 bg-red-500 hover:bg-red-400 text-foreground">
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button className="w-32">
                            <Save className="w-4 h-4" />
                            Save
                        </Button>
                        <Button className="w-36">
                            <Save className="w-4 h-4" />
                            Save & Close
                        </Button>
                    </div>
                    
                </CardFooter>
            </Card>
        </div>
    );
}