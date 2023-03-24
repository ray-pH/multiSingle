<script>
    function onSubmit(e) {
        const formData = new FormData(e.target);
        const data = {};
        for (let field of formData) {
          const [key, value] = field;
          data[key] = value;
        }
        console.log(data)
    }
</script>

<style>
    .login-container{
        font-family : 'Noto Sans';
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<div class='login-container'>
    <div class='login-box'>
        <h1>Multisingle</h1>
        <form on:submit|preventDefault={onSubmit}>
            <div>
                <label for="name">Username</label>
                <input type="text" id="email" name="email" value=""/>
            </div>
            <div>
              <label for="name">Password</label>
              <input type="password" id="password" name="password" value=""/>
          </div>
            <button type="submit">Submit</button>
        </form>
    </div>
</div>

