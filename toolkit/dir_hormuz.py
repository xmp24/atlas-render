"""The Battle for the Strait of Hormuz (hypothetical simulation) -> src/hw/hormuz.json"""
import wlib2 as W
from wlib2 import *

US, ir, ye, sa, ae, qa, bh, kw, om, iq = [K[c] for c in 'US IR YE SA AE QA BH KW OM IQ'.split()]
ru, cn = K['RU'], K['CN']
W.use(US)
W.EMP[US] |= {sa, ae, qa, bh, kw, om}
P_ = lambda lo, la: proj(lo, la)
STRAIT = P_(56.4, 26.45); GULF = P_(52.5, 26.9); GOO = P_(58.6, 24.9); ARAB = P_(62.5, 21.5)
BA = city(ir, 'Bandar'); BU = P_(50.84, 28.97); CH = P_(60.6, 25.35); JA = P_(57.77, 25.65)
TEH = CAP[ir][:2]
BASES = [('AL UDEID AIR BASE', P_(51.32, 25.12), qa), ('5TH FLEET HQ · BAHRAIN', P_(50.6, 26.2), bh), ('AL DHAFRA AIR BASE', P_(54.55, 24.25), ae), ('ALI AL SALEM AIR BASE', P_(47.5, 29.35), kw)]
OIL = [[0, 72]]; STR = [[0, 'OPEN']]
def oil(t, v): OIL.append([round(t, 2), v])
def strait(t, s_): STR.append([round(t, 2), s_])
TANKER = K['LR']
def tankers(t, pts, n=3, dur=6.0, gap=0.9):
    for j in range(n):
        a, b = pts[0], pts[1]
        arrows.append([round(t + j * gap, 2), round(t + j * gap + dur, 2), round(a[0] + j * 6), round(a[1] - j * 5), round(b[0] + j * 6), round(b[1] - j * 5), TANKER, 'naval'])
def intercept(t, src, dst, label=True):
    mid = (src[0] + (dst[0] - src[0]) * 0.72, src[1] + (dst[1] - src[1]) * 0.72)
    th = missile(t, src, mid, dur=1.5, g=0.4, boom=False)
    FX.append([round(th, 2), round(mid[0]), round(mid[1]), 32, 1]); SV(th, 'far', 0.5)
    return th
def ship_fire(t, src, dst, who, dur=2.2):
    arrows.append([round(t, 2), round(t + dur, 2), round(src[0]), round(src[1]), round(dst[0]), round(dst[1]), who, 'fire'])
pw = 9000; indo[:] = [[0, pw]]

# ======================== INTRO NUEVA (0 -> 26.5) ========================
C(0, STRAIT[0], STRAIT[1], 3.4, 0.01); C(0.05, STRAIT[0], STRAIT[1], 2.6, 6.0)
INTRO = dict(kind='hz', oil=[0.0, 3.2], here=[3.2, 6.2], close=[6.2, 9.4], tape=[15.4, 24.0], go=[24.0, 26.5],
             rows=[['🪖', 'TROOPS IN THE REGION', '50,000', '610,000', 0.08], ['✈️', 'FIGHTER JETS', '350', '320', 0.52], ['🚢', 'WARSHIPS', '40', '100+', 0.3], ['🚀', 'MISSILES', '∞ TOMAHAWKS', '3,000', 0.62], ['🚤', 'FAST ATTACK BOATS', '20', '1,500', 0.02]],
             ka=US, kb=ir)
tankers(0.0, [P_(53.5, 26.6), P_(58.3, 25.3)], n=3, dur=9.0, gap=1.2)
S(0.0, 'sub_drop', 0.8); S(0.3, 'heartbeat', 0.6); S(1.2, 'tick', 0.4); S(2.0, 'tick', 0.4)
S(3.2, 'whoosh_2', 0.7); S(3.5, 'lock', 0.6)
S(6.2, 'siren', 0.6); SV(6.3, 'boom', 1.0); shakes.append([6.3, 18]); flashes.append(6.3)
for j in range(4): missile(6.4 + j * 0.25, P_(56.2 + j * 0.3, 27.3), P_(56.0 + j * 0.5, 26.2 - j * 0.15), dur=1.3, g=0.4)
oil(6.2, 72); oil(9.4, 148)
for j in range(10): S(6.6 + j * 0.25, 'tick', 0.5)
S(9.0, 'riser_2s', 0.6)
GLOBE = (9.4, 15.4)
C(GLOBE[1], STRAIT[0], STRAIT[1] - 60, 1.1, 0.01)
for i in range(5): S(15.6 + i * 1.6, 'whip', 0.6); S(16.3 + i * 1.6, 'stamp_' + str(1 + i % 3), 0.55)
for i, tt in enumerate([24.0, 24.8]): SV(tt, 'hit', 0.7)
S(26.0, 'siren', 0.5); SV(26.2, 'boom', 1.0); S(26.25, 'impact_hit', 0.9); shakes.append([26.2, 22]); flashes.append(26.2)
WAR = 26.5; T = WAR

# ======================== CAP 1: EL ESTRECHO SE CIERRA ========================
il = K['IL']
chapters.append([T, 'HOW IT STARTED']); grade.append([T, 'tense'])
C(T, (CAP[il][0] + TEH[0]) / 2, (CAP[il][1] + TEH[1]) / 2, 1.0, 1.0)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.9, 2), kind='bigtext', text='FEBRUARY 28, 2026', sub='THE US & ISRAEL STRIKE IRAN'))
S(T + 0.1, 'sub_drop', 0.8)
for j in range(4):
    p = (TEH[0] + rng.uniform(-200, 120), TEH[1] + rng.uniform(-40, 220)); missile(T + 1.6 + j * 0.4, CAP[il][:2] if j % 2 else GULF, p, dur=1.8, g=0.4, big=(j == 1))
qcard(T + 4.6, 'A CEASEFIRE... THEN TALKS FAIL'); S(T + 4.6, 'beep_lo', 0.5)
C(T + 7.0, STRAIT[0], STRAIT[1], 2.0, 1.0)
cards.append(dict(t0=round(T + 7.4, 2), t1=round(T + 10.4, 2), kind='bigtext', text='THE WAR NEVER REALLY ENDED', sub='THE US BLOCKADES IRAN · IRAN THREATENS HORMUZ'))
S(T + 7.4, 'heartbeat', 0.7)
cards.append(dict(t0=round(T + 10.8, 2), t1=round(T + 13.6, 2), kind='bigtext', text='THIS IS A SIMULATION', sub='WHAT IF IT ESCALATES ALL THE WAY?'))
S(T + 10.8, 'glitch', 0.6); GLITCH.append([round(T + 10.8, 2), round(T + 11.4, 2)])
T += 14.0
chapters.append([T, 'WHY HORMUZ MATTERS']); grade.append([T, 'day'])
C(T, STRAIT[0], STRAIT[1], 3.6, 1.0)
tankers(T, [P_(54.8, 26.5), P_(58.0, 25.4)], n=4, dur=9.0, gap=0.8)
w1 = near_cell(ir, P_(56.25, 26.95)); w2 = near_cell(om, P_(56.3, 26.2))
target(T + 1.0, w1[0], w1[1], 'IRAN', d=4.5); target(T + 1.3, w2[0], w2[1], 'OMAN', d=4.2)
qcard(T + 1.6, 'ONLY 33 KM WIDE')
qcard(T + 4.2, '21 MILLION BARRELS EVERY DAY')
qcard(T + 6.8, '1 IN 5 BARRELS ON EARTH')
for j in range(3): S(T + 1.6 + j * 2.6, 'stamp_' + str(1 + j), 0.6)
T += 9.6
chapters.append([T, 'THE STRAIT CLOSES']); grade.append([T, 'night'])
strait(T, 'CLOSED')
C(T, STRAIT[0], STRAIT[1], 2.8, 0.8)
chip(T + 0.2, 'IRAN CLOSES THE STRAIT OF HORMUZ', ir, 2.6)
for j in range(5):
    src = near_cell(ir, P_(55.4 + j * 0.7, 27.0 - (0.2 if j > 2 else 0)))
    arrows.append([round(T + 0.4 + j * 0.3, 2), round(T + 2.6 + j * 0.3, 2), round(src[0]), round(src[1]), round(STRAIT[0] - 60 + j * 30), round(STRAIT[1] + 10 - j * 6), ir, 'fire'])
