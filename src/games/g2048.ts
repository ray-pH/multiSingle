import type { user, room, id, color, id_dict, Game } from '../lib/types.js'
import { shuffleArray, randint, arrayEqCustom } from '../lib/utils.js'

export type playerdata = {
    id : id, name: string, score : number,
}
export enum direction {
    UP, DOWN, LEFT, RIGHT
}

type square = {
    value : number;
    owner : number;
};
function eqSquare(sq1 : square, sq2 : square) : boolean {
    return sq1.value == sq2.value && sq1.owner == sq2.owner;
}

export type gamestate = {
    board : square[][], 
    players : id_dict<playerdata>, 
    playerorder : id[],
    currentplayer : number,
}
export type gameinput = {
    uid : id,
    direction : direction,
}

/**
 * The scoring system :
 *     merging of x + x give a score of x^2
*/
type scores = number[];
export class G2048 implements Game {
    board : square[][] = []
    players : id_dict<playerdata> = {};
    playerorder : id[] = [];
    currentplayer : number = 0;
    

    constructor(roomdata : room, _setting : any){
        this.initGame(6, roomdata);
    }

    get_emptySquarePos() : [number, number]{
        let row : number, col : number;
        do{
            row = randint(this.board.length - 1);
            col = randint(this.board[row].length - 1);
        } while (this.board[row][col].value != 0);
        return [row, col]
    }

    initGame(size : number, roomdata : room){
        //setup board
        this.board = new Array(size).
            fill([]).map(_ => new Array(size).fill({value : 0, owner : -1}));

        // setup player
        for (let uid in roomdata.members) 
            this.players[uid] = {id:uid, name:roomdata.members[uid].name, score:0};
        //order player
        let playerids = Object.keys(roomdata.members);
        shuffleArray(playerids);
        this.playerorder = playerids;
        this.currentplayer = 0;

        //put 2s in the board
        for (let i = 0; i < this.playerorder.length; i++){
            let [row, col] = this.get_emptySquarePos();
            this.board[row][col] = {value : 2, owner : i}
        }
    }

    combineArray(arr : square[]) : [square[], scores]{

        // score to add
        let dscore : scores = new Array(this.playerorder.length).fill(0);

        // imagine move "left" on the array
        // [2,0,2,4,2] -> [4,4,2]
        let combined : square[] = new Array(arr.length).fill({value:0, owner:-1});
        let ci = 0; // index for inserting into combined

        let stripped = arr.filter((x)=> x.value != 0);
        for (let i = 0; i < stripped.length; i++){

            // if only one left, put it in the combined
            if (i == stripped.length - 1){
                combined[ci] = { value:stripped[i].value, owner:stripped[i].owner };
                break;
            }

            if (eqSquare(stripped[i], stripped[i+1])){
                // combine two square
                combined[ci] = { value:2*stripped[i].value, owner:stripped[i].owner };
                // add score
                dscore[stripped[i].owner] += stripped[i].value * stripped[i].value;
                // advance
                ci++; i++;
            }else{
                combined[ci] = { value:stripped[i].value, owner:stripped[i].owner };
                ci++;
            }
        }

        return [combined, dscore];
    }

    /** try moving the board, return wheter the board is changing or not */
    moveBoard(dir : direction) : [boolean, scores] {
        let len = this.board.length;
        let changed = false;

        // score to add
        let dscore : scores = new Array(this.playerorder.length).fill(0);

        switch (dir){
            case direction.LEFT:
                for (let row = 0; row < len; row++){
                    let arr = this.board[row];
                    let [combined, ddscore] = this.combineArray(arr);
                    if (!arrayEqCustom(arr,combined, eqSquare)) changed = true;

                    for (let i = 0; i < dscore.length; i++) dscore[i] += ddscore[i]
                    for (let i = 0; i < len; i++)  this.board[row][i] = combined[i];
                }
                break;
            case direction.RIGHT:
                for (let row = 0; row < len; row++){
                    let arr = new Array<square>(len);
                    for (let i = 0; i < len; i++){
                        arr[i] = this.board[row][len-1-i];
                    }

                    let [combined, ddscore] = this.combineArray(arr);
                    if (!arrayEqCustom(arr,combined, eqSquare)) changed = true;

                    for (let i = 0; i < dscore.length; i++) dscore[i] += ddscore[i]
                    for (let i = 0; i < len; i++) this.board[row][i] = combined[len-1-i];
                }
                break;
            case direction.UP:
                for (let col = 0; col < len; col++){
                    let arr = new Array<square>(len);
                    for (let j = 0; j < len; j++){
                        arr[j] = this.board[j][col];
                    }

                    let [combined, ddscore] = this.combineArray(arr);
                    if (!arrayEqCustom(arr,combined, eqSquare)) changed = true;

                    for (let i = 0; i < dscore.length; i++) dscore[i] += ddscore[i]
                    for (let j = 0; j < len; j++) this.board[j][col] = combined[j];
                }
                break;
            case direction.DOWN:
                for (let col = 0; col < len; col++){
                    let arr = new Array<square>(len);
                    for (let j = 0; j < len; j++){
                        arr[j] = this.board[len-1-j][col];
                    }

                    let [combined, ddscore] = this.combineArray(arr);
                    if (!arrayEqCustom(arr,combined, eqSquare)) changed = true;

                    for (let i = 0; i < dscore.length; i++) dscore[i] += ddscore[i]
                    for (let j = 0; j < len; j++) this.board[j][col] = combined[len-1-j];
                }
                break;
        }
        return [changed, dscore];
    }

    sendInput(inp : gameinput) : [boolean, string] {
        if (inp == null) return [true, ""];
        if (inp.uid != this.playerorder[this.currentplayer]) return [false, ""]; // validate turn

        // do move
        let [changed, dscore] = this.moveBoard(inp.direction);
        if (!changed) return [false, "direction is invalid"];

        // add score
        for (let i = 0; i < dscore.length; i++){
            this.players[this.playerorder[i]].score += dscore[i];
        }

        // advance turn
        this.currentplayer = (this.currentplayer + 1) % this.playerorder.length;
        
        //add a random 2
        let [erow, ecol] = this.get_emptySquarePos();
        this.board[erow][ecol] = {value : 2, owner : this.currentplayer}
        return [true, ""];
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
        for (let row = 0; row < this.board.length; row++){
            for (let col = 0; col < this.board[row].length; col++){
                if (this.board[row][col].value == 0) return false;
            }
        }
        return true;
    }
}
