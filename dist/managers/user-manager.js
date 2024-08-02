"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(name, email, socketId, isHost = false, image) {
        this.name = name;
        this.email = email;
        this.socketId = socketId;
        this.isHost = isHost;
        this.image = image;
    }
}
exports.User = User;
