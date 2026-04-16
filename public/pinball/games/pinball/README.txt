PLACE GAME ASSETS HERE (68 files expected after extraction)
============================================================

1. Obtain: Space-Cadet-3D-Pinball_Win_FR.zip

2. Extract ONLY the Pinball/ folder contents into THIS directory (games/pinball/),
   with files at the top level (no Pinball subfolder).

   PowerShell (adjust path to your zip):
   Expand-Archive -Path "C:\path\to\Space-Cadet-3D-Pinball_Win_FR.zip" -DestinationPath "$env:TEMP\scpin" -Force
   Copy-Item "$env:TEMP\scpin\Pinball\*" -Destination "." -Force

   Or use 7-Zip / unzip so that PINBALL.DAT, FONT.DAT, PINBALL.MID, table.bmp,
   wavemix.inf, all SOUND*.WAV, etc. sit directly in games/pinball/

3. Verify:
   - PINBALL.DAT exists (~928 KB)
   - 63 files matching SOUND*.WAV

4. From the pinball-site/ folder run:  python serve.py
   Open http://localhost:8080

PINBALL.EXE is not used by the browser build.