S(T + 0.6, 'cannon', 0.5)
for j in range(6):
    p = (STRAIT[0] - 70 + j * 28, STRAIT[1] + rng.uniform(-14, 14)); target(T + 3.0 + j * 0.25, p[0], p[1], 'NAVAL MINE', d=1.2)
qcard(T + 3.2, '1,500 FAST BOATS · THOUSANDS OF MINES')
bubble(T + 5.0, ir, 'Nobody passes. NOBODY.')
tankers(T + 5.4, [P_(53.0, 26.7), P_(55.6, 26.4)], n=3, dur=3.0, gap=0.5)
chip(T + 6.6, '200 OIL TANKERS ARE TRAPPED', TANKER, 2.4)
oil(T + 3, 120); oil(T + 8, 155)
tk_ = P_(55.9, 26.35)
C(T + 8.4, tk_[0], tk_[1], 4.0, 0.8)
chip(T + 8.6, 'THE IRGC SEIZES A TANKER BY HELICOPTER', ir, 2.4)
para(ir, T + 9.4, tk_[0], tk_[1], n=6); target(T + 9.0, tk_[0], tk_[1], 'MT GULF STAR · 2M BARRELS', d=2.2)
bubble(T + 11.2, TANKER, 'MAYDAY MAYDAY!', 1.6)
T += 4.6
C(T + 8.4, (GULF[0] + BASES[0][1][0]) / 2, (GULF[1] + BASES[0][1][1]) / 2, 1.5, 1.0)
T1 = T + 8.6
chip(T1 + 0.2, 'IRAN FIRES AT US BASES', ir, 2.2); S(T1, 'siren', 0.5)
for j, (nm, p, kk) in enumerate(BASES):
    src = near_cell(ir, P_(51.5 + j * 0.8, 31.5 - j * 0.6))
    target(T1 + 0.5 + j * 0.6, p[0], p[1], 'INCOMING')
    if j == 1: intercept(T1 + 1.0 + j * 0.6, src, p); chip(T1 + 3.0, 'PATRIOT: INTERCEPTED', US, 1.6)
    else:
        th = missile(T1 + 1.0 + j * 0.6, src, p, dur=2.0, big=(j == 0))
        if j == 0: chip(th + 0.1, nm + ' HIT', kk, 2.0)
BED(T1, T1 + 6, 0.7)
grade.append([T1 + 2.6, 'red']); P(T1 + 3.2, pw - 1500)
bubble(T1 + 5.2, US, 'Big mistake.')
T = T1 + 7.4
# respuesta de Washington
C(T, cen[US][0], cen[US][1], 0.9, 1.0)
cards.append(dict(t0=round(T + 0.2, 2), t1=round(T + 2.8, 2), kind='bigtext', text='WASHINGTON RESPONDS', sub='2 CARRIER STRIKE GROUPS SET SAIL'))
S(T + 0.2, 'sub_drop', 0.9)
T = globe_zoom(T + 3.0, -80, 35, 58, 23, 3.2, hl=[US, ir])
T += 0.2

# ======================== CAP 2: LLEGAN LOS PORTAAVIONES ========================
chapters.append([T, 'THE CARRIERS ARRIVE']); grade.append([T, 'day'])
C(T - 0.05, (ARAB[0] + CH[0]) / 2, (ARAB[1] + CH[1]) / 2, 1.3, 0.01)
for j, (s_, e_) in enumerate([(P_(66, 17), ARAB), (P_(63.5, 16), P_(60.5, 23.2))]):
    arrows.append([round(T + 0.2 + j * 0.4, 2), round(T + 3.4 + j * 0.4, 2), round(s_[0]), round(s_[1]), round(e_[0]), round(e_[1]), US, 'naval'])
chip(T + 0.4, 'USS GERALD R. FORD & USS NIMITZ', US, 2.4); S(T + 0.3, 'riser_2s', 0.5)
qcard(T + 3.0, 'THE BIGGEST FLEET SINCE 2003'); P(T + 3.5, pw + 3000); pw += 3000
CP = ARAB
G = T + 4.2
C(G - 0.2, (CP[0] + JA[0]) / 2, (CP[1] + JA[1]) / 2, 1.5, 0.8)
for j, (nm, p) in enumerate([('JASK NAVAL BASE', JA), ('CHABAHAR PORT', CH)]):
    tp = near_cell(ir, p); target(G + 0.3 + j * 0.5, tp[0], tp[1], 'TARGET LOCKED'); th = missile(G + 1.0 + j * 0.5, CP, tp, dur=2.0, big=True); chip(th + 0.2, nm + ' DESTROYED', ir, 1.8)
ji = bomb_run(US, G + 5.6, JA[0] - 40, JA[1] - 10, ang=200, n=3, nb=3)
spot(G + 3.2, G + 5.2, lambda t, ji=ji: jet_pos(ji, t), 'F-35C SQUADRON', 150)
G2 = G + 6.6
C(G2 - 0.2, BA[0], BA[1] + 10, 2.4, 0.8)
chip(G2, 'TARGET: BANDAR ABBAS', ir, 2.0)
for j in range(3): bomb_run(US, G2 + 0.8 + j * 0.9, BA[0] - 20 + j * 20, BA[1] + rng.uniform(-10, 10), ang=rng.choice([15, 195, 165]), n=2, nb=3, size=46)
FLAK.append([round(G2 + 0.4, 2), round(G2 + 3.8, 2), round(BA[0] + 10), round(BA[1] - 8)]); S(G2 + 0.5, 'flak', 0.35)
BED(G2, G2 + 4, 0.9)
# contraataque iraní contra el portaaviones
G3 = G2 + 4.6
C(G3 - 0.2, (CP[0] + JA[0]) / 2 + 30, (CP[1] + JA[1]) / 2 + 30, 1.3, 0.8)
chip(G3 + 0.1, 'IRAN FIRES 40 ANTI-SHIP MISSILES', ir, 2.2); S(G3, 'siren', 0.6); grade.append([G3, 'red'])
target(G3 + 0.3, CP[0], CP[1], 'USS GERALD R. FORD')
for j in range(7):
    src = near_cell(ir, P_(57.0 + j * 0.5, 26.0 + (j % 3) * 0.3))
    if j < 6: intercept(G3 + 0.6 + j * 0.3, src, (CP[0] + rng.uniform(-10, 10), CP[1] + rng.uniform(-10, 10)))
    else: th = missile(G3 + 0.6 + j * 0.3, src, (CP[0] + 22, CP[1] - 8), dur=2.2, big=True)
qcard(G3 + 3.6, '39 INTERCEPTED... 1 GETS THROUGH'); chip(th + 0.3, 'A DESTROYER IS HIT', US, 2.0)
P(th, pw - 1200); bubble(th + 0.8, ir, 'Still think it\'s easy?')
grade.append([th + 2, 'day'])
T = th + 3.6

# ======================== CAP 3: OPERACIÓN MAR ABIERTO ========================
chapters.append([T, 'THE ISRAEL FRONT']); grade.append([T, 'night'])
tav = CAP[il][:2]
C(T, (tav[0] + TEH[0]) / 2, (tav[1] + TEH[1]) / 2, 0.85, 1.0)
chip(T + 0.2, 'IRAN FIRES 200 MISSILES AT ISRAEL', ir, 2.4); S(T + 0.2, 'siren', 0.6)
for j in range(9):
    src = near_cell(ir, (TEH[0] + rng.uniform(-260, 60), TEH[1] + rng.uniform(-40, 260)))
    dst = (tav[0] + rng.uniform(-14, 14), tav[1] + rng.uniform(-18, 18))
    if j in (4, 8): missile(T + 0.8 + j * 0.35, src, dst, dur=2.2, big=True)
    else: intercept(T + 0.8 + j * 0.35, src, dst)
