<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import { userstate, socketevent } from '../lib/types';
    import type { room, user, id, id_dict, color, scoredata } from '../lib/types';
    import type { gamestate, square, gameinput } from '../games/tiktakto';
    import Game_Finish from './Game_Finish.svelte';

    export let userdata : user;
    export let f_updatescore : (uscore : id_dict<number>) => void;
    export let playercolors  : id_dict<color> = {};

    let finished : boolean = false;
    var gamestate : gamestate = {
        board : [], currentplayer : 0,
        players : {}, playerorder : [],
    };

    function get_scoredata(gs : gamestate) : scoredata[] {
        let res : scoredata[] = [];
        for (let uid in gamestate.players)
            res.push({id:uid, name:gamestate.players[uid].name, score : gamestate.players[uid].score})
        let comparescore = (a : scoredata, b : scoredata) => {
            if (a.score > b.score) return 1;
            if (b.score > a.score) return -1;
            return 0;
        };
        res.sort((a,b) => comparescore(a,b));
        return res;
    }
    function get_curr_player_id(gs : gamestate) : id{
        return gs.playerorder[gs.currentplayer]
    }
    function get_next_player_id(gs : gamestate) : id{
        return gs.playerorder[(gs.currentplayer + 1) % gs.playerorder.length]
    }

    onMount(() => {
        io.removeAllListeners(socketevent.GAME_UPDATESTATE);
        io.emit(socketevent.GAME_INPUT, null);
        io.on(socketevent.GAME_UPDATESTATE, (gs : gamestate) => {
            gamestate = gs;

            // update score
            let userscore : id_dict<number> = {};
            for (let uid in gamestate.players) 
                userscore[uid] = gamestate.players[uid].score;
            f_updatescore(userscore);
        });
        io.on(socketevent.GAME_FINISH, () => {
            finished = true;
        });
    });
</script>

<style>
    .main {
        font-family:'Noto Sans';
        margin: auto;
        max-width: 340px;
        margin-top: 20px;
    }

    .board{
        width: 100%;
        background-color: white;
        border-radius: 5px;
        display: grid;
        grid-gap: 4px;
        padding: 4px;
        grid-template-columns: repeat(5, 1fr);
        margin: 10px 0px 10px;
    }
    .boardcell{
        aspect-ratio: 1/1;
        border: none; 
        border-radius: 5px;
        background-color: #1E1B18;
        color: white;
    }
    .boardcell:hover{
        background-color: #5E5B58;
        cursor: pointer;
    }
    .turn-next{
        float:right;
    }
    .turn-indicator-id{
        border-radius: 10px;
        padding: 2px 5px 2px;
    }
</style>

<div id="main-container" class="main">
    <div class="turn-indicator-container">
        <span class="turn-indicator turn-current">
            <span class="turn-indicator-id" style="background-color:{playercolors[get_curr_player_id(gamestate)]}">
                {get_curr_player_id(gamestate)}
            </span>
        </span>'s turn
        <span class="turn-indicator turn-next">
            next :
            <span class="turn-indicator-id" style="background-color:{playercolors[get_next_player_id(gamestate)]}">
                {get_next_player_id(gamestate)}
            </span>
        </span>
    </div>
    <div class="board">
        {#each gamestate.board as row, j}
            {#each row as symbol, i}
                <button class="boardcell">{symbol}{j}{i}
                </button>
            {/each}
        {/each}
    </div>
</div>
