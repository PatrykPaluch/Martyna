
function formatDate(d){
	var monthName = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
	let date = new Date(d);
	return date.getFullYear() + " " + monthName[date.getMonth()] + " " + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}
/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
exports.run = (client, message, args) => {
	let news = client.news[message.guild.id];
	if(news==undefined || news.length<=0){
		var info = [
			"Niestety, nie ma żadnych nowości",
			"Ostatnio nic się nie działo z CF",
			"Nic nowego", 
			"Patrzę i nie widzę nic nowego",
			"Przykro mi, brak nowości"
		];
		var emotka = [
			":unamused:", ":disappointed:", ":worried:", ":confused:", ":slight_frown:", ":frowning2:", ":frowning:", ":anguished:", ":cry:"
		];
		message.reply(
			info[ Math.floor(Math.random()*info.length) ] + " " + emotka[ Math.floor(Math.random()*emotka.length) ]
		);	
	}else {
		var info = [
			"Są {e} o to najnowsze wpisy:",
			"Proszę bardzo, najnowsze wpisy {e}:",
			"Specjalnie dla ciebie {e} lista najnowszych wiadomości:", 
			"Nowinki z CF {e}",
			"Ostatnio trochę się działo {e}"
		];
		var emotka = [
			":grinning:", ":grin:", ":smiley:", ":smile:", ":wink:", ":slight_smile:", ":upside_down:", ":blush:"
		];
		let fields = [];
		for(var i = 0 ; i < news.length && i < 5 ; ++i){
			var n = news[news.length-1 - i];
			var date = formatDate(n.date);

			fields.push({name:n.title, value:"[Link]("+n.link+") | "+date+"."});
		}
		message.channel.send({embed: {
			//237, 74, 65
			color: 0xED4A41,
			title: info[ Math.floor(Math.random()*info.length) ].replace("{e}", emotka[ Math.floor(Math.random()*emotka.length) ] ),
			description: "",
			fields: fields
		}});
	}
}