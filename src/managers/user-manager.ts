export class User{
    public name : string;
    public email : string;
    public socketId : string;
    public isHost : boolean;
    public image : string|undefined;

    constructor( name:string, email: string, socketId:string, isHost:boolean=false, image:string|undefined ){
        this.name = name;
        this.email = email;
        this.socketId = socketId;
        this.isHost = isHost;
        this.image = image
    }
}