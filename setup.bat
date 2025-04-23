@echo off
setlocal enabledelayedexpansion

echo Setting up CBL Project...

:: Create necessary directories
if not exist em-dosbox mkdir em-dosbox

:: Create em-dosbox.js
echo Creating em-dosbox.js...
(
echo // Em-DOSBox JavaScript interface
echo var Module = {
echo     preRun: [],
echo     postRun: [],
echo     print: function(text) {
echo         console.log(text);
echo     },
echo     printErr: function(text) {
echo         console.error(text);
echo     },
echo     canvas: null,
echo     setStatus: function(text) {
echo         if (this.statusElement) {
echo             this.statusElement.innerHTML = text;
echo         }
echo     },
echo     totalDependencies: 0,
echo     monitorRunDependencies: function(left) {
echo         this.totalDependencies = Math.max(this.totalDependencies, left);
echo         this.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
echo     }
echo };
echo.
echo Module.setStatus('Downloading...');
echo.
echo // Initialize the emulator
echo function Dosbox(options) {
echo     this.canvas = options.canvas;
echo     this.autolock = options.autolock || false;
echo     this.onready = options.onready || function() {};
echo     this.onerror = options.onerror || function(error) { console.error(error); };
echo.
echo     // Initialize the filesystem
echo     this.fs = {
echo         mount: function(type, options) {
echo             // Mount the filesystem
echo             Module.FS.mount(type, options);
echo         },
echo         filesystems: {
echo             ZIP: 'ZIP',
echo             MEMFS: 'MEMFS'
echo         }
echo     };
echo.
echo     // Run a program
echo     this.run = function(program) {
echo         try {
echo             Module.FS.writeFile(program, new Uint8Array(0));
echo             Module.callMain([program]);
echo             this.onready();
echo         } catch (error) {
echo             this.onerror(error);
echo         }
echo     };
echo.
echo     // Destroy the emulator
echo     this.destroy = function() {
echo         Module._emscripten_force_exit();
echo     };
echo }
echo.
echo // Export the Dosbox constructor
echo Module.Dosbox = Dosbox;
) > em-dosbox\em-dosbox.js

:: Create em-dosbox.wasm
echo Creating em-dosbox.wasm...
(
echo 0000000: 0061 736d 0100 0000 0108 0260 017f 0060
echo 0000010: 0000 020d 0103 656e 7605 6162 6f72 7400
echo 0000020: 0003 0201 0105 0301 0001 070d 0109 6d65
echo 0000030: 6d6f 7279 0200 0a6d 6169 6e00 000b 0801
echo 0000040: 0041 000b 0000 0000 0000 0000 0000 0000
) > em-dosbox\em-dosbox.wasm

echo Setup complete! Check em-dosbox directory for em-dosbox.js and em-dosbox.wasm
pause 