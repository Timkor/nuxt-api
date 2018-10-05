import express from 'express';
import Logger from './Logger';

export default class Router {

    constructor(context) {
        
        this.context = context;
        this.paths = {};
        this.handlers = {};

        // Create Express router:
        this.router = express.Router();
        this.router.use(express.json());
        //this.router.use(express.urlencoded({extended: false}));
    }

    add(resource) {

        if (!this.hasHandler(resource.path, resource.method)) {

            const path = resource.path;
            const method = resource.method;

            // Attach express middleware:
            this.router[method.toLowerCase()](path, (req, res, next) => {
                this.getHandler(path, method)(req, res, next);
            });
        }

        this.assignHandler(resource.path, resource.method, this.createHandler(resource));
    }
    
    remove(resource) {
        this.removeHandler(resource.path, resource.method);
    }

    createMiddleware(apiDstDir) {

        const middleware = express();
        middleware.use(apiDstDir, this.router);

        /*
            Error handling:
        */
        middleware.use(apiDstDir, (req, res, next) => {
            
            res.status(404).send();

            new Logger(req.method.toUpperCase() + ' ' + req.path).error('not found');
        });

        return middleware;
    }

    // Private methods:
    createHandler(resource) {


        const logger = Logger.forResource(resource);   

        const dispatch = (params, context) => {

            logger.info(`requested`);

            return resource.dispatch(params, context)
                
                .then(result => {
                        
                    if (result !== null) {
                        logger.success(`finished`, result);
                    } else {
                        logger.warning(`did not return`);
                    }
                    
                    return result;
                })

                .catch(error => {
                    logger.error(`threw error`, error);
                    throw error;
                })
        };

        return (request, response) => {

            const params = {

                // Inject path parameters:
                ...request.params,

                // Inject POST parameters:
                ...request.body,

                // Inject GET parameters:
                ...request.query,
            };

            const context = {

                ...this.context,

                // Inject request:
                request,

                // Inject response:
                response,

                // Inject session:
                session: request.session,
            };

            try {

                dispatch(params, context)
                
                    .then(result => {
                        
                        if (result !== null) {
                            response.json(result);
                        } else {
                            response.status(404).send('404: Not found')
                        }
                    })
            
                    .catch(error => {
                        response.status(500).send('500: Internal error');
                    })
                ;
    
            } catch (error) {
                
                logger.error(`Unknown error`, error);

                response.status(500).send('500: Internal error');
            }
        };
    }

    getHandler(path, method) {
        return (this.handlers[path] = this.handlers[path] || {})[method];
    }

    hasHandler(path, method) {
        return !!this.getHandler(path, method);
    }

    assignHandler(path, method, handler) {
        (this.handlers[path] = this.handlers[path] || {})[method] = handler;        
    }

    removeHandler(path, method) {

        if (this.hasHandler(path, method)) {
            
            // Assign empty middleware handler because we are not able te remove Express routes:
            this.assignHandler(path, method, (req, res, next) => {
                next();
            });
        }
    }
}