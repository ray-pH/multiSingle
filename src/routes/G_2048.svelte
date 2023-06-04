<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import { arrayEq } from '$lib/utils.js';
    import { userstate, socketevent } from '../lib/types';
    import type { room, user, id, id_dict, color, scoredata } from '../lib/types';
    import type { gamestate, gameinput } from '../games/g2048';
    import { direction } from '../games/g2048';
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
    function get_prev_player_id(gs : gamestate) : id{
        return gs.playerorder[(gs.currentplayer + gs.playerorder.length - 1) % gs.playerorder.length]
    }

    function send_input(dir : direction) : void{
        if (get_curr_player_id(gamestate) != userdata.id) return; // if not this player turn, skip
        let inp : gameinput = {
            uid : userdata.id,
            direction : dir,
        }
        io.emit(socketevent.GAME_INPUT, inp);
    }

    function onKeydown(e : KeyboardEvent){
        if (document.activeElement != document.body) return;
        let map : Map<string, direction> = new Map([
            ["ArrowLeft" , direction.LEFT],
            ["ArrowRight", direction.RIGHT],
            ["ArrowUp"   , direction.UP],
            ["ArrowDown" , direction.DOWN],
        ]);
        let dir = map.get(e.key);
        if (dir != undefined) send_input(dir);
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
        grid-template-columns: repeat(6, 1fr);
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
        text-align: center;
    }
    .cell-value{
        vertical-align: middle;
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
    <div class="board" on:keydown|preventDefault={onKeydown}>
        {#each gamestate.board as row}
        {#each row as square}
            {#if square.value == 0}
                <div class="board-cell" style="background-color:grey">
                </div>
            {:else}
                <div class="board-cell" style="background-color:{playercolors[get_prev_player_id(gamestate)]}">
                    <span class="cell-value">
                        {square.value}
                    </span>
                </div>
            {/if}
        {/each}
        {/each}
    </div>
</div>

{#if finished}
    <Game_Finish scoredata={get_scoredata(gamestate)} playercolors={playercolors}/>
{/if}
<svelte:window on:keydown={onKeydown} />
