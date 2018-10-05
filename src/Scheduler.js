import Logger from './Logger';

export default class Scheduler {

    constructor() {
        this.intervals = {};
    }

    add(resource) {

        if (resource.schedule) {
            
            const logger = Logger.forResource(resource);

            function call(){
    
                logger.info('scheduled task started');
    
                resource.dispatch()

                    .then((result) => {
                        
                        logger.success('scheduled task finished', result);

                    }).catch((error) => {
                        
                        logger.error('scheduled task failed', error);
                    });
            };
    
            if (resource.schedule.every) {
                
                this.intervals[resource.path] = setInterval(call, resource.schedule.every);

                logger.info('interval set every ' + (resource.schedule.every / 1000) + ' seconds');
            
                // Execute immediate:
                call();
            }
        }
    }

    remove(resource) {

        if (typeof this.intervals[resource.path] == 'number') {
            
            clearInterval(this.intervals[resource.path]);

            this.intervals[resource.path] = undefined;

            Logger.forResource(resource).info('Interval cleared');
        }
    }
}