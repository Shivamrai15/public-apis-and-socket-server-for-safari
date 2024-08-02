import { Router } from "express";
import { db } from "../libs/db";

const searchRouter = Router();


searchRouter.get("/song", async( req, res )=>{
    try {
        
        const { query } = req.query;

        const results = await db.song.findRaw({
            filter : {
                name : {
                    $search: query 
                }
            }
        })

        return res.json(results).status(200);

    } catch (error) {
        console.error(error);
        return res.send("Internal server error").status(500);
    }
});

export { searchRouter };