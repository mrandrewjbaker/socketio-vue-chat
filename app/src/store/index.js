import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		chatroom_connected: false,
		username: ""
	},
	actions: {
		chatroom_connected(state, data){
			state.commit('chatroom_connected', data)
		},
		username(state, data){
			state.commit('username', data)
		}

	},
	mutations: {
		chatroom_connected(state, data){
			state.chatroom_connected = data
		},
		username(state, data){
			state.username = data
		}
	},
	getters:{
		chatroom_connected(state){
			return state.chatroom_connected
		},
		username(state){
			return state.username
		}
	},
	modules: {

	}
})
