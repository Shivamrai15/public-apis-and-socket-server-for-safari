"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
const events_1 = require("../libs/events");
class EventManager {
    constructor() { }
    enqueue(payload, socket) {
        socket.to(payload.roomId).emit(events_1.ENQUEUE, payload);
    }
    dequeue(payload, socket) {
        socket.to(payload.roomId).emit(events_1.DEQUEUE);
    }
    push(payload, socket) {
        socket.to(payload.roomId).emit(events_1.PUSH, payload);
    }
    pop(payload, socket) {
        socket.to(payload.roomId).emit(events_1.POP);
    }
    priorityEnqueue(payload, socket) {
        socket.to(payload.roomId).emit(events_1.PRIORITY_ENQUEUE, payload);
    }
    clear(payload, socket) {
        socket.to(payload.roomId).emit(events_1.CLEAR);
    }
    shiftToTopOfQueue(payload, socket) {
        socket.to(payload.roomId).emit(events_1.SHIFT_TOP, payload);
    }
    replace(payload, socket) {
        socket.to(payload.roomId).emit(events_1.REPLACE, payload);
    }
    remove(payload, socket) {
        socket.to(payload.roomId).emit(events_1.REMOVE, payload);
    }
    playNext(payload, socket) {
        socket.to(payload.roomId).emit(events_1.PLAYNEXT, payload);
    }
    play(payload, socket) {
        socket.to(payload.roomId).emit(events_1.PLAY);
    }
    pause(payload, socket) {
        socket.to(payload.roomId).emit(events_1.PAUSE);
    }
    seek(payload, socket) {
        socket.to(payload.roomId).emit(events_1.SEEK, payload);
    }
}
exports.EventManager = EventManager;
