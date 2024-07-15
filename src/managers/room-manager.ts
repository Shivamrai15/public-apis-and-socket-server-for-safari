import { Server, Socket } from "socket.io";
import { User } from "./user-manager";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { LEAVE_ROOM, UPDATE_USER } from "../libs/events";


export class RoomManager {
    private rooms: ({ roomId: string, users: User[] })[];
    private users: ({ user: User, roomId: string })[];

    constructor() {
        this.rooms = [];
        this.users = [];
    }

    getRoom(roomId: string) {
        return this.rooms.find((room) => room.roomId === roomId);
    }

    getUser(socketId: string) {
        return this.users.find((user) => user.user.socketId === socketId);
    }

    joinRoom(payload: { name: string, email: string, roomId: string, isHost: boolean, image: string | undefined }, socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        const existingUser = this.users.find((user) => user.user.email === payload.email && user.roomId === payload.roomId);
        if (existingUser) {
            return;
        }

        const user = new User(payload.name, payload.email, socket.id, payload.isHost, payload.image);
        this.users.push({ user, roomId: payload.roomId });

        const room = this.getRoom(payload.roomId);
        if (!room) {
            const newRoom = { roomId: payload.roomId, users: [user] };
            this.rooms.push(newRoom);
            socket.join(payload.roomId);
            io.to(payload.roomId).emit(UPDATE_USER, newRoom.users, payload.roomId);
        } else {
            room.users.push(user);
            socket.join(payload.roomId);
            io.to(payload.roomId).emit(UPDATE_USER, room.users, payload.roomId);
        }
    }

    leaveRoom(socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        const user = this.getUser(socket.id);
        if (!user) {
            return; 
        }

        const room = this.getRoom(user.roomId);
        if (!room) {
            return;
        }

        room.users = room.users.filter((roomUser) => roomUser.socketId !== socket.id);

        if (room.users.length === 0) {
            this.rooms = this.rooms.filter((room) => room.roomId !== user.roomId);
        }
        this.users = this.users.filter((u) => u.user.socketId !== socket.id);

        socket.leave(user.roomId);
        io.to(user.roomId).emit(UPDATE_USER, room.users, user.roomId);
        socket.emit(LEAVE_ROOM);
    }

    end (roomId: string, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        const room = this.getRoom(roomId);
        if (!room) {
            return;
        }

        room.users.forEach((user)=>{
            const socket = io.sockets.sockets.get(user.socketId);
            if ( socket ){
                socket.leave(roomId);
                socket.emit(LEAVE_ROOM);
            }
        });

        this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
        this.users = this.users.filter((u) => u.roomId !== roomId);
    }
}