<script lang="ts">
    import {afterUpdate } from 'svelte';
    import { io } from '../../lib/webSocketConnection.js';
    import { socketevent } from '../../lib/types'
    import type { chatmessage, id_dict, color, room } from '../../lib/types'

    export let roomdata : room;

    let color_dict : id_dict<color> = {};
    let chat : chatmessage[] = [];
    $: color_dict = roomdata != null ? roomdata.membercolors : {};
    $: chat = roomdata != null ? roomdata.chat : [];

    afterUpdate(() => {
        const div_message_container = document.getElementById('message-container');
        if (div_message_container == null) return
        div_message_container.scrollTop = div_message_container.scrollHeight;
    })

    function chat_send(msg : string){ io.emit(socketevent.CHAT_MSG, msg); }
    function onSubmitChat(event : Event){
        let form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        let msg : string | File | null = formData.get('msg');
        if (typeof msg == 'string') chat_send(msg);
        form.reset();
    }

</script>

<style>
    .chatbox-container{
        position: fixed; 
        background-color: #00000050;
        bottom:10px;
        width: 340px;
        padding: 10px;
        border-radius: 10px;
    }

    /* width */
    ::-webkit-scrollbar {
      width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #888888; 
    }
     
    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #f1f1f1; 
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #aaaaaa; 
    }

    .chatname{
        font-size: 0.7em;
        color: white;
        padding: 2px 10px 2px 8px;
        border-radius: 5px;
    }
    .chatmsg{
        padding-left: 10px;
        word-wrap: break-word;
    }
    .chatbox{
        margin-top: 5px;
    }
    #chatinput{
        width: 80%;
    }
    #chatbutton{
        float: right;
    }
    .message-container{
        max-height: 100px;
        overflow-y: scroll;
        margin-bottom: 10px;
    }
</style>

<div class='chatbox-container'>
    <div class='message-container' id='message-container'>
        {#each chat as chatmessage }
            <div class="chatbox">
                <span class="chatname" style="background-color:{color_dict[chatmessage.id]}">{chatmessage.id}</span>
                <div class="chatmsg">{chatmessage.message}</div>
            </div>
        {/each}
    </div>
    <!-- <form on:submit|preventDefault={onSubmit}> -->
    <form on:submit|preventDefault={onSubmitChat}>
        <input type="text" id="chatinput" name="msg" autocomplete="off" value=""/>
        <button type="submit" id="chatbutton">Send</button>
    </form>
</div>
