<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict, roomsetting } from '../lib/types';
    import { userstate, socketevent, games } from '../lib/types';

    import Button from './module/Button.svelte';

    export let userdata : user;
    export let roomlist : id_dict<room>;

    let state_setroom : boolean = false;
    // room setting variables
    let selected_game_id : number = -1;

    function get_roomsetting() : roomsetting {
        let selected_game = Object.values(games)[selected_game_id] as games;
        return { game : selected_game };
    }

    function get_roomHostID(roomid : id) : id {
        return roomlist[roomid].hostid;
    }
    function get_roomHostUname(roomid : id) : string {
        let hostid = get_roomHostID(roomid);
        let hostuser : user = roomlist[roomid].members[hostid];
        if (hostuser) return hostuser.name;
        else return 'null';
    }

    function room_new(setting: roomsetting){ io.emit(socketevent.ROOM_NEW, setting); }
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
        margin-bottom: 10px;
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

    .game-selection{
        padding:5px;
        margin: 2px;
    }
    .game-selection.game-selected{
        background-color: var(--ccyan);
        color: white;
    }

    .title-container {
        width: 100%;
        text-align: center;
        margin: 20px 0 20px 0;
    }

    .github-link{
        text-decoration:none;
        color: black;
        background-color: white;
        padding: 2px 10px 2px;
        border-radius: 10px;
    }
    .github-link:hover{
        color: white;
        background-color: #3e92cc;
    }
    .github-link:visited{
        text-decoration:none;
    }
</style>

<div id="main-container" class="main">
    <!-- <button on:click={sendDebug}>debug</button> -->
    <!-- <div id="userinfo-container"> -->
    <!--     UserID   : {userdata.id}<br> -->
    <!--     Username : {userdata.name}<br> -->
    <!-- </div> -->
    <!--     room     : {userdata.roomid}<br> -->
    <div class="title-container">
        <img src="favicons/android-chrome-512x512.png" alt="multisingle logo" width="80px">
        <br><a href="https://github.com/ray-pH/multiSingle" class="github-link">@GitHub</a>
        <br><br> Username : {userdata.name}
    </div>

    {#if state_setroom}
        <!-- SetRoom ================================== -->
        <div class="topbutton-container">
            <Button text='Cancel'  action={()=>{state_setroom = false}} 
                --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
        </div>
        <div id="room-container">
            <span class="container-label">Select Game :</span>
            <div id="roomlist-container">
                {#each Object.values(games) as gamename, i}
                    <button class:game-selected="{selected_game_id == i}" class="game-selection"
                         on:click={()=>{selected_game_id = i}}>
                         {gamename}
                    </button>
                {/each}
            </div>
        </div>
        {#if selected_game_id >= 0}
            <Button text='Next'  action={() => {room_new(get_roomsetting())}} 
                --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
        {:else}
            <Button text='Next' disabled 
                --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
        {/if}
    {:else}
        <!-- Lobby ================================== -->
        <div class="topbutton-container">
            <!-- <Button text='New Room'  action={room_new} --> 
            <!--     --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/> -->
            <Button text='New Room'  action={()=>{state_setroom = true}} 
                --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
            <Button text='Join Room' action={()=>{}} 
                --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
        </div>

        <div id="room-container">
            <span class="container-label">Public Rooms :</span>
            <div id="roomlist-container">
                {#each Object.keys(roomlist) as rid}
                    <!-- <Button text='{rid} (host : {roomlist[rid].hostid})' --> 
                    <Button text='{get_roomHostUname(rid)} ({rid})' 
                        action={() => room_join(rid)} 
                        --margin='10px 0px 0px 0px' --textcolor='white' --width='100%'/>
                {/each}
            </div>
        </div>
    {/if}

</div>
