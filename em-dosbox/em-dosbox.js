// Em-DOSBox JavaScript interface
var Module = {
    preRun: [],
    postRun: [],
    print: function(text) {
        console.log('[Module] ' + text);
    },
    printErr: function(text) {
        console.error('[Module] ' + text);
    },
    canvas: null,
    setStatus: function(text) {
        console.log('[Module] Status: ' + text);
        if (this.statusElement) {
            this.statusElement.innerHTML = text;
        }
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        console.log('[Module] Dependencies: ' + left + ' remaining');
        this.totalDependencies = Math.max(this.totalDependencies, left);
        this.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    },
    // Initialize Emscripten filesystem
    FS: {
        root: null,
        mount: function(type, options) {
            console.log('[Module.FS] Mounting filesystem:', type, options);
            if (!this.root) {
                console.log('[Module.FS] Creating root filesystem');
                this.root = {
                    name: '/',
                    contents: {},
                    isDirectory: true
                };
            }
            return this.root;
        },
        mkdir: function(path) {
            console.log('[Module.FS] Creating directory:', path);
        },
        writeFile: function(path, data) {
            console.log('[Module.FS] Writing file:', path, data);
        },
        readFile: function(path) {
            console.log('[Module.FS] Reading file:', path);
            return new Uint8Array(0);
        }
    },
    // Add cleanup function
    cleanup: function() {
        console.log('[Module] Cleaning up emulator...');
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
        console.log('[Module] Runtime initialized');
        this.ready = true;
        if (this.onReadyCallback) {
            console.log('[Module] Calling ready callback');
            this.onReadyCallback();
        }
    },
    // Initialize the runtime
    initRuntime: function() {
        console.log('[Module] Initializing runtime...');
        try {
            // Simulate runtime initialization
            this.ready = true;
            this.onRuntimeInitialized();
            console.log('[Module] Runtime initialization complete');
        } catch (error) {
            console.error('[Module] Runtime initialization error:', error);
        }
    }
};

Module.setStatus('Downloading...');

// Initialize the emulator
function Dosbox(options) {
    console.log('[Dosbox] Initializing with options:', options);
    
    this.canvas = options.canvas;
    this.autolock = options.autolock || false;
    this.onready = options.onready || function() {};
    this.onerror = options.onerror || function(error) { console.error(error); };
    
    // Set the canvas in Module
    Module.canvas = this.canvas;
    console.log('[Dosbox] Canvas set in Module');
    
    // Initialize the filesystem
    this.fs = {
        mount: function(type, options) {
            try {
                console.log('[Dosbox.fs] Mounting filesystem:', type, options);
                // Mount the filesystem using Module.FS
                Module.FS.mount(type, options);
                console.log('[Dosbox.fs] Filesystem mounted successfully');
            } catch (error) {
                console.error('[Dosbox.fs] Error mounting filesystem:', error);
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
            console.log('[Dosbox] Running program:', program);
            // Use Module.FS to handle file operations
            Module.FS.writeFile(program, new Uint8Array(0));
            Module.callMain([program]);
            this.onready();
        } catch (error) {
            console.error('[Dosbox] Error running program:', error);
            this.onerror(error);
        }
    };

    // Destroy the emulator
    this.destroy = function() {
        console.log('[Dosbox] Destroying emulator');
        try {
            // Clean up the Module
            Module.cleanup();
            // Reset the canvas
            if (this.canvas) {
                this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } catch (error) {
            console.error('[Dosbox] Error during cleanup:', error);
        }
    };

    // Set up ready callback
    Module.onReadyCallback = function() {
        console.log('[Dosbox] Module is ready, calling onready');
        this.onready();
    }.bind(this);

    console.log('[Dosbox] Initialization complete');
}

// Export the Dosbox constructor
Module.Dosbox = Dosbox;
console.log('[Module] Dosbox constructor exported');

// Initialize the runtime
Module.initRuntime(); 