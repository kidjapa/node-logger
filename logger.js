var util = require('util')
var winston = require('winston');
var moment = require('moment');

function setup(options){
    CustomLogger = winston.transports.CustomLogger = function(){
        this.name = 'CustomLogger';
        this.endpoint = options.endpoint;
        this.serviceName = options.serviceName || 'unknownservice';
    }

    util.inherits(CustomLogger, winston.Transport);

    CustomLogger.prototype.log = function(level, msg, meta, callback){
        if(!this.endpoint){
             return(callback(false, true));
        }
        var timestamp = moment.utc().format();
        var logMessage = `${timestamp} [${this.serviceName}] ${level}: ${msg} ${JSON.stringify(meta)}\n`;
        var httpOptions = {
            url: this.endpoint + this.serviceName,
            method: 'POST',
            rejectUnauthorized: false,
            body: logMessage
        }
        request(httpOptions, function(err){
            if(err){
                console.log("Unable to send log:")
                console.log(logMessage)
                return(callback(true, false));
            }
            return(callback(false, true));
        })
    }

    var transports = [
        new (winston.transports.CustomLogger)({
            endpoint: options.endpoint,
            serviceName: options.name,
            level: 'error'
        })
    ];

    if(options.console){
        transports.push(
            new (winston.transports.Console)({
                level: 'debug',
                colorize: true,
                timestamp: function(ts){
                     return moment().format("M/D/YY @ h:mm:ss a");
                }
            })
        )
    }

    var logger = new (winston.Logger)({
        transports: transports
    });

    logger.transports.console.level = 'debug';
    logger.transports.CustomLogger.level = 'debug';

    return logger;
}

module.exports = setup;
