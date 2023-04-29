export enum userstate {
    lobby = 'Lobby', 
    room_host = 'Host', 
    room_wait = 'Not Ready', 
    room_ready = 'Ready', 
    game = 'Game', 
    loading = 'Loading',
};
export const colors = {
    BLACK  : '#1E1B18', 
    RED    : '#D8315B', 
    WHITE  : '#FFFAFF', 
    CYAN   : '#3E92CC', 
    BLUE   : '#0A2463', 
    YELLOW : '#FFE54C', 
    GREEN  : '#04BF55', 
    GREY   : '#666666', 
};
export const colorlist = ['#D8315B','#3E92CC','#04BF55','#FFE54C'];

export type color = string;
export type id = string;
export type id_dict<T> = {[key: id]: T};
export type user = { id : id, name : string, roomid : id, state : userstate};
export type room = { id : id, hostid : id, members : id_dict<user>, membercolors : id_dict<color>, 
    chat : chatmessage[], setting : roomsetting };
export type scoredata = {id : id, name : string, score : number};
export type chatmessage = { id : id, message : string };

export interface Game {
    sendInput(inp : any) : void;
    getState() : any;
    isDone()   : boolean;
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
    GAME_FINISH       = 'GAME_FINISH',
    GAME_TOROOM       = 'GAME_TOROOM',
    CHAT_MSG          = 'CHAT_MSG',
}
