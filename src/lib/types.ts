export enum userstate {
    lobby = 'Lobby', 
    room_host = 'Host', 
    room_wait = 'Not Ready', 
    room_ready = 'Ready', 
    game = 'Game', 
    loading = 'Loading',
}
export const colors = ['#D8315B','#FFE54C','#3E92CC','#04BF55',];

// export type Constructor<T> = { new(...args:any): T };
export type color = string;
export type id = string;
export type id_dict<T> = {[key: id]: T};
export type user = { id : id, name : string, roomid : id, state : userstate};
export type room = { id : id, hostid : id, members : id_dict<user>, membercolors : id_dict<color>, setting : roomsetting };

export interface Game {
    emitState(state : any) : void;
    sendInput() : void;
}
export type gameConstructor = { new(r : room, f_emitState : (state : any) => void) : Game }

export enum games {
    pairFlipper
}

export type roomsetting = {
    game : games,
}
