// Em-DOSBox JavaScript interface
var Module = {
    preRun: [],
    postRun: [],
    print: function(text) {
        console.log(text);
    },
    printErr: function(text) {
        console.error(text);
    },
    canvas: null,
    setStatus: function(text) {
        if (this.statusElement) {
            this.statusElement.innerHTML = text;
        }
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        this.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
};

Module.setStatus('Downloading...');

// Initialize the emulator
function Dosbox(options) {
    this.canvas = options.canvas;
    this.autolock = options.autolock || false;
    this.onready = options.onready || function() {};
    this.onerror = options.onerror || function(error) { console.error(error); };
    
    // Initialize the filesystem
    this.fs = {
        mount: function(type, options) {
            // Mount the filesystem
            Module.FS.mount(type, options);
        },
        filesystems: {
            ZIP: 'ZIP',
            MEMFS: 'MEMFS'
        }
    };

    // Run a program
    this.run = function(program) {
        try {
            Module.FS.writeFile(program, new Uint8Array(0));
            Module.callMain([program]);
            this.onready();
        } catch (error) {
            this.onerror(error);
        }
    };

    // Destroy the emulator
    this.destroy = function() {
        Module._emscripten_force_exit();
    };
}

// Export the Dosbox constructor
Module.Dosbox = Dosbox; 