<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict } from '../lib/types';
    import { userstate, socketevent } from '../lib/types';
    import { audio_init, play_instance, play_then_run } from '../lib/soundlib.js';
    let audio = audio_init();
    let play_hover = ()=>play_instance(audio.button_hover);

    export let userdata : user;
    export let roomdata : room;

    function is_allReady(members : id_dict<user>) : boolean {
        for (let uid in members){
            if (members[uid].state == userstate.room_wait)
                return false;
        }
        return true;
    }

    function room_leave(){ io.emit(socketevent.ROOM_LEAVE); }
    function game_toggleready(){ io.emit(socketevent.GAME_TOGGLEREADY); }
    function game_requeststart(){ io.emit(socketevent.GAME_REQUESTSTART); }
    function sendDebug(){ io.emit('debug', null); }
</script>

<style>
    :root{
        --cblack: #1E1B18;
        --cpink: #D8315B;
        --cwhite: #FFFAFF;
        --ccyan: #3E92CC;
        --cblue: #0A2463;
        --cyellow: #FFE54C;
        --cgreen: #04BF55;
        --cgrey: #666666;
    }
    .main {
        font-family:'Noto Sans';
        margin: auto;
        max-width: 340px;
    }
    #room-container{
        background-color: var(--cwhite);
        color: var(--cblack);
        padding: 20px;
        z-index: 0;
        margin-top: 10px;
        border-radius: 10px;
    }
    #playerlist-container{
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
        transition: 0.2s; 
    }
    .button:disabled:after {
        background-color: var(--cgrey);
    }

    .button:hover:after {
        top: 0px; left: 0px;
    }

    .topbutton{
        margin-right: 10px;
        color: white;
        border-color: white;
    }
    .botbutton{
        margin-right: 10px;
        color: white;
        border-color: white;
    }
    .playersettingbutton{
        padding: 1px 10px 1px;
        float: right;
    }
    .playerelem-status{
        float: right;
        font-size: 12px;
        margin-right: 5px;
        font-weight: bold;
        color: var(--ccyan);
    }

    .topbutton-container{
        margin: 10px 0 20px 0;
    }
    .botbutton-container{
        margin: 10px 0 20px 0;
    }
    .botinfo{
        float: right;
        font-weight: bold;
        font-size: 0.8em;
    }
</style>

<div id="main-container" class="main">
    <button on:click={sendDebug}>debug</button>
    <div id="userinfo-container">
        UserID   : {userdata.id}<br>
        Username : {userdata.name}<br>
        room     : {userdata.roomid}<br>
    </div>
    <div class="topbutton-container">
        <button on:mouseenter={play_hover}
                on:click={()=>play_then_run(audio.button_click, room_leave)}
            class="topbutton button" >Leave room</button>
    </div>

    <div id="room-container">
        <span class="container-label">Players :</span>
        <div id="playerlist-container">
            {#if roomdata != null}
            {#each Object.keys(roomdata.members) as uid}
                <div class="playerelem-container">
                    <span class="playerelem-name">{uid}</span>
                    <button class="button playersettingbutton">+</button>
                    <span class="playerelem-status">{roomdata.members[uid].state}</span>
                </div>
            {/each}
            {/if}
        </div>
    </div>

    <div class="botbutton-container">
        {#if roomdata != null}
            {#if roomdata.hostid == userdata.id}
                <!-- if host -->
                {#if is_allReady(roomdata.members)}
                    <button on:mouseenter={play_hover}
                            on:click={()=>play_then_run(audio.button_click, game_requeststart)}
                        class="botbutton button" >Start</button>
                {:else}
                    <button disabled class="botbutton button" on:click={() => {}}>Start</button>
                    <span class="botinfo">not everyone is ready</span>
                {/if}
            {:else if userdata.state == userstate.room_wait}
                <button class="botbutton button" on:click={game_toggleready}>Ready</button>
            {:else}
                <button class="botbutton button" on:click={game_toggleready}>Cancel Ready</button>
            {/if} 
        {/if}
    </div>
</div>
