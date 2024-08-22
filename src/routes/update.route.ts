import { Router } from "express";
import { db } from "../libs/db";
import fs from "fs";
import path from "path";

const updateRouter = Router();

updateRouter.get("/", async(req, res)=>{
    try {

        const albumsRef = await db.album.findMany({
            select : {
                id : true,
                name : true
            }
        });
        const albums = albumsRef.map((album)=>({...album, type: "ALBUM" }));

        const songsRef = await db.song.findMany({
            select : {
                id: true,
                name: true
            }
        });
        const songs = songsRef.map((song)=>({...song, type: "SONG"}))

        const artistsRef = await db.artist.findMany({
            select : {
                id : true,
                name : true
            }
        });
        const artists = artistsRef.map((artist)=>({...artist, type: "ARTIST"}));

        const fields = [...albums, ...songs, ...artists];
        
        const filePath = path.join(__dirname, "data.json");
        fs.writeFile(filePath, JSON.stringify(fields), (err)=>{
            if (err) {
                console.log("Something went wrong while writing the file");
            }
        });

        return res.json({ success: true }).status(201);

    } catch (error) {
       console.log("DB update error");
       return res.send("Internal server error").status(500); 
    }
});


export { updateRouter }