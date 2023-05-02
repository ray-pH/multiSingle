import type { user, room, id, color, id_dict, Game } from '../lib/types.js'
import { shuffleArray, arrayEq } from '../lib/utils.js'

type pos = [number, number];
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
    lastplayed : pos,
    winnerline : pos[],
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
    lastplayed : [number, number] = [-1,-1];
    winnerline : pos[] = [[-1,-1],[-1,-1],[-1,-1]];

    constructor(roomdata : room, _setinng : any){
        this.initGame(5, roomdata);
    }

    initGame(size : number, roomdata : room){
        //setup board
        this.board = new Array(size).
            fill([]).map(_ => new Array(size).fill(square.empty));

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
        let [row, col]  = inp.position;
        this.lastplayed = inp.position;
        this.board[row][col] = inp.symbol;
        this.currentplayer = (this.currentplayer + 1) % this.playerorder.length;

        // if already done, skip
        if (!arrayEq(this.winnerline[0],[-1,-1])) return;

        // calc score
        this.winnerline = this.checkWin();
        if (!arrayEq(this.winnerline[0],[-1,-1])){
            this.players[inp.uid].score += 100;
        }
    }

    checkWin() : [pos, pos, pos] {
        // check horizontally
        for (let j = 0; j < this.board.length; j++){
            for (let i = 0; i < this.board.length-2; i++){
                if (this.board[j][i] != square.empty &&
                    this.board[j][i] == this.board[j][i+1] &&
                    this.board[j][i] == this.board[j][i+2]) return [[j,i], [j,i+1], [j,i+2]];
            }
        }
        // check vertically
        for (let i = 0; i < this.board.length; i++){
            for (let j = 0; j < this.board.length-2; j++){
               if (this.board[j][i] != square.empty &&
                   this.board[j][i] == this.board[j+1][i] &&
                   this.board[j][i] == this.board[j+2][i]) return [[j,i], [j+1,i], [j+2,i]];
            }
        }
        // check diagonal /
        for (let j = 2; j < this.board.length; j++){
            for (let i = 0; i < this.board.length-2; i++){
               if (this.board[j][i] != square.empty &&
                   this.board[j][i] == this.board[j-1][i+1] &&
                   this.board[j][i] == this.board[j-2][i+2]) return [[j,i], [j-1,i+1], [j-2,i+2]];
            }
        }
        // check diagonal \
        for (let j = 0; j < this.board.length-2; j++){
            for (let i = 0; i < this.board.length-2; i++){
               if (this.board[j][i] != square.empty &&
                   this.board[j][i] == this.board[j+1][i+1] &&
                   this.board[j][i] == this.board[j+2][i+2]) return [[j,i], [j+1,i+1], [j+2,i+2]];
            }
        }
        // not found
        return [[-1,-1],[-1,-1],[-1,-1]];
    }

    getState() : gamestate {
        let gamestate : gamestate = {
            board       : this.board,
            players     : this.players,
            playerorder : this.playerorder,
            currentplayer: this.currentplayer,
            lastplayed  : this.lastplayed,
            winnerline  : this.winnerline,
        }
        return gamestate;
    }
    
    isDone() : boolean {
        if (!arrayEq(this.winnerline[0],[-1,-1])) return true;
        for (let row of this.board) 
            for (let symbol of row) 
                if (symbol == square.empty) return false;
        return true;
    }
}
