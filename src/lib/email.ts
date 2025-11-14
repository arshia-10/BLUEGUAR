import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

export type EmailPreview = {
  subject: string;
  body: string;
  recipients: string[];
};

export const initEmailJs = () => {
  if (PUBLIC_KEY) emailjs.init(PUBLIC_KEY);
};

export const sendEmails = async (preview: EmailPreview) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS is not configured');
  }
  const tasks = preview.recipients.map((to) =>
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: to,
      subject: preview.subject,
      title: preview.subject,
      message: preview.body,
    })
  );
  const results = await Promise.allSettled(tasks);
  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - succeeded;
  return { total: results.length, succeeded, failed };
};
