import type { user, room, id, color, id_dict, Game } from '../lib/types.js'
import { shuffleArray } from '../lib/utils.js'

export type playerdata = {
    id : id, name: string, score : number,
}

export enum square {
    empty = '' ,
    O     = 'O',
    X     = 'X',
}

export type gamestate = {
    board : square[][], 
    players : id_dict<playerdata>, 
    playerorder : id[],
    currentplayer : number,
}
export type gameinput = {
    uid : id,
    position : [number,number],
    symbol : square.O | square.X,
}

export class Tiktakto implements Game {
    board : square[][] = []
    players : id_dict<playerdata> = {};
    playerorder : id[] = [];
    currentplayer : number = 0;

    constructor(roomdata : room, _setinng : any){
        this.initGame(5, roomdata);
    }

    initGame(size : number, roomdata : room){
        //setup board
        this.board = new Array(size).
            fill(new Array(size).fill(square.empty));

        // setup player
        for (let uid in roomdata.members) 
            this.players[uid] = {id:uid, name:roomdata.members[uid].name, score:0};
        //order player
        let playerids = Object.keys(roomdata.members);
        shuffleArray(playerids);
        this.playerorder = playerids;
        this.currentplayer = 0;
    }

    sendInput(inp : gameinput) : void {
        if (inp == null) return;
        let [row, col] = inp.position;
        this.board[row][col] = inp.symbol;
        this.currentplayer = (this.currentplayer + 1) % this.playerorder.length;
    }

    getState() : gamestate {
        let gamestate : gamestate = {
            board       : this.board,
            players     : this.players,
            playerorder : this.playerorder,
            currentplayer: this.currentplayer,
        }
        return gamestate;
    }
    
    isDone() : boolean {
        for (let row of this.board) 
            for (let symbol of row) 
                if (symbol == square.empty) return false;
        return true;
    }
}
