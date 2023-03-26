<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict } from '../lib/types'
    import { userstate, socketevent } from '../lib/types'
    import * as audio from '../lib/soundlib.js'

    export let userdata : user;
    export let roomlist : id_dict<room>;

    function room_new(){ io.emit(socketevent.ROOM_NEW); }
    function room_join(roomid : id){ io.emit(socketevent.ROOM_JOIN, roomid); }
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

    /*@media (min-width: 768px) {
        .button {
            padding: 13px 50px 13px;
        }
    }*/

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
        <button on:mouseenter={audio.play_hover} 
                on:click={() => audio.play_then_run(audio.button_click, room_new)}
            class="topbutton button">New room</button>
        <button on:mouseenter={audio.play_hover} on:click={()=>{}}
            class="topbutton button" >Join room</button>
    </div>

    <div id="room-container">
        <span class="container-label">Public Rooms :</span>
        <div id="roomlist-container">
            {#each Object.keys(roomlist) as rid}
                <button on:click={() => {room_join(rid)}}
                    class="roombutton button">{rid} (host : {roomlist[rid].hostid})</button>
            {/each}
        </div>
    </div>
</div>
