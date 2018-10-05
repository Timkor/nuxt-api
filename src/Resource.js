import normalize from "../utils/path/normalize";
import basepath from '../utils/path/basepath';


const loadModule = require('esm')(module);


function validatePath(path) {
    
    const pattern = /((:?[a-zA-Z0-9])(\/(:?[a-zA-Z0-9]))*)?/;

    if (!pattern.test(path)) {
        throw new Error(`Path '${path}' should be following pattern ${pattern}`);
    }
}

function validateMethod(method) {

    const supportedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

    if (!supportedMethods.includes(method.toUpperCase())) {
        throw new Error(`Method ${method} should be one of ${supportedMethods.join(', ')}`);
    }
}

function validateParams(params) {

}

function validateSchedule(schedule) {

}

function validateCall(call) {
    
    if (typeof call != 'function') {
        console.log(typeof call);
        throw new Error('Module should have a function call()');
    }
}

export default class Resource {


    constructor(apiSrcDir, file) {
        this.apiSrcDir = apiSrcDir;
        this.file = file;
        // Props:
        this.path = normalize(this.apiSrcDir, this.file);
        this.method;
        this.params;
        this.schedule;
        this.call;
    }

    /**
     * Load new data into this resource
     * 
     * @param {string} file File to load
     */
    load(file) {

        delete require.cache[require.resolve(file)];
        var object = loadModule(file);
        object = object.default || object;


        // Path
        this.path = normalize(this.apiSrcDir, this.file);

        if (object.path) {
            
            validatePath(object.path);

            this.path = basepath(this.path) + object.path;
        }

        // Method
        this.method = 'GET';

        if (object.method) {
            
            validateMethod(object.method);

            this.method = object.method.toUpperCase();
        }

        // Params

        if (object.params) {

            validateParams(object.params);

            this.params = object.params;
        }

        // Schedule
        if (object.schedule) {

            validateSchedule(object.schedule);

            this.schedule = object.schedule;
        }

        // Callback
        if (object.call || true) {

            validateCall(object.call);

            this.call = object.call;
        }
    }

    /**
     * Dispatch this resource
     * 
     */
    dispatch(data, context) {
        return Promise.resolve(this.call(data, context));
    }
};