<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict } from '../lib/types'
    import { onMount } from 'svelte';
    import { userstate, socketevent } from '../lib/types'
    import type { gamestate, card } from '../games/pairFlipper'
    import type { cardstate } from '../games/pairFlipper'

    export let f_updatescore : (uscore : id_dict<number>) => void;

    var gamestate : gamestate = {
        board : [], boardstate : [], 
        players : {}, playerorder : {},
    };

    function get_cardlist(gs : gamestate) : {card : card, cardstate : cardstate}[] {
        let res = new Array(gs.board.length);
        for (let i in gs.board) res[i] = {card : gs.board[i], cardstate : gs.boardstate[i]};
        return res;
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
    .card {
        padding : 10px;
    }
</style>

PairFlipper

<div id="main-container" class="main">
    <div id="card-container">
        {#each get_cardlist(gamestate) as cd}
            <div class="card">
                {cd.card}
            </div>
        {/each}
    </div>
</div>
