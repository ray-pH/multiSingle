<script>
    import App from "./App.svelte";
    import Login from "./Login.svelte";
    import Chat from "./Chat.svelte";
</script>

<style>
    :global(body){
        background-color: #1E1B18;
        color: white;
    }
</style>

<svelte:head>
    <title>MultiSingle</title>
    <meta charset="utf-8" />
    <meta property="og:image" content="https://github.com/ray-pH/multiSingle/blob/main/static/favicon.png"/>
    <meta property="og:description" content="multiSingle"/>
    <meta property="og:url"content="https://multisingle.photon-ray.xyz/"/>
    <meta property="og:title" content="multiSingle">
</svelte:head>


<div class="main">
    <App />
</div>
<!-- <Login /> -->
<!-- <Chat/> -->
