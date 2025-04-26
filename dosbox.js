// DOSBox 0.74-3 JavaScript interface
var Module = {
    preRun: [],
    postRun: [],
    print: function(text) {
        console.log('[DOSBox] ' + text);
    },
    printErr: function(text) {
        console.error('[DOSBox] ' + text);
    },
    canvas: null,
    setStatus: function(text) {
        console.log('[DOSBox] Status: ' + text);
        if (this.statusElement) {
            this.statusElement.innerHTML = text;
        }
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        console.log('[DOSBox] Dependencies: ' + left + ' remaining');
        this.totalDependencies = Math.max(this.totalDependencies, left);
        this.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    },
    // Initialize Emscripten filesystem
    FS: {
        root: null,
        mounted: false,
        mount: function(type, options) {
            console.log('[DOSBox.FS] Mounting filesystem:', type, options);
            if (!this.root) {
                console.log('[DOSBox.FS] Creating root filesystem');
                this.root = {
                    name: '/',
                    contents: {},
                    isDirectory: true
                };
            }
            if (!this.mounted) {
                this.mounted = true;
                return this.root;
            }
            return this.root;
        },
        mkdir: function(path) {
            console.log('[DOSBox.FS] Creating directory:', path);
        },
        writeFile: function(path, data) {
            console.log('[DOSBox.FS] Writing file:', path, data);
        },
        readFile: function(path) {
            console.log('[DOSBox.FS] Reading file:', path);
            return new Uint8Array(0);
        }
    },
    // Add cleanup function
    cleanup: function() {
        console.log('[DOSBox] Cleaning up emulator...');
        if (this.canvas) {
            this.canvas = null;
        }
        if (this.FS && this.FS.root) {
            this.FS.root = null;
        }
    },
    // Add ready state handling
    ready: false,
    onRuntimeInitialized: function() {
        console.log('[DOSBox] Runtime initialized');
        this.ready = true;
        if (this.onReadyCallback) {
            console.log('[DOSBox] Calling ready callback');
            this.onReadyCallback();
        }
    },
    // Initialize the runtime
    initRuntime: function() {
        console.log('[DOSBox] Initializing runtime...');
        try {
            // Simulate runtime initialization
            this.ready = true;
            this.onRuntimeInitialized();
            console.log('[DOSBox] Runtime initialization complete');
        } catch (error) {
            console.error('[DOSBox] Runtime initialization error:', error);
        }
    }
};

// Initialize the emulator
function Dosbox(options) {
    console.log('[DOSBox] Initializing with options:', options);
    
    this.canvas = options.canvas;
    this.autolock = options.autolock || false;
    this.onready = options.onready || function() {
        console.log('[DOSBox] Default onready called');
    };
    this.onerror = options.onerror || function(error) {
        console.error('[DOSBox] Default onerror called:', error);
    };
    
    // Set the canvas in Module
    Module.canvas = this.canvas;
    console.log('[DOSBox] Canvas set in Module');
    
    // Initialize the filesystem
    this.fs = {
        mount: function(type, options) {
            try {
                console.log('[DOSBox.fs] Mounting filesystem:', type, options);
                Module.FS.mount(type, options);
                console.log('[DOSBox.fs] Filesystem mounted successfully');
            } catch (error) {
                console.error('[DOSBox.fs] Error mounting filesystem:', error);
                throw error;
            }
        },
        filesystems: {
            ZIP: 'ZIP',
            MEMFS: 'MEMFS'
        }
    };

    // Run a command
    this.run = function(command) {
        try {
            console.log('[DOSBox] Running command:', command);
            // Execute the command in DOSBox
            Module.ccall('dosbox_run_command', 'void', ['string'], [command]);
            this.onready();
        } catch (error) {
            console.error('[DOSBox] Error running command:', error);
            this.onerror(error);
        }
    };

    // Destroy the emulator
    this.destroy = function() {
        console.log('[DOSBox] Destroying emulator');
        try {
            Module.cleanup();
            if (this.canvas) {
                this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } catch (error) {
            console.error('[DOSBox] Error during cleanup:', error);
        }
    };

    // Set up ready callback
    Module.onReadyCallback = function() {
        console.log('[DOSBox] Module is ready, calling onready');
        this.onready();
    }.bind(this);

    // Call onready immediately to test
    console.log('[DOSBox] Calling onready immediately');
    this.onready();

    console.log('[DOSBox] Initialization complete');
}

// Export the Dosbox constructor
Module.Dosbox = Dosbox;
console.log('[DOSBox] Dosbox constructor exported');

// Initialize the runtime
Module.initRuntime(); 