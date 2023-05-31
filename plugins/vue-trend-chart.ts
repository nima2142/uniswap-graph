// @ts-ignore
import TrendChart from 'vue-trend-chart';
// const TrendChart = require('vue-trend-chart')

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(TrendChart)
})
