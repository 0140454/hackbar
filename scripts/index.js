import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import App from '../components/App.vue'

import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import '../css/googlefonts.css'
import '../css/index.css'

import './lib/encode'
import './lib/hash'
import './lib/payload'

Vue.use(Vuetify)

new Vue({
  name: 'HackBar',
  vuetify: new Vuetify(),
  render: h => h(App),
}).$mount('#app')
