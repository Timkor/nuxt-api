import Logger from './src/Logger';
import watch from './src/watch';
import Resource from './src/Resource';
import Router from './src/Router';
import Scheduler from './src/Scheduler';


const path = require('path');

import defaultOptions from './src/data/defaultOptions';

const log = new Logger();

module.exports = function (moduleOptions) {

    const options = {
        ...defaultOptions,
        ...moduleOptions
    };

    const srcPath =  this.options.srcDir;
    const apiSrcDir = path.join(srcPath, options.apiSrcDir);
    const apiDstDir = options.apiDstDir;

    const context = {
        cache: require(srcPath + '/server/utils/cache')
    }
    
    const router = new Router(context);
    const scheduler = new Scheduler();

    const resources = {};
    
    return watch({

        path: apiSrcDir,

        add(path) {

            const resource = new Resource(apiSrcDir, path);
                
            resources[path] = resource;

            try {
                
                resource.load(path);

                router.add(resource);

                scheduler.add(resource);

                Logger.forResource(resource).info('added');



            } catch (error) {

                Logger.forResource(resource).error('Could not add resource: ' + error.message);
            }
        },

        change(path) {

            

            const resource = resources[path];
            
            router.remove(resource);

            scheduler.remove(resource);

            try {
                
                resource.load(path);

                router.add(resource);

                scheduler.add(resource);

                Logger.forResource(resource).info('updated');
            
            } catch (error) {

                Logger.forResource(resource).error('Could not update resource: ' + error.message);
            }

            
        },

        remove(path) {

            const resource = resources[path];

            router.remove(resource);

            scheduler.add(resource);

            Logger.forResource(resource).info('removed');

        },

    }).then(watcher => {
        
        // Close watcher on Nuxt exit:
        this.nuxt.hook('close', () => {
            watcher.close();
        })

        this.addServerMiddleware(router.createMiddleware(apiDstDir));

        log.info('Middleware created');
    });
};