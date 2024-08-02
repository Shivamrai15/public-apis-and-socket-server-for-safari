"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const room_manager_1 = require("./managers/room-manager");
const events_1 = require("./libs/events");
const event_manger_1 = require("./managers/event-manger");
const album_route_1 = require("./routes/album.route");
const artist_route_1 = require("./routes/artist.route");
const genre_route_1 = require("./routes/genre.route");
const song_route_1 = require("./routes/song.route");
const meta_route_1 = require("./routes/meta.route");
const search_route_1 = require("./routes/search.route");
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT || "http://localhost:3000",
    methods: ["GET", "POST"]
}));
app.use("/api/v2/song", song_route_1.songRouter);
app.use("/api/v2/album", album_route_1.albumRouter);
app.use("/api/v2/artist", artist_route_1.artistRouter);
app.use("/api/v2/genre", genre_route_1.genreRouter);
app.use("/api/v2/metadata", meta_route_1.metaRouter);
app.use("/api/v2/search", search_route_1.searchRouter);
const roomManager = new room_manager_1.RoomManager();
const eventManager = new event_manger_1.EventManager();
io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    socket.on(events_1.JOIN_ROOM, (payload) => {
        roomManager.joinRoom(payload, socket, io);
    });
    socket.on(events_1.LEAVE_ROOM, () => {
        roomManager.leaveRoom(socket, io);
    });
    socket.on(events_1.END_ROOM, (payload) => {
        roomManager.end(payload.roomId, io);
    });
    socket.on(events_1.ENQUEUE, (payload) => {
        eventManager.enqueue(payload, socket);
    });
    socket.on(events_1.DEQUEUE, (payload) => {
        eventManager.dequeue(payload, socket);
    });
    socket.on(events_1.PUSH, (payload) => {
        eventManager.push(payload, socket);
    });
    socket.on(events_1.POP, (payload) => {
        eventManager.pop(payload, socket);
    });
    socket.on(events_1.PRIORITY_ENQUEUE, (payload) => {
        eventManager.priorityEnqueue(payload, socket);
    });
    socket.on(events_1.CLEAR, (payload) => {
        eventManager.clear(payload, socket);
    });
    socket.on(events_1.SHIFT_TOP, (payload) => {
        eventManager.shiftToTopOfQueue(payload, socket);
    });
    socket.on(events_1.REPLACE, (payload) => {
        eventManager.replace(payload, socket);
    });
    socket.on(events_1.REMOVE, (payload) => {
        eventManager.remove(payload, socket);
    });
    socket.on(events_1.PLAYNEXT, (payload) => {
        eventManager.playNext(payload, socket);
    });
    socket.on(events_1.PLAY, (payload) => {
        eventManager.play(payload, socket);
    });
    socket.on(events_1.PAUSE, (payload) => {
        eventManager.pause(payload, socket);
    });
    socket.on(events_1.SEEK, (payload) => {
        eventManager.seek(payload, socket);
    });
    socket.on("disconnect", () => {
        roomManager.leaveRoom(socket, io);
    });
});
server.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`);
});
