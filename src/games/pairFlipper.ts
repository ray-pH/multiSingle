import type { user, room, id, color, id_dict, Game } from '../lib/types'
import { shuffleArray } from '../lib/utils'

type card = string;

export type playerdata = {
    id : id, score : number,
}

export enum cardstate {
    closed, open0, open1, open2, open3, done,
}

export type gamestate = {
    board : card[], boardstate : cardstate[], 
    players : id_dict<playerdata>, playerorder : id_dict<number>,
}

export class PairFlipper implements Game {
    board      : card[]      = [];
    boardstate : cardstate[] = [];
    players : id_dict<playerdata> = {};
    playerorder : id_dict<number> = {};

    emitState : (state : any) => void;

    constructor(roomdata : room, f_emitState : (state : any) => void){
        this.initGame(['a','b','c'], roomdata);
        this.emitState = f_emitState;
    }

    initGame(symbols : string[], roomdata : room){
        //setup board
        this.board = this.generateBoard(symbols);
        this.boardstate = new Array(this.board.length);
        this.boardstate.fill(cardstate.closed);

        // setup player
        for (let uid in roomdata.members) this.players[uid] = {id:uid, score:0};
        //order player
        let playerids = Object.keys(roomdata.members);
        shuffleArray(playerids);
        for (let i in playerids) this.playerorder[playerids[i]] = parseInt(i);
    }

    generateBoard(symbols : Array<any>) : card[] {
        let board = symbols.concat(symbols);
        shuffleArray(board);
        return board;
    }

    sendInput() {
        console.log("todo");
        // emit back
        let gamestate : gamestate = {
            board       : this.board,
            boardstate  : this.boardstate,
            players     : this.players,
            playerorder : this.playerorder,
        }
        this.emitState(gamestate);
    }

}
