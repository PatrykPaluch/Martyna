const hello = ["Cześć :)", "Witam", "Hej :*"];
exports.run = (client, message, args) => {
	message.reply(
		hello[ Math.floor(Math.random()*hello.length) ]
	);
}