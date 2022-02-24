export class Event {
    constructor() {
        this.handlers = [];
    }

    addHandler(handler) {
        this.handlers.push(handler)
    }

    trigger(...params) {
        this.handlers.forEach(handler => handler(...params));
    }
}