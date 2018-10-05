const chokidar = require('chokidar');

/**
 * Watch a directory on add, change and remove events.
 * Add events are also emitted on initial scan.
 * 
 * @returns A promise which will be resolve after inital scan.
 */
export default function watch({path, add, change, remove}) {

    // Setup watcher:
    const watcher = chokidar.watch(path, {
        usePolling: true,
        ignoreInitial: false,
    });

    // Attach event listeners:
    watcher.on('add', path => {
        add(path);
    });

    watcher.on('change', path => {
        change(path);
    });

    watcher.on('unlink', path => {
        remove(path);
    });

    // Return promise bound to the ready event:
    return new Promise((resolve, reject) => {
        
        watcher.on('ready', watcher => {
            resolve(watcher);
        });

        watcher.on('error', error => {
            reject(error);
        })
    });
}
