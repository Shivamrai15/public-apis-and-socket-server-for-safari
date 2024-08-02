"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.songRouter = void 0;
const express_1 = require("express");
const db_1 = require("../libs/db");
const songRouter = (0, express_1.Router)();
exports.songRouter = songRouter;
songRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id) {
            return res.send("Missing song Id").status(401);
        }
        const song = yield db_1.db.song.findUnique({
            where: {
                id: id
            },
            include: {
                album: true
            }
        });
        if (!song) {
            return res.send("Song not found").status(404);
        }
        res.json(song).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
songRouter.get("/most-played", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mostPlayedSongs = yield db_1.db.songPlays.groupBy({
            by: ['songId'],
            _count: {
                songId: true
            },
            orderBy: {
                _count: {
                    songId: 'desc'
                }
            },
            take: 10
        });
        const mostPlayedSongIds = mostPlayedSongs.map((song) => song.songId);
        const songs = yield db_1.db.song.findMany({
            where: {
                id: {
                    in: mostPlayedSongIds
                }
            },
            include: {
                album: true
            }
        });
        songs.sort((a, b) => mostPlayedSongIds.indexOf(a.id) - mostPlayedSongIds.indexOf(b.id));
        return res.json(songs).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
