import { MailService } from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY environment variable is not set. Email functionality will be limited.");
}

const mailService = new MailService();

// Initialize API key if available
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Only attempt to send if we have an API key
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email would be sent (simulation):', params);
      return true;
    }
    
    // Construct the email data with proper typing
    const emailData: {
      to: string;
      from: string;
      subject: string;
      text?: string;
      html?: string;
    } = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    // Add text/html conditionally to avoid undefined values
    if (params.text) {
      emailData.text = params.text;
    }
    
    if (params.html) {
      emailData.html = params.html;
    }
    
    // Send the actual email
    await mailService.send(emailData);
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function convertTextToHtml(text: string): string {
  // Basic conversion of plain text to HTML
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold** to <strong>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic* to <em>
    .replace(/__(.*?)__/g, '<u>$1</u>');               // __underline__ to <u>
}