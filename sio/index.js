const express = require("express");

const socket = require("socket.io");

const port = 3000

const app = express();

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const uniqueNameConfig = {
    dictionaries: [colors, animals],
    separator: '',
    style: 'capital'
}

const server = app.listen(port, function(){
    console.log(`Listening on port ${port}`)
    console.log(`bentobuilder.com:${port}`)
})

app.use(express.static("public"))

const io = socket(server)

let active_users = [

]


io.on("connection", function(socket){
    console.log('connected')
    
    socket.on("disconnect", function(data){
        console.log('disconnected')
        io.emit("user_disconnected", {username: socket.username})

        for(var i = active_users.length - 1; i >=0; i-- ){
            if(active_users[i] === socket.username){
                active_users.splice(i, 1)
            }
        }
    })


    socket.on("get_active_users", function(data){
        console.log('get_active_users')

        socket.emit("get_active_users", {active_users: active_users})
    })

    socket.on("get_temp_username", function(data){
        console.log('get_temp_username')

        var temp_username = uniqueNamesGenerator(uniqueNameConfig)
        socket.username = temp_username
        active_users.push(temp_username)
        socket.emit("get_temp_username", {username: temp_username})
        io.emit("new_user", {username: temp_username})
    })

    socket.on("typing", function(data){
        console.log('typing')
        console.log(data)


        io.emit("typing", data)
    })

    socket.on("stop_typing", function(data){
        console.log('stop_typing')
        console.log(data)


        io.emit("stop_typing", data)
    })

    socket.on("message", function(data){
        console.log(data)

        io.emit("message", data)

    })
})