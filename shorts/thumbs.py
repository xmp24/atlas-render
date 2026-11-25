# Miniaturas 1080x1920: fotograma fuerte del vídeo + título grande con el estilo del vídeo
import subprocess, sys, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
R = '/home/claude/atlas-render/'
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-ExtraBold.otf'
T = {
    'gg_id': ('MAJAPAHIT\nGG EZ', -0.6), 'gg_in': ('MUGHALS\nGG EZ', -0.6), 'gg_as': ('MONGOLS\nGG EZ', -0.6),
    'grew': ('GREW THE\nFASTEST', 14.5), 'then_a': ('THEN\nVS TODAY', 9.5), 'then_b': ('THEN\nVS TODAY', 17.5),
    'ctl_in': ('WHO RULED\nINDIA?', -0.5), 'ctl_id': ('WHO RULED\nINDONESIA?', -0.5), 'ctl_us': ('WHO RULED\nTHE USA?', -0.5),
}
def make(v):
    text, ts = T[v]
    dur = json.load(open(R + f'src/sh/data/{v}.json'))['dur']
    if ts < 0: ts = dur + ts
    import os
    env = dict(os.environ, NODE_USE_ENV_PROXY='1', NODE_EXTRA_CA_CERTS='/root/.ccr/ca-bundle.crt', NODE_NO_WARNINGS='1')
    comp = 'SH-' + v.replace('_', '-')
    subprocess.run(['npx', 'remotion', 'still', 'build-sh9', comp, f'/tmp/th_{v}.png', f'--frame={int(ts * 60)}', '--props', json.dumps(dict(v=v, audio=False, notext=True)),
                    '--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', '--timeout=180000'], cwd=R, env=env, check=True, capture_output=True)
    im = Image.open(f'/tmp/th_{v}.png').convert('RGB')
    # tapar el texto del vídeo con un degradado oscuro arriba
    ov = Image.new('L', im.size, 0); d = ImageDraw.Draw(ov)
    for y in range(760): d.line([(0, y), (1080, y)], fill=int(205 * (1 - y / 760) ** 1.3))
    im = Image.composite(Image.new('RGB', im.size, (0, 0, 0)), im, ov)
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.15)).enhance(1.06)
    lines = text.split('\n')
    y = 150
    for li, ln in enumerate(lines):
        size = 210 if li == 0 else 190
        f = ImageFont.truetype(FONT, size)
        while f.getlength(ln) > 1000: size -= 6; f = ImageFont.truetype(FONT, size)
        w = f.getlength(ln); x = (1080 - w) / 2
        # sombra
        sh = Image.new('L', im.size, 0); ImageDraw.Draw(sh).text((x + 6, y + 12), ln, font=f, fill=230)
        im = Image.composite(Image.new('RGB', im.size, (0, 0, 0)), im, sh.filter(ImageFilter.GaussianBlur(10)))
        # texto con degradado blanco -> gris (o amarillo para GG EZ / ?)
        m = Image.new('L', im.size, 0); ImageDraw.Draw(m).text((x, y), ln, font=f, fill=255)
        g = Image.new('RGB', im.size); gd = ImageDraw.Draw(g)
        top, bot = ((255, 226, 80), (235, 160, 20)) if (li == 1 and ('GG' in ln or '?' in ln)) else ((255, 255, 255), (178, 178, 178))
        for yy in range(y, y + size + 20):
            k = min(max((yy - y) / size, 0), 1); gd.line([(0, yy), (1080, yy)], fill=tuple(int(top[i] + (bot[i] - top[i]) * k) for i in range(3)))
        im = Image.composite(g, im, m)
        y += int(size * 1.05)
    im.save(R + f'out/sh/thumb_{v}.jpg', quality=93)
    print('miniatura', v)

if __name__ == '__main__':
    for v in sys.argv[1:]: make(v)
