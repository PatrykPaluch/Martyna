const fs = require("fs");
const express = require("express");
const webApp = express();

webApp.get("/", (req,res)=>{
	fs.readFile("html_example.html",function(err,data){
		if(err){
			res.sendStatus(500);
			return
		}
		res.write(data);
		res.send();
	});
});

webApp.listen(8002, function(){ console.log("Start at 8002");});