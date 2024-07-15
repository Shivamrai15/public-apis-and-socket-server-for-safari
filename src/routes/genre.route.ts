import { Router } from "express";
import { db } from "../libs/db";
import { Album, GenreSong, Song } from "@prisma/client";

const genreRouter = Router();
const SONGS_BATCH = 10;

genreRouter.get("/", async(req, res)=>{
    try {
        
        const genre = await db.genre.findMany();
        return res.json(genre).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


genreRouter.get("/tracks", async(req, res)=>{
    try {
        
        const { id } = req.query;
        if ( !id ) {
            return res.send("Missing genre Id").status(401);
        }

        const genreSongs = await db.genreSong.findMany({
            where : {
                genreId : id as string
            },
            select : {
                songId : true
            }
        });

        const genreSongIds = genreSongs.map((song)=>song.songId);

        const songs = await db.song.findMany({
            where : {
                id : {
                    in : genreSongIds
                }
            },
            include : {
                album : true
            }
        });

        songs.sort((a, b)=>genreSongIds.indexOf(a.id)-genreSongIds.indexOf(b.id));

        return res.json(songs).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


genreRouter.get("/songs", async(req, res)=>{
    try {

        const { id, cursor } = req.query;
        
        if (!id) {
            return res.send("Missing Genre Id").status(401);
        }

        let songs : (Song & {
            artists : {id : string, name : string}[],
            album : Album
        })[] = [];

        let genreSongs : GenreSong[] = [];

        if (cursor) {
            genreSongs = await db.genreSong.findMany({
                where : {
                    genreId :id as string
                },
                take : SONGS_BATCH,
                skip : 1,
                cursor : {
                    id : cursor as string
                },
            });

            const genreSongIds = genreSongs.map((item)=> item.songId);

            songs = await db.song.findMany({
                where : {
                    id : {
                        in : genreSongIds
                    }
                },
                include : {
                    artists : {
                        select : {
                            id : true,
                            name : true
                        }
                    },
                    album : true
                }
            });

            songs.sort((a, b)=>genreSongIds.indexOf(a.id)-genreSongIds.indexOf(b.id));
        } else {
            genreSongs = await db.genreSong.findMany({
                where : {
                    genreId :id as string
                },
                take : SONGS_BATCH,
            });

            const genreSongIds = genreSongs.map((item)=> item.songId);

            songs = await db.song.findMany({
                where : {
                    id : {
                        in : genreSongIds
                    }
                },
                include : {
                    artists : {
                        select : {
                            id : true,
                            name : true
                        }
                    },
                    album : true
                }
            });

            songs.sort((a, b)=>genreSongIds.indexOf(a.id)-genreSongIds.indexOf(b.id));
        }

        let nextCursor = null;

        if(genreSongs.length === SONGS_BATCH){
            nextCursor = genreSongs[SONGS_BATCH-1].id
        }

        return res.json({
            items: songs,
            nextCursor
        })

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


export { genreRouter };