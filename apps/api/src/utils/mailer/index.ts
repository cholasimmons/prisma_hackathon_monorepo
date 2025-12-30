import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

const isProduction = process.env.NODE_ENV === 'production';

const mailer = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false, // isProduction, // true ONLY for 465
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	},
	tls: {
    servername: process.env.SMTP_HOST
  }
});

/** MUST have either text or html message body, to send email
 *
 * @param recipients
 * @param subject
 * @param text
 * @param html
 */
async function sendMail(recipients: string, subject: string, html: string) {
// 2. Define email options
let mailOptions = {
    from: process.env.SMTP_FROM,
    to: recipients, // List of recipients
    subject: subject,
    text: htmlToPlainText(html), // plain text body
    html: html, // html body
};

  // 3. Send the email
  try {
    let info = await mailer.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

function htmlToPlainText(html: string) {
	return htmlToText(html, {
		wordwrap: false,
		selectors: [
			{ selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
		]
	});
}


export { mailer, sendMail, htmlToPlainText };