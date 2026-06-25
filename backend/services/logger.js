const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'password',
      'body.password',
      'password_hash',
      'otp',
      'body.otp',
      'token',
      'refreshToken',
      'refresh_token',
      'verificationToken',
      'verification_token',
      'authorization',
      'headers.authorization'
    ],
    censor: '[REDACTED]'
  }
});

function maskSensitiveInfo(args) {
  return args.map(arg => {
    if (typeof arg === 'string') {
      // Mask phone numbers (mask last 4 digits: e.g. +919876543210 -> +91987654****)
      arg = arg.replace(/(\+?\d{1,4})?(\d{6})(\d{4})/g, (match, p1, p2, p3) => {
        return `${p1 || ''}${p2}****`;
      });
      // Mask 6-digit OTP codes in message bodies
      arg = arg.replace(/\b\d{6}\b/g, '[REDACTED_OTP]');
      // Mask JWT tokens
      arg = arg.replace(/\beyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\b/g, '[REDACTED_JWT]');
    } else if (arg && typeof arg === 'object') {
      try {
        const str = JSON.stringify(arg);
        const sanitizedStr = str
          .replace(/(\+?\d{1,4})?(\d{6})(\d{4})/g, '$1$2****')
          .replace(/"(password|otp|token|refreshToken|refresh_token)":"[^"]+"/gi, '"$1":"[REDACTED]"');
        return JSON.parse(sanitizedStr);
      } catch (e) {
        return arg;
      }
    }
    return arg;
  });
}

function setupGlobalLogger() {
  console.log = (...args) => {
    const sanitizedArgs = maskSensitiveInfo(args);
    if (sanitizedArgs.length === 1 && typeof sanitizedArgs[0] === 'string') {
      logger.info(sanitizedArgs[0]);
    } else {
      logger.info({ details: sanitizedArgs }, 'Log output');
    }
  };

  console.error = (...args) => {
    const sanitizedArgs = maskSensitiveInfo(args);
    if (sanitizedArgs.length === 1 && typeof sanitizedArgs[0] === 'string') {
      logger.error(sanitizedArgs[0]);
    } else if (sanitizedArgs[0] instanceof Error) {
      logger.error(sanitizedArgs[0], sanitizedArgs[0].message);
    } else {
      logger.error({ details: sanitizedArgs }, 'Error output');
    }
  };

  console.warn = (...args) => {
    const sanitizedArgs = maskSensitiveInfo(args);
    if (sanitizedArgs.length === 1 && typeof sanitizedArgs[0] === 'string') {
      logger.warn(sanitizedArgs[0]);
    } else {
      logger.warn({ details: sanitizedArgs }, 'Warning output');
    }
  };
}

module.exports = {
  logger,
  setupGlobalLogger
};
