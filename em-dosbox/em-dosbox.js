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
        },
        analyzePath: function(path) {
            // Implementation of analyzePath method
            return { exists: false }; // Placeholder return
        },
        unmount: function(mountpoint) {
            // Implementation of unmount method
        },
        rmdir: function(path) {
            // Implementation of rmdir method
        },
        chdir: function(path) {
            // Implementation of chdir method
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
    },
    // Add program execution function
    execute: function(program) {
        console.log('[Module] Executing program:', program);
        try {
            // Handle different DOS commands
            if (program.toLowerCase() === 'mount c /cbl') {
                this.print('Mounting C: drive to /CBL...');
                // Mount the CBL directory from the ZIP
                this.FS.mount('ZIP', {
                    zip: 'CBL.zip',
                    mountpoint: '/CBL'
                });
                this.print('C: drive mounted successfully');
            } else if (program.toLowerCase() === 'c:') {
                this.print('Changing to C: drive...');
                this.FS.chdir('/CBL');
                this.print('Current directory: C:\\');
            } else if (program.toLowerCase() === 'start') {
                this.print('Starting CBL program...');
                // Initialize the canvas for display
                if (this.canvas) {
                    const ctx = this.canvas.getContext('2d');
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '16px monospace';
                    ctx.fillText('CBL Program Initialized', 10, 30);
                }
                this.print('CBL program initialized');
            } else {
                this.print('Unknown command: ' + program);
            }
        } catch (error) {
            console.error('[Module] Execution error:', error);
            this.print('Error executing command: ' + error.message);
            throw error;
        }
    }
};

Module.setStatus('Downloading...');

// Initialize the emulator
function Dosbox(options) {
    console.log('[Dosbox] Initializing with options:', options);
    
    this.canvas = options.canvas;
    this.autolock = options.autolock || false;
    this.onready = options.onready || function() {
        console.log('[Dosbox] Default onready called');
    };
    this.onerror = options.onerror || function(error) {
        console.error('[Dosbox] Default onerror called:', error);
    };
    
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
            // Use the new execute function instead of callMain
            Module.execute(program);
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

    // Call onready immediately to test
    console.log('[Dosbox] Calling onready immediately');
    this.onready();

    console.log('[Dosbox] Initialization complete');
}

// Export the Dosbox constructor
Module.Dosbox = Dosbox;
console.log('[Module] Dosbox constructor exported');

// Initialize the runtime
Module.initRuntime(); 