C(T + 3.6, tav[0], tav[1], 2.6, 1.0)
qcard(T + 4.2, 'IRON DOME: 96% INTERCEPTED'); bubble(T + 5.6, il, 'Our turn.')
I2 = T + 6.8
C(I2 - 0.2, (tav[0] + TEH[0]) / 2 + 80, (tav[1] + TEH[1]) / 2, 0.95, 1.0)
for j in range(3): ji = jets(il, I2 + j * 0.4, I2 + 4.2 + j * 0.4, tav[0], tav[1] - 20 + j * 20, TEH[0] - 120 + j * 60, TEH[1] + 200 - j * 40, n=3, g=0.4)
for j in range(3): p = (TEH[0] - 120 + j * 60, TEH[1] + 200 - j * 40); FX.append([round(I2 + 4.3 + j * 0.4, 2), round(p[0]), round(p[1]), 60, 0]); SV(I2 + 4.3 + j * 0.4, 'boom', 0.8); CRAT.append([round(I2 + 4.3 + j * 0.4, 2), round(p[0]), round(p[1]), 0])
chip(I2 + 0.3, 'ISRAELI F-35s CROSS IRAQ', il, 2.2); chip(I2 + 4.6, 'IRANIAN AIR DEFENSES DESTROYED', ir, 2.2)
T = I2 + 7.6
chapters.append([T, 'THE AIR WAR']); grade.append([T, 'dusk'])
AW = (GULF[0] + 120, GULF[1] - 90)
C(T, AW[0], AW[1], 1.4, 1.0)
qcard(T + 0.2, 'FUN FACT: IRAN STILL FLIES F-14 TOMCATS')
for j in range(3):
    jets(ir, T + 0.6 + j * 0.5, T + 4.6 + j * 0.5, AW[0] + 220, AW[1] - 160 + j * 50, AW[0] - 60, AW[1] + 40 + j * 30, n=2, g=0.35)
    jets(US, T + 0.9 + j * 0.5, T + 4.9 + j * 0.5, AW[0] - 260, AW[1] + 120 - j * 40, AW[0] + 40, AW[1] - 60 - j * 20, n=2, g=0.35)
for j in range(5):
    p = (AW[0] - 20 + rng.uniform(-80, 80), AW[1] - 20 + rng.uniform(-60, 60)); FX.append([round(T + 3.0 + j * 0.35, 2), round(p[0]), round(p[1]), 34, 1]); SV(T + 3.0 + j * 0.35, 'far', 0.5)
    MISS.append([round(T + 2.2 + j * 0.35, 2), round(T + 3.0 + j * 0.35, 2), round(p[0] - 90), round(p[1] + 40), round(p[0]), round(p[1])])
chip(T + 2.6, 'DOGFIGHT OVER THE GULF', US, 2.0)
chip(T + 5.2, 'F-35 · 14 KILLS · 0 LOSSES', US, 2.4); bubble(T + 5.8, ir, 'Our Tomcats are from 1976...', 2.0)
ji = jet_over(US, T + 9.4, TEH[0], TEH[1] + 60, ang=-25, n=4, pre=3.0, post=2.0, g=0.6)
C(T + 7.4, TEH[0] - 40, TEH[1] + 80, 1.5, 0.8); spot(T + 7.6, T + 9.4, lambda t, ji=ji: jet_pos(ji, t), 'F-22 RAPTORS OVER TEHRAN', 160)
qcard(T + 10.2, 'THE SKY BELONGS TO THE USA'); P(T + 10.5, pw + 1500); pw += 1500
T += 12.4
C(T, cen[US][0], cen[US][1], 0.9, 0.01)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 3.0, 2), kind='bigtext', text='THE ULTIMATUM', sub='OPEN THE STRAIT IN 48 HOURS... OR ELSE'))
S(T + 0.1, 'stamp_2', 0.9); for_ = [S(T + 0.6 + j * 0.5, 'tick', 0.5) for j in range(5)]
C(T + 3.2, TEH[0], TEH[1], 1.6, 0.01); bubble(T + 3.6, ir, 'NEVER.', 1.6); SV(T + 3.6, 'hit', 0.7)
T += 5.6
chapters.append([T, 'BATTLE OF THE GULF']); grade.append([T, 'day'])
C(T, GULF[0] + 60, GULF[1] + 20, 1.5, 1.0)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.5, 2), kind='bigtext', text='BATTLE OF THE GULF', sub='THE BIGGEST NAVAL BATTLE SINCE 1945'))
S(T + 0.1, 'sub_drop', 0.9)
N0 = T + 2.8
for j in range(4):
    a_ = P_(51.2 + j * 1.0, 26.0 - j * 0.15); b_ = near_cell(ir, P_(51.0 + j * 1.1, 28.4 - j * 0.35))
    ship_fire(N0 + j * 0.3, P_(50.5 + j * 1.0, 25.0), a_, US, 2.0)
    arrows.append([round(N0 + j * 0.3, 2), round(N0 + 2.0 + j * 0.3, 2), round(b_[0]), round(b_[1]), round(a_[0] + 20), round(a_[1] - 25), ir, 'fire'])
    missile(N0 + 2.2 + j * 0.4, a_, (a_[0] + 20, a_[1] - 25), dur=1.0, g=0.35)
chip(N0 + 0.3, 'US DESTROYERS VS THE IRANIAN NAVY', US, 2.4)
BED(N0, N0 + 8, 1.1)
C(N0 + 4.2, GULF[0] + 140, GULF[1] - 10, 2.0, 0.8)
for j in range(3):
    p = (GULF[0] + 100 + j * 40, GULF[1] - 30 + j * 12); target(N0 + 4.6 + j * 0.4, p[0], p[1], 'IRANIAN FRIGATE'); FX.append([round(N0 + 5.6 + j * 0.4, 2), round(p[0]), round(p[1]), 55, 0]); SV(N0 + 5.6 + j * 0.4, 'boom', 0.7)
chip(N0 + 6.2, '3 FRIGATES SUNK IN 2 MINUTES', ir, 2.2)
SB = N0 + 8.6
C(SB - 0.2, GOO[0], GOO[1], 2.4, 0.8)
cards.append(dict(t0=round(SB, 2), t1=round(SB + 2.2, 2), kind='bigtext', text='SUBMARINE ALERT', sub='3 IRANIAN KILO-CLASS SUBS'))
S(SB, 'heartbeat', 0.8); S(SB + 0.5, 'beep_hi', 0.5); S(SB + 1.2, 'beep_hi', 0.5)
for j in range(3):
    p = (GOO[0] - 50 + j * 50, GOO[1] + 10 - j * 15); target(SB + 2.4 + j * 0.5, p[0], p[1], 'SONAR CONTACT')
    FX.append([round(SB + 3.6 + j * 0.5, 2), round(p[0]), round(p[1]), 40, 1]); SV(SB + 3.6 + j * 0.5, 'far', 0.6)
chip(SB + 4.4, 'ALL 3 SUBMARINES DESTROYED', US, 2.2); P(SB + 5, pw + 1000); pw += 1000
bubble(SB + 5.6, ir, 'Our navy... is gone?!')
T = SB + 7.8
chapters.append([T, 'OPERATION OPEN SEA']); grade.append([T, 'dusk'])
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.5, 2), kind='bigtext', text='THE MARINES LAND', sub='OPERATION OPEN SEA'))
S(T + 0.1, 'sub_drop', 0.9)
L0 = T + 2.8
lBA = near_cell(ir, (BA[0] + 8, BA[1] + 14)); lQS = near_cell(ir, P_(55.4, 26.9)); lJA = near_cell(ir, P_(57.8, 25.7))
C(L0 - 0.2, (lBA[0] + lJA[0]) / 2, (lBA[1] + lJA[1]) / 2 + 20, 2.2, 1.0)
for j, (l_, s_) in enumerate([(lBA, P_(56.4, 25.9)), (lQS, P_(55.3, 26.0)), (lJA, P_(58.1, 25.0))]): landing(s_, l_, L0 + 2.0 + j * 0.4, dur=2.0)
fleet(L0 + 0.2, [P_(56.8, 25.8), P_(57.4, 25.3)], [near_cell(ir, P_(56.6, 27.1)), near_cell(ir, P_(57.6, 26.3))], dur=2.2)
chip(L0 + 0.4, '20,000 MARINES HIT THE BEACHES', US, 2.4)
MQ = []
for j, (l_, d_) in enumerate([(lBA, (BA[0] + 30, BA[1] - 70)), (lQS, (lQS[0] - 10, lQS[1] - 70)), (lJA, (lJA[0] + 10, lJA[1] - 60))]):
    pts = route(l_, d_, {ir})
    q, _, _ = squad(US, ir, pts, [[L0 + 2.0 + j * 0.4, 0], [L0 + 9, 0.85], [L0 + 13, 0.85], [L0 + 17, 0.35], [L0 + 26, 0.35], [L0 + 31, 1.0]], n=6 if j == 0 else 5, r=30, t1=L0 + 33, fw=[[L0 + 11, L0 + 26]])
    MQ.append(q)
