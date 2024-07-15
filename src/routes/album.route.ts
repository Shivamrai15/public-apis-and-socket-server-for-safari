import { Router } from "express";
import { db } from "../libs/db";

const albumRouter = Router();
albumRouter.get("/", async(req, res)=>{
    try {
        const {id} = req.query;
        const songs = await db.song.findMany({
            where : {
                albumId : id as string
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

export { albumRouter }