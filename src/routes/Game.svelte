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
    /*#room-container{
        background-color: var(--cwhite);
        color: var(--cblack);
        padding: 20px;
        z-index: 0;
        margin-top: 10px;
        border-radius: 10px;
    }
    #roomlist-container{
        position: relative;
        z-index: 1;
    }
    .container-label {
        font-weight: bold;
    }
    .button {
        font-size: 16px; font-weight: 200; letter-spacing: 1px;
        outline: 0; border: 1px solid black; background-color: rgba(0, 0, 0, 0);
        cursor: pointer; position: relative;
        padding: 13px 30px 13px;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .button:after {
        background-color: var(--ccyan);
        content: ""; width: 100%;
        position: absolute; z-index: -1;
        height: 100%;
        top: 7px; left: 7px;
        transition: 0.2s; }

    .button:hover:after {
        top: 0px; left: 0px;
    }

    @media (min-width: 768px) {
        .button {
            padding: 13px 50px 13px;
        }
    }

    .topbutton-container{
        margin: 10px 0 20px 0;
    }
    .roombutton{
        margin-top: 10px;
        color: white;
        width: 100%;
    }
    .topbutton{
        margin-right: 10px;
        color: white;
        border-color: white;
    }*/
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
        <G_PairFlipper playercolors={roomdata.membercolors} f_updatescore={f_updatescore}/>
    {/if}

<!--     <button on:click={sendDebug}>debug</button> -->
<!--     <div id="userinfo-container"> -->
<!--         UserID   : {userdata.id}<br> -->
<!--         Username : {userdata.name}<br> -->
<!--         room     : {userdata.roomid}<br> -->
<!--     </div> -->
<!--     <div class="topbutton-container"> -->
<!--         <button class="topbutton button" on:click={room_new}>New room</button> -->
<!--         <button class="topbutton button" on:click={()=>{}}>Join room</button> -->
<!--     </div> -->

<!--     <div id="room-container"> -->
<!--         <span class="container-label">Public Rooms :</span> -->
<!--         <div id="roomlist-container"> -->
<!--             {#each Object.keys(roomlist) as rid} -->
<!--                 <button on:click={() => {room_join(rid)}} -->
<!--                     class="roombutton button">{rid} (host : {roomlist[rid].hostid})</button> -->
<!--             {/each} -->
<!--         </div> -->
<!--     </div> -->
</div>
