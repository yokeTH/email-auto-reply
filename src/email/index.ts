import { simpleParser } from 'mailparser';
import { partition } from './partition';
interface EmailMessage {
	readonly from: string;
	readonly to: string;
	readonly headers: Headers;
	readonly raw: ReadableStream;
	readonly rawSize: number;

	constructor(from: string, to: string, raw: ReadableStream | string): void;

	setReject(reason: string): void;
	forward(rcptTo: string, headers?: Headers): Promise<void>;
	reply(message: EmailMessage): Promise<void>;
}

export async function email(message: EmailMessage, env: any, ctx?: any): Promise<void> {
	const url = env.DISCORD_WEBHOOK_URL;
	if (!url) throw new Error('Missing DISCORD_WEBHOOK_URL');

	try {
		const { from, to } = message;
		const subject = message.headers.get('subject') || '(no subject)';
		const raw = await new Response(message.raw).text();
		const email = await simpleParser(raw);

		// send notification to discord
		const header = `# Email from ${from} to ${to}\n## Subject: ${subject}`;
		const discordMessages = partition(email.text || '');
		for (const msg in [header, ...discordMessages]) {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: msg }),
			});
			if (!response.ok) {
				throw new Error(`failed to post message to discord webhook with status ${response.status}.`);
			}
		}
		
		// reply
		message.reply(message)
	} catch {}
}
