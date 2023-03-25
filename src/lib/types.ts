export enum userstate {
    lobby = 'Lobby', 
    room_host = 'Host', 
    room_wait = 'Not Ready', 
    room_ready = 'Ready', 
    game = 'Game', 
    loading = 'Loading',
}
export const colors = ['#D8315B','#FFE54C','#3E92CC','#04BF55',];

export type color = string;
export type id = string;
export type id_dict<T> = {[key: id]: T};
export type user = { id : id, name : string, roomid : id, state : userstate};
export type room = { id : id, hostid : id, members : id_dict<user>, membercolors : id_dict<color>, setting : roomsetting };

export interface Game {
    getState() : any;
    sendInput(inp : any) : void;
}
export type gameConstructor = { new(r : room) : Game }

export enum games {
    pairFlipper
}

export type roomsetting = {
    game : games,
}

export enum socketevent {
    USER_UPDATE       = 'USER_UPDATE',
    ROOMLIST_UPDATE   = 'ROOMLIST_UPDATE',
    ROOM_NEW          = 'ROOM_NEW',
    ROOM_JOIN         = 'ROOM_JOIN',
    ROOM_LEAVE        = 'ROOM_LEAVE',
    ROOM_UPDATE       = 'ROOM_UPDATE',
    GAME_TOGGLEREADY  = 'GAME_TOGGLEREADY',
    GAME_REQUESTSTART = 'GAME_REQUESTSTART',
    GAME_START_SERVER = 'GAME_START_SERVER',
    GAME_START        = 'GAME_START',
    GAME_INPUT        = 'GAME_INPUT',
    GAME_UPDATESTATE  = 'GAME_UPDATESTATE',
}
