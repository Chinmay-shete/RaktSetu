const { Resend } = require('resend');
const { ApiError } = require('../middleware/errorHandler');

let resendInstance = null;

function getResendInstance() {
  if (process.env.NODE_ENV === 'test') {
    // Return a mock in test mode
    return {
      emails: {
        send: async (options) => {
          console.log('[Test mode] Mock Email Sent:', options);
          return { data: { id: 'mock-email-id' } };
        }
      }
    };
  }

  if (!resendInstance) {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      throw new ApiError('EMAIL_API_KEY environment variable is not defined', 500, 'CONFIG_ERROR');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

async function sendEmail({ to, subject, html }) {
  try {
    const resend = getResendInstance();
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
    
    const response = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html
    });

    if (response.error) {
      console.error('[Resend Error]', response.error);
      throw new ApiError(`Failed to send email: ${response.error.message}`, 500, 'EMAIL_SEND_FAILED');
    }

    return response.data || response;
  } catch (error) {
    console.error('Email dispatch error:', error);
    if (process.env.NODE_ENV === 'test') {
      return { id: 'mock-email-id' };
    }
    throw error;
  }
}

module.exports = {
  sendEmail
};
