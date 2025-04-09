'use client';

import { ITerminalOptions, Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { SearchAddon } from "@xterm/addon-search";
import { SearchBarAddon } from "@/plugins/searchbar/XtermSearchBarAddon";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePresistedState } from "@/plugins/usePresistedState";
import useEventListener from "@/plugins/useEventListener";
import { Input } from "@/components/ui/input";
import classNames from "classnames";
import { theme as th } from "twin.macro";
import styles from './console.module.scss';

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: "underline",
    allowTransparency: true,
    fontSize: 12,
    fontFamily: "monospace",
    theme: {
        background: "#121212",
        cursor: "transparent",
        red: '#E54B4B',
        green: '#9ECE58',
        yellow: '#FAED70',
        blue: '#396FE2',
        magenta: '#BB80B3',
        cyan: '#2DDAFD',
        white: '#d0d0d0',
        brightBlack: 'rgba(255, 255, 255, 0.2)',
        brightRed: '#FF5370',
        brightGreen: '#C3E88D',
        brightYellow: '#FFCB6B',
        brightBlue: '#82AAFF',
        brightMagenta: '#C792EA',
        brightCyan: '#89DDFF',
        brightWhite: '#ffffff'
    }
}

type ConsoleContainerProps = {
    serverId: string;
}

// I wouldn't know how to do this if pterodactyl was not open source, so thanks to the pterodactyl team for making this possible!
// This whole app is inspired by the pterodactyl panel, so thanks to them for that too!
// I am not affiliated with pterodactyl in any way, I just like their work and wanted to make my own game server panel for desktop use (windows).
// https://github.com/pterodactyl/panel/blob/1.0-develop/resources/scripts/components/server/console/Console.tsx
export default function ConsoleContainer({ serverId }: ConsoleContainerProps) {
    const PRELUDE = "\u001b[1m\u001b[0m\u001b[33mzephyr@daemon# \u001b[0m";
    const ref = useRef<HTMLDivElement>(null);

    const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const searchBarAddon = new SearchBarAddon({ searchAddon });
    const webLinksAddon = new WebLinksAddon();

    const [history, setHistory] = usePresistedState<string[]>(`console-${serverId}`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const handleOutput = (data: string, prelude: boolean = false) => {
        terminal.writeln((prelude ? PRELUDE : "") + data.replace(/(?:\r\n|\r|\n)/im, '') + "\u001b[0m");
    }

    useEffect(() => {
        if (ref.current && !terminal.element) {
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBarAddon);
            terminal.loadAddon(webLinksAddon);
            terminal.open(ref.current);
            fitAddon.fit();

            handleOutput("test message from daemon", true);
            
            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                } else if ((e.ctrlKey || e.metaKey) && e.key == 'f') {
                    e.preventDefault();
                    searchBarAddon.show();
                    return false;
                } else if (e.key == 'Escape') {
                    searchBarAddon.hidden();

                }
                return true;
            });
        }
    }, [terminal]);

    useEventListener("resize", () => {
        if (ref.current) {
            fitAddon.fit();
        }
    });
    
    return (
        <div className={classNames("relative flex flex-col w-full", styles.terminal)}>
            <div className={"rounded-t p-2 bg-[rgb(18,18,18)]"}>
                <div className="h-full">
                    <div className={"h-full"} id={styles.terminal} ref={ref}></div>
                </div>
            </div>
            <div className="relative -ml-4 sm:ml-0 w-[calc(100% + 2rem)] sm:w-full">
                <Input 
                    type="text"
                    className="rounded-t-none outline-none" 
                    placeholder="Type a command..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const command = (e.target as HTMLInputElement).value;
                            if (command.trim() === "") return;

                            handleOutput(command, false);
                            setHistory([...history, command]);
                            setHistoryIndex(-1);
                            (e.target as HTMLInputElement).value = "";
                        }
                    }}
                    autoCorrect={'off'}
                    autoCapitalize={'none'}
                />
            </div>
        </div>
    )
}