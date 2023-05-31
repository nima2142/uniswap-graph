// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineNuxtConfig} from 'nuxt/config'

export default defineNuxtConfig({
    // @ts-ignore
    modules: [
        'nuxt-windicss',
    ],
    // @ts-ignore
    ssr: false,
    // @ts-ignore
    css: [
        'virtual:windi.css',
        'virtual:windi-devtools',
        'vue-json-pretty/lib/styles.css',
    ],
})
