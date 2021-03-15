<template>
	<div class="chat">
		<!-- <p>{{username}}</p> -->
		<div class="container">
			<div class="toggle_users">
				<b-button class="is-info toggle_users_button" @click="toggle_sidebar"><b-icon :icon="sidebar_toggle_icon"/></b-button>
			</div>
			<div class="active_users" v-bind:class="{show_sidebar: sidebar_toggle, hide_sidebar: !sidebar_toggle}">
				<div class="active_users_container">
					<template v-for="user in active_users">
						<p class="active_user">{{user}}</p>
					</template>
				</div>

				
			</div>
			<div class="inbox" v-bind:class="{show_sidebar: sidebar_toggle, hide_sidebar: !sidebar_toggle}">
				<div class="inbox_messages">
					<div class="messages_log">
						<template v-for="message in message_log">
							<template v-if="message.action === 'message'">
								<p class="message my_message" v-if="message.username === username">{{message.message}}</p>
								<p class="message" v-else>{{message.username}}: {{message.message}}</p>
							</template>
							<template v-if="message.action === 'join'">
								<p class="message join_message">{{message.username}} joined</p>
							</template>
							<template v-if="message.action === 'disconnected'">
								<p class="message join_message">{{message.username}} left</p>
							</template>




						</template>
						<p class="message typing_indicator" v-show="typing_users.length > 0">
							<span v-for="(username, index) in typing_users">
								{{username}}
								<span v-if="typing_users.length>index + 1">, </span>
								<span v-else-if=""> </span>
							</span>
							<span v-if="typing_users.length===1">is</span>
							<span v-if="typing_users.length>1">are</span> typing
						</p>

					</div>

					<div class="fallback">

					</div>
				</div>
				<form class="message_form" v-on:submit.prevent="send_message">
					<input @update="indicate_typing" @input="indicate_typing" type="text" class="message_form_input" placeholder="Type a Message" v-model="message_field">
					<b-button @click="send_message" class="is-info message_form_button" >Send</b-button>
				</form>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	name: 'chat',
	data() {
		return {
			username: "",
			active_users: [],
			typing_users: [],
			message_log: [],
			message_field: "",
			message_field_previous: "",
			message_typing: false,
			typing_timer: {},
			sidebar_toggle: true,
			sidebar_toggle_icon: "close"

		}
	},
	mounted() {
		var vthis = this;
		vthis.get_temp_username()
		vthis.get_active_users()
		vthis.new_user()
		vthis.user_disconnected()
		vthis.messaging()
		vthis.listen_typing()
	},
	methods: {
		scrollToEnd: function() {    	
			var container = this.$el.querySelector(".messages_log");
			var style = window.getComputedStyle ? getComputedStyle(container, null) : container.currentStyle;
			container.scrollTop = container.scrollHeight
		},
		indicate_typing(e){
			var vthis = this;
			console.log(e.target.value)
			console.log(vthis.message_field)
			vthis.message_typing = true
			window.clearTimeout(vthis.typing_timer)
			vthis.typing_timer = window.setTimeout(function(){
				vthis.message_typing = false
				vthis.send_stop_typing()
				
			},5000)
			this.send_typing()

			vthis.message_field_previous = vthis.message_field

		},
		send_stop_typing(){
			var vthis = this;
			vthis.socket.emit("stop_typing", {
				action: "stop_typing",
				username: vthis.username
			})
		},
		send_typing(){
			var vthis = this;
			vthis.socket.emit("typing", {
				action: "typing",
				username: vthis.username
			})
		},
		listen_typing(){
			var vthis = this;
			vthis.socket.on("typing", function(data){
				console.log('typing')
				if(!vthis.typing_users.includes(data.username)){
					vthis.typing_users.push(data.username)
				}
			})

			vthis.socket.on("stop_typing", function(data){
				console.log('stop_typing')
				if(vthis.typing_users.includes(data.username)){
					vthis.typing_users = vthis.typing_users.filter(e => e !== data.username)
				}
			})
		},
		send_message(){
			var vthis = this;
			if(vthis.message_field.length > 0){
				vthis.socket.emit("message", {
					action: "message",
					username: vthis.username,
					message: vthis.message_field
				})
				vthis.message_field = ''
			}

		},
		get_active_users(){
			var vthis = this;
			vthis.socket.emit("get_active_users")

			vthis.socket.on("get_active_users", function(data){
				vthis.active_users = data.active_users
			})
		},
		new_user(){
			var vthis = this;
			vthis.socket.on("new_user", function(data){
				vthis.message_log.push({action: "join", username: data.username})
				vthis.active_users.push(data.username)
			})
		},
		user_disconnected(){
			var vthis = this;
			vthis.socket.on("user_disconnected", function(data){
				console.log('disconnected')
						vthis.message_log.push({action: "disconnected", username: data.username})

				for(var i = vthis.active_users.length -1; i >= 0; i--){
					if(vthis.active_users[i] === data.username){

						vthis.active_users.splice(i, 1)
					}
				}
			})
		},
		get_temp_username(){
			var vthis = this;
			vthis.socket.emit("get_temp_username")

			vthis.socket.on("get_temp_username", function(data){
				vthis.username = data.username
			})
		},
		messaging(){
			var vthis = this;
			vthis.socket.on("message", function(data){
				vthis.message_log.push({action: "message", username: data.username, message: data.message})
			})
		},
		typing(){
			var vthis = this;
			vthis.socket.on("typing", function(data){
				vthis.typing_users.push(data.username)
			})
		},
		toggle_sidebar(){
			var vthis = this;
			vthis.sidebar_toggle = !vthis.sidebar_toggle
			if(vthis.sidebar_toggle){
				vthis.sidebar_toggle_icon = "close"

			}else{
				vthis.sidebar_toggle_icon = "menu"
			}
		}
	},
	computed: {
		chatroom_connected(){
			return this.$store.getters.chatroom_connected
		}
	},
	watch: {
		message_log: function(){
			var vthis = this;
			vthis.$nextTick(function(){
				vthis.scrollToEnd()

			})
		}
	},
}
</script>

