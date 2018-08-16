const n2t = require("../modules/numberToText");
exports.run = (client, message, args) => {
	var time = new Date().getTime();
	var l = time%10;
	var sek = " milisekund";
	if(l==2 || l==3 || l==4 ) sek = " milisekundy";

	message.channel.send("Jest " + n2t(time) + sek + " po godzinie pierwszej w nocy dnia pierwszego stycznia tysiąc dziewięćset siedemdziesiątego roku.")
}