# OTP Authentication Report

This report explains the concepts, limits, and configurations of the One-Time Password (OTP) system in the RaktSetu platform.

---

## 1. Core Concepts of the OTP System

An OTP is a temporary security code used to verify a user's contact information (phone number or email) during registration or login. The system operates in two distinct modes:

- **Third-Party Mode (Production)**: In this mode, the application relies on external services. Firebase is used on the client-side to verify phone numbers, MSG91 is used on the backend to send text messages to Indian phone numbers, and Resend is used to send verification emails.
- **Local Fallback Mode (Development)**: When third-party services are not configured (which is common during local development), the system automatically falls back to a backend-managed flow. Instead of sending actual text messages or emails, the backend generates the security code, saves it to the database, and prints it directly in the backend terminal logs so developers can see and use it.

### The Registration Flow (Local Mode)
1. You enter a phone number or email.
2. The frontend asks the backend to send an OTP.
3. The backend generates a random six-digit code, saves it, and displays it in your terminal.
4. You input the code on the registration page.
5. The backend validates the code and, if correct, gives the frontend a secure verification token.
6. The frontend sends this token along with your password to complete the registration.

### The Login Flow (Local Mode)
1. You enter your registered phone number.
2. The frontend asks the backend to send an OTP.
3. The backend generates the code and displays it in your terminal.
4. You input the code on the login page.
5. The backend verifies the code and logs you in immediately, issuing your access and refresh tokens.

---

## 2. What We Added and Fixed

We made several improvements to ensure the OTP system works perfectly for you and your friend in any environment:

- **Automatic Development Fallback**: If the application detects that Firebase config keys are missing, it switches to the local backend-managed flow. This ensures that you can sign up and log in as donors on your Mac or phone without setting up Firebase, Twilio, or MSG91 accounts.
- **Backend Error Resilience**: Previously, if third-party credentials were missing, the backend would crash and return a bad gateway error. We modified the backend to log a warning in development mode and continue successfully.
- **Firebase Token Integration**: We corrected a path mismatch in the Firebase flow. Previously, the frontend tried to send requests to an incorrect URL. We updated it to retrieve the proper security token from Firebase and post it to the correct backend endpoint.
- **Mobile vs Email Payload Correction**: We updated the registration flow to submit the correct contact key (phone or email) based on what the user typed.

---

## 3. OTP Rate Limits and Expirations

To protect the platform against abuse and unauthorized login attempts, the system enforces several security limits:

- **OTP Expiration Time**: By default, each generated OTP code is valid for five minutes. If it is not verified within this window, the code expires and becomes useless, requiring you to request a new one.
- **Send Limits (per IP address)**: An IP address is limited to requesting a maximum of three OTP codes within a ten-minute window. This prevents spamming.
- **Verification Limits (per IP address)**: An IP address is limited to a maximum of five verification attempts within a fifteen-minute window. This stops attackers from trying to guess codes.
- **Attempt Lockout (per OTP code)**: If a user enters an incorrect OTP code five times, that specific code is immediately marked as verified/invalidated in the database. Even if the code has not expired, it can never be used again.

Note: IP-based rate limits are automatically skipped in development mode to make local testing easier, but the attempt lockout per code is always active.

---

## 4. Configuration Settings

The behavior of the OTP system is controlled by environment variables in your server configuration:

- **Expiration Limit**: Set the time-to-live for codes in minutes.
- **Database Storage**: The system records every attempt, tracking the timestamp, number of attempts, and verification status to ensure audit compliance.
- **Service Keys**: Variables for Resend and MSG91 determine whether actual emails or texts are delivered. When omitted, the console-logging fallback takes over.
