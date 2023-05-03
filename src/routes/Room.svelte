<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict } from '../lib/types';
    import { userstate, socketevent } from '../lib/types';
    import Button from './module/Button.svelte';
    import ChatBox from './module/ChatBox.svelte';

    export let userdata : user;
    export let roomdata : room;

    function is_allReady(members : id_dict<user>) : boolean {
        for (let uid in members){
            if (!(members[uid].state == userstate.room_ready || members[uid].state == userstate.room_host))
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
        <Button text='Leave Room'action={room_leave} 
            --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
    </div>

    <div id="room-container">
        <span class="container-label">Players :</span>
        <div id="playerlist-container">
            {#if roomdata != null}
            {#each Object.keys(roomdata.members) as uid}
                <div class="playerelem-container">
                    <span class="playerelem-name">{uid}</span>
                    <Button text='+'
                        --padding='1px 10px 1px' --float='right' --color={roomdata.membercolors[uid]}/>
                        <span class="playerelem-status"
                            style="color:{roomdata.membercolors[uid]}"
                            >{roomdata.members[uid].state}</span>
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
                    <Button text='Start' action={game_requeststart}
                        --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
                {:else}
                    <Button text='Start' disabled={true}
                        --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
                    <span class="botinfo">not everyone is ready</span>
                {/if}
            {:else if userdata.state == userstate.room_wait}
                <Button text='Ready' action={game_toggleready} 
                    --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
            {:else}
                <Button text='Cancel Ready' action={game_toggleready} 
                    --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
            {/if} 
        {/if}
    </div>

    <!-- <ChatBox chat={roomdata.chat} color_dict={roomdata.membercolors}/> -->
    <ChatBox roomdata={roomdata}/>
</div>
