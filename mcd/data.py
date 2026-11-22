# Datos de "¿Dónde NO hay McDonald's?" — fuente: Wikipedia, List of countries with McDonald's restaurants (nov 2026)
# Estado: H = hay McDonald's, F = se fue (cerró), N = nunca llegó
NAMES = {
 'US':'Estados Unidos','CA':'Canadá','MX':'México','GB':'Reino Unido','IE':'Irlanda','FR':'Francia','ES':'España','PT':'Portugal','AD':'Andorra','IT':'Italia','SM':'San Marino','VA':'Vaticano','MT':'Malta','MC':'Mónaco','CH':'Suiza','LI':'Liechtenstein','AT':'Austria','DE':'Alemania','LU':'Luxemburgo','BE':'Bélgica','NL':'Países Bajos','DK':'Dinamarca','NO':'Noruega','SE':'Suecia','FI':'Finlandia','IS':'Islandia',
 'PL':'Polonia','CZ':'Chequia','SK':'Eslovaquia','HU':'Hungría','SI':'Eslovenia','HR':'Croacia','BA':'Bosnia','RS':'Serbia','ME':'Montenegro','XK':'Kosovo','AL':'Albania','MK':'Macedonia del Norte','GR':'Grecia','BG':'Bulgaria','RO':'Rumanía','MD':'Moldavia','UA':'Ucrania','BY':'Bielorrusia','LT':'Lituania','LV':'Letonia','EE':'Estonia','RU':'Rusia','CY':'Chipre','TR':'Turquía',
 'CO':'Colombia','VE':'Venezuela','EC':'Ecuador','PE':'Perú','BO':'Bolivia','CL':'Chile','AR':'Argentina','UY':'Uruguay','PY':'Paraguay','BR':'Brasil','GY':'Guyana','SR':'Surinam',
 'PA':'Panamá','CR':'Costa Rica','NI':'Nicaragua','HN':'Honduras','SV':'El Salvador','GT':'Guatemala','BZ':'Belice','CU':'Cuba','JM':'Jamaica','HT':'Haití','DO':'Rep. Dominicana','BS':'Bahamas','BB':'Barbados','TT':'Trinidad y Tobago','GD':'Granada','VC':'San Vicente','LC':'Santa Lucía','DM':'Dominica','AG':'Antigua y Barbuda','KN':'San Cristóbal y Nieves',
 'GE':'Georgia','AM':'Armenia','AZ':'Azerbaiyán','KZ':'Kazajistán','UZ':'Uzbekistán','TM':'Turkmenistán','KG':'Kirguistán','TJ':'Tayikistán','AF':'Afganistán','IR':'Irán','IQ':'Irak','SY':'Siria','LB':'Líbano','IL':'Israel','PS':'Palestina','JO':'Jordania','SA':'Arabia Saudí','YE':'Yemen','OM':'Omán','AE':'Emiratos Árabes','QA':'Catar','BH':'Baréin','KW':'Kuwait',
 'IN':'India','PK':'Pakistán','NP':'Nepal','BT':'Bután','BD':'Bangladés','LK':'Sri Lanka','MV':'Maldivas','MM':'Myanmar','TH':'Tailandia','LA':'Laos','KH':'Camboya','VN':'Vietnam','MY':'Malasia','SG':'Singapur','ID':'Indonesia','BN':'Brunéi','PH':'Filipinas','TL':'Timor Oriental','CN':'China','MN':'Mongolia','KP':'Corea del Norte','KR':'Corea del Sur','JP':'Japón','TW':'Taiwán',
 'AU':'Australia','NZ':'Nueva Zelanda','PG':'Papúa Nueva Guinea','SB':'Islas Salomón','VU':'Vanuatu','FJ':'Fiyi','WS':'Samoa','TO':'Tonga','KI':'Kiribati','TV':'Tuvalu','NR':'Nauru','MH':'Islas Marshall','FM':'Micronesia','PW':'Palaos',
 'MA':'Marruecos','DZ':'Argelia','TN':'Túnez','LY':'Libia','EG':'Egipto','SD':'Sudán','SS':'Sudán del Sur','ET':'Etiopía','ER':'Eritrea','DJ':'Yibuti','SO':'Somalia','KE':'Kenia','UG':'Uganda','RW':'Ruanda','BI':'Burundi','TZ':'Tanzania','MZ':'Mozambique','MW':'Malaui','ZM':'Zambia','ZW':'Zimbabue','BW':'Botsuana','NA':'Namibia','ZA':'Sudáfrica','LS':'Lesoto','SZ':'Esuatini','MG':'Madagascar','MU':'Mauricio','KM':'Comoras','SC':'Seychelles','AO':'Angola','CD':'R. D. del Congo','CG':'Congo','GA':'Gabón','GQ':'Guinea Ecuatorial','CM':'Camerún','CF':'Rep. Centroafricana','TD':'Chad','NE':'Níger','NG':'Nigeria','BJ':'Benín','TG':'Togo','GH':'Ghana','CI':'Costa de Marfil','BF':'Burkina Faso','ML':'Malí','MR':'Mauritania','SN':'Senegal','GM':'Gambia','GW':'Guinea-Bisáu','GN':'Guinea','SL':'Sierra Leona','LR':'Liberia','CV':'Cabo Verde','ST':'Santo Tomé',
}
HAS = set('US CA PR CR AU JP NL PA DE FR SV SE GT GB BS NZ CH IE AT BE BR SG ES DK PH MY NO TW AD FI TH IT LU VE MX TR AR RS KR HU CN CL ID PT GR UY CZ PL MC BN MA IL SI SA KW OM EG BG BH LV AE EE RO MT CO SK ZA QA HN HR WS FJ LI LT IN PE JO PY DO TT UA CY EC SR MD NI LB PK GE AZ MU VN IQ'.split())
LEFT = {'BB':1990,'BO':2002,'JM':2005,'ME':2007,'IS':2009,'MK':2013,'SM':2019,'RU':2022,'BY':2022,'BA':2022,'KZ':2023,'LK':2024}
def status(c):
    if c in LEFT: return 'F'
    if c in HAS: return 'H'
    return 'N'

ORDER = '''US CA MX
GB IE FR ES PT AD IT SM MT MC CH LI AT DE LU BE NL DK NO SE FI IS
PL CZ SK HU SI HR BA RS ME XK AL MK GR BG RO MD UA BY LT LV EE RU CY TR
CO VE EC PE BO CL AR UY PY BR GY SR
PA CR NI HN SV GT BZ CU JM HT DO BS BB TT GD VC LC DM AG KN
GE AM AZ KZ UZ TM KG TJ AF IR IQ SY LB IL PS JO SA YE OM AE QA BH KW
IN PK NP BT BD LK MV MM TH LA KH VN MY SG ID BN PH TL CN MN KP KR JP TW
AU NZ PG SB VU FJ WS TO KI TV NR MH FM PW
MA DZ TN LY EG SD SS ET ER DJ SO KE UG RW BI TZ MZ MW ZM ZW BW NA ZA LS SZ MG MU KM SC AO CD CG GA GQ CM CF TD NE NG BJ TG GH CI BF ML MR SN GM GW GN SL LR CV ST
VA'''.split()
assert len(ORDER) == 197 == len(set(ORDER)), (len(ORDER), len(set(ORDER)))
assert all(c in NAMES for c in ORDER)
if __name__ == '__main__':
    from collections import Counter
    print(Counter(status(c) for c in ORDER))
