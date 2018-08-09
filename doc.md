- [Wprowadzenie](#wprowadzenie)
- [GET](#get)
	- [/guilds](#guilds)
	- [/channels](#channels)

# Wprowadzenie
Dostęp do API odbywa się przez HTTP pod adresem **localhost:8001/martyna/api/**.
Konkretne polecenia są wywoływane metodami POST lub GET. Ten sam adres może wykonać różne czynności zależnie od użytej metody HTTP.
Wszystkie dane są zwracane w schemacie JSON.

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
- **guild_id** - id serwera którego kanały mają zostać zwrócone 

Zwraca listę kanałów na podanym serverze 

lista zawiera obiekty:

 { id, name, type }
- **id** - id kanału
- **name** - nazwa kanału
- **type** - typ kanału (dm/group/text/voice/category)