SQ[MQ[0]]['kind'] = 'tank'; SQ[MQ[0]]['n'] = 3; tank_snd(MQ[0])
twB = [[L0 + 2, L0 + 2], [L0 + 11, L0 + 11], [L0 + 17, L0 + 5], [L0 + 26, L0 + 5], [L0 + 33, L0 + 16], [L0 + 300, L0 + 16]]
FLB = flood_of(US, ir, L0 + 2, 0, 1e6, CAP[ir], MQ, [lBA, lQS, lJA], v=1.1, border=False, tw=twB, t_end=L0 + 34)
strait(L0 + 4, 'CONTESTED'); oil(L0 + 4, 140)
autocam(L0 + 3, L0 + 10, MQ, ir, minsz=260, smax=3.0)
chip(L0 + 7.0, 'THE COAST IS TAKEN', US, 2.0); P(L0 + 9, pw + 1500); pw += 1500
# contraataque de la Guardia Revolucionaria
IR0 = L0 + 10.6
C(IR0 - 0.2, BA[0] + 20, BA[1] - 120, 1.6, 1.0)
chip(IR0 + 0.1, 'THE REVOLUTIONARY GUARD COUNTERATTACKS', ir, 2.6); grade.append([IR0, 'red'])
IQS = []
for j, (s_, d_) in enumerate([(city(ir, 'Shiraz'), (BA[0] - 10, BA[1] - 40)), (city(ir, 'Yazd'), (BA[0] + 30, BA[1] - 50)), ((CAP[ir][0] + 300, CAP[ir][1] + 300), (lJA[0], lJA[1] - 40))]):
    s2 = near_cell(ir, s_); pts = route(s2, d_, {ir})
    if j == 1: q = tanks_sq(ir, pts, [[IR0 - 3, 0.3], [IR0 + 5, 0.9], [IR0 + 14, 0.92]], n=4, t1=IR0 + 15.4, fw=[[IR0 + 3, IR0 + 15]])
    else: q, _, _ = squad(ir, None, pts, [[IR0 - 3, 0.3], [IR0 + 5, 0.9], [IR0 + 14, 0.92]], n=6, r=40, t1=IR0 + 15.4, fw=[[IR0 + 3, IR0 + 15]])
    IQS.append(q)
qcard(IR0 + 3.4, 'THE MARINES ARE PUSHED BACK TO THE SEA'); P(IR0 + 5, pw - 4000)
bubble(IR0 + 5.4, ir, 'Get off our coast!')
for j in range(4): missile(IR0 + 2 + j * 0.7, near_cell(ir, (BA[0] + rng.uniform(-80, 80), BA[1] - 200)), (lBA[0] + rng.uniform(-30, 30), lBA[1] + rng.uniform(-30, 10)), dur=1.6, g=0.4)
BED(IR0, IR0 + 14, 1.4)
# B-2
B2 = IR0 + 9.2
C(B2 - 0.2, BA[0] + 10, BA[1] - 70, 1.7, 0.8)
ji = jet_over(US, B2 + 2.6, BA[0], BA[1] - 60, ang=-10, n=3, pre=3.2, post=2.4, g=0.6)
spot(B2 + 0.2, B2 + 2.2, lambda t, ji=ji: jet_pos(ji, t), 'B-2 STEALTH BOMBERS', 160)
wipe_out(IQS, B2 + 2.4)
chip(B2 + 3.0, 'THE COUNTERATTACK IS ERASED', US, 2.2); grade.append([B2 + 3.4, 'dusk']); P(B2 + 4, pw)
T = L0 + 31

# ======================== CAP 4: LA GUERRA SE EXTIENDE ========================
qs = P_(55.85, 26.82)
C(T, qs[0], qs[1], 3.2, 1.0)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.3, 2), kind='bigtext', text='BATTLE OF QESHM ISLAND', sub="THE KEY TO THE STRAIT"))
lq = near_cell(ir, qs)
for j in range(3): landing(P_(55.6 + j * 0.3, 26.3), (lq[0] + j * 8 - 8, lq[1] + 4), T + 3.0 + j * 0.3, dur=2.0)
FLAK.append([round(T + 2.6, 2), round(T + 6.4, 2), round(lq[0]), round(lq[1] - 6)])
for j in range(4): bomb_run(US, T + 3.2 + j * 0.7, lq[0] + rng.uniform(-30, 30), lq[1] + rng.uniform(-14, 8), ang=rng.choice([0, 180]), n=2, nb=2, size=38, jg=0.3)
chip(T + 3.2, 'MARINES STORM QESHM', US, 2.0); BED(T + 3, T + 8, 1.2)
chip(T + 7.4, 'QESHM IS TAKEN', US, 2.0); stamps.append([round(T + 7.4, 2), ir, 'small'])
T += 9.4
kh = P_(50.32, 29.24)
C(T, kh[0], kh[1], 3.4, 1.0)
chip(T + 0.2, "KHARG ISLAND: 90% OF IRAN'S OIL EXPORTS", ir, 2.6)
lk = near_cell(ir, kh); landing(P_(50.0, 28.5), lk, T + 2.4, dur=2.2)
para(US, T + 2.8, kh[0] + 6, kh[1] - 4, n=8)
chip(T + 3.4, 'NAVY SEALS SEIZE THE OIL TERMINAL', US, 2.2); bubble(T + 5.0, ir, 'Not our OIL!')
qcard(T + 6.2, "IRAN'S ECONOMY IS CUT OFF"); oil(T + 6, 128)
T += 8.4
chapters.append([T, 'THE WAR SPREADS']); grade.append([T, 'tense'])
C(T, cen[ye][0], cen[ye][1] - 150, 0.95, 1.2)
qcard(T + 0.2, "IRAN'S ALLIES JOIN THE WAR")
san = CAP[ye][:2]; hod = P_(42.95, 14.8); RS = P_(39.6, 18.5); riy = CAP[sa][:2]; jed = city(sa, 'Jeddah')
for j, p in enumerate([RS, (riy[0], riy[1]), jed]):
    target(T + 1.0 + j * 0.5, p[0], p[1], 'INCOMING')
    if j == 1: intercept(T + 1.5 + j * 0.5, san, p)
    else: missile(T + 1.5 + j * 0.5, hod if j == 0 else san, p, dur=1.8, big=(j == 0))
