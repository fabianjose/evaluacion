const {createLogger,format,transports} = require('winston')

module.exports = createLogger({
    format: format.combine(format.simple()),
    transports:[
        new transports.File({
          maxsize:5200000 ,
          maxFiles:5 ,
          filename :  `${__dirname}/../log/log-api.log`
        }),
        new transports.Console({
            level:'debug',
          
        })
    ]
})