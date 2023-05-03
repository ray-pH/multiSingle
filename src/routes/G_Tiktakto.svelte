<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import { userstate, socketevent } from '../lib/types';
    import type { room, user, id, id_dict, color, scoredata } from '../lib/types';
    import type { gamestate, gameinput } from '../games/tiktakto';
    import { square } from '../games/tiktakto';
    import Game_Finish from './Game_Finish.svelte';

    export let userdata : user;
    export let f_updatescore : (uscore : id_dict<number>) => void;
    export let playercolors  : id_dict<color> = {};

    type squareSymbol = square.X | square.O;

    let finished : boolean = false;
    let selected_symbol : squareSymbol = square.X;
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

    function send_input(pos : [number, number], sym : squareSymbol){
        let inp : gameinput = {
            uid : userdata.id,
            position : pos,
            symbol : sym,
        }
        io.emit(socketevent.GAME_INPUT, inp);
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
    .board-cell{
        aspect-ratio: 1/1;
        border: none; 
        border-radius: 5px;
        background-color: #1E1B18;
        color: white;
        font-size: 30px;
        font-weight: bold;
    }
    .board-cell:hover{
        background-color: #5E5B58;
        cursor: pointer;
    }
    .board-cell:disabled{
        background-color: #1E1B18;
        cursor: default;
    }
    .turn-next{
        float:right;
    }
    .turn-indicator-id{
        border-radius: 10px;
        padding: 2px 5px 2px;
    }
    .symbolbutton{
        background-color: white;
        aspect-ratio: 1/1;
        border: none; 
        border-radius: 5px;
        width: 50px;
        font-size: 20px;
        font-weight: bold;
    }
    .symbolbutton:hover{
        background-color: #5E5B58;
        color: white;
        cursor: pointer;
    }
    .symbolbutton.selected-symbol{
        background-color: var(--selfcolor, #3E92CC);
        color: white;
    }
    .symbolbutton.selected-symbol:hover{
        cursor: default;
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
        {#if get_curr_player_id(gamestate) == userdata.id}
            <!-- this player turn -->
            {#each gamestate.board as row, j}
                {#each row as symbol, i}
                    <button class="board-cell empty-cell"
                            on:click={()=>{send_input([j,i], selected_symbol)}}>
                            {symbol}
                    </button>
                {/each}
            {/each}
        {:else}
            <!-- other player turn -->
            {#each gamestate.board as row, j}
                {#each row as symbol, i}
                    <button disabled class="board-cell empty-cell">
                            {symbol}
                    </button>
                {/each}
            {/each}
        {/if}
    </div>
    <button class="symbolbutton" class:selected-symbol={selected_symbol==square.X}
            on:click={()=>{selected_symbol=square.X}}>X</button>
    <button class="symbolbutton" class:selected-symbol={selected_symbol==square.O}
            on:click={()=>{selected_symbol=square.O}}>O</button>
</div>

{#if finished}
    <Game_Finish scoredata={get_scoredata(gamestate)} playercolors={playercolors}/>
{/if}
