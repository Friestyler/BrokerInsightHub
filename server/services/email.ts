import sgMail from '@sendgrid/mail';

// Check and set the API key if available
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY environment variable is not set. Email functionality will be limited to simulation mode.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends an email using SendGrid
 * If SENDGRID_API_KEY is not set, simulates sending the email and logs details
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Make sure we have at least text or HTML content
    if (!params.text && !params.html) {
      console.error('Email must have either text or HTML content');
      return false;
    }
    
    // Only attempt to send if we have an API key
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email would be sent (simulation mode - no API key):', {
        to: params.to,
        from: params.from,
        subject: params.subject,
        contentLength: params.text?.length || params.html?.length || 0
      });
      return true;
    }
    
    // Prepare the message, ensuring we meet SendGrid's requirements
    // SendGrid requires at least one content object
    const content: Array<{type: string, value: string}> = [];
    
    if (params.text) {
      content.push({
        type: 'text/plain',
        value: params.text
      });
    }
    
    if (params.html) {
      content.push({
        type: 'text/html',
        value: params.html
      });
    }
    
    // Create the message with SendGrid's required format
    const msg: sgMail.MailDataRequired = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      content: content
    };
    
    // Send the email
    await sgMail.send(msg);
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Converts plain text to HTML with basic formatting
 */
export function convertTextToHtml(text: string): string {
  // Basic conversion of plain text to HTML
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold** to <strong>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic* to <em>
    .replace(/__(.*?)__/g, '<u>$1</u>');               // __underline__ to <u>
}