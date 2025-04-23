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
    },
    // Initialize Emscripten filesystem
    FS: {
        root: null,
        mount: function(type, options) {
            console.log('Mounting filesystem:', type, options);
            if (!this.root) {
                this.root = {
                    name: '/',
                    contents: {},
                    isDirectory: true
                };
            }
            return this.root;
        },
        mkdir: function(path) {
            console.log('Creating directory:', path);
        },
        writeFile: function(path, data) {
            console.log('Writing file:', path, data);
        },
        readFile: function(path) {
            console.log('Reading file:', path);
            return new Uint8Array(0);
        }
    },
    // Add cleanup function
    cleanup: function() {
        console.log('Cleaning up emulator...');
        if (this.canvas) {
            this.canvas = null;
        }
        if (this.FS && this.FS.root) {
            this.FS.root = null;
        }
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
            try {
                // Mount the filesystem using Module.FS
                Module.FS.mount(type, options);
                console.log('Filesystem mounted successfully');
            } catch (error) {
                console.error('Error mounting filesystem:', error);
                throw error;
            }
        },
        filesystems: {
            ZIP: 'ZIP',
            MEMFS: 'MEMFS'
        }
    };

    // Run a program
    this.run = function(program) {
        try {
            console.log('Running program:', program);
            // Use Module.FS to handle file operations
            Module.FS.writeFile(program, new Uint8Array(0));
            Module.callMain([program]);
            this.onready();
        } catch (error) {
            console.error('Error running program:', error);
            this.onerror(error);
        }
    };

    // Destroy the emulator
    this.destroy = function() {
        console.log('Destroying emulator');
        try {
            // Clean up the Module
            Module.cleanup();
            // Reset the canvas
            if (this.canvas) {
                this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    };
}

// Export the Dosbox constructor
Module.Dosbox = Dosbox; 