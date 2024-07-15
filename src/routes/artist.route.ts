import { Router } from "express";
import { db } from "../libs/db";
import { Album, Song } from "@prisma/client";

const artistRouter = Router();
const SONGS_BATCH = 10;

artistRouter.get("/", async(req, res)=>{
    try {
        
        const { id } = req.query;
        if ( !id ) {
            return res.send("Artist Id is missing").status(401);
        }

        const songs = await db.song.findMany({
            where : {
                artistIds : {
                    has : id as string
                }
            },
            include : {
                album : true
            }
        });

        return res.json(songs);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


artistRouter.get("/views", async(req, res)=>{
    try {
        
        const { id } = req.query;
        if ( !id ) {
            return res.send("Artist Id is missing").status(401);
        }

        const artist = await db.artist.findUnique({
            where : {
                id : id as string
            },
            select : {
                songIds : true
            }
        });

        if ( !artist ) {
            return res.send("Artist not found").status(404);
        }

        const artistViews = await db.songPlays.count({
            where : {
                songId : {
                    in : artist.songIds
                }
            }
        });

        return res.json({views: artistViews});

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});

artistRouter.get("/songs", async(req, res)=>{
    try {
        
        const { id, cursor } = req.query;
        if ( !id ) {
            return res.send("Artist Id is missing").status(401);
        }

        let songs : (Song & {
            artists : {id : string, name: string}[],
            album : Album
        })[] = [];

        if (cursor) {
            songs = await db.song.findMany({
                where : {
                    artists : {
                        some : {
                            id : id as string
                        }
                    }
                },
                include : {
                    album : true,
                    artists : {
                        select : {
                            id : true,
                            name : true
                        }
                    }
                },
                take : SONGS_BATCH,
                skip : 1,
                cursor : {
                    id : cursor as string
                },
                orderBy : {
                    name : "asc"
                }
            });
        } else {
            songs = await db.song.findMany({
                where : {
                    artists : {
                        some : {
                            id : id as string
                        }
                    }
                },
                include : {
                    album : true,
                    artists : {
                        select : {
                            id : true,
                            name : true
                        }
                    }
                },
                take : SONGS_BATCH,
                orderBy : {
                    name : "asc"
                }
            })
        }

        let nextCursor = null;

        if(songs.length === SONGS_BATCH){
            nextCursor = songs[SONGS_BATCH-1].id
        }

        return res.json({
            items : songs,
            nextCursor
        }).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
})


export { artistRouter };