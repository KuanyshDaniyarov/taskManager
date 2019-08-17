import Vue from 'vue'
import App from './App.vue'

import router from './plugins/router'
import store from './plugins/store'
import i18n from './plugins/i18n'

import axios from 'axios'
import jwt from './jwt.js'

import 'typeface-roboto/index.css'

import './plugins/iview'

Vue.config.productionTip = false

jwt(axios);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