<style lang="scss">

	.container{
		float: left;
		width: 100% !important;
		max-width: 100% !important;
		height: 85vh;
	}

	.active_users{
		float: left;
		height: 85vh;
		background-color: #cecece;
		overflow-y: scroll;
		overflow-x: scroll;
		width: auto;


		.active_users_container{
			float: left;
			min-width: 100%;
			left: 0;
			rigth: 0;
		}


		&.show_sidebar{
			width: 25%;

			.active_user{
				background-color: #dedede;
				padding: .5rem;
				padding-top: .5rem;
				padding-bottom: .5rem;
				width: 100%;
			}
		}
		&.hide_sidebar{
			width: 0%;

			.active_user{
				display: none;
			}
		}

		button.toggle_users_button{
			width: 100%;
		}
	}

	.inbox{
		float: left;
		height: 85vh;
		background-color: rgb(233, 233, 233);



		&.show_sidebar{
			width: 75%;
		}
		&.hide_sidebar{
			width: 100%;
		}
		.inbox_messages{
			float: left;
			width: 100%;
			top:0;
			height: 95%;



			.messages_log{
				float: left;
				width: 100%;
				height: 100%;
				overflow-y: scroll;



				.message{
					margin: .1rem;
					padding: 1rem;
					border: 1px solid #cecece;
					border-radius: .65rem;
					width: 75%;
					float: left;

					&.typing_indicator{
						border: none;
						background-color: rgba($color: #ffffff, $alpha: 0);
						font-size: .75rem;
						padding: .5rem;

						font-style: italic;
					}

					&.join_message{
						border: none;
						background-color: rgba($color: #ffffff, $alpha: 0);
						font-size: .75rem;
						padding: .5rem;

						font-style: italic;
					}

					&.my_message{

						background-color: dodgerblue;
						color: #eaeaea;

						width: 75%;
						float: right;
					}

					&:nth-last-child{
						margin-bottom: 1rem;

					}
				}
			}
		}

		.message_form{
			float: left;
			background-color: #d3d3d3;
			bottom: 0;
			height: 5%;
			width: 100%;

			input{
				background-color: #dedede;
				height: 97%;
				width: 65%;
				padding: 0;
				border: 1px solid #323232;
				font-size: 1rem;
				text-indent: .25rem;
				outline: none;
				border: none;
			}

			button.message_form_button{
				height: 100%;
				width: 35%;
				border: 0;
				outline: none;
				padding: 0;
				margin: 0;
			}
		}
	}

	@media screen and (min-width: 1024px){
		.container{
			height: 95vh;
		}

		.active_users{
			float: left;
			height: 95vh;
			background-color: #cecece;
			overflow-y: scroll;

			&.show_sidebar{
				width: 25%;
			}
			&.hide_sidebar{
				width: 0%;
			}

		}
		.inbox{
			float: left;
			height: 95vh;
			background-color: rgb(233, 233, 233);

			.message_form{

				input{
					width: 90%;
				}

				button.message_form_button{
					width: 10%;
				
				}
			}
		}
	}


	@media screen and (min-width: 1216px){

	}

	@media screen and (min-width: 1408px){

	}

</style>
