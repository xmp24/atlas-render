# Guiones de los vídeos numéricos (motor "país por país con valor")
#   alt = Atlas Loco #1  · La altura media de cada país
#   sue = El Mapa Curioso #1 · El sueldo mínimo de cada país
import json, math, os, sys
sys.path.insert(0, '/home/claude/atlas-render/mcd')
from data import ORDER, NAMES
from num2words import num2words
R = '/home/claude/atlas-render/mcd2/'
RAW = json.load(open(R + 'raw.json'))

SP = {'DO': 'República Dominicana', 'CD': 'República Democrática del Congo', 'CF': 'República Centroafricana'}
def nm(c): return SP.get(c, NAMES[c])
def w(n): return num2words(int(n), lang='es')
def fmt(n): return f'{int(round(n)):,}'.replace(',', '.')

# ---------------------------------------------------------------- ALTURA
def alt():
    H = RAW['H']; EST = set(RAW['EST']['H'])
    cats = [
        dict(k='A', label='MENOS DE 1,65', short='-1,65', col='#ee4646', cold='#a51f1f', mood='sad'),
        dict(k='B', label='1,65 – 1,70', short='1,65+', col='#ff8c2e', cold='#b35a0c', mood='angry'),
        dict(k='C', label='1,70 – 1,75', short='1,70+', col='#ffd23f', cold='#b38e00', mood='happy'),
        dict(k='D', label='1,75 – 1,80', short='1,75+', col='#2fbf63', cold='#17803d', mood='happy'),
        dict(k='E', label='MÁS DE 1,80', short='1,80+', col='#9b5de5', cold='#5e2ca5', mood='happy'),
    ]
    def cat(m): return 'A' if m < 165 else 'B' if m < 170 else 'C' if m < 175 else 'D' if m < 180 else 'E'
    X = {  # comentario del narrador tras el valor
        'CA': 'Más que su vecino de abajo.', 'IE': '¡Los irlandeses les ganan a los ingleses!',
        'PT': 'Los más bajitos de Europa occidental.', 'BE': '¡Segundo del mundo!',
        'NL': '¡Los hombres más altos del planeta!', 'DK': 'Empatado con Letonia.', 'EE': '¡Tercero del mundo!',
        'LV': 'Y ojo: sus mujeres, las más altas del mundo.', 'RS': 'Los Balcanes, una fábrica de gigantes.',
        'GT': 'Y atención: sus mujeres son las más bajitas del mundo. ¡Un metro cuarenta y nueve!',
        'PE': 'Los más bajitos de Sudamérica.', 'YE': '¡Segundo más bajito del mundo!', 'LA': 'Tercero más bajito del mundo.',
        'PH': 'Y sus mujeres, casi las más bajitas del planeta.', 'TL': '¡El país más bajito del mundo!',
        'CN': 'Y cada generación, un poco más alto.', 'KR': '¡Les sacan cuatro centímetros a los japoneses!',
        'KP': 'Tres centímetros menos que sus vecinos del sur.', 'TO': '¡Los gigantes del Pacífico!',
        'MG': 'Cuarto más bajito del mundo.', 'SN': 'De los más altos de África.', 'CZ': 'El club de los uno ochenta.',
        'BA': '¡El más alto de los Balcanes!', 'MX': '', 'BR': 'Medio metro... ¡no!, medio centímetro menos que Argentina... casi.',
        'IN': '', 'NP': 'De los más bajitos de Asia.', 'BD': 'Y sus mujeres, de las más bajitas: uno cincuenta.',
        'SS': 'No hay datos oficiales... ¡pero aquí viven los dinka, de los pueblos más altos del mundo!',
        'VA': 'Y para entrar en la Guardia Suiza, piden mínimo un metro setenta y cuatro.',
        'RW': 'De los más bajitos de África.', 'MW': 'También muy bajitos.',
    }
    X['BR'] = 'Un centímetro menos que Argentina.'
    T = {  # países que hablan (voz, texto)
        'US': ('PbdeBaBBJTgZkIRcTU1J', '¡Uno setenta y siete! Bueno... con las botas de cowboy, uno noventa.'),
        'MX': ('qKiF0EEU7wtRm1G2mLMh', '¡Uno sesenta y nueve, güey! Pero con el sombrero... ¡llegamos al techo!'),
        'ES': ('d5UAjYhvzEX3wkRfxPTM', '¡Uno setenta y seis, oye! Y en las fotos de grupo, siempre detrás.'),
        'NL': ('COD96vfwrPlMeaUXwauW', '¡Desde aquí arriba os veo a todos muy pequeñitos!'),
        'BA': ('mgZYFBDKPJGhiZEAcf4X', '¡En los Balcanes jugamos al baloncesto sin saltar!'),
        'AR': ('D09EpJbk4um1HKSpeTSc', '¡Uno setenta y cuatro, che! Y Messi mide uno setenta... y es el mejor del mundo.'),
        'IN': ('pnoafjwb2T2zx4YYE60H', '¿Bajitos? ¡Somos mil cuatrocientos millones! Todos juntos medimos más que nadie.'),
        'JP': ('1naQcvaoaQTXNd36WqlD', 'Uno setenta... pero nuestros robots gigantes miden dieciocho metros.'),
        'TL': ('BtpRfPpxFVRP0vhn1qSr', '¡Oye, oye! Lo importante no es la altura... ¡es la altura de miras!'),
        'SS': ('3W7TIElBzp1JQ8BxQuXK', '¡Aquí hay gente de más de dos metros! ¡Que vuelvan a medirnos!'),
        'AU': ('dSX8MUEljgxrFygPwhF5', '¡Uno setenta y nueve, mate! Pero los canguros nos ganan saltando.'),
    }
    C = []
    for c in ORDER:
        m, f = H[c]; cm = int(m); est = c in EST
        say = f'{nm(c)}: {"más o menos " if est else ""}un metro {w(cm - 100)}.'
        if c == 'NL': say = 'Países Bajos: ¡un metro ochenta y dos y medio!'
        if X.get(c): say += ' ' + X[c]
        v = f'{m:.1f}'.replace('.', ',') + ' cm'
        C.append(dict(c=c, st=cat(m), val=m, v=v, vs=f'{int(m)/100:.2f}'.replace('.', ','),
                      sub=('Estimación · ' if est else '') + f'Mujeres: {f:.1f} cm'.replace('.', ','), say=say))
    cfg = dict(
        title='LA ALTURA DE CADA PAÍS', icon='ruler', t1='¿CUÁNTO MIDE', t2='CADA PAÍS?', badge='197 PAÍSES · HOMBRES',
        cats=cats, balls=['NL', 'US', 'MX', 'JP', 'IN', 'TL'], ballMoods=['happy', 'happy', 'sad', 'happy', 'angry', 'sad'],
        best=['NL', 'MÁS ALTOS', '1,82 m'], worst=['TL', 'MÁS BAJITOS', '1,60 m'],
        ask='¿Y TÚ, CUÁNTO MIDES? ¡COMENTA!', head='ALTURA MEDIA')
    intro = ['¿En qué país la gente es más alta del mundo? ¿Y en cuál es más bajita? Hoy medimos los ciento noventa y siete países del planeta, uno por uno, con la altura media de los hombres.',
             'Rojo: menos de un metro sesenta y cinco.', 'Naranja: hasta uno setenta.', 'Amarillo: hasta uno setenta y cinco.',
             'Verde: hasta uno ochenta.', 'Y morado... ¡los gigantes de más de uno ochenta! En la tarjeta verás también a las mujeres. ¡Vamos!']
    outro = ['¿Y tú, cuánto mides? ¡Te leo en comentarios!']
    return dict(key='alt', narr='w495jEjc73YEWOkc3VLu', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ---------------------------------------------------------------- SUELDO MÍNIMO
def sue():
    W = dict(RAW['W'])
    W.update({'LU': 3150, 'NL': 2950, 'GB': 2920, 'IE': 2840, 'DE': 2790, 'AU': 2710, 'BE': 2450, 'NZ': 2400, 'FR': 2110,
              'MC': 2220, 'AD': 1490, 'ES': 1600, 'CY': 1160, 'MX': 520, 'EC': 482, 'CU': 5, 'GE': 7, 'NG': 48, 'NA': 195,
              'VE': 0.5, 'SD': 0.5, 'KP': None})
    cats = [
        dict(k='X', label='NO TIENE', short='NO', col='#8f86a8', cold='#5c5475', mood='happy'),
        dict(k='A', label='MENOS DE 100 $', short='-100', col='#ee4646', cold='#a51f1f', mood='sad'),
        dict(k='B', label='100 – 300 $', short='100+', col='#ff8c2e', cold='#b35a0c', mood='angry'),
        dict(k='C', label='300 – 700 $', short='300+', col='#ffd23f', cold='#b38e00', mood='happy'),
        dict(k='D', label='700 – 1.500 $', short='700+', col='#2fbf63', cold='#17803d', mood='happy'),
        dict(k='E', label='MÁS DE 1.500 $', short='1.500+', col='#9b5de5', cold='#5e2ca5', mood='happy'),
    ]
    def cat(v): return 'X' if v is None else 'A' if v < 100 else 'B' if v < 300 else 'C' if v < 700 else 'D' if v < 1500 else 'E'
    def spoken(v):
        if v < 1: return 'menos de un dólar'
        r = int(v) if v < 100 else int(v // 5) * 5 if v < 1000 else int(v // 50) * 50
        t = 'un dólar' if r == 1 else w(r) + ' dólares'
        return t.replace('uno dólares', 'un dólares')
    X = {
        'LU': '¡El sueldo mínimo más alto del mundo!', 'NL': 'Segundo del mundo.', 'IE': 'Casi empatado con los ingleses.',
        'CH': 'Cada cantón pone el suyo... ¡y en Ginebra pasa de cinco mil!', 'IT': 'Allí lo fijan los convenios.',
        'AT': 'También por convenio.', 'DK': 'Y aun así, de los sueldos más altos.', 'NO': 'Lo mismo que sus vecinos.',
        'VE': '¡Al mes!', 'SD': 'La inflación se lo ha comido.', 'EC': 'Y en dólares de verdad: ¡allí usan el dólar!',
        'SA': 'Pero solo para los saudíes.', 'KP': 'Bueno... nadie lo sabe.', 'KG': 'De los más bajos de Asia.',
        'CY': 'Lo estrenó hace poco.', 'QA': 'Más comida y alojamiento.', 
        
        'NZ': 'Casi como sus vecinos.', 'SG': 'Y es uno de los países más ricos del mundo.', 'AE': 'Ni Dubái.',
        'CN': 'Y cambia según la provincia.', 'JP': 'Y depende de la prefectura.', 'RU': '', 'NA': 'Lo estrenó en 2025.',
        'BD': 'El sueldo de las fábricas de ropa.', 'TR': '¡Y lo suben cada año por la inflación!', 'IL': 'El más alto de Oriente Medio.',
        'SM': 'Pequeño, pero bien pagado.', 'MC': 'Un poco más que en Francia.', 'PL': '¡Ha subido muchísimo!',
    }
    T = {
        'US': ('5hwrYfkFdtVsiDRs66iv', '¡Siete dólares con veinticinco la hora! ¡Desde 2009 no lo suben!'),
        'MX': ('INWTGvzKdMrRuRgTL1rY', '¡Desde 2018 se ha triplicado, eh! Ahora sí alcanza para los tacos.'),
        'ES': ('D7dkYvH17OKLgp4SLulf', '¡Y en catorce pagas, eh! Que aquí la paga extra es sagrada.'),
        'GB': ('h5EerLZbdVHFXe9rEGjM', 'Casi tres mil dólares... ¡y aun así una pinta cuesta un riñón!'),
        'DE': ('COD96vfwrPlMeaUXwauW', '¡Trece euros con noventa la hora! Todo muy ordenado.'),
        'SE': ('WdIPSrSt3hS2coCWJ8HG', '¿Sueldo mínimo? Aquí no hay ley... lo pactan los sindicatos, ¡y sale alto!'),
        'AR': ('S9xWbRwkWxZfSdk9ZG27', '¿Doscientos setenta y cinco dólares? Che, con la inflación... ¡mañana es otro número!'),
        'VE': ('CCXmXKZExbF90N5aaPWM', '¡Ciento treinta bolívares, mi pana! Menos mal que existen los bonos.'),
        'CU': ('P5oKQC0uccAVbhCpX8GX', '¡Dos mil cien pesos! Al cambio de la calle... ¡ni cinco dólares, asere!'),
        'GE': ('mgZYFBDKPJGhiZEAcf4X', '¡Veinte laris al mes! Unos siete dólares... ¡y sin tocarlo desde 1999!'),
        'NG': ('3W7TIElBzp1JQ8BxQuXK', '¡Setenta mil nairas! Suena a muchísimo... hasta que lo pasas a dólares.'),
        'IN': ('PYRaAAjVbDEj4aaaEcjn', 'El mínimo nacional es pequeñito... ¡pero cada estado pone el suyo!'),
    }
    C = []; flip = 0
    for c in ORDER:
        v = W.get(c); n = nm(c)
        if v is None:
            flip += 1
            say = f'{n}: ¡no tiene sueldo mínimo!' if flip % 2 else f'{n}: ¡sin sueldo mínimo!'
            if c == 'KP': say = 'Corea del Norte: ¡ni idea!'
            vtxt, vs = 'NO TIENE', 'NO'
        else:
            say = f'{n}: {spoken(v)}.'
            vtxt = ('< 1 $' if v < 1 else fmt(v) + ' $') + ' / mes'; vs = '<1 $' if v < 1 else fmt(v) + ' $'
        if X.get(c): say += ' ' + X[c]
        sub = {'CU': '2.100 pesos al cambio informal', 'VE': '130 bolívares (sin contar bonos)', 'GE': '20 laris al mes desde 1999',
               'US': 'Federal: 7,25 $ la hora', 'CH': 'Solo algunos cantones', 'SA': 'Solo para ciudadanos saudíes',
               'KP': 'Sin datos', 'IN': 'Mínimo nacional (los estados ponen más)'}.get(c, 'Al mes, en dólares' if v is not None else 'Sin sueldo mínimo nacional')
        C.append(dict(c=c, st=cat(v), val=v if v is not None else -1, v=vtxt, vs=vs, sub=sub, say=say))
    cfg = dict(
        title='EL SUELDO MÍNIMO DE CADA PAÍS', icon='money', t1='¿CUÁNTO SE COBRA', t2='EN CADA PAÍS?', badge='SUELDO MÍNIMO · $ AL MES',
        cats=cats, balls=['LU', 'US', 'ES', 'MX', 'VE', 'SE'], ballMoods=['happy', 'angry', 'happy', 'happy', 'sad', 'happy'],
        best=['LU', 'EL MÁS ALTO', '3.150 $'], worst=['VE', 'EL MÁS BAJO', '< 1 $'],
        ask='¿TE ALCANZA EL SUELDO MÍNIMO? ¡COMENTA!', head='SUELDO MÍNIMO')
    intro = ['¿Cuánto cobra al mes alguien con el sueldo mínimo en cada país del mundo? En uno pasa de tres mil dólares... y en otro, no llega ni a uno. Los ciento noventa y siete países, uno por uno, todo pasado a dólares al mes.',
             'Gris: no tiene sueldo mínimo.', 'Rojo: menos de cien dólares.', 'Naranja: hasta trescientos.', 'Amarillo: hasta setecientos.',
             'Verde: hasta mil quinientos.', 'Y morado... ¡más de mil quinientos dólares! ¡Empezamos!']
    outro = ['¿Y a ti, te alcanza el sueldo mínimo? ¡Cuéntamelo en comentarios!']
    return dict(key='sue', narr='w495jEjc73YEWOkc3VLu', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

VIDEOS = {'alt': alt, 'sue': sue}

if __name__ == '__main__':
    for k, fn in VIDEOS.items():
        V = fn()
        n = sum(len(c['say']) for c in V['C']) + sum(len(x) for x in V['intro'] + V['outro']) + sum(len(t[1]) for t in V['T'].values())
        from collections import Counter
        print(k, 'caracteres', n, Counter(c['st'] for c in V['C']))
        json.dump(V, open(R + f'{k}_script.json', 'w'), ensure_ascii=False, indent=0)
        for c in V['C'][:4] + V['C'][-3:]: print('  ', c['say'], '|', c['v'], '|', c['sub'])

from videos_b import nav, rbx, sbx, tbl
VIDEOS.update({'nav': nav, 'rbx': rbx, 'sbx': sbx, 'tbl': tbl})
