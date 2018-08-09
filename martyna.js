//Libs
const fs = require("fs");
const Discord = require("discord.js")

//bot_client
const client = new Discord.Client();

//consts
const name = "Martyna";
const prefixes = ["M!", "Martyna", "Martyno"];

/**
 * Sprawdza czy tekst zawiera prefix
 * @param {string} text 
 */
function hasPrefix( text ){

}

client.on('ready', ()=>{
	console.log("Logged in as $(client.user.tag)");
})

client.on('message', (client, message)=>{
	console.log(message.author.bot);
});



//Start
fs.readFile('token','utf8',(err,data)=>{
	if(err)
		console.error("ERROR: Token not found. Add file 'token'");
	else
		client.login(data);
});

