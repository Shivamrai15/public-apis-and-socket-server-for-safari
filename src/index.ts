import express from "express";
import cors from "cors";
import http from "http";
import { rateLimit } from "express-rate-limit";
import { Server } from "socket.io";
import { RoomManager } from "./managers/room-manager";
import { LEAVE_ROOM, JOIN_ROOM, ENQUEUE, DEQUEUE, PUSH, POP, PRIORITY_ENQUEUE, CLEAR, SHIFT_TOP, REPLACE, REMOVE, PLAYNEXT, PLAY, PAUSE, SEEK, END_ROOM } from "./libs/events";
import { Album, Song } from "./libs/types";
import { EventManager } from "./managers/event-manger";
import { albumRouter } from "./routes/album.route";
import { artistRouter } from "./routes/artist.route";
import { genreRouter } from "./routes/genre.route";
import { songRouter } from "./routes/song.route";
import { metaRouter } from "./routes/meta.route";
import { searchRouter } from "./routes/search.route";
import { updateRouter } from "./routes/update.route";


const PORT = process.env.PORT! || 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : process.env.CLIENT || "http://localhost:3000",
        methods : ["GET", "POST"]
    }
});

const limiter = rateLimit({
    windowMs : 1000,
    limit : 50,
    standardHeaders : "draft-7",
    legacyHeaders : false
});


app.use(limiter);
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT || "http://localhost:3000",
    methods : ["GET", "POST"]
}));


app.use("/api/v2/song", songRouter);
app.use("/api/v2/album", albumRouter);
app.use("/api/v2/artist", artistRouter);
app.use("/api/v2/genre", genreRouter);
app.use("/api/v2/metadata", metaRouter);
app.use("/api/v2/search", searchRouter);
app.use("/api/v2/update", updateRouter)



const roomManager = new RoomManager();
const eventManager = new EventManager();

io.on("connection", (socket)=>{
    console.log("User connected", socket.id);
    
    socket.on(JOIN_ROOM, ( payload : { name : string, email: string, roomId: string, isHost:boolean, image: string|undefined })=>{
        roomManager.joinRoom(payload, socket, io);
    });

    socket.on(LEAVE_ROOM, ()=>{
        roomManager.leaveRoom(socket, io);
    });

    socket.on(END_ROOM, (payload: { roomId: string })=>{
        roomManager.end(payload.roomId, io);
    });

    socket.on(ENQUEUE, (payload: { roomId: string, songs : ( Song & { album : Album } )[], clear?: boolean })=>{
        eventManager.enqueue(payload, socket);
    });

    socket.on(DEQUEUE, (payload: { roomId: string })=>{
        eventManager.dequeue(payload, socket);
    });

    socket.on(PUSH, (payload: { roomId: string, song: ( Song & { album: Album } )})=>{
        eventManager.push(payload, socket);
    });

    socket.on(POP, (payload: { roomId: string })=>{
        eventManager.pop(payload, socket);
    });

    socket.on(PRIORITY_ENQUEUE, (payload: { roomId:string, songs: ( Song & { album: Album } )[] })=>{
        eventManager.priorityEnqueue(payload, socket);
    });

    socket.on(CLEAR, (payload: { roomId: string })=>{
        eventManager.clear(payload, socket);
    });

    socket.on(SHIFT_TOP, (payload: { roomId: string, id: string })=>{
        eventManager.shiftToTopOfQueue(payload, socket);
    });

    socket.on(REPLACE, (payload: { roomId: string, id : string, source : number, destination : number })=>{
        eventManager.replace(payload, socket);
    });

    socket.on(REMOVE, (payload: { roomId: string, id: string })=>{
        eventManager.remove(payload, socket);
    });

    socket.on(PLAYNEXT, (payload: { roomId: string, song: ( Song & { album: Album }) })=>{
        eventManager.playNext(payload, socket);
    });

    socket.on(PLAY, (payload: { roomId: string })=>{
        eventManager.play(payload, socket);
    });

    socket.on(PAUSE, (payload: { roomId: string })=>{
        eventManager.pause(payload, socket);  
    });

    socket.on(SEEK, (payload: { roomId: string, time: number })=>{
        eventManager.seek(payload, socket);
    });

    socket.on("disconnect", ()=>{
        roomManager.leaveRoom(socket, io);  
    });

});



server.listen(PORT, ()=>{
    console.log(`App is listening on PORT ${PORT}`)
});