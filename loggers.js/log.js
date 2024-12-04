// logger.js
import pino from 'pino'
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
}, pino.destination('./logs/app.log')); 

export default logger;