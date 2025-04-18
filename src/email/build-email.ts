import { createMimeMessage } from 'mail-mime-builder';
import { EmailMessage } from 'cloudflare:email';

const replyMsg = `Hi,

Thank you for reaching out to us.

We just wanted to let you know that we've received your email and our team is currently reviewing it. We'll get back to you as soon as possible with a detailed response.

If you have any additional information or questions, feel free to reply to this email.

Regards,

`;

export function buildEmail(from: string, msgId: any, name = 'Thanapon Johdee', addr = 'contact@yoke-th.me', msg = replyMsg): EmailMessage {
	const reply = createMimeMessage();
	reply.setHeader('In-Reply-To', msgId);
	reply.setSender({ name, addr });
	reply.setRecipient(from);
	reply.setSubject('Thanks for contacting us!');
	reply.addMessage({
		contentType: 'text/plain',
		data: msg + name.split(' ')[0],
	});

	const replyMessage = new EmailMessage(addr, from, reply.asRaw());

	return replyMessage;
}