chip(T + 1.4, 'THE HOUTHIS FIRE AT THE RED SEA', ye, 2.4); bubble(T + 3.6, sa, 'Again?!')
arrows.append([round(T + 0.6, 2), round(T + 3.4, 2), round(RS[0] - 40), round(RS[1] - 60), round(RS[0]), round(RS[1]), TANKER, 'naval'])
Y1 = T + 5.2
C(Y1 - 0.2, (san[0] + hod[0]) / 2, (san[1] + hod[1]) / 2, 2.2, 0.8)
for j, p in enumerate([hod, san, (san[0] + 30, san[1] + 30)]): bomb_run(US, Y1 + 0.8 + j * 0.8, p[0], p[1], ang=rng.choice([20, 200]), n=2, nb=3, size=44)
chip(Y1 + 0.3, 'US STRIKES YEMEN', US, 2.0)
BED(Y1, Y1 + 3.6, 0.7)
# Iraq: milicias
I1 = Y1 + 4.6
bgd = CAP[iq][:2]
C(I1 - 0.2, bgd[0] + 40, bgd[1] + 20, 1.6, 0.8)
chip(I1 + 0.2, 'MILITIAS IN IRAQ OPEN A 3RD FRONT', iq, 2.4)
for j in range(3): missile(I1 + 0.8 + j * 0.4, (bgd[0] + rng.uniform(-30, 30), bgd[1] + rng.uniform(-20, 20)), BASES[3][1], dur=1.6, g=0.35, big=(j == 2))
bomb_run(US, I1 + 3.4, bgd[0] - 10, bgd[1] + 20, ang=10, n=2, nb=3, size=40)
AQ = I1 + 5.2
abq = P_(49.68, 25.93)
C(AQ - 0.2, abq[0], abq[1], 2.2, 0.8)
chip(AQ, 'DRONE SWARM ON SAUDI OIL FIELDS', ir, 2.4)
for j in range(8):
    src = near_cell(ir, P_(50.5 + j * 0.3, 29.5)); p = (abq[0] + rng.uniform(-30, 30), abq[1] + rng.uniform(-20, 20))
    if j % 3 == 0: missile(AQ + 0.4 + j * 0.2, src, p, dur=1.6, g=0.3, big=(j == 0))
    else: intercept(AQ + 0.4 + j * 0.2, src, p)
oil(AQ + 2, 165); qcard(AQ + 3.0, 'OIL HITS $165')
HZ = AQ + 5.4
lb_ = CAP[K['LB']][:2]
C(HZ - 0.2, (lb_[0] + tav[0]) / 2, (lb_[1] + tav[1]) / 2, 2.4, 0.8)
chip(HZ, 'HEZBOLLAH OPENS A NORTHERN FRONT', K['LB'], 2.2)
for j in range(4): intercept(HZ + 0.4 + j * 0.3, (lb_[0] + rng.uniform(-10, 10), lb_[1]), (tav[0] + rng.uniform(-20, 20), tav[1] + rng.uniform(-30, 0)))
for j in range(3): bomb_run(il, HZ + 2.4 + j * 0.6, lb_[0] + rng.uniform(-20, 20), lb_[1] + rng.uniform(-15, 15), ang=rng.choice([30, 210]), n=2, nb=2, size=40, jg=0.3)
I1 = HZ + 1.2
# Rusia y China
R1 = I1 + 4.8
C(R1, (CAP[ru][0] + CAP[ir][0]) / 2, (CAP[ru][1] + CAP[ir][1]) / 2 + 200, 0.45, 1.2)
T = summit(R1 + 0.6, [ir, ru, cn], [(ir, 'They are inside Iran!'), (ru, 'This is getting dangerous.'), (cn, 'We send our fleet.')], 'RUSSIA & CHINA SEND WARSHIPS')
F0 = T + 0.2
C(F0 - 0.2, (ARAB[0] + P_(66, 14)[0]) / 2, (ARAB[1] + P_(66, 14)[1]) / 2, 1.0, 1.0)
arrows.append([round(F0, 2), round(F0 + 3.6, 2), round(P_(72, 12)[0]), round(P_(72, 12)[1]), round(P_(64.5, 18)[0]), round(P_(64.5, 18)[1]), cn, 'naval'])
arrows.append([round(F0 + 0.4, 2), round(F0 + 4.0, 2), round(P_(70, 9)[0]), round(P_(70, 9)[1]), round(P_(63, 17.2)[0]), round(P_(63, 17.2)[1]), ru, 'naval'])
chip(F0 + 0.4, 'CHINESE & RUSSIAN SHIPS ENTER THE ARABIAN SEA', cn, 2.6)
cards.append(dict(t0=round(F0 + 4.2, 2), t1=round(F0 + 6.6, 2), kind='bigtext', text='WORLD WAR 3?', sub='EVERY RADAR IS LOCKED ON SOMEONE'))
S(F0 + 4.2, 'heartbeat', 0.9); S(F0 + 4.3, 'siren', 0.4); DESAT.append([round(F0 + 4.0, 2), round(F0 + 7.6, 2), 0.6]); TILT.append([round(F0 + 4.0, 2), round(F0 + 7.6, 2), -1.4])
for j, (p, lab) in enumerate([(P_(64.5, 18), 'LOCKED: CHINESE DESTROYER'), (P_(63, 17.2), 'LOCKED: RUSSIAN CRUISER'), (ARAB, 'LOCKED: USS NIMITZ')]): target(F0 + 6.8 + j * 0.6, p[0], p[1], lab, d=1.6)
qcard(F0 + 9.0, '...NOBODY FIRES.'); bubble(F0 + 10.4, cn, 'We are only... watching.', 2.0)
T = F0 + 12.6

# ======================== CAP 5: REABRIR EL ESTRECHO ========================
chapters.append([T, 'THE OIL FRONT']); grade.append([T, 'day'])
ahv = city(ir, 'Ahvaz'); bas = city(iq, 'Basra')
C(T, (ahv[0] + bas[0]) / 2, (ahv[1] + bas[1]) / 2, 1.9, 1.0)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.6, 2), kind='bigtext', text='THE OIL FRONT', sub='THE 3RD ARMORED DIVISION ROLLS FROM KUWAIT'))
J0 = T + 2.8
KQ = []
for j, (a_, b_) in enumerate([(near_cell(kw, CAP[kw][:2]), (ahv[0] - 10, ahv[1] + 20)), (near_cell(kw, (CAP[kw][0] + 20, CAP[kw][1] - 10)), (ahv[0] + 40, ahv[1] + 50))]):
    pts = route(a_, b_, {kw, iq, ir})
    if j == 0: q = tanks_sq(US, pts, [[J0, 0], [J0 + 9, 0.7], [J0 + 14, 0.95]], n=4, t1=J0 + 30, fw=[[J0 + 7, J0 + 13]], tgt=ahv)
    else: q, _, _ = squad(US, ir, pts, [[J0 + 0.3, 0], [J0 + 9, 0.7], [J0 + 14, 0.95]], n=6, r=30, t1=J0 + 30, fw=[[J0 + 7, J0 + 13]])
    KQ.append(q)
chip(J0 + 0.4, 'M1 ABRAMS CROSS INTO IRAN', US, 2.2)
spot(J0 + 2.0, J0 + 4.2, lambda t, q=KQ[0]: head(q, t), 'M1A2 ABRAMS', 140)
autocam(J0 + 4.4, J0 + 8.0, KQ, ir, minsz=220, smax=3.4)
IR2 = []
for j in range(2):
    s2 = near_cell(ir, (ahv[0] + 80 + j * 40, ahv[1] - 120)); q = tanks_sq(ir, route(s2, (ahv[0] + 10 + j * 30, ahv[1] + 10), {ir}), [[J0 + 3, 0], [J0 + 9, 0.85], [J0 + 11, 0.9]], n=3, t1=J0 + 11.5, fw=[[J0 + 8, J0 + 11]]); IR2.append(q)
C(J0 + 8.0, ahv[0] + 20, ahv[1], 2.6, 0.8)
chip(J0 + 8.2, 'TANK BATTLE: ABRAMS VS T-72', ir, 2.2); BED(J0 + 7, J0 + 12, 1.4)
wipe_out(IR2, J0 + 10.6)
FLK = flood_of(US, ir, J0, 0, 1e6, CAP[ir], KQ, [], v=1.1, border=False, tw=[[J0, J0], [J0 + 14, J0 + 14], [J0 + 300, J0 + 14]], t_end=J0 + 15)
occ.append([ir, US, round(J0, 2), 0, [], None, FLK]); OCC_K = len(occ) - 1
chip(J0 + 12.6, 'AHVAZ & THE OIL FIELDS ARE TAKEN', ir, 2.4); P(J0 + 13, pw + 1500); pw += 1500
T = J0 + 15.4
chapters.append([T, 'REOPEN THE STRAIT']); grade.append([T, 'day'])
C(T, STRAIT[0], STRAIT[1], 3.0, 1.0)
chip(T + 0.2, 'MINESWEEPERS GO IN', US, 2.0)
for j in range(6):
    p = (STRAIT[0] - 70 + j * 28, STRAIT[1] + rng.uniform(-14, 14)); target(T + 0.8 + j * 0.45, p[0], p[1], 'MINE CLEARED', d=1.0)
    FX.append([round(T + 1.4 + j * 0.45, 2), round(p[0]), round(p[1]), 26, 1]); SV(T + 1.4 + j * 0.45, 'far', 0.4)
