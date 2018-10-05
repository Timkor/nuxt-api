import chalk from 'chalk';

const chalkInfo = chalk.cyan;

export default class Logger {

    static forResource(resource) {
        return new Logger(resource.method + ' ' + resource.path);
    }

    constructor(prefix) {
        this.prefix = prefix ? ' ' + prefix : '';
    }
    
    info(message, value) {
        
        if (value) {
            console.log(chalkInfo('[API]' + this.prefix) + ' ' + message, value);
        } else {
            console.log(chalkInfo('[API]' + this.prefix) + ' ' + message);
        }
    }

    success(message, value = null) {
        console.log(chalk.bgBlack.green.bold('[API]' + this.prefix) + ' ' + message);
    }

    warning(message, value = null) {
        console.log(chalk.bgBlack.yellow.bold('[API]' + this.prefix) + ' ' + message);
    }

    error(message, error = null) {
        console.log(chalk.bgBlack.red.bold('[API]' + this.prefix) + ' ' + message);

        if (error) {
            console.error(error);
        }
    }
}