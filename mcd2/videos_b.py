# Vídeos de categorías (estilo "¿Dónde NO hay McDonald's?") con el motor numérico
#   nav = ¿Dónde está prohibida la Navidad?   rbx = ¿Dónde está prohibido Roblox?
#   sbx = ¿Dónde NO hay Starbucks?            tbl = ¿Dónde NO hay Taco Bell?
import sys
sys.path.insert(0, '/home/claude/atlas-render/mcd')
from data import ORDER, NAMES
NARR = 'w495jEjc73YEWOkc3VLu'
SP = {'DO': 'República Dominicana', 'CD': 'República Democrática del Congo', 'CF': 'República Centroafricana'}
def nm(c): return SP.get(c, NAMES[c])
V = {'US': 'PbdeBaBBJTgZkIRcTU1J', 'MX': 'qKiF0EEU7wtRm1G2mLMh', 'ES': 'd5UAjYhvzEX3wkRfxPTM', 'AR': 'D09EpJbk4um1HKSpeTSc',
     'DE': 'COD96vfwrPlMeaUXwauW', 'BALK': 'mgZYFBDKPJGhiZEAcf4X', 'IN': 'pnoafjwb2T2zx4YYE60H', 'JP': '1naQcvaoaQTXNd36WqlD',
     'AU': 'dSX8MUEljgxrFygPwhF5', 'AF': '3W7TIElBzp1JQ8BxQuXK', 'CU': 'P5oKQC0uccAVbhCpX8GX', 'RU': 'XCV7OOxwKwPMAdSwpD4R',
     'IT': 'EUB39iBkSWvtMTIGWmNE', 'GB': 'erjfZbWOeOlXoejyglLN', 'FR': 'Pu9MMuPx0BqjFaVxHf8W', 'KP': 'DXmaqevHBKl3Emj5cBp1',
     'CN': 'XAV9ErNepIMDFPmlJ3pQ', 'BR': 'BECjFqjKpX1jVslC0trK', 'IR': 'TXoBVQ9S1J8PyUCOfL3s', 'VA': 'G0q9AYE8QsarSbMtaIEu'}
GREEN, YEL, ORA, RED, GRAY, PUR = '#2fbf63', '#ffd23f', '#ff8c2e', '#ee4646', '#8f86a8', '#9b5de5'
def cat(k, label, short, col, cold, mood): return dict(k=k, label=label, short=short, col=col, cold=cold, mood=mood)

def rows(st_of, phr, X, SUB, VT):
    """st_of(c)->cat · phr[cat] = lista de coletillas que rotan · X comentarios · SUB subtítulo · VT[cat]=(texto tarjeta, corto)"""
    C = []; rot = {}
    for c in ORDER:
        s = st_of(c); i = rot.get(s, 0); rot[s] = i + 1
        say = f'{nm(c)}: {phr[s][i % len(phr[s])]}'
        x = X.get(c, '')
        if x.startswith('!'): say = f'{nm(c)}: {x[1:]}'      # '!' = sustituye la coletilla
        elif x: say += ' ' + x
        v, vs = VT[s]
        C.append(dict(c=c, st=s, val=0, v=v, vs=vs, sub=SUB.get(c, SUB.get('_' + s, '')), say=say))
    return C

