<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict } from '../lib/types';
    import { userstate, socketevent } from '../lib/types';

    import Button from './module/Button.svelte';

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


    .topbutton-container{
        margin: 10px 0 20px 0;
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
        <Button text='New Room'  action={room_new} 
            --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
        <Button text='Join Room' action={()=>{}} 
            --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
    </div>

    <div id="room-container">
        <span class="container-label">Public Rooms :</span>
        <div id="roomlist-container">
            {#each Object.keys(roomlist) as rid}
                <Button text='{rid} (host : {roomlist[rid].hostid})' 
                    action={() => room_join(rid)} 
                    --margin='10px 0px 0px 0px' --textcolor='white' --width='100%'/>
            {/each}
        </div>
    </div>

</div>
