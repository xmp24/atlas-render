import json, os
R = '/home/claude/atlas-render/'
def mmss(t): t = int(t); return f'{t//60}:{t%60:02d}'
REG = [('US', 'Norteamérica'), ('GB', 'Europa occidental'), ('PL', 'Europa del Este y los Balcanes'), ('CO', 'Sudamérica'), ('PA', 'Centroamérica'),
       ('CU', 'Caribe'), ('GE', 'Cáucaso, Asia Central y Oriente Medio'), ('IN', 'Sur y Sureste de Asia'), ('AU', 'Oceanía'), ('MA', 'África'), ('VA', 'El Vaticano')]
V = {
 'nav': dict(ch='El Mapa Curioso', folder='Donde esta prohibida la Navidad', name='¿DÓNDE ESTÁ PROHIBIDA LA NAVIDAD?', hook='¿Dónde está prohibida?',
   t=['¿Dónde está PROHIBIDA la Navidad? Los 197 países del mundo', 'En estos países celebrar la Navidad está PROHIBIDO', 'La Navidad en cada país del mundo (en uno te pueden meter en la cárcel)'],
   th=['miniatura-1 (Vaticano vs Corea del Norte)', 'miniatura-2 (PROHIBIDA en Somalia)', 'miniatura-3 (Festivo / Se trabaja / Prohibida)'],
   d='Hay países donde celebrar la Navidad está prohibido… y en alguno te puede costar hasta cinco años de cárcel. Recorremos los 197 países, uno por uno: dónde es festivo, dónde se celebra pero se trabaja, dónde casi no se nota… y dónde está prohibida.\n\nCorea del Norte, Brunéi, Somalia y Tayikistán la prohíben o la persiguen. Filipinas la empieza en septiembre. Y en Japón… se cena pollo frito.\n\n¿En tu país la Navidad es festivo? ¡Comenta!',
   src='Festivos nacionales de cada país (Wikipedia: Observance of Christmas by country) y noticias sobre las prohibiciones de Brunéi y Somalia (2015), Tayikistán (2013) y Corea del Norte. Rusia, Serbia, Georgia, Egipto, Etiopía y otros la celebran el 7 de enero.',
   hs='#navidad #mapas #paises #curiosidades #prohibido #ElMapaCurioso',
   tags='dónde está prohibida la navidad, países donde está prohibida la navidad, navidad prohibida, navidad en el mundo, navidad en cada país, corea del norte navidad, brunei navidad, somalia navidad, tayikistán navidad, navidad en japón kfc, navidad filipinas, festivos del mundo, mapa del mundo, mapas curiosos, curiosidades del mundo, 197 países, countryballs, datos curiosos, El Mapa Curioso'),
 'sbx': dict(ch='El Mapa Curioso', folder='Donde NO hay Starbucks', name='¿DÓNDE NO HAY STARBUCKS?', hook='¿Dónde no hay Starbucks?',
   t=['¿Dónde NO hay Starbucks? Los 197 países del mundo', 'En MÁS DE LA MITAD del mundo no hay ni un Starbucks', 'Starbucks en cada país (Italia no lo tuvo hasta 2018)'],
   th=['miniatura-1 (Estados Unidos vs Etiopía)', 'miniatura-4 (¿Dónde no hay ni uno?)', 'miniatura-2 (2018, llegó por fin a Italia)'],
   d='Starbucks tiene más de 40.000 cafeterías… y aun así, en más de la mitad de los países del mundo no hay ni una. Recorremos los 197 países, uno por uno.\n\nSe fue de Rusia y de Israel. A Italia no llegó hasta 2018. Y en Etiopía, donde nació el café… ni uno.\n\n¿Hay Starbucks en tu ciudad? ¡Comenta!',
   src='Mercados de Starbucks según sus informes del año fiscal 2025 y listas públicas por país (Mappr, Visual Capitalist, noviembre de 2026). Cuba: solo en la base de Guantánamo.',
   hs='#starbucks #mapas #paises #curiosidades #cafe #ElMapaCurioso',
   tags='dónde no hay starbucks, países sin starbucks, starbucks en el mundo, starbucks en cada país, cuántos starbucks hay, starbucks italia, starbucks rusia, starbucks israel, starbucks etiopía, café, mapa del mundo, mapas curiosos, curiosidades del mundo, 197 países, countryballs, datos curiosos, El Mapa Curioso'),
 'rbx': dict(ch='Atlas Loco', folder='Donde esta prohibido Roblox', name='¿DÓNDE ESTÁ PROHIBIDO ROBLOX?', hook='¿Dónde está prohibido?',
   t=['¿Dónde está PROHIBIDO Roblox? Los 197 países del mundo', 'Estos países han BLOQUEADO Roblox', 'Roblox en cada país del mundo (en algunos ya no se puede jugar)'],
   th=['miniatura-1 (Estados Unidos vs Turquía)', 'miniatura-3 (Se juega / Limitado / Prohibido)', 'miniatura-2 (BLOQUEADO en Turquía)'],
   d='Roblox lo juegan más de cien millones de personas al día… pero en algunos países, si entras, te lo encuentras bloqueado. Recorremos los 197 países, uno por uno.\n\nTurquía lo bloqueó en 2024. Después vinieron Catar, Omán, Irak, Palestina y Egipto. Rusia lo bloqueó seis meses… y lo devolvió.\n\n¿Tú juegas a Roblox? ¡Comenta tu usuario!',
   src='Bloqueos de gobiernos y reguladores publicados en prensa (Anadolu, rblxdb, Wikipedia: Censorship of Roblox), situación a noviembre de 2026. Irán y Cuba: sin servicio por las sanciones de EE. UU.',
   hs='#roblox #mapas #paises #curiosidades #prohibido #AtlasLoco',
   tags='dónde está prohibido roblox, países donde roblox está prohibido, roblox prohibido, roblox bloqueado, roblox turquía, roblox rusia, roblox egipto, roblox catar, roblox en el mundo, roblox en cada país, mapa del mundo, mapas curiosos, curiosidades del mundo, 197 países, countryballs, datos curiosos, Atlas Loco'),
 'tbl': dict(ch='Atlas Loco', folder='Donde NO hay Taco Bell', name='¿DÓNDE NO HAY TACO BELL?', hook='¿Dónde no hay Taco Bell?',
   t=['¿Dónde NO hay Taco Bell? Los 197 países del mundo', 'En México NO hay Taco Bell (y fracasó dos veces)', 'Taco Bell en cada país del mundo (España es el número 2)'],
   th=['miniatura-1 (España vs México)', 'miniatura-2 (0 Taco Bell en México)', 'miniatura-3 (+100 / Fracasó / Ni uno)'],
   d='Taco Bell es la cadena de tacos más grande del mundo… pero en México, el país de los tacos, no hay ni uno. Recorremos los 197 países, uno por uno.\n\nEn México fracasó dos veces. España es su mayor mercado fuera de Estados Unidos. Y ahora está llegando a Alemania, Polonia, Emiratos y Grecia.\n\n¿Has probado Taco Bell? ¡Comenta!',
   src='Mercados de Taco Bell según Yum! Brands y prensa especializada (QSR Magazine, Restaurant Business, noviembre de 2026).',
   hs='#tacobell #mapas #paises #curiosidades #tacos #AtlasLoco',
   tags='dónde no hay taco bell, países sin taco bell, taco bell en el mundo, taco bell en cada país, taco bell méxico, taco bell españa, taco bell fracasó en méxico, tacos, mapa del mundo, mapas curiosos, curiosidades del mundo, 197 países, countryballs, datos curiosos, Atlas Loco'),
}
for k, v in V.items():
    T = json.load(open(R + f'src/num/{k}.json')); C = {c['c']: c for c in T['C']}
    S = json.load(open(R + f'mcd2/{k}_script.json'))
    talk = [c['n'] for c in T['C'] if c['kind'] == 's']
    chap = [f'0:00 {v["hook"]}'] + [f'{mmss(C[c]["t0"])} {n}' for c, n in REG]
    txt = f'''{v["ch"].upper()} · {v["name"]}
Duración: {mmss(T["dur"])} · 1920x1080 · 30 fps

=== 3 TÍTULOS (elige uno) ===
1) {v["t"][0]}
2) {v["t"][1]}
3) {v["t"][2]}

Miniatura recomendada por título:
  título 1 → {v["th"][0]}
  título 2 → {v["th"][1]}
  título 3 → {v["th"][2]}

=== DESCRIPCIÓN ===
{v["d"]}

⏱️ CAPÍTULOS
''' + '\n'.join(chap) + f'''

📊 FUENTES
{v["src"]}

{v["hs"]}

=== HASHTAGS (van en la descripción) ===
{v["hs"]}

=== ETIQUETAS (pegar en "Etiquetas") ===
{v["tags"]}

=== VOCES ===
Narrador: El Faraón (ElevenLabs), la misma voz que en los demás vídeos.
Hablan {len(talk)} países: {", ".join(talk)}.
'''
    d = R + f'out/entrega/{v["ch"]} - {v["folder"]}/'; os.makedirs(d, exist_ok=True)
    open(d + f'{v["folder"]} - info.txt', 'w').write(txt)
    print(d, mmss(T['dur']))
