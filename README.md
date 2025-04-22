# CBL Program Runner

This project runs a DOS program (CBL.zip) in the browser using Em-DOSBox.

## Project Structure

```
.
├── index.html              # Main web interface
├── CBL.zip                 # The DOS program to run
└── em-dosbox-em-dosbox-0.74/  # Em-DOSBox files
    ├── em-dosbox.js        # Em-DOSBox JavaScript
    ├── em-dosbox.wasm      # Em-DOSBox WebAssembly
    └── ...                 # Other Em-DOSBox files
```

## Setup Instructions

1. Make sure all files are in the correct locations:
   - `index.html` in the root directory
   - `CBL.zip` in the root directory
   - Em-DOSBox files in the `em-dosbox-em-dosbox-0.74` directory

2. For GitHub Pages:
   - Push all files to your GitHub repository
   - Enable GitHub Pages in your repository settings
   - Select the main branch as the source

## How It Works

1. The web page loads Em-DOSBox, a JavaScript port of DOSBox
2. Em-DOSBox mounts the current directory as drive C:
3. The program automatically navigates to the CBL directory and runs STUDENT.EXE
4. The DOS program runs in a canvas element on the webpage

## Controls

- **Start Program**: Starts or restarts the DOS program
- **Reset**: Resets the emulator

## Requirements

- Modern web browser with WebAssembly support (Chrome, Firefox, Edge recommended)
- Stable internet connection
- GitHub Pages hosting

## Troubleshooting

If the program doesn't start:
1. Check that all files are in the correct locations
2. Clear your browser cache
3. Try a different browser
4. Check the browser console for errors 