# ======================================================================= NAVIDAD
def nav():
    A = set('KP BN SO TJ'.split())                       # prohibida / perseguida
    B = set('AF IR AZ UZ TM MV BT LA MN YE OM KW SA LY DZ TN MA MR KM'.split())  # casi no se celebra
    Cc = set('JP CN TW TH VN KH TR IL AE QA BH'.split())  # se celebra sin ser festivo
    def st(c): return 'A' if c in A else 'B' if c in B else 'C' if c in Cc else 'D'
    cats = [cat('D', 'ES FESTIVO', 'FESTIVO', GREEN, '#17803d', 'happy'),
            cat('C', 'SE CELEBRA, PERO SE TRABAJA', 'SE CELEBRA', YEL, '#b38e00', 'happy'),
            cat('B', 'CASI NO SE CELEBRA', 'CASI NADA', ORA, '#b35a0c', 'angry'),
            cat('A', 'PROHIBIDA', 'PROHIBIDA', RED, '#a51f1f', 'sad')]
    phr = {'D': ['¡festivo!', 'festivo.', 'sí es festivo.', 'Navidad, sí.'], 'C': ['se celebra... pero se trabaja.', 'se celebra, pero no es festivo.'],
           'B': ['casi no se celebra.', 'casi nada.', 'apenas se nota.'], 'A': ['¡prohibida!']}
    X = {'US': 'Y con luces que se ven desde el espacio.', 'MX': 'Con posadas desde el dieciséis de diciembre.',
         'GB': 'Con discurso del rey incluido.', 'ES': 'Y los regalos, muchos, el seis de enero.', 'IT': 'Con panettone hasta en la sopa.',
         'VA': 'Aquí la Misa del Gallo la da el Papa.', 'DE': 'Los mercadillos navideños nacieron aquí.',
         'FI': 'Y aquí vive Papá Noel, en Laponia.', 'IS': 'Aquí no hay un Papá Noel... ¡hay trece!', 'NO': 'Y cada año regala el árbol de Londres.',
         'RU': 'Pero el siete de enero.', 'BY': '¡Y dos veces: el veinticinco y el siete!', 'RS': 'El siete de enero.', 'GE': 'El siete de enero.',
         'UA': 'Y desde 2023, el veinticinco, como Europa.', 'AM': 'El seis de enero.', 'KZ': 'El siete de enero, la ortodoxa.',
         'CU': 'Y ojo: estuvo prohibida casi treinta años, hasta 1997.', 'VE': 'Con gaitas y hallacas.', 'AU': 'Y en bañador: ¡allí es verano!',
         'PH': '¡Y empiezan en septiembre! La Navidad más larga del mundo.', 'IN': 'Aunque solo un dos por ciento es cristiano.',
         'PK': 'Es el día de su fundador... y también Navidad.', 'IQ': 'Desde 2008.', 'SD': 'Volvió a ser festivo en 2020.',
         'PS': 'Aquí está Belén, donde todo empezó.', 'EG': 'El siete de enero, la Navidad copta.', 'ET': 'El siete de enero, y se llama Genna.',
         'SA': 'Hasta hace poco estaba prohibida en público... ahora ya venden adornos.', 'AE': 'Y Dubái se llena de árboles gigantes.',
         'TR': 'Aunque aquí nació San Nicolás, el Papá Noel original.', 'CN': 'Y la mayoría de adornos del mundo se fabrican aquí.',
         'AF': 'Casi no quedan cristianos.', 'MV': 'Allí no se permiten otras religiones en público.', 'MN': 'Aquí la gran fiesta es la del año nuevo.',
         'IL': 'Menos en Nazaret, que es una fiesta enorme.', 'KR': 'Y es la fiesta de las parejas.', 'TJ': 'Desde 2013, nada de árboles ni Papá Noel en la tele... ni en los colegios.',
         'SO': 'Desde 2015. Ni celebrarla en público, ni felicitarla.', 'BN': 'En público, desde 2015: hasta cinco años de cárcel.',
         'TL': 'De los países más católicos de Asia.', 'JP': '', 'NZ': 'Con barbacoa en la playa.', 'BR': 'Con treinta grados.',
         'CO': 'Y empieza el siete de diciembre, con las velitas.', 'GT': 'Con la quema del diablo.', 'PL': 'Y en la cena se deja un sitio libre.',
         'CZ': 'Con una carpa viva en la bañera.', 'NL': 'Aunque los regalos llegan con San Nicolás, el cinco.', 'NG': 'Y se viaja al pueblo por millones.'}
    T = {'US': (V['US'], '¡Luces, regalos y un pavo gigante! ¡Aquí la Navidad empieza en noviembre!'),
         'MX': (V['MX'], '¡Posadas, piñatas y ponche, carnal! Aquí la fiesta dura un mes.'),
         'ES': (V['ES'], '¡Turrón, lotería y Reyes Magos! ¡Y comiendo hasta el seis de enero!'),
         'JP': (V['JP'], 'En Navidad, aquí cenamos pollo frito del KFC. ¡Hay que reservarlo con semanas!'),
         'CU': (V['CU'], '¡Treinta años sin Navidad, asere! Hasta que vino el Papa en el noventa y ocho.'),
         'RU': (V['RU'], 'Aquí no viene Papá Noel. Viene el Abuelo Frío... ¡y en Año Nuevo!'),
         'AU': (V['AU'], '¡Navidad en la playa, mate! Papá Noel llega en tabla de surf.'),
         'IN': (V['IN'], '¡Es festivo! Y en Goa, con fuegos artificiales y todo.'),
         'CN': (V['CN'], 'No es festivo... ¡pero aquí fabricamos casi todos los adornos del planeta!'),
         'KP': (V['KP'], '¿Navidad? Aquí el veinticuatro se celebra el cumpleaños de la abuela del líder. Siguiente.'),
         'VA': (V['VA'], 'Aquí la Navidad la celebra el mismísimo Papa. ¡Más festivo, imposible!')}
    SUB = {'_D': 'Festivo nacional', '_C': 'No es festivo, pero se celebra', '_B': 'No es festivo', '_A': 'Prohibida o perseguida',
           'RU': 'Festivo el 7 de enero', 'RS': 'Festivo el 7 de enero', 'GE': 'Festivo el 7 de enero', 'ME': 'Festivo el 7 de enero',
           'MK': 'Festivo el 7 de enero', 'KZ': 'Festivo el 7 de enero', 'KG': 'Festivo el 7 de enero', 'EG': 'Festivo el 7 de enero',
           'ET': 'Festivo el 7 de enero', 'ER': 'Festivo el 7 de enero', 'AM': 'Festivo el 6 de enero', 'BY': 'Festivo el 25 y el 7',
           'MD': 'Festivo el 25 y el 7', 'KP': 'Prohibida: la religión está perseguida', 'BN': 'Prohibida en público desde 2015',
           'SO': 'Prohibida en público desde 2015', 'TJ': 'Sin árbol ni Papá Noel desde 2013', 'CU': 'Prohibida de 1969 a 1997',
           'SA': 'Prohibida en público hasta hace poco', 'PS': 'Belén, donde nació Jesús', 'IQ': 'Festivo desde 2008', 'SD': 'Festivo de nuevo desde 2020'}
    VT = {'D': ('FESTIVO', 'SÍ'), 'C': ('SE CELEBRA', 'MEDIO'), 'B': ('CASI NADA', 'NO'), 'A': ('PROHIBIDA', 'NO')}
    C = rows(st, phr, X, SUB, VT)
    cfg = dict(title='¿DÓNDE ESTÁ PROHIBIDA LA NAVIDAD?', icon='tree', t1='¿DÓNDE ESTÁ', t2='PROHIBIDA LA NAVIDAD?', badge='197 PAÍSES',
               cats=cats, balls=['VA', 'US', 'MX', 'JP', 'KP', 'SO'], ballMoods=['happy', 'happy', 'happy', 'happy', 'angry', 'sad'],
               best=['PH', 'LA MÁS LARGA', 'DESDE SEPTIEMBRE'], worst=['KP', 'PROHIBIDA', 'CORRE PELIGRO'],
               ask='¿EN TU PAÍS ES FESTIVO? ¡COMENTA!', head='NAVIDAD')
    intro = ['Hay países donde celebrar la Navidad está prohibido... y en alguno te puede costar la cárcel. Hoy revisamos los ciento noventa y siete países del mundo, uno por uno.',
             'Verde: es festivo.', 'Amarillo: se celebra... pero se trabaja.', 'Naranja: casi no se celebra.', 'Y rojo... ¡prohibida! ¡Vamos!']
    outro = ['¿En tu país la Navidad es festivo? ¡Comenta!']
    return dict(key='nav', narr=NARR, C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ======================================================================= ROBLOX
def rbx():
    A = set('CN KP TR EG IQ PS QA OM'.split()); Cc = set('RU JO KW DZ BH ID'.split()); Xs = set('IR CU'.split())
    def st(c): return 'A' if c in A else 'C' if c in Cc else 'X' if c in Xs else 'D'
    cats = [cat('D', 'SE PUEDE JUGAR', 'SÍ', GREEN, '#17803d', 'happy'),
            cat('C', 'CON LIMITACIONES', 'LIMITADO', YEL, '#b38e00', 'angry'),
            cat('X', 'SIN SERVICIO (SANCIONES)', 'SIN SERVICIO', GRAY, '#5c5475', 'sad'),
            cat('A', 'PROHIBIDO', 'PROHIBIDO', RED, '#a51f1f', 'sad')]
    phr = {'D': ['se puede jugar.', 'sí.', 'sin problema.', 'adelante.'], 'C': ['con limitaciones.'], 'X': ['sin servicio.'], 'A': ['¡prohibido!']}
    X = {'US': 'Aquí nació, en 2006.', 'TR': 'Desde agosto de 2024. El primero de los grandes.', 'CN': 'Tuvo su versión china... y la cerraron en 2021.',
         'KP': 'Bueno... aquí casi no hay internet.', 'QA': 'Desde agosto de 2025.', 'OM': 'Desde junio de 2025.', 'IQ': 'Desde octubre de 2025.',
         'PS': 'Desde noviembre de 2025.', 'EG': 'Desde febrero de 2026.', 'RU': 'Lo bloqueó en diciembre de 2025... y lo devolvió en junio de 2026.',
         'JO': 'Volvió en 2025... pero sin chat.', 'KW': 'Lo bloqueó tres meses en 2025. Volvió, sin chat.', 'DZ': 'Prohibido en 2025... y de vuelta en 2026, sin chat.',
         'BH': 'Y se está estudiando prohibirlo.', 'ID': 'Allí están quitando las cuentas a los menores de dieciséis.', 'IR': 'Por las sanciones de Estados Unidos.',
         'CU': 'Por las sanciones de Estados Unidos.', 'SA': '!se puede jugar... pero sin chat.', 'AE': '!se puede jugar... pero sin chat.',
         'PH': 'Querían prohibirlo... y al final no.', 'AU': 'Y con el chat muy controlado para los niños.', 'BR': 'Uno de sus países con más jugadores.',
         'GB': 'Con verificación de edad.', 'NL': 'Aunque allí lo vigilan con lupa.'}
    for c in 'MA TN LY SD YE LB SY MR'.split(): X.setdefault(c, '!se puede jugar... pero sin chat.')
    T = {'US': (V['US'], '¡Roblox es nuestro! Nació en California... ¡y lo juegan cien millones de personas al día!'),
         'MX': (V['MX'], '¡Aquí juega todo el mundo, güey! Hasta mi abuelita tiene su avatar.'),
         'ES': (V['ES'], '¡Se puede jugar, tío! Pero a las diez, a cenar.'),
         'TR': (V['BALK'], '¡Más de un año bloqueado! Aquí los niños juegan con VPN.'),
         'RU': (V['RU'], 'Seis meses bloqueado... ¡y ahora otra vez dentro! Pero vigilado.'),
         'CN': (V['CN'], 'Aquí Roblox no... ¡pero tenemos nuestros propios juegos!'),
         'KP': (V['KP'], '¿Roblox? Aquí el único juego es obedecer. Siguiente.'),
         'BR': (V['BR'], '¡Brasil es uno de los países que más juega a Roblox del mundo!'),
         'JP': (V['JP'], 'Sí se puede jugar... pero aquí preferimos las consolas.'),
         'AU': (V['AU'], '¡Se puede jugar, mate! Pero con el chat bloqueado para los peques.'),
         'IN': (V['IN'], '¡Se puede jugar! Y con mil cuatrocientos millones, imagina las colas en los servidores.')}
    SUB = {'_D': 'Disponible', '_C': 'Restringido o sin chat', '_X': 'Por sanciones de EE. UU.', '_A': 'Bloqueado por el gobierno',
           'TR': 'Bloqueado desde agosto de 2024', 'CN': 'Versión china cerrada en 2021', 'QA': 'Bloqueado desde agosto de 2025',
           'OM': 'Bloqueado desde junio de 2025', 'IQ': 'Bloqueado desde octubre de 2025', 'PS': 'Bloqueado desde noviembre de 2025',
           'EG': 'Bloqueado desde febrero de 2026', 'RU': 'Bloqueado dic 2025 – jun 2026', 'JO': 'Volvió sin chat', 'KW': 'Volvió sin chat',
           'DZ': 'Volvió en 2026 sin chat', 'BH': 'Prohibición en estudio', 'ID': 'Fuera menores de 16', 'KP': 'Sin internet para la población',
           'US': 'Nació aquí en 2006'}
    VT = {'D': ('SÍ', 'SÍ'), 'C': ('LIMITADO', 'MEDIO'), 'X': ('SIN SERVICIO', 'NO'), 'A': ('PROHIBIDO', 'NO')}
    C = rows(st, phr, X, SUB, VT)
    cfg = dict(title='¿DÓNDE ESTÁ PROHIBIDO ROBLOX?', icon='pad', t1='¿DÓNDE ESTÁ', t2='PROHIBIDO ROBLOX?', badge='197 PAÍSES',
               cats=cats, balls=['US', 'BR', 'MX', 'RU', 'TR', 'CN'], ballMoods=['happy', 'happy', 'happy', 'angry', 'sad', 'angry'],
               best=['US', 'SU CASA', 'DESDE 2006'], worst=['TR', 'BLOQUEADO', 'DESDE 2024'],
               ask='¿TÚ JUEGAS A ROBLOX? ¡COMENTA!', head='ROBLOX')
    intro = ['Roblox lo juegan más de cien millones de personas al día... pero en algunos países, si entras, te lo encuentras bloqueado. Hoy revisamos los ciento noventa y siete países, uno por uno.',
             'Verde: se puede jugar.', 'Amarillo: con limitaciones.', 'Gris: sin servicio, por sanciones.', 'Y rojo... ¡prohibido! ¡Vamos!']
    outro = ['¿Y tú, juegas a Roblox? ¡Comenta tu usuario!']
    return dict(key='rbx', narr=NARR, C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ======================================================================= STARBUCKS
SBX = set('''US CA MX GT SV CR PA CO EC PE BO CL AR UY PY BR BS JM TT
GB IE FR ES PT AD IT MT MC CH AT DE LU BE NL DK NO SE FI PL CZ SK HU RO BG GR CY TR RS
GE AZ KZ SA AE KW QA BH OM JO LB EG MA ZA IN CN JP KR TW PH ID MY SG TH VN KH BN MN LA AU NZ'''.split())
def sbx():
    F = {'RU': 2022, 'IL': 2003}
    def st(c): return 'C' if c in F else 'D' if c in SBX else 'A'
    cats = [cat('D', 'HAY STARBUCKS', 'HAY', GREEN, '#17803d', 'happy'),
            cat('C', 'LO TUVO, Y SE FUE', 'SE FUE', YEL, '#b38e00', 'angry'),
            cat('A', 'NO HAY', 'NO HAY', RED, '#a51f1f', 'sad')]
    phr = {'D': ['sí hay.', 'hay.', 'sí.', '¡hay!'], 'C': ['se fue.'], 'A': ['no hay.', 'nada.', 'tampoco.', 'ni uno.', 'no.']}
    X = {'US': '¡Casi diecisiete mil!', 'CN': '¡Más de ocho mil! El segundo del mundo.', 'KR': 'Y es de los países con más Starbucks por persona.',
         'IT': 'Pero llegó tardísimo: ¡en 2018!', 'FR': '', 'RU': 'En 2022. Y sus locales ahora se llaman Stars Coffee.', 'IL': '¡En 2003! Duró solo dos años.',
         'AU': 'Aunque en 2008 cerró casi todos sus locales.', 'ET': '¡Y aquí es donde nació el café!',
         'CO': 'En el país del café... y llegó en 2014.', 'VN': 'Aunque aquí manda el café vietnamita.', 'SA': 'Más de cuatrocientos.',
         'IN': 'Casi quinientos.', 'ZA': 'El primero del África negra, en 2016.', 'EG': 'El primero de África, en 2006.',
         'MN': 'De los últimos en llegar.', 'LA': 'Recién llegado.', 'IS': '!ni uno. Aquí se defienden con sus cafeterías.', 'KP': '!ni de broma.',
         'CU': '!bueno... solo en la base de Guantánamo.', 'NG': '¡Doscientos millones de personas y ni un Starbucks!', 'UA': '!ni uno.',
         'BO': '!pocos, pero hay.', 'PY': '!sí, en Asunción.', 'JM': '¡Café de las Montañas Azules... y Starbucks!', 'PT': 'Y eso que allí el café cuesta un euro.',
         'KE': 'Y eso que tiene un café buenísimo.', 'HR': '!nada.', 'SI': '!tampoco.', 'BA': '!tampoco.', 'XK': '!no.', 'AL': '!no.'}
    T = {'US': (V['US'], '¡Nació en Seattle, en 1971! Al principio solo vendía café en grano.'),
         'MX': (V['MX'], '¡Claro que hay, carnal! Pero yo me quedo con mi café de olla.'),
         'ES': (V['ES'], '¡Sí hay, tío! Pero aquí un cortado en el bar es sagrado.'),
         'IT': (V['IT'], '¿Starbucks en Italia? ¡Llegó en 2018! Aquí el espresso se toma de pie y en diez segundos.'),
         'RU': (V['RU'], 'Starbucks se fue en 2022... ¡y ahora el logo tiene una estrella! Stars Coffee.'),
         'AU': (V['AU'], '¡En 2008 cerramos casi todos, mate! Aquí el flat white de barrio gana.'),
         'ET': (V['AF'], '¡Aquí nació el café, hace siglos! ¿Para qué queremos Starbucks?'),
         'CU': (V['CU'], 'Oye, un Starbucks hay... ¡pero dentro de la base de Guantánamo! Los cubanos ni lo olemos.'),
         'JP': (V['JP'], '¡Más de mil ochocientos! Y con sabores que solo hay aquí, como el de flor de cerezo.'),
         'IN': (V['IN'], '¡Hay casi quinientos! Pero el chai de la calle cuesta diez veces menos.'),
         'VA': (V['VA'], 'En el Vaticano no hay Starbucks. Pero a la salida de la plaza... ¡hay de todo!')}
    SUB = {'_D': 'Hay locales', '_C': 'Cerró todos sus locales', '_A': 'Ni un solo local',
           'US': '~16.900 locales · Seattle, 1971', 'CN': '~8.100 locales', 'KR': '+2.000 locales', 'JP': '+1.800 locales',
           'IT': 'Llegó en 2018', 'RU': 'Se fue en 2022 · ahora "Stars Coffee"', 'IL': 'Abrió 2001 · Cerró 2003', 'AU': 'Cerró 61 locales en 2008',
           'CU': 'Solo en la base de Guantánamo', 'ET': 'Donde nació el café', 'EG': 'Desde 2006', 'ZA': 'Desde 2016', 'CO': 'Desde 2014',
           'IN': '~500 locales', 'SA': '~420 locales', 'NG': '+200 millones de personas'}
    VT = {'D': ('HAY', 'SÍ'), 'C': ('SE FUE', 'SE FUE'), 'A': ('NO HAY', 'NO')}
    C = rows(st, phr, X, SUB, VT)
    cfg = dict(title='¿DÓNDE NO HAY STARBUCKS?', icon='cup', t1='¿DÓNDE NO', t2='HAY STARBUCKS?', badge='197 PAÍSES',
               cats=cats, balls=['US', 'CN', 'IT', 'RU', 'ET', 'NG'], ballMoods=['happy', 'happy', 'angry', 'angry', 'sad', 'sad'],
               best=['US', 'EL QUE MÁS', '16.900'], worst=['ET', 'CUNA DEL CAFÉ', 'NI UNO'],
               ask='¿HAY STARBUCKS EN TU CIUDAD? ¡COMENTA!', head='STARBUCKS')
    intro = ['Starbucks tiene más de cuarenta mil cafeterías... y aun así, en más de la mitad de los países del mundo no hay ni una. Hoy revisamos los ciento noventa y siete, uno por uno.',
             'Verde: hay Starbucks.', 'Amarillo: lo tuvo, y se fue.', 'Y rojo: no hay ni uno. ¡Vamos!']
    outro = ['¿Hay Starbucks en tu ciudad? ¡Comenta!']
    return dict(key='sbx', narr=NARR, C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ======================================================================= TACO BELL
TBL = set('''US CA GT SV CR PA CO EC PE CL BR DO GB ES PT NL FI SE RO CY BA RS
SA KW IN LK TH MY ID PH CN KR JP AU NZ'''.split())
def tbl():
    F = {'MX': 2010, 'SG': 2008, 'IS': 2008}
    SOON = set('DE PL AE GR'.split())
    def st(c): return 'C' if c in F else 'E' if c in SOON else 'D' if c in TBL else 'A'
    cats = [cat('D', 'HAY TACO BELL', 'HAY', GREEN, '#17803d', 'happy'),
            cat('E', 'LLEGA AHORA', 'LLEGA', PUR, '#5e2ca5', 'happy'),
            cat('C', 'LO TUVO, Y SE FUE', 'SE FUE', YEL, '#b38e00', 'angry'),
            cat('A', 'NO HAY', 'NO HAY', RED, '#a51f1f', 'sad')]
    phr = {'D': ['sí hay.', 'hay.', 'sí.', '¡hay!'], 'E': ['¡está llegando!'], 'C': ['se fue.'], 'A': ['no hay.', 'nada.', 'tampoco.', 'ni uno.', 'no.']}
    X = {'US': '¡Más de siete mil quinientos!', 'MX': '!se fue... ¡y fracasó dos veces! Ni los mexicanos se lo creyeron.', 'ES': '¡El mayor fuera de Estados Unidos!',
         'GB': 'El segundo de Europa.', 'IN': 'Y sin carne de vaca.', 'SG': '!se fue en 2008.', 'IS': '!lo tuvo... y se fue.',
         'DE': 'Después de un intento fallido, ahora sí.', 'PL': 'Abre a finales de 2026.', 'AE': 'Vuelve después de catorce años.', 'GR': 'Vuelve, tras cerrar en 2010.',
         'FR': '!ni uno... de momento: está en sus planes.', 'ZA': 'Pero está en sus planes.', 'IT': '!nada. Aquí la pizza no se toca.',
         'CN': 'Con un menú muy distinto.', 'FI': 'Y le va de maravilla.', 'BA': '!¡sorpresa! Sí hay.', 'RS': '!sí, en Belgrado.', 'KP': '!ni de broma.',
         'AR': '!nada... y eso que les encanta la carne.', 'AU': 'Llegó en 2017.', 'CA': 'Más de cien.', 'RU': '!nada.', 'VA': ''}
    T = {'US': (V['US'], '¡Nació en California en 1962! Y ojo: el primer local se llamaba Taco-Tia.'),
         'MX': (V['MX'], '¿Taco Bell en México? ¡Lo intentaron dos veces, güey! Nadie quiere un taco de cartón teniendo tacos al pastor.'),
         'ES': (V['ES'], '¡Más de cien locales, tío! Somos el país del mundo con más Taco Bell después de Estados Unidos.'),
         'GB': (V['GB'], 'Tenemos más de cien. ¡Y ahora sí, ponemos picante a todo!'),
         'IN': (V['IN'], '¡Hay! Y aquí el burrito más famoso es de patata con especias.'),
         'IT': (V['IT'], '¿Taco Bell? Mamma mia... ¡aquí comemos pizza, no tacos!'),
         'DE': (V['DE'], 'Lo intentamos en 2024 y no salió. ¡Ahora va en serio, con fecha y todo!'),
         'AR': (V['AR'], '¿Taco Bell? ¡Che, aquí con un buen choripán no nos hace falta!'),
         'JP': (V['JP'], '¡Hay! Y con taco de arroz... ¡solo en Japón!'),
         'AU': (V['AU'], '¡Llegó en 2017, mate! Ahora hay más de treinta.'),
         'VA': (V['VA'], 'En el Vaticano no hay Taco Bell. Pero en Roma, para los turistas... ¡ya veremos!')}
    SUB = {'_D': 'Hay locales', '_E': 'Abre en 2026', '_C': 'Cerró todos sus locales', '_A': 'Ni un solo local',
           'US': '+7.500 locales · California, 1962', 'MX': 'Fracasó en 1992 y en 2007', 'ES': 'El mayor fuera de EE. UU.',
           'SG': 'Cerró en 2008', 'DE': 'Primeros locales a finales de 2026', 'PL': 'Primer local a finales de 2026', 'AE': 'Vuelve tras 14 años',
           'GR': 'Cerró en 2010 · vuelve', 'FR': 'En sus planes hasta 2030', 'ZA': 'En sus planes hasta 2030', 'AU': 'Desde 2017'}
    VT = {'D': ('HAY', 'SÍ'), 'E': ('LLEGA', 'PRONTO'), 'C': ('SE FUE', 'SE FUE'), 'A': ('NO HAY', 'NO')}
    C = rows(st, phr, X, SUB, VT)
    cfg = dict(title='¿DÓNDE NO HAY TACO BELL?', icon='taco', t1='¿DÓNDE NO', t2='HAY TACO BELL?', badge='197 PAÍSES',
               cats=cats, balls=['US', 'ES', 'MX', 'GB', 'IT', 'AR'], ballMoods=['happy', 'happy', 'angry', 'happy', 'sad', 'sad'],
               best=['ES', 'EL MAYOR FUERA', 'DE EE. UU.'], worst=['MX', 'FRACASÓ', 'DOS VECES'],
               ask='¿HAS PROBADO TACO BELL? ¡COMENTA!', head='TACO BELL')
    intro = ['Taco Bell es la cadena de tacos más grande del mundo... pero en México, el país de los tacos, ¡no hay ni uno! Hoy revisamos los ciento noventa y siete países, uno por uno.',
             'Verde: hay Taco Bell.', 'Morado: está llegando.', 'Amarillo: lo tuvo, y se fue.', 'Y rojo: no hay. ¡Vamos!']
    outro = ['¿Has probado Taco Bell? ¡Comenta!']
    return dict(key='tbl', narr=NARR, C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ======================================================================= V2: más contenido (mínimo 8 min)
V.update({'CA': 'N2lVS1w4EtoT3dr4eOWO', 'IS': 'jTAlT4VvvXlYNDrxqpNQ', 'JM': 'TT7tPlYlWLvcEiOfrtEK'})
def _v2(base, add, rep, talk, intro0):
    def f():
        S = base()
        for c in S['C']:
            if c['c'] in rep: c['say'] = f"{nm(c['c'])}: {rep[c['c']]}"
            elif c['c'] in add: c['say'] += ' ' + add[c['c']]
        for cc, (vk, t) in talk.items(): S['T'][cc] = (V[vk], t)
        if intro0: S['intro'][0] = intro0
        return S
    return f
rbx = _v2(rbx, {}, {}, {
    'GB': ('GB', '¡Se puede jugar! Pero ahora, para chatear, hay que verificar la edad.'),
    'FR': ('FR', 'Sí se puede jugar... ¡pero que no se entere mi madre!'),
    'AR': ('AR', '¡Acá se juega, che! Y los pibes no sueltan la compu.'),
    'DE': ('DE', 'Se puede jugar, pero con muchos controles. ¡Todo muy ordenado!'),
    'CU': ('CU', '¡Ni Roblox ni nada, asere! Sin servicio por las sanciones.'),
    'IR': ('IR', 'Aquí no entra por las sanciones... pero los chavales siempre encuentran la manera.'),
    'IT': ('IT', '¡Se puede jugar! Pero en Italia, a la hora de comer, ¡la consola se apaga!'),
    'VA': ('VA', '¿Roblox en el Vaticano? Bueno... aquí se reza más de lo que se juega.')},
    'Roblox lo juegan más de cien millones de personas al día... y casi la mitad son niños. Pero en algunos países, si entras, te lo encuentras bloqueado. Hoy revisamos los ciento noventa y siete países, uno por uno.')
sbx = _v2(sbx, {'MX': 'Con cientos de locales.', 'AT': 'Y eso que Viena es la capital de las cafeterías.', 'GR': 'Y eso que allí reina el frapé.',
                'CH': 'Y con precios suizos.', 'KZ': 'El que más tiene de Asia Central.', 'AE': 'Más de trescientos.', 'KW': 'Muchísimos para un país tan pequeño.',
                'PH': 'Más de cuatrocientos.', 'ID': 'Más de quinientos.', 'TH': 'Más de cuatrocientos.', 'TW': 'Más de quinientos.',
                'MA': 'De los pocos de África.'},
    {'JM': 'hay.', 'IS': 'ni uno.', 'NG': 'ni uno.'}, {
    'FR': ('FR', '¡Hay Starbucks en París! Pero un café en la terraza de siempre... no tiene precio.'),
    'GB': ('GB', '¡Más de mil doscientos! Aquí casi hay más Starbucks que pubs... casi.'),
    'KP': ('KP', '¿Café americano? Aquí no. Siguiente.'),
    'CN': ('CN', '¡Más de ocho mil! Pero ahora aquí manda Luckin Coffee... ¡que ya tiene más que Starbucks!'),
    'TR': ('BALK', '¡Hay más de seiscientos! Pero aquí el café turco es sagrado.'),
    'BR': ('BR', '¡Hay Starbucks! Pero ojo: Brasil es el mayor productor de café del mundo.'),
    'AR': ('AR', '¡Hay Starbucks, che! Pero acá lo nuestro es el mate.'),
    'JM': ('JM', '¡Aquí está el café de las Montañas Azules, de los más caros del mundo! Y sí... también hay Starbucks.'),
    'IS': ('IS', '¿Starbucks? Aquí no hay ni uno. ¡Tenemos nuestras propias cafeterías!'),
    'NG': ('AF', '¡Doscientos millones de personas y ni un Starbucks! Aquí el café... se toma en casa.')},
    'Starbucks tiene más de cuarenta mil cafeterías en todo el planeta... y aun así, en más de la mitad de los países del mundo no hay ni una. Y en el país donde nació el café... tampoco. Hoy revisamos los ciento noventa y siete, uno por uno.')
tbl = _v2(tbl, {'PT': 'Y no para de abrir locales.', 'NL': 'Llegó en 2017, a Eindhoven.', 'RO': 'Desde 2017, en Bucarest.',
                'CY': 'Desde 2009, en Limasol.', 'KW': 'Uno de los pocos del Golfo.',
                'SA': 'En Riad y en Jobar.', 'TH': 'Con locales en Bangkok y Pattaya.', 'ID': 'Casi todos en Yakarta.',
                'CR': '¡Desde 1990! De los primeros fuera de Estados Unidos.', 
                'NZ': 'Llegó después que a Australia.', 'PE': 'En el país del ceviche.'},
    {'BZ': 'nada. Y tiene a México al lado... que tampoco.', 'FI': '¡hay! Más de quince, casi todos en Helsinki.', 'GT': '¡hay! Justo al lado de México... que no tiene.'}, {
    'CA': ('CA', '¡Más de cien locales! Y aquí los pedimos a cualquier hora... ¡hasta con nieve!'),
    'FR': ('FR', '¿Taco Bell? Todavía no... ¡pero aquí inventamos los tacos franceses, con patatas fritas dentro!'),
    'IS': ('IS', 'Tuvimos Taco Bell... y se fue. Ahora aquí lo más picante es el viento.'),
    'CN': ('CN', '¡Aquí sí hay! Con un menú solo para China... y otro tipo de picante.'),
    'BR': ('BR', '¡Hay Taco Bell en Brasil! Pero aquí la estrella sigue siendo la picanha.'),
    'CU': ('CU', '¿Taco Bell en Cuba? Aquí ni taco ni campana, asere.'),
    'KP': ('KP', '¿Taco Bell? Aquí la única campana es la que suena para ir a trabajar. Siguiente.'),
    'JM': ('JM', '¿Taco Bell? Aquí no hay... ¡pero con nuestro pollo jerk no lo echamos de menos!'),
    'TR': ('BALK', '¿Taco Bell? ¡Aquí tenemos un döner en cada esquina!'),
    'NG': ('AF', '¡Somos doscientos millones y ni un Taco Bell! Pero nuestro arroz jollof le gana a cualquier taco.'),
    'RS': ('BALK', '¡Sí hay, en Belgrado! Y con ración extra de ajvar.')},
    'Taco Bell es la cadena de tacos más grande del mundo, con más de ocho mil quinientos locales... pero en México, el país de los tacos, ¡no hay ni uno! Hoy revisamos los ciento noventa y siete países, uno por uno.')
