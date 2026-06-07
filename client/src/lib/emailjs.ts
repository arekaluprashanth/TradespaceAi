// ── EmailJS Configuration ──────────────────────────────
// Sign up at https://www.emailjs.com (free: 200 emails/month)
//
// 1. Go to Email Services → Add New Service → Gmail → Connect
//    Copy the Service ID below
//
// 2. Go to Email Templates → Create New Template
//    Set Subject: "TradeSphere AI - Verification Code"
//    Set Content:
//      Hello,
//      Your TradeSphere AI verification code is: {{verification_code}}
//      This code expires in 10 minutes.
//    Copy the Template ID below
//
// 3. Go to Account → General → Public Key
//    Copy the Public Key below

export const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_dym1y1j',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_nltl7sa',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'LldPJSF81o01WcVi7',
};

export function isEmailJSConfigured(): boolean {
  return (
    EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
    EMAILJS_CONFIG.templateId !== 'YOUR_TEMPLATE_ID' &&
    EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'
  );
}
