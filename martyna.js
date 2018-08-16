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
const humanPrefixes =  ["Martyna", "Martyno"];
const footerMessage = "Zapraszamy na cubeform.com";
const footerImg = "http://example.com/img.png";
const ipWhiteList = ["localhost", "127.0.0.1"];

//vars
discordClient.maxNewsCount = 10;
discordClient.news = {}

//===================== FUNCTIONS ===================
/**
 * 
 * @param {string} text 
 * @returns {string} text bez polskich ogonków
 */
function replacePolishDiacritics(text){
	var from = ['ą','ć','ę','ł','ń','ó','ś','ź','ż'];
	var to   = ['a','c','e','l','n','o','s','z','z'];
	for(var i = 0 ; i < from.length ; ++i){
		text = text.replace(from[i], to[i]);
	}   
	return text;
}

/**
 * 
 * @param {string} guild_id 
 * @param {string} title 
 * @param {string} link 
 * @param {Date | string | number} date 
 */
function addNews(guild_id, title, link, date){
	let obj =  {title: title, date: date, link: link};
	if(discordClient.news[guild_id])
		discordClient.news[guild_id].push(obj);
	else {
		discordClient.news[guild_id] = [ obj ];
	}
	if(discordClient.news[guild_id].length>discordClient.maxNewsCount){
		discordClient.news[guild_id].splice(0,1);//remove oldest
	}
}

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

//======= INIT COMMANDS
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

/**
 * @param {Discord.Message} message 
 */
function proccesHumanCommand(message){
	var text = replacePolishDiacritics(message.content.toLowerCase());
	//Nowosci
	var cmd =
			(
			(text.indexOf("co")!==-1 || text.indexOf("cos")!==-1)&&
				(text.indexOf("nowego")!==-1)
			|| (text.indexOf("ostatnio")!==-1)
			|| (text.indexOf("slychac")!==-1)
			)
		|| (text.indexOf("sa")!==-1 && (text.indexOf("nowosci")!==-1||text.indexOf("nowinki")!==-1) );
	if(cmd){
		discordClient.commands["nowosci"].run(discordClient,message);
		return;
	}
	cmd = (
		(text.indexOf("ktora")!==-1 || text.indexOf("jaka")!==-1 || text.indexOf("ktory")!==-1 || text.indexOf("jaki")!==-1 || text.indexOf("podaj")!==-1) 
		&&
		(text.indexOf("godzina")!==-1 || text.indexOf("czas")!==-1 || text.indexOf("dzisiaj")!==-1 || text.indexOf("godzine")!==-1)
	);
	if(cmd){
		discordClient.commands["czas"].run(discordClient,message);
		return;
	}
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

webApp.use("/martyna/api/", (req,res,next)=>{
	for(var i = 0 ; i < ipWhiteList.length ; ++i){
		 if(ipWhiteList[i]==req.hostname){
			res.setHeader("Access-Control-Allow-Origin", "*"); ///Only white list, any port
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
			res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
			next(); 
			return;
		 }
	}
	console.log("Unauthorized request from: " + req.hostname);
	res.sendStatus(403);
});
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

	res.setHeader("Content-Type", "application/json");
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
	res.setHeader("Content-Type", "application/json");
	res.write(JSON.stringify(channelList));
	res.send();
});
/**
 * Zwraca listę nowinek
 * Parametry (opcjionalne):
 * 	guild_id - id servera
 */
webApp.get("/martyna/api/news", (req, res)=>{
	var guild = req.query.guild_id;
	res.setHeader("Content-Type", "application/json");
	if(guild){
		if(discordClient.news[guild])
			res.write( JSON.stringify(discordClient.news[guild]) );
		else 
			res.write( JSON.stringify([]) );
	}else {
		res.write( JSON.stringify(discordClient.news) );
	}
	res.send();
});

/**
 * Usuwa nowinki
 * Parametry:
 * 	guild_id
 */
webApp.post("/martyna/api/news/remove", (req,res)=>{
	var guild = req.body.guild_id;
	if(guild==undefined){
		res.status(400);
		res.write("Missing guild_id");
		res.send();
		return;
	}
	var news = discordClient.news[guild];
	var len = news.length;
	if(news && len>0){
		discordClient.news[guild] = [];
		res.write(""+len);
		res.send()
		return;
	}
	res.write("0");
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
	date - ilość ms lub zapis daty JavaScript
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
	let date = req.body.date; //ms
	let author = req.body.author;
	let author_icon = req.body.author_icon;
	let link = req.body.link;
	let content = req.body.content;
	if(!(guild_id&&channel_id&&title&&date&&author&&author_icon&&link&&content)){
		res.status(400);
		res.write("guild_id, channel_id, title, date, author, author_icon, link, content. Some of thete are missing");
		res.send();
		return;
	}
	if(!isNaN(date)) date = parseInt(date);

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
		.setTimestamp(new Date(date))
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
			res.status(409);
			res.write(""+m);
			res.send();
		});
		
	addNews(guild_id, title, link, date);
});

webApp.get("/martyna/api/teapot", (req, res)=>{ res.sendStatus(418);})


//==================== START =======================


discordClient.on('ready', ()=>{
	console.log('Logged in as '+discordClient.user.tag);
	humanPrefixes.push(discordClient.user.tag);
	humanPrefixes.push("<@"+discordClient.user.id+">");
	webApp.listen(8001, ()=>{
		console.log("HTTP server start on 8001");
	});
})

//Start
fs.readFile('token','utf8',(err,data)=>{
	if(err)
		console.error("ERROR: Token not found. Add file 'token'");
	else{
		discordClient.login(data);
	}
});