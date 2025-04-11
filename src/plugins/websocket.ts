import Sockette from 'sockette'
import { EventEmitter } from 'events'

export default class WebSocketClient extends EventEmitter {
    private timer: any = null;
    private backoff: number = 5000;
    private socket: Sockette | null = null
    private url: string | null = null

    connect(url: string): this {
        this.url = url;

        this.socket = new Sockette(this.url, {
            timeout: 5e3,
            maxAttempts: 10,
            onopen: () => {
                this.timer && clearTimeout(this.timer);
                this.backoff = 5000;

                this.emit('WS_OPEN')
            },
            onmessage: (e) => {
                try {
                    const { event, data } = JSON.parse(e.data)
                    data ? this.emit(event, ...data) : this.emit(event)
                } catch (err) {
                    console.error('Error parsing message', e.data, err)
                }
            },
            onclose: () => {
                this.emit('WS_CLOSE')
            },
            onerror: (e) => {
                this.emit('WS_ERROR', e)
            }
        });

        this.timer = setTimeout(() => {
            this.backoff = Math.max(20000, this.backoff + 2500);
            if (this.socket) this.socket.close();

            clearTimeout(this.timer);
            this.connect(url);
        });

        return this;
    }

    close() {
        this.socket?.close();
        this.socket = null;
        this.url = null;
    }

    open() {
        if (this.socket) this.socket.open();
    }

    reconnect() {
        if (this.socket) this.socket.reconnect();
    }

    send(event: string, payload: string[] | string) {
        if (this.socket) {
            this.socket.send(JSON.stringify({ event, data: Array.isArray(payload) ? payload : [payload] }));
        }
    }
}