import { Router } from "express";
import { db } from "../libs/db";
import { Album, Song } from "../libs/types";

const songRouter = Router();
const BATCH = 10;

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
        
        const { cursor } =  req.query;
        
        let songs : (Song & { album: Album })[] = [];

        if (cursor) {
            songs = await db.song.findMany({
                where : {
                    view : {
                        some : {}
                    }
                },
                include : {
                    album : true
                },
                orderBy : [
                    {
                        view : {
                            _count : "desc"
                        }
                    },
                    {
                        name : "asc"
                    }
                ],
                skip : 1,
                cursor : {
                    id : cursor as string
                },
                take : BATCH 
            });
        } else {
            songs = await db.song.findMany({
                where : {
                    view : {
                        some : {}
                    }
                },
                include : {
                    album : true
                },
                orderBy : [
                    {
                        view : {
                            _count : "desc"
                        }
                    },
                    {
                        name : "asc"
                    }
                ],
                take : BATCH 
            });
        }

        let nextCursor = null;

        if(songs.length === BATCH){
            nextCursor = songs[BATCH-1].id
        }

        return res.json({
            items : songs,
            nextCursor
        });

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});

export { songRouter };