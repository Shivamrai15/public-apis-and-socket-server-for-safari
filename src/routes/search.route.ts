import { Router } from "express";
import Fuse from "fuse.js";

import { db } from "../libs/db";
import data from "./data.json";

const fuseOptions = {
    keys : ['name'],
    threshold : 0.4
}

const searchRouter = Router();


searchRouter.get("/", async(req, res)=>{
    try {

        const { query } = req.query;
        const fuse =  new Fuse(data, fuseOptions);
        const similarity = fuse.search(query as string)
        
        const songRefs = similarity.filter((result)=>(result.item.type==="SONG" )).map((result)=>result.item.id).slice(0,5);;
        const albumRefs = similarity.filter((result)=>(result.item.type==="ALBUM" )).map((result)=>result.item.id).slice(0,5);;
        const artistRefs = similarity.filter((result)=>(result.item.type==="ARTIST" )).map((result)=>result.item.id).slice(0,5);;

        const [ albums, artists, songs ] = await db.$transaction([
            db.album.findMany({
                where : {
                    id : {
                        in : albumRefs
                    }
                }
            }),
            db.artist.findMany({
                where : {
                    id : {
                        in  : artistRefs
                    }
                },
                select : {
                    id : true,
                    name : true,
                    image : true
                }
            }),
            db.song.findMany({
                where : {
                    id  : {
                        in : songRefs
                    }
                },
                include : {
                    album : true,
                    artists : {
                        select : {
                            id : true,
                            image : true,
                            name : true
                        }
                    }
                }
            }),
        ]);

        songs.sort((a, b)=>songRefs.indexOf(a.id)-songRefs.indexOf(b.id));
        albums.sort((a, b)=>albumRefs.indexOf(a.id)-albumRefs.indexOf(b.id));
        artists.sort((a, b)=>artistRefs.indexOf(a.id)-artistRefs.indexOf(b.id));

        const topResult = similarity[0].item.type === "SONG" ? songs.shift() : similarity[0].item.type === "ALBUM" ? albums.shift() : artists.shift()
        
        return res.json({ topResult, songs, albums, artists });

        
    } catch (error) {
        console.error(error);
        return res.send("Internal server error").status(500);
    }
})


searchRouter.get("/song", async( req, res )=>{
    try {        
        const { query } = req.query;
        const fuse =  new Fuse(data, fuseOptions);
        const similarity = fuse.search(query as string)
                            .filter((result)=>(result.item.type==="SONG" ))
                            .map((result)=>result.item.id);

        if (similarity.length === 0){
            return res.json(null).status(200);
        }

        const songs = await db.song.findMany({
            where : {
                id : {
                    in : similarity
                }
            },
            include : {
                album : true,
                artists : {
                    select : {
                        id: true,
                        name : true,
                        image : true
                    }
                }
            }
        });

        songs.sort((a, b)=>similarity.indexOf(a.id)-similarity.indexOf(b.id));
        return res.json(songs).status(200);

    } catch (error) {
        console.error(error);
        return res.send("Internal server error").status(500);
    }
});


searchRouter.get("/album", async( req, res )=>{
    try {
        
        const { query } = req.query;
        const fuse =  new Fuse(data, fuseOptions);
        const similarity = fuse.search(query as string)
                            .filter((result)=>(result.item.type==="ALBUM" ))
                            .map((result)=>result.item.id);

        if (similarity.length === 0){
            return res.json(null).status(200);
        }

        const albums = await db.album.findMany({
            where : {
                id : {
                    in : similarity
                }
            },
        });

        albums.sort((a, b)=>similarity.indexOf(a.id)-similarity.indexOf(b.id));
        return res.json(albums).status(200);

    } catch (error) {
        console.error(error);
        return res.send("Internal server error").status(500);
    }
});


searchRouter.get("/artist", async( req, res )=>{
    try {
        
        const { query } = req.query;
        const fuse =  new Fuse(data, fuseOptions);
        const similarity = fuse.search(query as string)
                            .filter((result)=>(result.item.type==="ARTIST" ))
                            .map((result)=>result.item.id);

        if (similarity.length === 0){
            return res.json(null).status(200);
        }

        const artists = await db.artist.findMany({
            where : {
                id : {
                    in : similarity
                }
            },
            select : {
                id : true,
                name : true,
                image : true
            }
        });

        artists.sort((a, b)=>similarity.indexOf(a.id)-similarity.indexOf(b.id));
        return res.json(artists).status(200);

    } catch (error) {
        console.error(error);
        return res.send("Internal server error").status(500);
    }
});

export { searchRouter };