import json, sys, os, torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
V = sys.argv[1]
CFG = {
 'narrA': ('N', 'ref_narr.wav', 0.7, 0.35, 0.8),
 'narrB': ('N', 'ref_narr.wav', 1.1, 0.3, 0.85),
 'narrD': ('N', None, 0.8, 0.35, 0.8),
 'brunoA': ('BX', 'ref_bruno.wav', 0.9, 0.3, 0.85),
 'brunoB': ('BX', 'ref_bruno.wav', 1.4, 0.25, 0.9),
}
who, ref, ex, cfg, temp = CFG[V]
torch.manual_seed(42)
m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
L = json.load(open('lines.json'))
os.makedirs('../../out', exist_ok=True)
for k, (s, txt) in L.items():
    if s not in who: continue
    r = ref
    if s == 'X': r = 'ref_x.wav'
    for take in (1, 2):
        torch.manual_seed(take * 100 + hash(k) % 97)
        wav = m.generate(txt, language_id='es', audio_prompt_path=r, exaggeration=ex, cfg_weight=cfg, temperature=temp)
        ta.save(f'../../out/{V}_{k}_{take}.wav', wav, m.sr)
        print(V, k, take, wav.shape, flush=True)
