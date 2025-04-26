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
    currentCommand: '',
    commandHistory: [],
    cursorPosition: 0,
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
        mounted: false,
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
            if (!this.mounted) {
                this.mounted = true;
                return this.root;
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
    // Handle keyboard input
    handleKeyPress: function(event) {
        if (!this.canvas) return;
        
        const ctx = this.canvas.getContext('2d');
        const key = event.key;
        
        // Handle special keys
        if (key === 'Enter') {
            this.executeCommand(this.currentCommand);
            this.currentCommand = '';
            this.cursorPosition = 0;
            this.drawPrompt();
        } else if (key === 'Backspace') {
            if (this.currentCommand.length > 0) {
                this.currentCommand = this.currentCommand.slice(0, -1);
                this.cursorPosition--;
                this.drawPrompt();
            }
        } else if (key.length === 1) {
            this.currentCommand += key;
            this.cursorPosition++;
            this.drawPrompt();
        }
    },
    // Draw the command prompt
    drawPrompt: function() {
        if (!this.canvas) return;
        
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px monospace';
        ctx.fillText('C:\\> ' + this.currentCommand, 10, 30);
    },
    // Execute a command
    executeCommand: function(command) {
        if (!this.canvas) return;
        
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px monospace';
        ctx.fillText('C:\\> ' + command, 10, 30);
        
        // Handle basic DOS commands
        if (command.toLowerCase() === 'dir') {
            ctx.fillText('Directory of C:\\', 10, 50);
            ctx.fillText('No files found', 10, 70);
        } else if (command.toLowerCase() === 'cls') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (command.toLowerCase() === 'help') {
            ctx.fillText('Available commands:', 10, 50);
            ctx.fillText('dir - List directory contents', 10, 70);
            ctx.fillText('cls - Clear screen', 10, 90);
            ctx.fillText('help - Show this help message', 10, 110);
        } else {
            ctx.fillText('Bad command or file name', 10, 50);
        }
        
        this.commandHistory.push(command);
        this.drawPrompt();
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
    
    // Add keyboard event listener
    this.canvas.addEventListener('keydown', function(event) {
        Module.handleKeyPress(event);
    });
    
    // Initialize the filesystem
    this.fs = {
        mount: function(type, options) {
            try {
                console.log('[Dosbox.fs] Mounting filesystem:', type, options);
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

    // Run a command
    this.run = function(command) {
        try {
            console.log('[Dosbox] Running command:', command);
            Module.executeCommand(command);
            this.onready();
        } catch (error) {
            console.error('[Dosbox] Error running command:', error);
            this.onerror(error);
        }
    };

    // Destroy the emulator
    this.destroy = function() {
        console.log('[Dosbox] Destroying emulator');
        try {
            Module.cleanup();
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