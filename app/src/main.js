import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import io from 'socket.io-client'


Vue.config.productionTip = false


Vue.use({
	install (Vue) {
    Vue.prototype.socket = io("http://bentobuilder.com:3000")
    
	}
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
