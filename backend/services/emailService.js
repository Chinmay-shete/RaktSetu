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
  const resend = getResendInstance();
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
  const fallbackAddress = 'onboarding@resend.dev';

  // Helper: attempt a single send with a given from address
  async function attemptSend(from) {
    const response = await resend.emails.send({ from, to, subject, html });
    if (response.error) {
      throw Object.assign(new Error(response.error.message || 'Resend API error'), { resendError: response.error });
    }
    return response.data || response;
  }

  try {
    return await attemptSend(fromAddress);
  } catch (primaryErr) {
    // If the primary from-address failed due to an unverified domain, retry with
    // Resend's built-in sandbox address so OTP emails still work before domain verification.
    const isUnverifiedDomainError =
      primaryErr.message?.toLowerCase().includes('domain') ||
      primaryErr.message?.toLowerCase().includes('not verified') ||
      primaryErr.message?.toLowerCase().includes('unauthorized') ||
      primaryErr?.resendError?.name === 'validation_error';

    if (fromAddress !== fallbackAddress && isUnverifiedDomainError) {
      console.warn(`[Email] Primary from-address "${fromAddress}" rejected (domain not verified?). Retrying with fallback "${fallbackAddress}".`);
      try {
        return await attemptSend(fallbackAddress);
      } catch (fallbackErr) {
        console.error('[Email] Fallback send also failed:', fallbackErr.message);
        throw new ApiError(`Failed to send email: ${fallbackErr.message}`, 502, 'EMAIL_SEND_FAILED');
      }
    }

    console.error('[Email] Send failed:', primaryErr.message);
    if (process.env.NODE_ENV === 'test') {
      return { id: 'mock-email-id' };
    }
    throw new ApiError(`Failed to send email: ${primaryErr.message}`, 502, 'EMAIL_SEND_FAILED');
  }
}


module.exports = {
  sendEmail
};
