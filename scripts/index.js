import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import App from '../components/App.vue'

import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import '../css/googlefonts.css'
import '../css/index.css'

import '../scripts/lib/encode.js'
import '../scripts/lib/hash.js'
import '../scripts/lib/payload.js'

Vue.use(Vuetify)

new Vue({
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app')
