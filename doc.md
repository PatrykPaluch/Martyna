- [Wprowadzenie](#wprowadzenie)
- [GET](#get)
	- [/guilds](#guilds)
	- [/channels](#channels)
	- [/news](#news)
- [POST](#post)
	- [/news](#news)
	- [/news/remove](#newsremove)

# Wprowadzenie
Dostęp do API odbywa się przez HTTP pod adresem **domena:port/martyna/api/**.
Konkretne polecenia są wywoływane metodami POST lub GET. Ten sam adres może wykonać różne czynności zależnie od użytej metody HTTP.
Wszystkie dane są zwracane w schemacie JSON.

Obsługiwane formaty plików graficznych: png, jpg

# GET
Parametry są dodawane jako zapis zmiennych po linku. 

Przykład: *localhost:8001/martyna/api/channels?guild_id=00000*

Odpowiedź kodem 400 jeżeli wystąpił błąd.

## /guilds
Parametry: - 

Zwraca listę podłączonych serwerów

lista zawiera obiekty:

 { id, name }
- **id** - id serwera.
- **name** - nazwa serwera.

## /channels
Parametry: 
- Wymagane
	- **guild_id** - id serwera którego kanały mają zostać zwrócone 
- opcjonalne
	- **only_text** - tylko kanały tekstowe (wartość 0 lub 1) domyślne 0
	- **only_can_write** - tylko kanały tekstowe do których ma uprawnienia SEND_MESSAGES i EMBED_LINKS (wartość 0 lub 1) domyślnie

Zwraca listę kanałów na podanym serverze 

lista zawiera obiekty:

 { id, name, type }
- **id** - id kanału
- **name** - nazwa kanału
- **type** - typ kanału (dm/group/text/voice/category)

## /news 
Parametry:
- Opcjonalne
	- **guild_id** - id servera

Zwraca listę nowinek

Jeżeli podano guild_id struktura wygląda tak:
```json
[
	{title, date, link}, ...
]
```
Jeżeli nie podano guild_id struktura wygląda tak:
```json
{
	guild_id: [
		{title, date, link}, ...
	], ...
}
```


# POST
Parametry są przekazywane z użyciem JSON w treści zapytania

## /news
Wstawia nowinkę na podany serwer

Parametry:
- Wymagane
	- **guild_id** - id servera
	- **channel_id** - id kanału 
	- **title** - max 256 znaków
	- **content** - max 2048 znaków
	- **date** - czas w ms lub zapis daty JavaScript
	- **author** - nazwa autora
	- **author_icon** - link to ikony autora
	- **link** - link do postu 
	
- Opcionalne
	- **image** - duzy obrazek pod postem
	- **color** - kolor z lewej strony
	- **footer** - własny footer (max 256 znaków)
	- **footer_img** - mały obrazek obok footera
	- **thumbnail** - mała ikona w rogu
	- **custom_fields** - dodatkowe pola (max 25) wedłóg schematu: [ {title, content, inline}, ... ]
		- **title** - (max 256 znaków)
		- **content** - (max 20148 znaków)
		- **inline** - "0" lub "1" (0 jeżeli ma być jeden pod drugim)

Zwraca:
- Wszystko okej
	- Kod odpowiedzi: 200
	- Treść: "OK"
- Błąd
	- Kod odpowiedzi: 409
	- Treść: informacja o napotkanym błędzie
- Błąd 
	- Kod odpowiedzi: 400
	- Treść: informacja o brakujących zmiennych

## /news/remove
Usuwa nowinki

Parametry:
- Wymagane
	- guild_id


Zwraca:
	ilość usuniętych nowosci