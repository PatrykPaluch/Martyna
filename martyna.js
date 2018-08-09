//Libs
const fs = require("fs");
const Discord = require("discord.js")

//bot_client
const client = new Discord.Client();

//consts
const name = "Martyna";
const prefix = "M!";
const humanPrefixes =  ["Martyna", "Martyno", "@Martyna#3857"];

/**
 * Sprawdza czy tekst zawiera prefix ludzki np. "Martyno"
 * @param {string} text tekst do sprawdzenia
 */
function hasHumanPrefix( text ){
	for(var i = 0 ; i < humanPrefixes.length ; ++i )
		if(text.startsWith(humanPrefixes[i]+" ")) return true;
	
	return false;
}



client.commands = {}

fs.readdir("./commands/", (err, files)=>{
	if(err) return console.error(err);
	files.forEach(file=>{
		if(!file.endsWith(".js")) return;
		let props = require('./commands/'+file);
		let commandName = file.split(".")[0];
		client.commands[commandName] =  props;
	});
});

client.on('ready', ()=>{
	console.log('Logged in as '+client.user.tag);
})

function proccesHumanCommand(message){
	
}
client.on('message', (message)=>{
	if(message.author.bot) return;
	if(message.content.indexOf(prefix)!==0){
		if(hasHumanPrefix(message.content)){
			proccesHumanCommand(message);
		}
	}else{
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		const cmd = client.commands[command];
		if(!cmd) return;
		cmd.run(client, message, args);
	}
});



//Start
fs.readFile('token','utf8',(err,data)=>{
	if(err)
		console.error("ERROR: Token not found. Add file 'token'");
	else
		client.login(data);
});

