//Libs
const fs = require("fs");
const Discord = require("discord.js")
const http = require("http");
const express = require("express");
const webApp = express();

//bot_client
const discordClient = new Discord.Client();

//consts
const name = "Martyna";
const prefix = "M!";
const humanPrefixes =  ["Martyna", "Martyno", "@Martyna#3857"];
const footerMessage = "Zapraszamy na cubeform.com";
const footerImg = "http://example.com/img.png";


//======================= DISCORD BOT =============== 
/**
 * Sprawdza czy tekst zawiera prefix ludzki np. "Martyno"
 * @param {string} text tekst do sprawdzenia
 */
function hasHumanPrefix( text ){
	for(var i = 0 ; i < humanPrefixes.length ; ++i )
		if(text.startsWith(humanPrefixes[i]+" ")) return true;
	
	return false;
}



discordClient.commands = {}

fs.readdir("./commands/", (err, files)=>{
	if(err) return console.error(err);
	files.forEach(file=>{
		if(!file.endsWith(".js")) return;
		let props = require('./commands/'+file);
		let commandName = file.split(".")[0];
		discordClient.commands[commandName] =  props;
	});
});

discordClient.on('ready', ()=>{
	console.log('Logged in as '+discordClient.user.tag);
})

function proccesHumanCommand(message){
	
}
discordClient.on('message', (message)=>{
	if(message.author.bot) return;
	if(message.content.indexOf(prefix)!==0){
		if(hasHumanPrefix(message.content)){
			proccesHumanCommand(message);
		}
	}else{
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		const cmd = discordClient.commands[command];
		if(!cmd) return;
		cmd.run(discordClient, message, args);
	}
});


//================ HTTP SERVER =====================

webApp.use(express.json());
webApp.use(express.urlencoded({ extended: true }));
//use
// webApp.on("/martyna/api/*", (req,res,next)=>{
// 	console.log("Request from: " + req.host);
// 	next();
// });
/**
 * Zwraca listę serwerów 
 * return
 * lista obiektow
 * {
 * 	id - id servera
 * 	name - nazwa servera
 * }
 */
webApp.get("/martyna/api/guilds", (req, res)=>{
	let guilds = discordClient.guilds.array();
	let guildList = [];
	guilds.forEach((guild)=>{
		guildList.push( {id: guild.id, name: guild.name});
	});
	res.write( JSON.stringify(guildList) );
	res.send();
});

/**
 * Zwraca listę kanałów na serverze <br>
 * Parametry:
 * 	guild_id
 * opcjonalne:
 * 	onlyText - 0/1 - tylko kanały tekstowe
 *  onlyCanWrite - 0/1 - tylko kanały do których ma uprawnienia SEND_MESSAGES i EMBED_LINKS
 * 
 * return
 * lista obiektow:
 * 	{
 * 		id - id kanału
 * 		name - nazwa kanału
 * 		type - typ kanału (dm/group/text/voice/category)
 *  }
 */
webApp.get("/martyna/api/channels", (req,res)=>{
	let guild_id = req.query.guild_id;
	let onlyText = req.query.only_text;
	let onlyCanWrite = req.query.only_can_write;

	if(guild_id==undefined){
		res.status(400);
		res.write("guild_id is undefined");
		res.send();
		return;
	} 
	let channels=discordClient.guilds.get(guild_id).channels;
	let channelList = [];
	channels.forEach((channel)=>{
		if( onlyCanWrite ){
			var perms = channel.permissionsFor(discordClient.user);
			if( channel.type=="text" && perms.has("SEND_MESSAGES") && perms.has("EMBED_LINKS") ){
				channelList.push(
					{id: channel.id, name: channel.name, type: channel.type}
				);
			}
		}
		else if(!onlyText || channel.type=="text"){
			channelList.push(
				{id: channel.id, name: channel.name, type: channel.type}
			);
		}
	});

	res.write(JSON.stringify(channelList));
	res.send();
});
/**
	Wstawia nowinkę na podany serwer
	Parametry:
	//Wymagane
	guild_id
	channel_id
	title - max 256 znaków
	content - max 2048 znaków
	data - ilość ms lub zapis daty JavaScript
	author - nazwa autora
	author_icon - link to ikony autora
	link - link do postu 
	
	//opcionalne
	image - duzy obrazek pod postem
	color - kolor z lewej strony
	custom_footer - własny footer (max 256 znaków)
	custom_footer_img - mały obrazek obok footera
	thumbnail - mała ikona w rogu
	custom_fields - dodatkowe pola (max 25) wedłóg schematu:
		[ {title, content, inline}, ... ]
			title - (max 256 znaków)
			content - (max 20148 znaków)
			inline - "0" lub "1" (0 jeżeli ma być jeden pod drugim)

 */
webApp.post("/martyna/api/news", (req, res)=>{
	//required
	let guild_id = req.body.guild_id;
	let channel_id = req.body.channel_id;
	let title = req.body.title;
	let data = req.body.data; //ms
	let author = req.body.author;
	let author_icon = req.body.author_icon;
	let link = req.body.link;
	let content = req.body.content;

	//optional
	let image = req.body.image;
	let color = req.body.color;
	let customFooter = req.body.footer;
	let customFooterImg = req.body.footer_icon;
	let thumbnail = req.body.thumbnail;
	let customFields = req.body.custom_fields; //Object [ {title,content, inline}, ... ]
	if(title.length>256) title = title.split(0,256);
	if(content.length>2048) content = content.slice(0,2048);
	if(color==undefined) color = "0";
	if(customFooter==undefined) customFooter = footerMessage;
	if(customFooterImg==undefined) customFooterImg = footerImg;

	let embed = new Discord.RichEmbed()
		.setTitle(title)
		.setAuthor(author, author_icon)
		.setColor(color)
		.setDescription(content)
		.setFooter(customFooter, customFooterImg);
	if(image) embed.setImage(image);
	if(thumbnail) embed.setThumbnail(thumbnail);
	embed
		.setTimestamp(new Date(data))
		.setURL(link);
	if(customFields){
		customFields.forEach((field)=>{
			if(field.blank=="1") embed.addBlankField();
			else embed.addField(field.title, field.content, field.inline=="1");
		});
	}


	discordClient.guilds.get(guild_id).channels.get(channel_id).send( {embed} )
		.then((m)=>{
			console.log("Send message");
			res.write("OK");
			res.send();
		})
		.catch((m)=>{
			console.log("Error with sennding");
			res.write(""+m);
			res.status(409);
			res.send();
		});
});

webApp.get("/martyna/api/teapot", (req, res)=>{ res.sendStatus(418);})


//==================== START =======================

//Start
fs.readFile('token','utf8',(err,data)=>{
	if(err)
		console.error("ERROR: Token not found. Add file 'token'");
	else{
		discordClient.login(data);
		webApp.listen(8001, ()=>{
			console.log("HTTP server start on 8001");
		});
	}
});