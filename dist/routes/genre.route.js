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
exports.genreRouter = void 0;
const express_1 = require("express");
const db_1 = require("../libs/db");
const genreRouter = (0, express_1.Router)();
exports.genreRouter = genreRouter;
const SONGS_BATCH = 10;
genreRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const genre = yield db_1.db.genre.findMany();
        return res.json(genre).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
genreRouter.get("/tracks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id) {
            return res.send("Missing genre Id").status(401);
        }
        const genreSongs = yield db_1.db.genreSong.findMany({
            where: {
                genreId: id
            },
            select: {
                songId: true
            }
        });
        const genreSongIds = genreSongs.map((song) => song.songId);
        const songs = yield db_1.db.song.findMany({
            where: {
                id: {
                    in: genreSongIds
                }
            },
            include: {
                album: true
            }
        });
        songs.sort((a, b) => genreSongIds.indexOf(a.id) - genreSongIds.indexOf(b.id));
        return res.json(songs).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
genreRouter.get("/songs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, cursor } = req.query;
        if (!id) {
            return res.send("Missing Genre Id").status(401);
        }
        let songs = [];
        let genreSongs = [];
        if (cursor) {
            genreSongs = yield db_1.db.genreSong.findMany({
                where: {
                    genreId: id
                },
                take: SONGS_BATCH,
                skip: 1,
                cursor: {
                    id: cursor
                },
            });
            const genreSongIds = genreSongs.map((item) => item.songId);
            songs = yield db_1.db.song.findMany({
                where: {
                    id: {
                        in: genreSongIds
                    }
                },
                include: {
                    artists: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    album: true
                }
            });
            songs.sort((a, b) => genreSongIds.indexOf(a.id) - genreSongIds.indexOf(b.id));
        }
        else {
            genreSongs = yield db_1.db.genreSong.findMany({
                where: {
                    genreId: id
                },
                take: SONGS_BATCH,
            });
            const genreSongIds = genreSongs.map((item) => item.songId);
            songs = yield db_1.db.song.findMany({
                where: {
                    id: {
                        in: genreSongIds
                    }
                },
                include: {
                    artists: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    album: true
                }
            });
            songs.sort((a, b) => genreSongIds.indexOf(a.id) - genreSongIds.indexOf(b.id));
        }
        let nextCursor = null;
        if (genreSongs.length === SONGS_BATCH) {
            nextCursor = genreSongs[SONGS_BATCH - 1].id;
        }
        return res.json({
            items: songs,
            nextCursor
        });
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
