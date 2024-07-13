type Song = {
    id: string;
    name: string;
    image: string;
    url: string;
    duration: number;
    albumId: string;
    artistIds: string[];
}

type Album = {
    id: string;
    name: string;
    image: string;
    color: string;
    release: Date;
}

export { Song, Album };
