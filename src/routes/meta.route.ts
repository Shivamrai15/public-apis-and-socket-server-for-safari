import { Router } from "express";
import { db } from "../libs/db";

const metaRouter = Router();

metaRouter.get("/artist", async(req, res)=>{
    try {

        const { id } = req.query;
        const metadata = await db.artist.findUnique({
            where : {
                id: id as string
            },
            select : {
                name : true,
                image : true,
                about : true
            }
        });

        return res.json(metadata).status(200);
        
    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


metaRouter.get("/album", async(req, res)=>{
    try {
        
        const { id } = req.query;
        const metadata = await db.album.findUnique({
            where : {
                id : id as string
            },
            select : {
                image : true,
                name : true,
                release : true,
                _count : {
                    select : {
                        songs : true
                    }
                }
            }
        });

        return res.json(metadata).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});


metaRouter.get("/track", async(req, res)=>{
    try {
        
        const { id } = req.query;
        const song = await db.song.findUnique({
            where : {
                id : id as string
            },
            select : {
                name : true,
                image: true,
                album : {
                    select : {
                        name : true,
                        release : true
                    }
                },
                artists : {
                    select :{
                        name : true
                    }
                }
            }
        });

        return res.json(song).status(200);

    } catch (error) {
        return res.send("Internal server error").status(500);
    }
});

export { metaRouter };