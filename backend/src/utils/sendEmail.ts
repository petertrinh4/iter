import sgMail from "@sendgrid/mail";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.warn(
      "⚠️ SendGrid API Key or From Email is missing! Check your .env file.",
    );
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error: any) {
    console.error("❌ SendGrid Email Error:");
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
  }
};
