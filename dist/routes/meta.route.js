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
exports.metaRouter = void 0;
const express_1 = require("express");
const db_1 = require("../libs/db");
const metaRouter = (0, express_1.Router)();
exports.metaRouter = metaRouter;
metaRouter.get("/artist", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        const metadata = yield db_1.db.artist.findUnique({
            where: {
                id: id
            },
            select: {
                name: true,
                image: true,
                about: true
            }
        });
        return res.json(metadata).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
metaRouter.get("/album", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        const metadata = yield db_1.db.album.findUnique({
            where: {
                id: id
            },
            select: {
                image: true,
                name: true,
                release: true,
                _count: {
                    select: {
                        songs: true
                    }
                }
            }
        });
        return res.json(metadata).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
metaRouter.get("/track", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        const song = yield db_1.db.song.findUnique({
            where: {
                id: id
            },
            select: {
                name: true,
                image: true,
                album: {
                    select: {
                        name: true,
                        release: true
                    }
                },
                artists: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return res.json(song).status(200);
    }
    catch (error) {
        return res.send("Internal server error").status(500);
    }
}));
