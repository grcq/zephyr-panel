"use client";

import { Event } from "./events";

export class EventWSClient {
    private ws: WebSocket | null = null;
    private listeners: Map<Event, ((data: any) => void)[]> = new Map();
    private url: string;
    private openListener?: (() => void);

    constructor(path: string) {
        this.url = "ws://127.0.0.1:8083" + (path.startsWith("/") ? path : `/${path}`);
    }

    public connect(): EventWSClient {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.warn("WebSocket is already connected.");
            return this;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("WebSocket connection established");
            this.openListener?.();
        };

        this.ws.onmessage = (event) => {
            const { event: e, data } = JSON.parse(event.data);
            const listeners = this.listeners.get(e);
            if (listeners) {
                listeners.forEach(listener => listener(data));
            }
        };

        this.ws.onclose = () => {
            console.log("WebSocket connection closed");
            this.ws = null;
        };
        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return this;
    }

    public open(listener: () => void): EventWSClient {
        if (!this.ws) {
            console.error("WebSocket is not connected. Call connect() first.");
            return this;
        }
        this.openListener = listener;
        return this;
    }

    public on(event: Event, listener: (data: any) => void): EventWSClient {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event)?.push(listener);
        return this;
    }

    public close(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public send(event: Event, data?: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected.");
            return;
        }
        this.ws.send(JSON.stringify({ event, data }));
    }

    public isOpen(): boolean {
        return !!this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}