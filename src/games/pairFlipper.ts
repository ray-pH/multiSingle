import type { user, room, id, color, id_dict, Game } from '../lib/types.js'
import { shuffleArray } from '../lib/utils.js'

export type card = string;

export type playerdata = {
    id : id, name: string, score : number,
}

export enum cardstate {
    closed, open0, open1, open2, open3,
            done0, done1, done2, done3,
}
export const cardopenstate = [cardstate.open0, cardstate.open1, cardstate.open2, cardstate.open3];
export const carddonestate = [cardstate.done0, cardstate.done1, cardstate.done2, cardstate.done3];

export type gamestate = {
    board : card[], boardstate : cardstate[], 
    players : id_dict<playerdata>, playerorder : id[],
}
export type gameinput = {
    uid : id,
    clicked_card : number,
}

export class PairFlipper implements Game {
    board      : card[]      = [];
    boardstate : cardstate[] = [];
    players : id_dict<playerdata> = {};
    playerorder : id[] = [];

    constructor(roomdata : room, _setting : any){
        let n = 8; // todo create a setting
        const hanafuda_count = 48;
        let cards = [...Array(hanafuda_count).keys()].map(x => x.toString());
        shuffleArray(cards);
        this.initGame(cards.slice(0,n), roomdata);
    }

    initGame(symbols : string[], roomdata : room){
        //setup board
        this.board = this.generateBoard(symbols);
        this.boardstate = new Array(this.board.length);
        this.boardstate.fill(cardstate.closed);

        // setup player
        for (let uid in roomdata.members) 
            this.players[uid] = {id:uid, name:roomdata.members[uid].name, score:0};
        //order player
        let playerids = Object.keys(roomdata.members);
        shuffleArray(playerids);
        this.playerorder = playerids;
    }

    generateBoard(symbols : Array<any>) : card[] {
        let board = symbols.concat(symbols);
        shuffleArray(board);
        return board;
    }
    
    addPoint(playernum : number, point : number) : void{
        let uid : id = this.playerorder[playernum];
        this.players[uid].score += point;
    }

    clickCard(playernum : number, cardid : number) : void {
        // if not closed, return
        if (this.boardstate[cardid] != cardstate.closed) return;

        let playeropenstate : cardstate = cardopenstate[playernum];
        let openids : number[] = [];
        for (let i in this.boardstate) if (this.boardstate[i] == playeropenstate) openids.push(parseInt(i));
        switch (openids.length){
            case 0 :{
                this.boardstate[cardid] = playeropenstate;
                break;
            }
            case 1 :{
                if (this.board[openids[0]] == this.board[cardid]){
                    //same
                    this.boardstate[openids[0]] = carddonestate[playernum];
                    this.boardstate[cardid]     = carddonestate[playernum];
                    this.addPoint(playernum, 100);
                }else{
                    //different
                    this.boardstate[openids[0]] = cardstate.closed;
                    this.boardstate[cardid]     = playeropenstate;
                }
                break;
            }
            default :{
                for (let id of openids) this.boardstate[id] = cardstate.closed;
                break;
            }
        }
    }

    isDone() : boolean {
        for (let cs of this.boardstate) if (cs == cardstate.closed) return false;
        return true;
    }

    sendInput(inp : gameinput) : void{
        if (inp == null) return;
        let playernum = this.playerorder.indexOf(inp.uid);
        if (playernum < 0) return;
        this.clickCard(playernum, inp.clicked_card);
    }

    getState() : gamestate {
        let gamestate : gamestate = {
            board       : this.board,
            boardstate  : this.boardstate,
            players     : this.players,
            playerorder : this.playerorder,
        }
        return gamestate;
    }
}

