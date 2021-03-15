<template>
  <div id="app">
	<div id="nav">
	  <!-- <router-link to="/">Home</router-link> |
	  <router-link to="/about">About</router-link> |
	  <router-link to="/chat">Chat</router-link> -->
	</div>
	<router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy)

export default {
	name: "App",
	mounted() {
		var vthis = this;
		vthis.socket.on("connect", function(){
			vthis.$store.dispatch('chatroom_connected', true)
		})
	},
}
</script>

<style lang="scss">
	#app{
		padding: 0;
	}

</style>
