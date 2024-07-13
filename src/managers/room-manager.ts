import { Server, Socket } from "socket.io";
import { User } from "./user-manager";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { LEAVE_ROOM, UPDATE_USER } from "../libs/events";


export class RoomManager {
    private rooms : ({ roomId: string, users : User[] })[];
    private users : ({ user : User, roomId: string })[];

    constructor () {
        this.rooms = [];
        this.users = [];
    }

    getRoom ( roomId: string ) {
        const room = this.rooms.find((room)=>room.roomId===roomId);
        return room;
    }

    getUser ( socketId: string ) {
        const user = this.users.find((user)=>user.user.socketId===socketId);
        return user;
    }

    joinRoom ( payload : { name : string, email: string, roomId: string, isHost:boolean, image: string|undefined }, socket:Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {

        const user = new User( payload.name, payload.email, socket.id, payload.isHost, payload.image );
        this.users.push({ user, roomId: payload.roomId });

        const room = this.getRoom(payload.roomId);
        if ( !room ) {
            const newRoom = { roomId: payload.roomId, users: [user]}
            this.rooms.push(newRoom);
            socket.join(payload.roomId);
            io.to(payload.roomId).emit(UPDATE_USER, [user], payload.roomId);

        } else {
            const users = room.users;
            room.users = [...users, user];
            socket.join(payload.roomId);
            io.to(payload.roomId).emit(UPDATE_USER, users, payload.roomId);
        }
    }


    leaveRoom (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        const user = this.getUser(socket.id);
       
        if (user) {
            const room = this.rooms.find((room)=>room.roomId === user.roomId);

            if (room) {
                const roomUsers = room.users;
                const remainingUsers = roomUsers.filter((user)=>user.socketId!==socket.id);
                socket.leave(user.roomId);
                
                const users = this.users.filter((user)=>user.user.socketId !== socket.id);
                this.users = users;

                io.to(user.roomId).emit(UPDATE_USER, remainingUsers, user.roomId);
                socket.emit(LEAVE_ROOM, user.user, user.roomId);
            }
        }
    }

}