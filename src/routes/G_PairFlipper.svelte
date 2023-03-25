<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import { userstate, socketevent } from '../lib/types'
    import type { room, user, id, id_dict, color } from '../lib/types'
    import type { gamestate, card, gameinput } from '../games/pairFlipper'
    import { cardstate, cardopenstate } from '../games/pairFlipper'

    export let userdata : user;
    export let f_updatescore : (uscore : id_dict<number>) => void;
    export let playercolors  : id_dict<color> = {};

    var gamestate : gamestate = {
        board : [], boardstate : [], 
        players : {}, playerorder : [],
    };

    function get_color_from_cardstate(cs : cardstate) : color {
        let playernum : number = cardopenstate.indexOf(cs);
        if (playernum < 0) return '#00000000';
        // TODO warn if playernum not exist
        let uid : id = gamestate.playerorder[playernum];
        return playercolors[uid];
    }

    function get_cardlist(gs : gamestate) : {index : number, value : card, cardstate : cardstate}[] {
        let res = new Array(gs.board.length);
        for (let i in gs.board) res[i] = {index : i, value : gs.board[i], cardstate : gs.boardstate[i]};
        return res;
    }

    function send_input(cardid : number){
        let inp : gameinput = {uid : userdata.id, clicked_card : cardid};
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
    });

</script>

<style>
    :root{
        --cblack: #1E1B18;
        --cpink: #D8315B;
        --cwhite: #FFFAFF;
        --ccyan: #3E92CC;
        --cblue: #0A2463;
        --cgreen: #04BF55;
        --cyellow: #FFE54C;
    }
    .main {
        font-family:'Noto Sans';
        margin: auto;
        max-width: 340px;
    }
    #card-container {
        display: flex;
    }
    .card-bg{
        padding: 5px;
        margin : 5px;
    }
    .card {
        padding : 10px;
        background-color: white;
        color: black;
    }
</style>

<div id="main-container" class="main">
    <div id="card-container">
        {#each get_cardlist(gamestate) as cd}
            <div class="card-bg" style="background-color:{get_color_from_cardstate(cd.cardstate)}">
                <button class="card" on:click={() => {send_input(cd.index)}}>
                    {cd.value}
                </button>
            </div>
        {/each}
    </div>
</div>
