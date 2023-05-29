<script lang="ts">
    import { audio_init, play_instance, play_then_run } from '../../lib/soundlib.js';
    import { onMount } from 'svelte';


    type audiolib = {[key : string] : HTMLAudioElement};
    let audio : audiolib;
    let play_hover : Function;

    onMount(() => {
        audio = audio_init();
        play_hover = ()=>play_instance(audio.button_hover);
    });

    // css variables --padding --margin --color --bordercolor --textcolor --width
    export let action : Function = () => {};
    export let text   : string = 'button';

    export let disabled : boolean = false;
    export let typesubmit   : boolean = false;
</script>

{#if disabled}
    <button disabled class="button">{text}</button>
{:else if typesubmit}
    <button on:mouseenter={play_hover} 
            on:click={() => play_then_run(audio.button_click, action)}
            type="submit"
            class="button">{text}</button>
{:else}
    <button on:mouseenter={play_hover} 
            on:click={() => play_then_run(audio.button_click, action)}
            class="button">{text}</button>
{/if}

<style>
    .button {
        float: var(--float, none);
        width: var(--width, auto);
        font-size: 16px; font-weight: 200; letter-spacing: 1px;
        color: var(--textcolor, black);
        outline: 0; 
        border: 1px solid black; 
        background-color: rgba(0, 0, 0, 0);
        border-color: var(--bordercolor, black);
        cursor: pointer; 
        position: relative;
        padding: var(--padding,13px 30px 13px);
        margin : var(--margin, 0px);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .button:after {
        background-color: var(--color, #3E92CC);
        content: ""; width: 100%;
        position: absolute; z-index: -1;
        height: 100%;
        top: 7px; left: 7px;
        transition: 0.2s; 
    }
    .button:disabled:after {
        background-color: var(--discolor, #666666);
    }

    .button:hover:after {
        top: 0px; left: 0px;
    }

    /*@media (min-width: 768px) {
        .button {
            padding: 13px 50px 13px;
        }
    }*/
</style>