for j, (s_, e_) in enumerate([(P_(58.4, 25.0), P_(56.2, 26.2)), (P_(58.6, 24.7), P_(55.4, 26.2))]): arrows.append([round(T + 0.2 + j * 0.5, 2), round(T + 3.6 + j * 0.5, 2), round(s_[0]), round(s_[1]), round(e_[0]), round(e_[1]), US, 'naval'])
T += 0.0
ES = T + 4.4
C(ES - 0.2, (P_(58.6, 24.9)[0] + STRAIT[0]) / 2, (P_(58.6, 24.9)[1] + STRAIT[1]) / 2, 1.9, 1.0)
chip(ES, 'OPERATION EARNEST WILL 2.0: ESCORT', US, 2.4)
tankers(ES + 0.2, [P_(59.2, 24.4), P_(57.0, 25.9)], n=4, dur=7.0, gap=0.6)
for j in range(3): arrows.append([round(ES + j * 0.6, 2), round(ES + 7.0 + j * 0.6, 2), round(P_(59.4, 24.6)[0] + j * 10), round(P_(59.4, 24.6)[1] - j * 10), round(P_(57.2, 26.1)[0] + j * 10), round(P_(57.2, 26.1)[1] - j * 10), US, 'naval'])
qcard(ES + 3.6, 'EVERY TANKER GETS A WARSHIP')
S1 = ES + 8.2
chip(S1, 'THE ISLANDS: ABU MUSA · TUNBS · LARAK', ir, 2.4)
for j, (lo, la) in enumerate([(55.03, 25.88), (55.3, 26.26), (56.36, 26.85), (56.0, 26.75)]):
    p = P_(lo, la); target(S1 + 0.4 + j * 0.4, p[0], p[1], 'MISSILE SITE'); missile(S1 + 1.0 + j * 0.4, ARAB, p, dur=2.0, big=(j == 2))
S2 = S1 + 4.6
C(S2 - 0.2, STRAIT[0] + 20, STRAIT[1] - 10, 2.6, 0.6)
chip(S2, 'LAST ATTACK: 300 FAST BOATS', ir, 2.2); grade.append([S2, 'red'])
for j in range(8):
    src = near_cell(ir, P_(55.6 + j * 0.25, 27.0)); dst = (STRAIT[0] - 60 + j * 16, STRAIT[1] + 26)
    arrows.append([round(S2 + 0.2 + j * 0.15, 2), round(S2 + 2.4 + j * 0.15, 2), round(src[0]), round(src[1]), round(dst[0]), round(dst[1]), ir, 'fire'])
    FX.append([round(S2 + 2.6 + j * 0.18, 2), round(dst[0]), round(dst[1] - 6), 30, 1]); SV(S2 + 2.6 + j * 0.18, 'far' if j % 2 else 'boom', 0.4)
jet_over(US, S2 + 2.6, STRAIT[0], STRAIT[1] + 20, ang=180, n=3, pre=2.0, post=2.0, g=0.6)
chip(S2 + 3.4, 'APACHE HELICOPTERS SINK THEM ALL', US, 2.2); BED(S2 + 0.5, S2 + 4.5, 1.0); grade.append([S2 + 4, 'day'])
S3 = S2 + 5.4
C(S3 - 0.2, STRAIT[0], STRAIT[1] + 10, 2.0, 1.0)
tankers(S3, [P_(53.6, 26.6), P_(58.6, 25.0)], n=4, dur=6.0, gap=0.7)
strait(S3 + 1.0, 'OPEN'); oil(S3 + 1.0, 140); oil(S3 + 6, 105)
cards.append(dict(t0=round(S3 + 1.0, 2), t1=round(S3 + 3.4, 2), kind='stamp', text='THE STRAIT IS OPEN', k=US)); S(S3 + 1.0, 'stinger_win', 0.6)
qcard(S3 + 3.8, 'BUT IRAN IS NOT DONE...'); P(S3 + 3, pw + 2000); pw += 2000
T = S3 + 6.4

# ======================== CAP 6: HACIA TEHERÁN ========================
C(T, STRAIT[0] + 60, STRAIT[1] + 30, 2.2, 0.8)
chip(T + 0.2, 'SHAHED DRONES TARGET THE CONVOY', ir, 2.4)
for j in range(10):
    src = near_cell(ir, P_(57.0 + j * 0.15, 27.0)); dst = (STRAIT[0] + 30 + j * 10, STRAIT[1] + 40 + (j % 3) * 8)
    if j == 7: missile(T + 0.6 + j * 0.2, src, dst, dur=1.8, g=0.3, big=True)
    else: intercept(T + 0.6 + j * 0.2, src, dst)
chip(T + 3.6, 'ONE TANKER IS ON FIRE', TANKER, 2.0); bubble(T + 4.2, US, 'Shoot them all down!')
T += 6.2
POLL = dict(t0=round(T, 2), t1=round(T + 4.6, 2), ks=[US, ir], text='WHO WINS? COMMENT NOW 👇')
S(T + 0.1, 'whoosh_3', 0.6); S(T + 0.4, 'tick', 0.4); S(T + 0.7, 'tick', 0.4)
T += 5.0
chapters.append([T, 'INTO IRAN']); grade.append([T, 'dusk'])
C(T, cen[ir][0], cen[ir][1], 0.9, 1.0)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.6, 2), kind='bigtext', text='NEXT TARGET: TEHRAN', sub='THE INVASION OF IRAN BEGINS'))
S(T + 0.1, 'sub_drop', 0.9)
T0 = T + 2.8; D = 146.0
setup_markers(ir, 4, names=['Shiraz', 'Ahvaz', 'Isfahan', 'Mashhad'])
lBU = near_cell(ir, (BU[0] + 6, BU[1] - 4)); lCH = near_cell(ir, P_(60.6, 25.45))
landing(P_(50.2, 28.2), lBU, T0 + 1.6, dur=1.6); landing(P_(60.6, 24.4), lCH, T0 + 1.8, dur=1.6)
chip(T0 + 0.6, 'NEW LANDINGS: BUSHEHR & CHABAHAR', US, 2.4)
def _ifx(i):
    def f(th, bx, by):
        target(th - 3.0, bx, by, 'TARGET LOCKED'); missile(th - 2.2, ARAB if i % 2 else GULF, (bx, by), dur=2.2, boom=False)
        if i == 2: bomb_run(US, th - 0.8, bx, by, ang=200, n=3, nb=3)
    return f
