import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite.js'

const PORT : number = parseInt(process.env.PORT || '3000');
export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
        server : {
            port : PORT
        },
        preview : {
            port : PORT
        },
});
