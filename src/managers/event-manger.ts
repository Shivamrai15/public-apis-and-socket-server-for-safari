import { Socket } from "socket.io";
import { Album, Song } from "../libs/types";
import { 
    CLEAR,
    DEQUEUE,
    ENQUEUE,
    PAUSE,
    PLAY,
    PLAYNEXT,
    POP,
    PRIORITY_ENQUEUE,
    PUSH,
    REMOVE,
    REPLACE,
    SEEK,
    SHIFT_TOP
} from "../libs/events";


export class EventManager {
    constructor() {}

    enqueue (payload: { roomId: string, songs : ( Song & { album : Album } )[], clear?: boolean }, socket: Socket) {
        socket.to(payload.roomId).emit(ENQUEUE, payload);
    }

    dequeue (payload: { roomId: string }, socket: Socket) {
        socket.to(payload.roomId).emit(DEQUEUE);
    }

    push (payload: { roomId: string, song: ( Song & { album: Album } ) }, socket: Socket) {
        socket.to(payload.roomId).emit(PUSH, payload);
    }

    pop (payload: { roomId: string }, socket: Socket) {
        socket.to(payload.roomId).emit(POP);
    }
    
    priorityEnqueue (payload: { roomId:string, songs: ( Song & { album: Album } )[] }, socket: Socket) {
        socket.to(payload.roomId).emit(PRIORITY_ENQUEUE, payload)
    }

    clear (payload: { roomId: string }, socket: Socket) {
        socket.to(payload.roomId).emit(CLEAR);
    }

    shiftToTopOfQueue (payload: { roomId: string, id: string }, socket: Socket ) {
        socket.to(payload.roomId).emit(SHIFT_TOP, payload);
    } 

    replace (payload: { roomId: string, id : string, source : number, destination : number }, socket: Socket) {
        socket.to(payload.roomId).emit(REPLACE, payload);
    }

    remove (payload: { roomId: string, id: string }, socket: Socket ) {
        socket.to(payload.roomId).emit(REMOVE, payload);
    }

    playNext (payload: { roomId: string, song: ( Song & { album: Album }) }, socket: Socket) {
        socket.to(payload.roomId).emit(PLAYNEXT, payload);
    }

    play (payload: { roomId: string }, socket: Socket) {
        socket.to(payload.roomId).emit(PLAY)
    }

    pause (payload: { roomId: string }, socket: Socket) {
        socket.to(payload.roomId).emit(PAUSE)
    }

    seek (payload: { roomId: string, time: number }, socket: Socket) {
        socket.to(payload.roomId).emit(SEEK, payload);
    }

}