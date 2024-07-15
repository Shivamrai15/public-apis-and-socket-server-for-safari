import { Router } from "express";
import { db } from "../libs/db";

const songRouter = Router();

songRouter.get("/", async(req, res)=>{
    try {
        
        const { id } = req.query;
        if ( !id ) {
            return res.send("Missing song Id").status(401);
        }

        const song = await db.song.findUnique({
            where : {
                id: id as string
            },
            include : {
                album : true
            }
        });

        if ( !song ) {
            return res.send("Song not found").status(404);
        }

        res.json(song).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


songRouter.get("/most-played", async(req, res)=>{
    try {
        
        const mostPlayedSongs = await db.songPlays.groupBy({
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

        const mostPlayedSongIds = mostPlayedSongs.map((song)=>song.songId);

        const songs = await db.song.findMany({
            where : {
                id : {
                    in : mostPlayedSongIds
                }
            },
            include : {
                album : true
            }
        });

        songs.sort((a, b)=>mostPlayedSongIds.indexOf(a.id)-mostPlayedSongIds.indexOf(b.id));

        return res.json(songs).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});

export { songRouter };