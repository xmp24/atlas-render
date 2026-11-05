"""Atlas of War - paleta de 8 músicas (120 s cada una, secciones de 8 compases).
Uso: python3 audio/palette.py [nombre ...]   (sin argumentos: todas)
Salida: audio/tracks/<nombre>.wav + audio/tracks/index.json
"""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'tracks')
DUR = 120.0

# acordes (MIDI)
def ch(root, kind='m', inv=0):
    iv = {'m': [0, 3, 7], 'M': [0, 4, 7], 'sus2': [0, 2, 7], 'sus4': [0, 5, 7], 'dim': [0, 3, 6], 'm7': [0, 3, 7, 10], 'M7': [0, 4, 7, 11], '5': [0, 7, 12]}[kind]
    n = [root + i for i in iv]
    for _ in range(inv): n = n[1:] + [n[0] + 12]
    return n


STYLES = {}
def style(name, bpm, levels):
    def deco(fn):
        STYLES[name] = dict(fn=fn, bpm=bpm, levels=levels)
        return fn
    return deco


# ============================================================ EPIC (D menor, 144)
@style('epic', 144, [0.25, 0.5, 0.75, 1.0, 1.0, 0.35, 0.7, 1.0, 1.0])
def epic(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(50), ch(50), ch(46, 'M'), ch(46, 'M'), ch(43), ch(43), ch(45, 'M'), ch(45, 'M')]
    if i % 2: prog = [ch(50), ch(50), ch(48, 'M'), ch(48, 'M'), ch(46, 'M'), ch(46, 'M'), ch(45, 'M'), ch(45, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        # pedal grave
        if b % 2 == 0: M.drone(tr, r - 12, tb, bar * 2.05, 0.05 + 0.03 * L, 260)
        # ostinato de cuerdas
        if L >= 0.45:
            pat = [r + 12, r + 12, r + 24, r + 12, c[1] + 12, r + 12, c[2] + 12, r + 12]
            M.ostinato(tr, pat, tb, beat / 2, 0.022 + 0.018 * L, 2400 + 1600 * L)
        if L >= 0.5:
            for k, n in enumerate([r - 12, r - 12, r, r - 12, r - 12, r, r - 12, r]):
                M.bass(tr, n - 12, tb + k * beat / 2, beat / 2 * 0.9, 0.08 + 0.05 * L, 600 + 500 * L)
        # percusión
        if L >= 0.3:
            for pos, g in [(0, 1.0), (1.5, 0.7), (2, 0.9), (3.5, 0.6 if b % 2 else 0.0)]:
                if g and (L >= 0.6 or pos in (0, 2)): M.taiko(tr, tb + pos * beat, g * (0.5 + 0.5 * L), pan=(-0.25 if pos % 2 else 0.25))
        if L >= 0.7:
            for pos in (1, 3): M.snare(tr, tb + pos * beat, 0.8 * L)
            for k in range(8 if L < 0.95 else 16):
                st = beat / (2 if L < 0.95 else 4); M.hat(tr, tb + k * st, 1.0 if k % 2 else 0.6)
        if L < 0.45:
            for k in range(4): M.tick(tr, tb + k * beat, 0.6)
        # metales y coro
        if b % 2 == 0 and L >= 0.6:
            M.brass(tr, [n - 12 for n in c], tb, bar * 1.95, 0.03 + 0.03 * L, 1300 + 900 * L)
        if b % 2 == 0 and L >= 0.85:
            M.choir(tr, [n + 12 for n in c], tb, bar * 1.95, 0.016 + 0.01 * L)
        if b % 2 == 0 and L < 0.6:
            M.strings(tr, [n + 12 for n in c], tb, bar * 2.0, 0.02 + 0.02 * L, 1500 + 1500 * L, att=0.8)
    # melodía heroica (8 compases)
    if L >= 0.95:
        if i % 2 == 0:
            mel = [(74, 3), (72, 1), (74, 2), (77, 2), (76, 4), (74, 2), (72, 2), (70, 3), (72, 1), (74, 4), (69, 4), (70, 2), (72, 2), (74, 4), (73, 4)]
        else:
            mel = [(81, 4), (79, 2), (77, 2), (79, 4), (77, 2), (76, 2), (74, 6), (77, 2), (76, 4), (74, 2), (72, 2), (74, 4), (76, 4)]
        tot = sum(l for _, l in mel)
        M.fanfare(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 0.032, 2600)
    # transiciones
    if L >= 0.95: M.crash(tr, t0, 1.0)
    nxt = STYLES['epic']['levels'][(i + 1) % nsec]
    if nxt > L + 0.15: M.riser(tr, t0 + 6 * bar, 2 * bar, 0.16); M.timp_roll(tr, t0 + 7 * bar, bar, 38)
    if nxt >= 0.95 and L >= 0.95: M.snare_roll(tr, t0 + 7.5 * bar, bar * 0.5, 0.3, 0.9)


# ============================================================ TENSION (A menor, 112)
@style('tension', 112, [0.25, 0.45, 0.65, 0.85, 0.35, 0.8, 1.0])
def tension(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(45), ch(45), ch(41, 'M'), ch(41, 'M'), ch(38), ch(38), ch(40, 'M'), ch(40, 'M')]
    if i % 2: prog = [ch(45), ch(45), ch(46, 'M'), ch(46, 'M'), ch(41, 'M'), ch(41, 'M'), ch(40, 'M'), ch(40, 'm')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        if b % 4 == 0: M.drone(tr, 33, tb, bar * 4.1, 0.06, 180, beat=1.006)
        # pulso de cuerdas graves en corcheas
        if L >= 0.4:
            for k in range(8):
                acc = 1.0 if k % 4 == 0 else 0.6
                M.ostinato(tr, [r], tb + k * beat / 2, beat / 2, (0.02 + 0.02 * L) * acc, 900 + 1200 * L, pan=0.15)
        # reloj
        for k in range(4): M.clock_tick(tr, tb + k * beat, 0.7 + 0.3 * L, hi=(k % 2 == 0))
        if L >= 0.3 and b % 2 == 0: M.heartbeat(tr, tb, 0.6 + 0.4 * L)
        if L >= 0.6 and b % 2 == 1:
            M.strings(tr, [c[1] + 24, c[2] + 24], tb, bar, 0.012 + 0.012 * L, 3000, att=0.6)
        if L >= 0.8:
            M.taiko(tr, tb, 0.8 * L); M.taiko(tr, tb + 2.5 * beat, 0.5 * L)
            if b % 4 == 3: M.brass(tr, [n - 12 for n in c], tb + 2 * beat, beat * 2, 0.04, 1200)
            for k in range(8): M.hat(tr, tb + k * beat / 2, 0.5 if k % 2 else 0.3)
        if L >= 0.95:
            M.kick(tr, tb, 0.7); M.kick(tr, tb + 2 * beat, 0.6)
            M.snare(tr, tb + 3 * beat, 0.6)
    # tema de piano (inquietante)
    if L <= 0.5 or L >= 0.95:
        mel = [69, 72, 71, 69, 76, 74, 72, 71]
        for k, n in enumerate(mel):
            M.piano(tr, n + (12 if L >= 0.95 else 0), t0 + k * bar, 0.05, pan=-0.2, d=bar * 1.2)
    M.pad(tr, [57, 60, 64], t0, bar * 8, 0.008 + 0.01 * L, 900)
    nxt = STYLES['tension']['levels'][(i + 1) % nsec]
    if nxt > L: M.riser(tr, t0 + 5 * bar, 3 * bar, 0.12 + 0.1 * L)
    if L >= 0.8: M.impact(tr, t0, 0.6)


# ============================================================ FRANTIC (F# menor, 144)
@style('frantic', 144, [0.4, 0.6, 0.8, 1.0, 1.0, 0.4, 0.7, 1.0, 1.0])
def frantic(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(54), ch(54), ch(50, 'M'), ch(50, 'M'), ch(45, 'M'), ch(45, 'M'), ch(52, 'M'), ch(52, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        if L >= 0.55:
            for k in range(4): M.kick(tr, tb + k * beat, 0.9)
        elif L >= 0.4 and b % 2 == 0:
            M.kick(tr, tb, 0.7)
        if L >= 0.7:
            for k in (1, 3): M.clap(tr, tb + k * beat, 0.9)
        nh = 16 if L >= 0.95 else 8
        for k in range(nh):
            st = bar / nh; M.hat(tr, tb + k * st, (1.0 if k % 2 else 0.5) * (0.6 + 0.4 * L), open_=(nh == 8 and k % 2 == 1))
        # bajo a contratiempo
        if L >= 0.5:
            for k in range(4):
                M.bass(tr, r - 24, tb + k * beat + beat / 2, beat / 2 * 0.9, 0.12, 900, bus='pump', kind='reese')
        # arpegio 16th
        M.arp(tr, c, tb, bar, beat / 4, 0.016 + 0.014 * L, octave=12, pattern=(0, 1, 2, 3, 2, 1, 0, 2), cutoff=2500 + 3000 * L)
        if L >= 0.75 and b % 2 == 0:
            M.supersaw(tr, c[0] + 12, tb, bar * 2, 0.012 + 0.008 * L, 3000 + 2000 * L, bus='pump')
            M.supersaw(tr, c[1] + 12, tb, bar * 2, 0.012 + 0.008 * L, 3000 + 2000 * L, bus='pump')
            M.supersaw(tr, c[2] + 12, tb, bar * 2, 0.012 + 0.008 * L, 3000 + 2000 * L, bus='pump')
    if L >= 0.95:
        mel = [78, 78, 81, 78, 76, 74, 76, 78, 81, 83, 81, 78, 76, 78, 74, 73] if i % 2 else [78, 76, 74, 73, 74, 76, 78, 81, 83, 81, 78, 76, 74, 76, 78, 78]
        for k, n in enumerate(mel):
            M.supersaw(tr, n, t0 + k * bar / 2, bar / 2 * 0.85, 0.018, 6000, bus='main')
        M.crash(tr, t0, 1.0)
    nxt = STYLES['frantic']['levels'][(i + 1) % nsec]
    if nxt > L + 0.1:
        M.snare_roll(tr, t0 + 6 * bar, 2 * bar, 0.1, 0.9, rate=8)
        M.snare_roll(tr, t0 + 7 * bar, bar, 0.3, 1.0, rate=16)
        M.riser(tr, t0 + 6 * bar, 2 * bar, 0.2)
    if L < 0.5:
        M.pad(tr, [54, 57, 61], t0, bar * 8, 0.02, 1200)


# ============================================================ CHIP (C mayor, 160)
@style('chip', 160, [0.4, 0.6, 0.85, 1.0, 1.0, 0.45, 0.75, 1.0, 1.0, 0.9])
def chip(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(60, 'M'), ch(55, 'M'), ch(57), ch(53, 'M'), ch(60, 'M'), ch(55, 'M'), ch(53, 'M'), ch(55, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        # bajo triangular saltarín
        for k in range(8):
            n = r - 24 if k % 2 == 0 else r - 12
            M.chip_tri(tr, n, tb + k * beat / 2, beat / 2 * 0.85, 0.08 + 0.04 * L)
        # batería 8-bit
        if L >= 0.5:
            for k in range(4):
                M.noise_drum(tr, tb + k * beat, 'kick' if k % 2 == 0 else 'snare', 0.9)
        for k in range(8 if L < 0.95 else 16):
            st = bar / (8 if L < 0.95 else 16); M.noise_drum(tr, tb + k * st, 'hat', 0.6)
        # arpegio
        M.arp(tr, c, tb, bar, beat / 4, 0.010 + 0.008 * L, octave=12, pattern=(0, 1, 2, 3), inst='chip', pan=0.4)
    # melodía (8 compases, 2 variantes)
    if L >= 0.6:
        A = [(72, 1), (76, 1), (79, 2), (77, 1), (76, 1), (74, 2), (71, 1), (74, 1), (79, 2), (77, 2), (76, 2), (72, 1), (76, 1), (77, 2), (76, 1), (74, 1), (72, 4),
             (74, 2), (76, 2), (77, 2), (79, 2), (81, 2), (79, 2), (77, 2), (74, 2)]
        B = [(79, 2), (79, 1), (81, 1), (79, 2), (76, 2), (77, 2), (77, 1), (79, 1), (77, 2), (74, 2), (76, 2), (72, 2), (74, 2), (71, 2), (72, 3), (74, 1), (76, 4),
             (77, 2), (76, 2), (74, 2), (72, 2), (74, 4)]
        mel = A if i % 2 == 0 else B
        tt = t0; prev = None
        tot = sum(l for _, l in mel); scale = 32 / tot
        for n, l in mel:
            d = l * beat * scale
            M.chip_lead(tr, n, tt, d * 0.92, 0.024 + 0.01 * L, pw=0.25 if L < 0.95 else 0.5, vib=0.006 if l >= 2 else 0, slide_from=prev if (prev and abs(prev - n) <= 2) else None)
            if L >= 0.95: M.chip_lead(tr, n - 12, tt, d * 0.92, 0.012, pw=0.125, pan=0.3)
            prev = n; tt += d
    nxt = STYLES['chip']['levels'][(i + 1) % nsec]
    if nxt > L + 0.1:
        for k in range(8): M.noise_drum(tr, t0 + 7 * bar + k * bar / 8, 'snare', 0.4 + 0.08 * k)


# ============================================================ HORROR (D, 96)
@style('horror', 96, [0.25, 0.5, 0.8, 0.35, 0.7, 1.0])
def horror(tr, t0, bar, beat, L, i, nsec):
    r = M.rng()
    M.drone(tr, 26, t0, bar * 8.2, 0.08, 160, beat=1.004)
    M.drone(tr, 27, t0 + bar * 4, bar * 4.2, 0.03 + 0.03 * L, 300, beat=1.01)
    for b in range(8):
        tb = t0 + b * bar
        if L >= 0.4:
            M.heartbeat(tr, tb, 0.7 + 0.3 * L)
            if L >= 0.8: M.heartbeat(tr, tb + 2 * beat, 0.6 + 0.3 * L)
        if b % 4 == 0:
            M.cluster(tr, [62, 63, 68, 69] if b == 0 else [60, 61, 66, 67], tb, bar * 4, 0.006 + 0.012 * L)
        if L >= 0.6 and b in (3, 7):
            M.metal_hit(tr, tb + 3 * beat, 0.7 + 0.3 * L)
        if L >= 0.7:
            M.taiko(tr, tb, 0.9 * L); M.taiko(tr, tb + 1.5 * beat, 0.5 * L)
            if b % 2 == 1: M.taiko(tr, tb + 3 * beat, 0.8 * L)
            M.ostinato(tr, [38, None, 38, 39, 38, None, 39, 38], tb, beat / 2, 0.02 + 0.015 * L, 1200)
        if L >= 0.95 and b % 2 == 0:
            M.brass(tr, [38, 44, 50], tb, bar * 1.5, 0.05, 900)
            M.strings(tr, [86, 87], tb, bar * 2, 0.008, 5000, att=0.3)
    # caja de música desafinada
    if L <= 0.5:
        mel = [74, 77, 76, 74, 73, 74, 70, 69, 74, 77, 81, 80, 77, 76, 74, 73]
        for k, n in enumerate(mel):
            M.bell(tr, n + 12, t0 + k * bar / 2 + r.uniform(0, 0.02), 0.03, pan=0.3, d=2.5)
    nxt = STYLES['horror']['levels'][(i + 1) % nsec]
    if nxt > L: M.riser(tr, t0 + 5 * bar, 3 * bar, 0.18, f0=150, f1=4000)
    if L >= 0.7: M.impact(tr, t0, 0.8)


# ============================================================ MARCH (F mayor / D menor, 112)
@style('march', 112, [0.35, 0.6, 0.85, 1.0, 0.45, 0.8, 1.0])
def march(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(53, 'M'), ch(48, 'M'), ch(50), ch(46, 'M'), ch(53, 'M'), ch(48, 'M'), ch(46, 'M'), ch(48, 'M')]
    if i % 2: prog = [ch(50), ch(46, 'M'), ch(48, 'M'), ch(53, 'M'), ch(50), ch(45, 'M'), ch(46, 'M'), ch(48, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        # caja de marcha: r-r-ll-r-r-r-ll-r (redobles)
        pat = [(0, 1.0), (0.5, 0.5), (0.75, 0.4), (1, 0.8), (1.5, 0.5), (2, 1.0), (2.5, 0.5), (2.75, 0.4), (3, 0.8), (3.25, 0.4), (3.5, 0.6), (3.75, 0.5)]
        for pos, g in pat:
            if L >= 0.5 or pos in (0, 1, 2, 3): M.snare(tr, tb + pos * beat, g * (0.6 + 0.4 * L), tone=220, rev=0.2)
        if L >= 0.4:
            M.kick(tr, tb, 0.8, punch=0.5); M.kick(tr, tb + 2 * beat, 0.7, punch=0.5)
        # tuba oom-pah
        M.bass(tr, r - 12, tb, beat * 0.8, 0.12, 500, kind='saw'); M.bass(tr, c[2] - 24, tb + 2 * beat, beat * 0.8, 0.1, 500)
        if L >= 0.5:
            for k in (1, 3): M.brass(tr, [n for n in c], tb + k * beat, beat * 0.45, 0.022, 1600, att=0.02)
        if L >= 0.85 and b % 4 == 0: M.crash(tr, tb, 0.7)
    if L >= 0.8:
        mel = [(65, 2), (65, 1), (65, 1), (69, 2), (72, 2), (77, 4), (76, 2), (74, 2), (72, 3), (70, 1), (69, 2), (67, 2), (65, 4)] if i % 2 == 0 else \
              [(74, 2), (72, 1), (70, 1), (69, 2), (70, 2), (72, 4), (69, 4), (70, 2), (72, 2), (74, 2), (76, 2), (77, 8)]
        tot = sum(l for _, l in mel)
        M.fanfare(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 0.03, 2800)
    elif L >= 0.45:
        for b in range(0, 8, 2): M.strings(tr, [n + 12 for n in prog[b]], t0 + b * bar, bar * 2, 0.02, 2200, att=0.4)
    nxt = STYLES['march']['levels'][(i + 1) % nsec]
    if nxt > L + 0.1: M.snare_roll(tr, t0 + 7 * bar, bar, 0.2, 1.0, rate=16); M.timp_roll(tr, t0 + 7 * bar, bar, 41)


# ============================================================ SCIFI (E menor, 128)
@style('scifi', 128, [0.25, 0.45, 0.7, 1.0, 0.35, 0.7, 1.0, 0.9])
def scifi(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(52, 'm'), ch(52, 'm'), ch(48, 'M7'), ch(48, 'M7'), ch(55, 'M'), ch(55, 'M'), ch(50, 'sus2'), ch(50, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        if b % 2 == 0: M.pad(tr, [n + 12 for n in c], tb, bar * 2.1, 0.012 + 0.008 * L, 900 + 1500 * L, att=0.8)
        # pulsos graves
        for k in range(8):
            M.bass(tr, r - 24, tb + k * beat / 2, beat / 2 * 0.7, 0.06 + 0.05 * L, 300 + 400 * L, kind='sub', bus='pump')
        M.arp(tr, c, tb, bar, beat / 4, 0.012 + 0.01 * L, octave=12, pattern=(0, 2, 1, 3, 2, 0, 3, 1), inst='bell' if L < 0.6 else 'pluck', cutoff=2200 + 3000 * L, pan=0.5)
        if L >= 0.65:
            for k in range(4): M.kick(tr, tb + k * beat, 0.8, punch=0.8)
            for k in (1, 3): M.clap(tr, tb + k * beat, 0.6)
            for k in range(16): M.shaker(tr, tb + k * beat / 4, 0.7 if k % 2 else 0.4)
    if L >= 0.95:
        mel = [(76, 3), (74, 1), (71, 4), (72, 2), (74, 2), (76, 4), (79, 3), (78, 1), (74, 4), (76, 8)]
        tt = t0; tot = sum(l for _, l in mel)
        for n, l in mel:
            d = l * beat * 32 / tot
            M.supersaw(tr, n, tt, d * 0.95, 0.016, 4500, rev=0.6); tt += d
        M.crash(tr, t0, 0.8)
    if L < 0.5:
        M.riser(tr, t0 + 2 * bar, 2 * bar, 0.06, f0=800, f1=9000); M.downlifter(tr, t0 + 4 * bar, 2 * bar, 0.06)
    nxt = STYLES['scifi']['levels'][(i + 1) % nsec]
    if nxt > L + 0.1: M.riser(tr, t0 + 6 * bar, 2 * bar, 0.16)


# ============================================================ TRIUMPH (C mayor, 96)
@style('triumph', 96, [0.35, 0.6, 0.9, 1.0, 0.5, 1.0])
def triumph(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(48, 'M'), ch(43, 'M', 1), ch(45), ch(41, 'M'), ch(48, 'M'), ch(41, 'M'), ch(43, 'M'), ch(48, 'M')]
    if i % 2: prog = [ch(41, 'M'), ch(43, 'M'), ch(45), ch(40, 'm'), ch(41, 'M'), ch(48, 'M', 2), ch(43, 'M'), ch(48, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        M.strings(tr, [n + 12 for n in c] + [c[0] + 24], tb, bar * 1.05, 0.016 + 0.014 * L, 1800 + 1800 * L, att=0.3)
        M.bass(tr, r - 12, tb, bar * 0.95, 0.1, 500, kind='sub')
        if L >= 0.55:
            M.brass(tr, [n for n in c], tb, bar, 0.025 + 0.02 * L, 1600 + 1000 * L)
            for k in range(4): M.piano(tr, c[k % 3] + 24, tb + k * beat, 0.03, pan=0.3, d=1.5)
        if L >= 0.85:
            M.choir(tr, [n + 12 for n in c], tb, bar * 1.02, 0.014 + 0.008 * L, vowel='a')
            M.timpani(tr, tb, 36 if r % 12 == 0 else 31, 0.8); M.timpani(tr, tb + 2 * beat, 36 if r % 12 == 0 else 31, 0.5)
            for k in (1, 3): M.snare(tr, tb + k * beat, 0.5)
            M.taiko(tr, tb, 0.5)
        if L < 0.55:
            for k in range(8): M.piano(tr, [c[0], c[1], c[2], c[1]][k % 4] + 24, tb + k * beat / 2, 0.035, pan=0.3 * (1 if k % 2 else -1), d=1.8)
    if L >= 0.95:
        mel = [(72, 2), (76, 1), (79, 1), (84, 4), (83, 2), (81, 2), (79, 4), (77, 2), (76, 2), (77, 2), (79, 2), (81, 4), (79, 4)]
        tot = sum(l for _, l in mel)
        M.fanfare(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 0.03, 3000)
        M.crash(tr, t0, 0.9)
    nxt = STYLES['triumph']['levels'][(i + 1) % nsec]
    if nxt > L + 0.1: M.timp_roll(tr, t0 + 7 * bar, bar, 36)



# ============================================================ estilos tranquilos (v2)
def melody(tr, notes, t0, beat, inst='piano', g=0.05, pan=0.0):
    t = t0
    for n, l in notes:
        d = l * beat
        if n is not None:
            if inst == 'piano': M.piano(tr, n, t, g, pan=pan, d=max(1.2, d * 1.6))
            elif inst == 'strings': M.strings(tr, [n], t, d * 1.02, g, 2600, att=0.18, rel=0.25)
            elif inst == 'horn': M.brass(tr, [n], t, d * 0.97, g, 1500, att=0.09, pan_spread=0)
            elif inst == 'bell': M.bell(tr, n, t, g, pan=pan, d=max(1.5, d * 2))
            elif inst == 'pluck': M.pluck(tr, n, t, d * 0.9, g, 2800, pan=pan)
            elif inst == 'cello': M.strings(tr, [n], t, d * 1.02, g, 1500, att=0.25, rel=0.3)
        t += d

# ---------- SAGA (D menor -> F mayor, 80)
@style('saga', 80, [0.3, 0.55, 0.8, 0.45, 1.0])
def saga(tr, t0, bar, beat, L, i, nsec):
    if i in (0, 1, 3): prog = [ch(50), ch(46, 'M'), ch(48, 'M'), ch(45, 'M'), ch(50), ch(46, 'M'), ch(43), ch(45, 'M')]
    else: prog = [ch(41, 'M'), ch(48, 'M'), ch(50), ch(46, 'M'), ch(41, 'M'), ch(48, 'M'), ch(46, 'M'), ch(45, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b]; r = c[0]
        M.strings(tr, [n + 12 for n in c], tb, bar * 1.04, 0.014 + 0.014 * L, 1400 + 1400 * L, att=0.7)
        M.bass(tr, r - 12, tb, bar * 0.98, 0.07 + 0.03 * L, 400, kind='sub')
        if L >= 0.5:
            for k in range(4): M.piano(tr, [c[0], c[2], c[1] + 12, c[2]][k] + 12, tb + k * beat, 0.022, pan=0.25, d=2.0)
        if L >= 0.75 and b % 2 == 0: M.brass(tr, [n for n in c], tb, bar * 1.9, 0.016 + 0.012 * L, 1200, att=0.6)
    if L >= 0.45:
        if i % 2 == 0: mel = [(69, 3), (70, 1), (72, 4), (74, 2), (72, 1), (70, 1), (69, 4), (65, 3), (67, 1), (69, 2), (70, 2), (72, 4), (69, 4)]
        else: mel = [(77, 3), (76, 1), (74, 2), (72, 2), (74, 4), (72, 2), (70, 2), (69, 4), (67, 2), (69, 2), (70, 3), (72, 1), (69, 4)]
        tot = sum(l for _, l in mel); mel = [(n, l * 32 / tot) for n, l in mel]
        melody(tr, mel, t0, beat, 'piano' if L < 0.75 else 'strings', 0.05 if L < 0.75 else 0.03)
        if L >= 0.95: melody(tr, [(n - 12, l) for n, l in mel], t0, beat, 'horn', 0.022)
    M.timpani(tr, t0, 38, 0.35 + 0.4 * L)
    if L >= 0.95: M.crash(tr, t0, 0.4)

# ---------- AMBIENT (64, sin percusión)
@style('ambient', 64, [0.3, 0.6, 1.0, 0.5])
def ambient(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(45), ch(41, 'M7'), ch(43, 'sus2'), ch(40, 'm7')] if i % 2 == 0 else [ch(41, 'M7'), ch(45), ch(38, 'm7'), ch(40, 'sus4')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[(b // 2) % 4]
        if b % 2 == 0:
            M.pad(tr, [n + 12 for n in c], tb, bar * 2.1, 0.02 + 0.012 * L, 900 + 900 * L, att=1.8)
            M.drone(tr, c[0] - 12, tb, bar * 2.1, 0.05, 200)
        pat = [c[0], c[1], c[2], c[1] + 12, c[2] + 12, c[1] + 12]
        step = beat / 2 if L >= 0.55 else beat
        for k in range(int(4 / (step / beat))):
            if (k * 7 + b) % 5 == 3 and L < 0.9: continue
            M.bell(tr, pat[k % len(pat)] + 24, tb + k * step, 0.012 + 0.012 * L, pan=0.5 * np.sin(k + b), d=2.5)
        if L >= 0.95 and b % 2 == 0: M.choir(tr, [n + 12 for n in c], tb, bar * 2.0, 0.008, vowel='u')
    if L >= 0.55:
        mel = [(76, 4), (74, 2), (72, 2), (71, 6), (None, 2), (72, 4), (74, 2), (76, 2), (79, 6), (None, 2)]
        tot = sum(l for _, l in mel); melody(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 'piano', 0.035, pan=-0.2)

# ---------- HEROIC (C mayor / La menor, 96)
@style('heroic', 96, [0.35, 0.6, 0.85, 1.0, 0.5, 1.0])
def heroic(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(48, 'M'), ch(43, 'M'), ch(45), ch(41, 'M')] if i % 2 == 0 else [ch(45), ch(41, 'M'), ch(48, 'M'), ch(43, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b % 4]; r = c[0]
        M.strings(tr, [n + 12 for n in c], tb, bar * 1.03, 0.014 + 0.013 * L, 1600 + 1400 * L, att=0.4)
        if L >= 0.55:
            M.ostinato(tr, [r + 12, c[1] + 12, c[2] + 12, c[1] + 12] * 2, tb, beat / 2, 0.012 + 0.01 * L, 2200, pan=0.25)
        M.bass(tr, r - 12, tb, bar * 0.95, 0.08 + 0.03 * L, 450, kind='sub')
        if L >= 0.95:
            M.snare_roll(tr, tb + 3 * beat, beat, 0.1, 0.35, rate=12) if b % 4 == 3 else None
            M.timpani(tr, tb, 36 if r % 12 == 0 else 33, 0.45)
    if L >= 0.55:
        if i % 2 == 0: mel = [(67, 2), (72, 2), (74, 2), (76, 4), (74, 2), (72, 2), (71, 2), (72, 6), (69, 2), (71, 2), (72, 4), (67, 4)]
        else: mel = [(76, 3), (77, 1), (79, 4), (77, 2), (76, 2), (74, 4), (72, 2), (74, 2), (76, 4), (74, 2), (71, 2), (72, 4)]
        tot = sum(l for _, l in mel); mel = [(n, l * 32 / tot) for n, l in mel]
        melody(tr, mel, t0, beat, 'horn' if L >= 0.8 else 'strings', 0.03 if L >= 0.8 else 0.028)
    if L >= 0.95: M.crash(tr, t0, 0.5)

# ---------- NOCTURNE (Mi menor, 64, sin percusión)
@style('nocturne', 64, [0.35, 0.7, 1.0, 0.45])
def nocturne(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(40), ch(36, 'M'), ch(43, 'M'), ch(47, 'M')] if i % 2 == 0 else [ch(45), ch(40), ch(36, 'M7'), ch(47, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[(b // 2) % 4]
        for k, n in enumerate([c[0], c[2], c[1] + 12, c[2], c[0] + 12, c[2], c[1] + 12, c[2]]):
            M.piano(tr, n + 12, tb + k * beat / 2, 0.02 + 0.008 * L, pan=-0.25, d=1.6)
        if b % 2 == 0:
            M.pad(tr, [n + 12 for n in c], tb, bar * 2.05, 0.012 + 0.01 * L, 800, att=1.5)
            M.strings(tr, [c[0] - 12], tb, bar * 2.0, 0.03 + 0.02 * L, 900, att=0.5)
    if L >= 0.65:
        mel = [(71, 3), (72, 1), (71, 2), (67, 2), (69, 4), (66, 4), (67, 3), (69, 1), (71, 2), (74, 2), (72, 4), (71, 4)] if i % 2 else [(76, 4), (74, 2), (72, 2), (71, 4), (67, 4), (69, 3), (71, 1), (72, 2), (69, 2), (71, 8)]
        tot = sum(l for _, l in mel); mel = [(n, l * 32 / tot) for n, l in mel]
        melody(tr, [(n - 12, l) for n, l in mel], t0, beat, 'cello', 0.04)
        if L >= 0.95: melody(tr, mel, t0, beat, 'piano', 0.035, pan=0.2)

# ---------- DRIVE (Sol menor, 112, sin taiko)
@style('drive', 112, [0.35, 0.55, 0.8, 1.0, 0.45, 0.8, 1.0])
def drive(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(43), ch(39, 'M'), ch(46, 'M'), ch(41, 'M')] if i % 2 == 0 else [ch(43), ch(46, 'M'), ch(48), ch(50, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b % 4]; r = c[0]
        M.ostinato(tr, [r, r, r + 12, r, r, r + 12, r, r + 7], tb, beat / 2, 0.02 + 0.016 * L, 900 + 900 * L, pan=0.15)
        M.bass(tr, r - 12, tb, bar * 0.95, 0.06 + 0.03 * L, 380, kind='sub')
        if L >= 0.5 and b % 2 == 0: M.brass(tr, [n for n in c], tb + beat, bar * 1.6, 0.015 + 0.014 * L, 1100 + 700 * L, att=0.7)
        if L >= 0.55:
            for pos in (0, 2): M.kick(tr, tb + pos * beat, 0.45 + 0.25 * L, punch=0.6)
        if L >= 0.95:
            for k in range(8): M.hat(tr, tb + k * beat / 2, 0.35 if k % 2 else 0.2)
        if L < 0.5 and b % 2 == 0: M.strings(tr, [n + 12 for n in c], tb, bar * 2, 0.016, 1500, att=0.8)
    if L >= 0.75:
        mel = [(67, 4), (70, 2), (72, 2), (74, 6), (72, 2), (70, 4), (69, 4), (67, 4), (65, 2), (67, 2)]
        tot = sum(l for _, l in mel); melody(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 'strings', 0.026)
    nxt = STYLES['drive']['levels'][(i + 1) % nsec]
    if nxt > L + 0.15: M.riser(tr, t0 + 6 * bar, 2 * bar, 0.1)

# ---------- VOYAGE (Si bemol mayor, 96)
@style('voyage', 96, [0.35, 0.6, 0.9, 0.5, 1.0, 0.75])
def voyage(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(46, 'M'), ch(41, 'M'), ch(43), ch(39, 'M')] if i % 2 == 0 else [ch(39, 'M'), ch(46, 'M'), ch(41, 'M'), ch(43)]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b % 4]; r = c[0]
        for k, n in enumerate([c[0], c[1], c[2], c[1] + 12, c[2] + 12, c[1] + 12, c[2], c[1]]):
            M.pluck(tr, n + 12, tb + k * beat / 2, beat / 2 * 0.9, 0.018 + 0.01 * L, 2400, pan=0.4 * (1 if k % 2 else -1))
        M.strings(tr, [n + 12 for n in c], tb, bar * 1.03, 0.012 + 0.012 * L, 1500 + 1200 * L, att=0.5)
        M.bass(tr, r - 12, tb, bar * 0.95, 0.07 + 0.03 * L, 450, kind='sub')
        if L >= 0.55:
            for k in range(8): M.shaker(tr, tb + k * beat / 2, 0.35 if k % 2 else 0.2)
        if L >= 0.85 and b % 2 == 0: M.choir(tr, [n + 12 for n in c], tb, bar * 2.0, 0.01 + 0.006 * L, vowel='o')
    if L >= 0.55:
        mel = [(70, 2), (72, 2), (74, 4), (77, 2), (75, 2), (74, 4), (72, 2), (74, 2), (75, 4), (72, 4), (70, 4)] if i % 2 == 0 else [(77, 4), (79, 2), (77, 2), (75, 4), (74, 4), (72, 2), (74, 2), (75, 2), (77, 2), (74, 8)]
        tot = sum(l for _, l in mel); melody(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 'strings' if L >= 0.85 else 'piano', 0.03 if L >= 0.85 else 0.045)


# ---------- SPY (La menor, 112): bajo caminante, pizzicato, tensión de espías
@style('spy', 112, [0.3, 0.55, 0.8, 1.0, 0.5, 0.85, 1.0])
def spy(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(45), ch(45), ch(41, 'M'), ch(40, 'M')] if i % 2 == 0 else [ch(45), ch(48, 'M'), ch(43, 'M'), ch(40, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[(b // 2) % 4]; r = c[0]
        for k, n in enumerate([r, r + 7, r + 12, r + 10, r, r + 7, r + 3, r + 5]):
            M.bass(tr, n - 12, tb + k * beat / 2, beat / 2 * 0.8, 0.07 + 0.03 * L, 600, kind='sub')
        for k in (1, 3): M.pluck(tr, c[1] + 12, tb + k * beat, beat * 0.4, 0.02 + 0.012 * L, 1800, pan=-0.3)
        if L >= 0.5:
            for k in range(8): M.hat(tr, tb + k * beat / 2, 0.25 if k % 2 else 0.12)
            M.kick(tr, tb, 0.4 + 0.2 * L, punch=0.5); M.snare(tr, tb + 2 * beat, 0.25 + 0.15 * L)
        if b % 2 == 0: M.strings(tr, [n + 12 for n in c], tb, bar * 2, 0.008 + 0.01 * L, 1200, att=0.8)
    if L >= 0.8:
        mel = [(69, 2), (72, 1), (71, 1), (69, 4), (64, 2), (67, 2), (69, 4), (72, 2), (74, 2), (76, 4), (74, 2), (72, 2), (71, 4)]
        tot = sum(l for _, l in mel); melody(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 'piano', 0.035, pan=0.2)

# ---------- CHASE (Re menor, 160): persecución, taikos y cuerdas rápidas
@style('chase', 160, [0.5, 0.75, 1.0, 1.0, 0.6, 0.9, 1.0, 1.0, 0.7, 1.0])
def chase(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(50), ch(46, 'M'), ch(48, 'M'), ch(45, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b % 4]; r = c[0]
        M.ostinato(tr, [r + 12, r + 12, r + 24, r + 12, r + 15, r + 12, r + 19, r + 12], tb, beat / 2, 0.022 + 0.016 * L, 2200, pan=0.2)
        M.bass(tr, r - 12, tb, bar * 0.9, 0.07 + 0.03 * L, 500, kind='saw')
        for k in range(4): M.kick(tr, tb + k * beat, 0.5 + 0.3 * L, punch=0.8)
        M.snare(tr, tb + beat, 0.3 + 0.2 * L); M.snare(tr, tb + 3 * beat, 0.3 + 0.2 * L)
        if L >= 0.7:
            for k in range(8): M.hat(tr, tb + k * beat / 2, 0.3)
            if b % 2 == 0: M.taiko(tr, tb, 0.6 * L)
        if L >= 0.9 and b % 2 == 0: M.brass(tr, c, tb, bar * 1.8, 0.02 + 0.015 * L, 1600)
    nxt = STYLES['chase']['levels'][(i + 1) % nsec]
    if nxt > L + 0.15: M.riser(tr, t0 + 6 * bar, 2 * bar, 0.1)

# ---------- NEWSROOM (Do mayor, 128): sintetizador de informativo
@style('newsroom', 128, [0.6, 0.85, 1.0, 0.7, 1.0, 0.85, 1.0, 0.8])
def newsroom(tr, t0, bar, beat, L, i, nsec):
    prog = [ch(48, 'M'), ch(45), ch(41, 'M'), ch(43, 'M')]
    for b in range(8):
        tb = t0 + b * bar; c = prog[b % 4]; r = c[0]
        M.ostinato(tr, [r + 12, r + 19, r + 24, r + 19] * 2, tb, beat / 2, 0.02 + 0.012 * L, 2800, pan=-0.2)
        M.bass(tr, r - 12, tb, beat * 1.8, 0.06 + 0.02 * L, 500, kind='sub'); M.bass(tr, r - 12, tb + 2 * beat, beat * 1.8, 0.06, 500, kind='sub')
        for k in range(4): M.kick(tr, tb + k * beat, 0.35 + 0.2 * L, punch=0.5)
        for k in range(8): M.hat(tr, tb + k * beat / 2, 0.25 if k % 2 else 0.1)
        M.clap(tr, tb + beat, 0.3); M.clap(tr, tb + 3 * beat, 0.3)
        if b % 2 == 0: M.pad(tr, [n + 12 for n in c], tb, bar * 2, 0.012 + 0.01 * L, 2200)
    if L >= 0.95:
        mel = [(72, 2), (76, 2), (79, 4), (77, 2), (76, 2), (74, 4), (72, 2), (74, 2), (76, 4), (72, 8)]
        tot = sum(l for _, l in mel); melody(tr, [(n, l * 32 / tot) for n, l in mel], t0, beat, 'piano', 0.03)

# ============================================================ render
def build(name):
    S = STYLES[name]
    bpm, levels = S['bpm'], S['levels']
    beat = 60.0 / bpm; bar = 4 * beat; sec = 8 * bar
    nsec = len(levels)
    assert abs(sec * nsec - DUR) < 1e-6, (name, sec * nsec)
    M.set_seed(sum(ord(ch_) for ch_ in name) * 7)
    tr = M.Track(DUR, tail=4.0)
    for i, L in enumerate(levels):
        S['fn'](tr, i * sec, bar, beat, L, i, nsec)
    # el primer compás tras el final (para que el bucle tenga continuidad en la cola)
    env = {}
    if 'pump' in tr.buses:
        env['pump'] = M.sidechain_env(DUR, beat, depth=0.65, rel=0.2, tail=4.0)
    x = tr.render(bus_env=env, rev_gain=0.5)
    x = M.compress(x, thr_db=-16, ratio=2.5, att=0.01, rel=0.15)
    # sonoridad: la sección más fuerte a ~-14.5 dB RMS, picos limitados suavemente a -1 dBFS
    secs = [x[int(k * sec * M.SR): int((k + 1) * sec * M.SR)] for k in range(nsec)]
    loud = max(np.sqrt((sg ** 2).mean()) for sg in secs)
    x = x * (10 ** (-14.5 / 20) / max(loud, 1e-9))
    lim = 10 ** (-1.05 / 20)
    x = np.where(np.abs(x) > 0.7 * lim, np.sign(x) * (0.7 * lim + 0.3 * lim * np.tanh((np.abs(x) - 0.7 * lim) / (0.3 * lim))), x)
    path = os.path.join(OUT, f'{name}.wav')
    M.write_wav(path, x)
    rms = []
    for k in range(nsec):
        seg = x[int(k * sec * M.SR): int((k + 1) * sec * M.SR)]
        rms.append(round(float(20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)), 1))
    info = dict(file=f'tracks/{name}.wav', bpm=bpm, beat=round(beat, 5), bar=round(bar, 5), section=round(sec, 4), duration=DUR,
                sections=[[round(k * sec, 3), round((k + 1) * sec, 3)] for k in range(nsec)], intensity=levels, rms_db=rms,
                peak_db=round(float(20 * np.log10(np.abs(x).max())), 2))
    print(name, 'rms', rms, 'peak', info['peak_db'], flush=True)
    return info


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or list(STYLES)
    idx_path = os.path.join(OUT, 'index.json')
    idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    for n in names:
        idx[n] = build(n)
        json.dump(idx, open(idx_path, 'w'), indent=1)
