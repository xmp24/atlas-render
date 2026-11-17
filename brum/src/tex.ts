import * as THREE from 'three';

const cache: Record<string, THREE.Texture> = {};
const mk = (key: string, w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  cache[key] = t;
  return t;
};

const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

export const grassTex = () => mk('grass', 512, 512, (x) => {
  x.fillStyle = '#8fd16a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const a = rnd();
    x.fillStyle = a < 0.5 ? 'rgba(120,196,86,0.35)' : 'rgba(168,224,120,0.35)';
    const r = 3 + rnd() * 10;
    x.beginPath(); x.arc(rnd() * 512, rnd() * 512, r, 0, 7); x.fill();
  }
}, [40, 40]);

export const plazaTex = () => mk('plaza', 1024, 1024, (x) => {
  x.fillStyle = '#ffe59a'; x.fillRect(0, 0, 1024, 1024);
  x.translate(512, 512);
  for (let r = 60; r < 512; r += 62) {
    x.strokeStyle = 'rgba(214,170,80,0.55)'; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, r, 0, 7); x.stroke();
    const n = Math.round((r * 2 * Math.PI) / 70);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      x.beginPath(); x.moveTo(Math.cos(a) * r, Math.sin(a) * r); x.lineTo(Math.cos(a) * (r + 62), Math.sin(a) * (r + 62)); x.stroke();
    }
  }
  x.fillStyle = '#ffd06a'; x.beginPath(); x.arc(0, 0, 58, 0, 7); x.fill();
  // estrella central
  x.fillStyle = '#ffb347'; x.beginPath();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 22 : 50; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  x.fill();
});

export const roadTex = () => mk('road', 256, 1024, (x) => {
  x.fillStyle = '#76839a'; x.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${0.03 + rnd() * 0.04})`; x.fillRect(rnd() * 256, rnd() * 1024, 3, 3); }
  x.fillStyle = '#f4f7fb'; x.fillRect(0, 0, 14, 1024); x.fillRect(242, 0, 14, 1024);
  x.fillStyle = '#ffe066';
  for (let y = 40; y < 1024; y += 256) x.fillRect(118, y, 20, 150);
}, [1, 6]);

export const stripeTex = (key: string, a: string, b: string, n: number, vertical = false) => mk(key, 256, 256, (x) => {
  for (let i = 0; i < n; i++) {
    x.fillStyle = i % 2 ? b : a;
    if (vertical) x.fillRect((i * 256) / n, 0, 256 / n + 1, 256); else x.fillRect(0, (i * 256) / n, 256, 256 / n + 1);
  }
});

export const signTex = (text: string, bg: string, fg: string, icon?: string) => mk('sign' + text, 1024, 256, (x) => {
  const r = 70;
  x.fillStyle = bg;
  x.beginPath(); x.moveTo(r, 8); x.arcTo(1016, 8, 1016, 248, r); x.arcTo(1016, 248, 8, 248, r); x.arcTo(8, 248, 8, 8, r); x.arcTo(8, 8, 1016, 8, r); x.fill();
  x.lineWidth = 14; x.strokeStyle = '#ffffff'; x.stroke();
  x.font = 'bold 150px "Lilita One", "Fredoka", sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 16; x.strokeStyle = 'rgba(0,0,0,0.25)'; x.strokeText((icon ? icon + ' ' : '') + text, 512, 140);
  x.fillStyle = fg; x.fillText((icon ? icon + ' ' : '') + text, 512, 134);
});

export const clockTex = () => mk('clock', 256, 256, (x) => {
  x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
  x.lineWidth = 14; x.strokeStyle = '#2d7a52'; x.stroke();
  x.fillStyle = '#2d3a4a';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.beginPath(); x.arc(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92, 8, 0, 7); x.fill(); }
  x.lineCap = 'round'; x.lineWidth = 12; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 60); x.stroke();
  x.lineWidth = 9; x.beginPath(); x.moveTo(128, 128); x.lineTo(182, 128); x.stroke();
});

export const zTex = () => mk('zzz', 128, 128, (x) => {
  x.font = 'bold 110px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 12; x.strokeStyle = '#3b4a8a'; x.strokeText('Z', 64, 68);
  x.fillStyle = '#ffffff'; x.fillText('Z', 64, 68);
});

export const starTex = () => mk('star', 128, 128, (x) => {
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,240,170,0.9)'); gr.addColorStop(1, 'rgba(255,220,120,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#ffffff'; x.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = i % 2 ? 10 : 60; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
  x.fill();
});

export const puffTex = () => mk('puff', 128, 128, (x) => {
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(250,246,236,0.7)'); gr.addColorStop(1, 'rgba(250,246,236,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
});
