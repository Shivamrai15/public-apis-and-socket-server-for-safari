"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const user_manager_1 = require("./user-manager");
const events_1 = require("../libs/events");
class RoomManager {
    constructor() {
        this.rooms = [];
        this.users = [];
    }
    getRoom(roomId) {
        return this.rooms.find((room) => room.roomId === roomId);
    }
    getUser(socketId) {
        return this.users.find((user) => user.user.socketId === socketId);
    }
    joinRoom(payload, socket, io) {
        const existingUser = this.users.find((user) => user.user.email === payload.email && user.roomId === payload.roomId);
        if (existingUser) {
            return;
        }
        const user = new user_manager_1.User(payload.name, payload.email, socket.id, payload.isHost, payload.image);
        this.users.push({ user, roomId: payload.roomId });
        const room = this.getRoom(payload.roomId);
        if (!room) {
            const newRoom = { roomId: payload.roomId, users: [user] };
            this.rooms.push(newRoom);
            socket.join(payload.roomId);
            io.to(payload.roomId).emit(events_1.UPDATE_USER, newRoom.users, payload.roomId);
        }
        else {
            room.users.push(user);
            socket.join(payload.roomId);
            io.to(payload.roomId).emit(events_1.UPDATE_USER, room.users, payload.roomId);
        }
    }
    leaveRoom(socket, io) {
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
        io.to(user.roomId).emit(events_1.UPDATE_USER, room.users, user.roomId);
        socket.emit(events_1.LEAVE_ROOM);
    }
    end(roomId, io) {
        const room = this.getRoom(roomId);
        if (!room) {
            return;
        }
        room.users.forEach((user) => {
            const socket = io.sockets.sockets.get(user.socketId);
            if (socket) {
                socket.leave(roomId);
                socket.emit(events_1.LEAVE_ROOM);
            }
        });
        this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
        this.users = this.users.filter((u) => u.roomId !== roomId);
    }
}
exports.RoomManager = RoomManager;
