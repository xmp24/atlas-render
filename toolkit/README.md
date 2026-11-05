# Atlas toolkit
Python side of the map-war engine (the Remotion side is ../src).
Copy everything in this folder to the project root (next to src/ and public/) before running.
- warlib.py / wlib2.py: map data + event library (invade, quick, missiles, jets, landings...).
- dir_*.py: example directors -> src/hw/<name>.json
- aud_hw.py + audio/: procedural music (audio/palette.py regenerates audio/tracks) + SFX bank + mixer
- ghrender.sh / ghfetch.sh: GitHub Actions parallel render + decrypt + concat + QA
- hwstill.sh: local stills for review
