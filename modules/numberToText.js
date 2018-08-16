module.exports = function(liczba) {
	var jednosci = ["", " jeden", " dwa", " trzy", " cztery", " pięć", " sześć", " siedem", " osiem", " dziewięć"];
	var nascie = ["", " jedenaście", " dwanaście", " trzynaście", " czternaście", " piętnaście", " szesnaście", " siedemnaście", " osiemnaście", " dziewietnaście"];
	var dziesiatki = ["", " dziesięć", " dwadzieścia", " trzydzieści", " czterdzieści", " pięćdziesiąt", " sześćdziesiąt", " siedemdziesiąt", " osiemdziesiąt", " dziewięćdziesiąt"];
	var setki = ["", " sto", " dwieście", " trzysta", " czterysta", " pięćset", " sześćset", " siedemset", " osiemset", " dziewięćset"];
	var grupy = [
		["" ,"" ,""],
		[" tysiąc" ," tysiące" ," tysięcy"],
		[" milion" ," miliony" ," milionów"],
		[" miliard"," miliardy"," miliardów"],
		[" bilion" ," biliony" ," bilionów"],
		[" biliard"," biliardy"," biliardów"],
		[" trylion"," tryliony"," trylionów"]
	];
	
	if (!isNaN(liczba)){
	
		var wynik = '';
		var znak = '';
		if (liczba == 0)
			wynik = "zero";
		if (liczba < 0) {
			znak = "minus";
			liczba = -liczba;
		}
		
		var g = 0;
		while (liczba > 0) {
			var s = Math.floor((liczba % 1000)/100);
			var n = 0;
			var d = Math.floor((liczba % 100)/10);
			var j = Math.floor(liczba % 10);
			if (d == 1 && j>0) {
				n = j;
				d = 0;
				j = 0;
			}
			
			var k = 2;
			if (j == 1 && s+d+n == 0) k = 0;
			if (j == 2 || j == 3 || j == 4) k = 1;
			if (s+d+n+j > 0)
				wynik = setki[s]+dziesiatki[d]+nascie[n]+jednosci[j]+grupy[g][k]+wynik;
			
			g++;
			liczba = Math.floor(liczba/1000);
		}
		return znak + wynik;
	}
	else  {
		throw "value is NaN";
	}
}