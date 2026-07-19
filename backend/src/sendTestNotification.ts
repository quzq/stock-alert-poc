import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const registrationToken = requireEnv('FCM_REGISTRATION_TOKEN');
const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

initializeApp({
  credential: applicationDefault(),
  ...(projectId ? { projectId } : {}),
});

const sentAt = new Date().toISOString();

const messageId = await getMessaging().send({
  token: registrationToken,
  notification: {
    title: 'Stock Alert PoC',
    body: 'TypeScript Backend -> FCM -> Android',
  },
  data: {
    source: 'typescript-backend',
    sentAt,
  },
});

console.log('FCM message sent successfully.');
console.log(`Message ID: ${messageId}`);
console.log(`Sent at: ${sentAt}`);
