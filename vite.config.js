import { defineConfig } from 'vite'

const baseConfig = {
    base: process.env.VITE_BASE_PATH
}

console.log(process.env)

function getConfig() {
    return baseConfig;
}

export default defineConfig(getConfig())
