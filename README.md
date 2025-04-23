# CBL Program Runner

This project runs a DOS program in a web browser using Emscripten-compiled DOSBox.

## Quick Start

1. Visit https://aetherialcatnip.github.io/CBL/
2. Click "Start Program" to run the DOS program
3. Use "Reset" if needed

## Setup Instructions (for developers)

### Prerequisites

1. Install Git for Windows: https://git-scm.com/download/win
2. Install Python 3.x: https://www.python.org/downloads/
3. Install CMake: https://cmake.org/download/

### Automated Setup (Windows)

1. Open Command Prompt as Administrator
2. Navigate to the project directory
3. Run the setup script:
   ```batch
   setup.bat
   ```

### Manual Setup

1. Install Emscripten SDK:
   ```batch
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   emsdk install latest
   emsdk activate latest
   call emsdk_env.bat
   cd ..
   ```

2. Build DOSBox:
   ```batch
   git clone https://github.com/dosbox-staging/dosbox-staging.git
   cd dosbox-staging
   mkdir build
   cd build
   emcmake cmake ..
   emmake make
   cd ../..
   ```

3. Copy compiled files:
   ```batch
   copy dosbox-staging\build\dosbox.js em-dosbox\
   copy dosbox-staging\build\dosbox.wasm em-dosbox\
   ```

### Project Structure

```
CBL_Project/
├── index.html          # Web interface
├── CBL.zip            # DOS program
├── em-dosbox/         # Compiled DOSBox files
│   ├── dosbox.js      # JavaScript interface
│   └── dosbox.wasm    # WebAssembly module
├── setup.bat          # Setup script
└── README.md          # Documentation
```

### Deploying to GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to repository Settings > Pages
4. Select the main branch as the source
5. Wait for the site to be published

## Troubleshooting

If you encounter issues:

1. Make sure all prerequisites are installed
2. Run setup.bat as Administrator
3. Check the browser console for errors
4. Ensure your browser supports WebAssembly

## License

This project is licensed under the MIT License. 