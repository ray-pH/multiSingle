<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import type { room, user, id, id_dict, roomsetting } from '../lib/types';
    import { userstate, socketevent, games } from '../lib/types';
    import { onMount } from 'svelte';

    import Button from './module/Button.svelte';

    export let userdata : user;

    function onLogin(event : Event){
        let form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        let username : string | File | null = formData.get('username');
        if (typeof username == 'string'){
            username = username.trim();
            if (username.length == 0){
                alert('Username is not valid');
                return;
            }
            io.emit(socketevent.USER_LOGIN, username);
        }
    }

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
        align-items: center;
        justify-content: center;
        text-align: center;
        height: 100%;
    }
    .content {
        margin-top: 50px;
        align-items: center;
        text-align: center;
        justify-content: center;
    }
    .title {
        font-size: 2em;
        font-weight: bold;
        margin-bottom: 20px;
    }
    #username {
        margin-bottom: 10px;
    }
</style>

<div id="main-container" class="main">
    <div class="content">
        <img src="favicons/android-chrome-512x512.png" alt="multisingle logo" width="200px">
        <div class="title">MULTISINGLE</div>
        UserID : {userdata.id}
        <br>
        Username :
        <form on:submit|preventDefault={onLogin}>
            <input type="text" id="username" name="username" autocomplete="off" value=""/>
            <br>
            <Button text='Login'  typesubmit={true}
                --margin='0px 10px 0px 0px' --textcolor='white' --bordercolor='white'/>
        </form>
    </div>
</div>
