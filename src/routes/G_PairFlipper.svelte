<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import { userstate, socketevent } from '../lib/types';
    import type { room, user, id, id_dict, color, scoredata } from '../lib/types';
    import type { gamestate, card, gameinput } from '../games/pairFlipper';
    import { cardstate, cardopenstate, carddonestate } from '../games/pairFlipper';
    import FlipCard from './module/FlipCard.svelte';
    import Game_Finish from './Game_Finish.svelte';

    export let userdata : user;
    export let f_updatescore : (uscore : id_dict<number>) => void;
    export let playercolors  : id_dict<color> = {};

    let finished : boolean = false;
    var gamestate : gamestate = {
        board : [], boardstate : [], 
        players : {}, playerorder : [],
    };
    //const imageModules = import.meta.glob("../../static/*.jpg");
    const img_count = 48;
    let image_urls = [...Array(img_count).keys()]
        .map(x => `/images/hanafuda/${(x+1).toString().padStart(2,'0')}.gif`);


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
        io.on(socketevent.GAME_FINISH, () => {
            finished = true;
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
    .divbutton{
        padding: 0;
        margin: 0;
        background-color: transparent;
        color: black;
        border: none;
    }
    #card-container {
        width: 100%;
        display: grid;
        grid-gap: 4px;
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    }
    .card-bg{
        aspect-ratio: 68/118;
        padding: 5px;
    }
    .card {
        width: 100%;
        height: 100%;
    }
</style>

<div id="main-container" class="main">
    <div id="card-container">
        {#each get_cardlist(gamestate) as cd}
            <div class="card-bg" style="background-color:{get_color_from_cardstate(cd.cardstate)}">
                <button class="card divbutton" on:click={() => {send_input(cd.index)}}>
                    <FlipCard value={cd.value} 
                        img_front={image_urls[parseInt(cd.value)]}
                        opened={cardopenstate.includes(cd.cardstate) || carddonestate.includes(cd.cardstate)}/>
                </button>
            </div>
        {/each}
    </div>
</div>

{#if finished}
    <Game_Finish scoredata={get_scoredata(gamestate)} playercolors={playercolors}/>
{/if}