info = invade(ir, T0, D, [lBA, lBU, lCH, lJA], main_entries=[lBU, lBA, lCH], n_main=7, tanks={0, 1}, minsz=380, smax=4.2, fill=0.55, cam_on=False, base_fx={i: _ifx(i) for i in range(4)}, flak=True, s_siege=2.4)
tcap = info['tcap']
occ.append([ir, US, round(L0 + 2, 2), round(T0 + 3.0, 2), [], None, FLB]); occ[OCC_K][3] = round(T0 + 3.0, 2)
para(US, T0 + 16.0, city(ir, 'Isfahan')[0] + 20, city(ir, 'Isfahan')[1] - 20, n=12); chip(T0 + 16.2, '82ND AIRBORNE OVER ISFAHAN', US, 2.2)
autocam(T0 + 2.0, T0 + 15.4, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
C(T0 + 15.6, city(ir, 'Isfahan')[0], city(ir, 'Isfahan')[1] + 10, 2.2, 0.9)
SH = T0 + 19.6
shz = city(ir, 'Shiraz')
cam_cut(SH - 0.3, SH + 30)
C(SH - 0.2, shz[0], shz[1], 2.4, 0.8)
chip(SH, 'THE BATTLE OF SHIRAZ', ir, 2.2)
for j in range(4): bomb_run(US, SH + 1.0 + j * 0.7, shz[0] + rng.uniform(-30, 30), shz[1] + rng.uniform(-20, 20), ang=rng.choice([15, 195]), n=2, nb=3, size=44, jg=0.35)
BED(SH, SH + 6, 1.2); bubble(SH + 3.0, ir, 'Not the city of poets!', 1.8)
autocam(SH + 6.2, SH + 12.0, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
IS = SH + 12.0
isf = city(ir, 'Isfahan')
C(IS - 0.2, isf[0], isf[1] + 30, 1.8, 0.8)
chip(IS, 'IRAN COUNTERATTACKS AT ISFAHAN', ir, 2.4); grade.append([IS, 'red'])
CQ = []
for j in range(3):
    s2 = near_cell(ir, (isf[0] - 60 + j * 60, isf[1] - 120)); d2 = (isf[0] - 40 + j * 40, isf[1] + 60)
    if j == 1: q = tanks_sq(ir, route(s2, d2, {ir}), [[IS, 0], [IS + 6, 0.85], [IS + 9, 0.9]], n=4, t1=IS + 9.4, fw=[[IS + 4, IS + 9]])
    else: q, _, _ = squad(ir, None, route(s2, d2, {ir}), [[IS, 0], [IS + 6, 0.85], [IS + 9, 0.9]], n=6, r=40, t1=IS + 9.4, fw=[[IS + 4, IS + 9]])
    CQ.append(q)
qcard(IS + 2.6, 'THE PARATROOPERS ARE SURROUNDED'); P(IS + 3, pw - 2000); BED(IS, IS + 9, 1.4)
ji = jet_over(US, IS + 7.2, isf[0], isf[1], ang=180, n=3, pre=2.4, post=2.0, g=0.6)
spot(IS + 5.0, IS + 7.0, lambda t, ji=ji: jet_pos(ji, t), 'AC-130 GUNSHIP', 150)
wipe_out(CQ, IS + 7.4); chip(IS + 8.0, 'ISFAHAN IS HELD', US, 2.0); grade.append([IS + 9, 'dusk']); P(IS + 9, pw)
autocam(IS + 9.4, T0 + 51.6, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
NU = T0 + 52.0
nat = P_(51.73, 33.72); fo_ = P_(50.99, 34.88)
cam_cut(NU - 0.3, NU + 9.0)
C(NU - 0.2, (nat[0] + fo_[0]) / 2, (nat[1] + fo_[1]) / 2, 2.4, 0.8)
cards.append(dict(t0=round(NU, 2), t1=round(NU + 2.2, 2), kind='bigtext', text='THE NUCLEAR SITES', sub='NATANZ & FORDOW'))
S(NU, 'heartbeat', 0.8)
for j, (p, nm) in enumerate([(nat, 'NATANZ'), (fo_, 'FORDOW')]):
    target(NU + 2.4 + j * 0.6, p[0], p[1], nm); jet_over(US, NU + 4.2 + j * 0.8, p[0], p[1], ang=200, n=2, pre=2.2, post=1.6, g=0.5)
    FX.append([round(NU + 4.8 + j * 0.8, 2), round(p[0]), round(p[1]), 90, 0]); SV(NU + 4.8 + j * 0.8, 'boom', 1.0); shakes.append([round(NU + 4.8 + j * 0.8, 2), 18]); CRAT.append([round(NU + 4.8 + j * 0.8, 2), round(p[0]), round(p[1]), 1])
chip(NU + 5.2, '30,000 LB BUNKER BUSTERS', US, 2.2); chip(NU + 7.4, 'NUCLEAR PROGRAM: DESTROYED', ir, 2.2)
autocam(NU + 9.2, NU + 17.0, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
BJ = NU + 17.0
C(BJ - 0.2, TEH[0] + 30, TEH[1] + 160, 1.4, 0.8)
chip(BJ, 'THE BASIJ: 1 MILLION VOLUNTEERS', ir, 2.4); grade.append([BJ, 'red'])
BQ = []
for j in range(4):
    s2 = near_cell(ir, (TEH[0] - 80 + j * 60, TEH[1] + 40)); d2 = (TEH[0] - 60 + j * 50, TEH[1] + 260)
    q, _, _ = squad(ir, None, route(s2, d2, {ir}), [[BJ, 0], [BJ + 5, 0.8], [BJ + 7, 0.82]], n=7, r=44, t1=BJ + 7.4, fw=[[BJ + 4, BJ + 7]]); BQ.append(q)
qcard(BJ + 2.4, 'A HUMAN WAVE...'); BED(BJ, BJ + 7, 1.5)
wipe_out(BQ, BJ + 6.0); chip(BJ + 6.6, 'STOPPED BY APACHES & A-10s', US, 2.2); grade.append([BJ + 7, 'dusk'])
CY = BJ + 8.6
C(CY - 0.2, TEH[0], TEH[1] + 40, 1.2, 0.6)
cards.append(dict(t0=round(CY, 2), t1=round(CY + 2.4, 2), kind='bigtext', text='CYBER ATTACK', sub="IRAN'S POWER GRID GOES DARK"))
S(CY, 'blackout', 1.0); GLITCH.append([round(CY + 0.1, 2), round(CY + 1.8, 2)]); flashes.append(round(CY, 2))
autocam(CY + 2.6, CY + 10, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
MC = M1 - 0 if False else None
# Irán lanza todo contra el Golfo
M1 = T0 + 58.0
MCY = T0 + 74.0
C(MCY - 0.2, city(ir, 'Yazd')[0], city(ir, 'Yazd')[1] - 40, 1.8, 0.8)
cards.append(dict(t0=round(MCY, 2), t1=round(MCY + 2.4, 2), kind='bigtext', text="IRAN'S SECRET", sub='UNDERGROUND MISSILE CITIES'))
S(MCY, 'heartbeat', 0.8)
for j in range(4):
    p = (city(ir, 'Yazd')[0] + rng.uniform(-150, 150), city(ir, 'Yazd')[1] + rng.uniform(-120, 60)); target(MCY + 2.6 + j * 0.4, p[0], p[1], 'TUNNEL ENTRANCE'); bomb_run(US, MCY + 4.0 + j * 0.5, p[0], p[1], ang=rng.choice([15, 195]), n=2, nb=3, size=46, jg=0.35)
chip(MCY + 5.0, 'SEALED WITH BUNKER BUSTERS', US, 2.2)
autocam(MCY + 7.6, M1 - 0.3, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
M1 = T0 + 88.0
C(M1 - 0.2, (GULF[0] + CAP[ir][0]) / 2, (GULF[1] + CAP[ir][1]) / 2 + 60, 0.95, 0.9)
chip(M1, 'IRAN FIRES EVERYTHING IT HAS LEFT', ir, 2.4); S(M1, 'siren', 0.6); grade.append([M1, 'red'])
dub = city(ae, 'Dubai')
for j, p in enumerate([dub, CAP[qa][:2], riy, CAP[kw][:2], CAP[bh][:2], dub]):
    src = near_cell(ir, (CAP[ir][0] + rng.uniform(-150, 150), CAP[ir][1] + rng.uniform(50, 250)))
    target(M1 + 0.4 + j * 0.3, p[0], p[1], 'INCOMING', d=1.0)
    if j in (2, 5): missile(M1 + 0.8 + j * 0.3, src, p, dur=2.0, big=True)
    else: intercept(M1 + 0.8 + j * 0.3, src, p)
qcard(M1 + 3.4, 'THE GULF SKY IS ON FIRE'); P(M1 + 3.5, pw - 2500)
chip(M1 + 4.0, 'MOST MISSILES ARE INTERCEPTED', US, 2.0)
grade.append([M1 + 5.2, 'dusk'])
autocam(M1 + 5.6, tcap - 7.6, info['ids'], ir, minsz=380, smax=4.2, fill=0.55)
# poder especial
RV = tcap - 12.8
REVEAL = dict(t0=round(RV, 2), t1=round(RV + 3.6, 2), name='OPERATION NIGHT HAMMER', icon='jet-fighter', items=['CYBER', 'SEALS', 'B-2 FLEET', 'DRONES', 'EMP', 'RAILGUN', 'SATELLITE', 'LASER'])
S(RV, 'heartbeat', 0.7); S(RV + 1.6, 'riser_2s', 0.7); SV(RV + 3.4, 'boom', 1.0)
cam_cut(RV - 0.3, RV + 9.0)
NH = RV + 3.8
C(NH - 0.2, TEH[0], TEH[1] + 30, 1.4, 0.6)
for j in range(5):
    p = (TEH[0] + rng.uniform(-120, 120), TEH[1] + rng.uniform(-60, 140)); bomb_run(US, NH + 1.2 + j * 0.55, p[0], p[1], ang=rng.choice([10, 190]), n=2, nb=3, size=48, jg=0.4 if j else 0.7)
chip(NH + 0.3, '40 B-2 BOMBERS HIT EVERY BUNKER', US, 2.6); LB.append([round(RV - 0.3, 2), round(NH + 4.6, 2)])
C(NH + 4.8, (TEH[0] + info['stops'][0][0]) / 2, (TEH[1] + info['stops'][0][1]) / 2, 2.0, 0.8)
TS = tcap - 7.0
hpt = [[TS, 1.0], [TS + 1.0, 1.0], [TS + 1.15, 0.84], [TS + 2.2, 0.84], [TS + 2.35, 0.64], [TS + 3.4, 0.64], [TS + 3.55, 0.5], [TS + 4.2, 0.57], [TS + 5.0, 0.57], [TS + 5.15, 0.3], [TS + 5.8, 0.3], [TS + 5.95, 0.1], [tcap, 0.0]]
CAPHP[-1] = [ir, round(TEH[0]), round(TEH[1]), round(TS, 2), round(tcap, 2), hpt]
BIGHP = [dict(t0=round(TS - 0.4, 2), t1=round(tcap + 0.4, 2), k=ir, name='TEHRAN', sub='CAPITAL HP', hp=hpt)]
C(TS - 0.5, (TEH[0] + info['stops'][0][0]) / 2, (TEH[1] + info['stops'][0][1]) / 2, 2.2, 1.2); C(TS + 2.0, TEH[0] + 10, TEH[1] + 6, 2.7, 4.5)
chip(TS + 3.6, 'TEHRAN HOLDS ON!', ir, 1.8); bubble(TS + 3.8, ir, 'Never!'); S(TS + 5.0, 'heartbeat', 0.8)
LB.append([round(TS + 4.8, 2), round(tcap + 2.0, 2)])
B = battle_card(ir, 'IRAN', T0 + 0.2, tcap + 1.6, pw, 8000, info['tb'], tcap, pw + 6000)
fill_inv(B, info['fl'])
chip(tcap + 0.2, 'TEHRAN HAS FALLEN', ir, 2.4)
P(tcap + 1, pw + 6000); pw += 6000
oil(tcap, 95); oil(tcap + 6, 71)
T = tcap + 2.0

# ======================== FINAL ========================
chapters.append([T, 'THE AFTERMATH']); grade.append([T, 'gold'])
C(T, STRAIT[0], STRAIT[1], 1.8, 1.4)
tankers(T + 0.2, [P_(52.6, 26.9), P_(59.0, 24.6)], n=5, dur=7.0, gap=0.6)
cards.append(dict(t0=round(T + 0.4, 2), t1=round(T + 2.8, 2), kind='stamp', text='THE STRAIT IS SAFE', k=US)); S(T + 0.4, 'stinger_win', 0.6)
chip(T + 3.2, 'OIL FALLS BACK TO $71', TANKER, 2.4)
cards.append(dict(t0=round(T + 5.6, 2), t1=round(T + 8.4, 2), kind='bigtext', text='THE WORLD BREATHES AGAIN', sub='MARKETS RECOVER · SHIPS SAIL'))
qcard(T + 8.8, 'BUT THE REGION WILL NEVER BE THE SAME')
C(T + 11.6, cen[ir][0], cen[ir][1], 0.8, 1.6)
cards.append(dict(t0=round(T + 12.0, 2), t1=round(T + 14.8, 2), kind='bigtext', text='SIMULATION OVER', sub='REAL LIFE IS NEVER THIS SIMPLE'))
WIN_T = T + 16.4
C(WIN_T - 0.3, cen[ir][0] - 100, cen[ir][1], 0.55, 2.0); C(WIN_T + 2.0, cen[ir][0] - 100, cen[ir][1] + 40, 0.62, 9.0)
END = WIN_T + 11.0
P(END, pw)

# ======================== MÚSICA ========================
CH = {c[1]: c[0] for c in chapters}
M(0, 6.2, 'spy', 0, 0.95, 0.05, 0.2); M(6.2, GLOBE[0], 'frantic', 40, 1.0, 0.02, 0.2); M(GLOBE[0], 15.4, 'scifi', 45, 0.85, 0.2, 0.3); M(15.4, WAR - 0.1, 'tension', 34.3, 0.85, 0.2, 0.2)
M(WAR, CH['THE CARRIERS ARRIVE'], 'horror', 0, 0.95, 0.02, 1.0); M(CH['THE CARRIERS ARRIVE'], CH['OPERATION OPEN SEA'], 'epic', 0, 1.05, 0.6, 1.0)
M(CH['OPERATION OPEN SEA'], IR0, 'drive', 34.28, 1.0, 0.6, 0.8); M(IR0, B2 + 2.4, 'frantic', 30, 1.0, 0.3, 0.6); M(B2 + 2.4, CH['THE WAR SPREADS'], 'heroic', 40, 1.0, 0.4, 1.0)
M(CH['THE WAR SPREADS'], CH['REOPEN THE STRAIT'], 'saga', 24, 0.95, 0.6, 1.0); M(CH['REOPEN THE STRAIT'], CH['INTO IRAN'], 'march', 0, 1.0, 0.6, 1.0)
M(CH['INTO IRAN'], RV - 0.1, 'chase', 0, 1.0, 0.6, 0.4); M(RV + 3.4, TS - 0.5, 'epic', 66.667, 1.08, 0.02, 0.8); M(TS - 0.5, WIN_T, 'heroic', 70, 1.05, 0.4, 0.5); M(WIN_T, END, 'triumph', 40, 1.0, 0.1, 2.0)
S(WIN_T, 'stinger_win', 1.0); S(WIN_T + 0.2, 'crowd_cheer', 0.5)
W.use(US)
out = export('src/hw/hormuz.json', END, WAR, WIN_T, mode='hz', poll=POLL, intro=INTRO, oil=OIL, strait=STR, reveal=REVEAL, bighp=BIGHP, hero='USA', heroLong='THE USA', heroAdj='US',
             weapon='OPERATION NIGHT HAMMER', title2=['THE BATTLE FOR', 'THE STRAIT OF HORMUZ'], empFlag=True, globe=dict(t0=GLOBE[0], t1=GLOBE[1], lon0=-40, lat0=25, lon1=56.4, lat1=26.5),
             endTitle=['THE STRAIT', 'IS OPEN AGAIN'], endPills=[['⚓', 'STRAIT REOPENED'], ['🛢️', 'OIL BACK TO $71'], ['💣', 'OPERATION NIGHT HAMMER']], endAsk='WOULD IT REALLY GO LIKE THIS? 👇')
print('dur', round(END, 1), 'win', round(WIN_T, 1), 'chapters', [(round(c[0]), c[1]) for c in chapters])
# cámara más cerca en la guerra (salvo planos generales)
for c_ in cam:
    if c_[0] > WAR and c_[3] >= 0.7: c_[3] = round(min(4.6, c_[3] * 1.45), 3)
out['cam'] = cam
# días realistas: ~60 días de guerra
out['days'] = [[round(WAR + i * 0.5, 2), 1 + int(59 * (i * 0.5) / (WIN_T - WAR))] for i in range(int((WIN_T - WAR) / 0.5) + 1)]
json.dump(out, open('src/hw/hormuz.json', 'w'), separators=(',', ':'))
