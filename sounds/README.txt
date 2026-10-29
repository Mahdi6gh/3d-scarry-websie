UNMASKED — optional real sound files
=====================================

Every sound on the site is synthesized live in the browser, so the site works with this
folder empty. If you own (or have licensed) real recordings, you can swap any sound:

1. Put the audio file in this folder, e.g.  sounds/scooby-laugh.mp3
2. List it in manifest.json, mapping the sound name to the file name:

   {
     "scoobyLaugh": "scooby-laugh.mp3",
     "ruhroh": "ruh-roh.mp3",
     "reItem": "item-pickup.wav"
   }

3. Reload the site (it must be served over http, e.g.  python -m http.server 5173).

Sound names you can replace:
  ruhroh       – "Ruh-roh!" when a character is clicked / chase starts
  scoobyLaugh  – the Great Dane's laugh (clicking Biscuit)
  scoobyDoo    – victory call (all biscuits / all clues found)
  skid         – cartoon feet-scramble before running away
  bark         – dog bark
  moan         – ghost moan
  laugh        – villain laugh at the unmasking
  sting        – jump-scare sting
  reItem       – item pickup chime (add to item box)
  reDoor       – heavy door + footsteps when entering the safe room
  herb         – healing chime (green herb)
  type, ding   – typewriter keys / bell
  creak, knock, slam, thunder, bigclang, squeak, radio, boing

Only use recordings you have the rights to use.
