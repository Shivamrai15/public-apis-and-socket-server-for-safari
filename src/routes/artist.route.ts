import { Router } from "express";
import { db } from "../libs/db";
import { Album, Song } from "@prisma/client";

const SONGS_BATCH = 10;
const DISCOGRAPHY_BATCH = 6;

const artistRouter = Router();

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

        const artist = await db.view.count({
            where : {
                song : {
                    artistIds : {
                        has : id as string
                    }
                }
            }
        });

        if ( !artist ) {
            return res.send("Artist not found").status(404);
        }

        return res.json({ views : artist });

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


artistRouter.get("/discography", async(req, res)=>{
    try {
        
        const { id, cursor } = req.query;
        if (!id) {
            return res.send("Missing Artist Id").status(400);
        }

        let albums : ( Album & {songs : (Song & {artists : ({ id: string, name: string })[]})[] } )[] = [];

        if (cursor) {
            albums = await db.album.findMany({
                where : {
                    songs : {
                        some : {
                            artistIds : {
                                has : id as string
                            }
                        }
                    }
                },
                include : {
                    songs : {
                        include : {
                            artists : {
                                select : {
                                    id : true,
                                    name : true
                                }
                            }
                        }
                    }
                },
                orderBy : {
                    release : "desc"
                },
                take : DISCOGRAPHY_BATCH,
                skip : 1,
                cursor : {
                    id : cursor as string
                },
            });
        } else {
            albums = await db.album.findMany({
                where : {
                    songs : {
                        some : {
                            artistIds : {
                                has : id as string
                            }
                        }
                    }
                },
                include : {
                    songs : {
                        include : {
                            artists : {
                                select : {
                                    id : true,
                                    name : true
                                }
                            }
                        }
                    }
                },
                orderBy : {
                    release : "desc"
                },
                take : DISCOGRAPHY_BATCH,
            });
        } 

        let nextCursor = null;

        if(albums.length === DISCOGRAPHY_BATCH){
            nextCursor = albums[DISCOGRAPHY_BATCH-1].id
        }

        return res.json({
            items : albums,
            nextCursor
        })

    } catch (error) {
        console.log("DISCOGRAPHY API ERROR", error);
        return res.send("Internal server error").status(500);
    }
});


export { artistRouter };