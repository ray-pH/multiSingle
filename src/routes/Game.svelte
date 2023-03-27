<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict, roomsetting } from '../lib/types'
    import { userstate, games, colors } from '../lib/types'

    import G_PairFlipper from './G_PairFlipper.svelte'

    export let userdata : user;
    export let roomdata : room;
    let userscore : id_dict<number> = {};

    function f_updatescore(uscore : id_dict<number>){
        userscore = uscore;
    }
    function get_score(uid : id, uscore : id_dict<number>) : string {
        if (!(uid in uscore)) return '-';
        return (uscore[uid]).toString();
    }
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
    .playerinfo {
        padding: 5px 10px 5px;
        border-radius: 10px;
        margin-bottom: 5px;
    }
    .playerscore {
        float: right;
    }
</style>

<div id="main-container" class="main">
    <div id="playerlist-container">
        {#each Object.keys(roomdata.members) as uid}
            <div class="playerinfo" style="background-color:{roomdata.membercolors[uid]}">
                {uid}
                <span class="playerscore">{get_score(uid, userscore)}</span>
            </div>
        {/each}
    </div>
    inGame
    {#if roomdata.setting.game == games.pairFlipper}
        <G_PairFlipper userdata={userdata} playercolors={roomdata.membercolors} f_updatescore={f_updatescore}/>
    {/if}
</div>
