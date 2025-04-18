import { simpleParser } from 'mailparser';
import { partition } from './partition';
import { buildEmail } from './build-email';
import { screenshot } from './screenshot';

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function email(message: any, env: any, ctx?: any): Promise<void> {
	const url = env.DISCORD_WEBHOOK_URL;
	const forward = env.EMAIL_FORWARD_TO;
	if (!url || !forward) throw new Error('Missing ENV');

	try {
		const { from, to } = message;
		const subject = message.headers.get('subject') || '(no subject)';
		const rawText = await new Response(message.raw).text();
		const email = await simpleParser(rawText);

		// send notification to discord
		const header = `# Email from ${from} to ${to}\n## Subject: ${subject}`;
		const discordMessages = [header, ...partition(email.text || '')];
		for (const i in discordMessages) {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: discordMessages[i] }),
			});

			if (!response.ok) {
				throw new Error(`failed to post message to discord webhook with status ${response.status}.`);
			}

			await delay(500);
		}

		const isHtml = !!email.html;
		if (isHtml) {
			await delay(500);
			const formData = new FormData();
			const img = await screenshot(email.html || '', env, isHtml);
			formData.append('file', img, 'email.png');
			const response = await fetch(url, {
				method: 'POST',
				body: formData,
			});
			if (!response.ok) {
				throw new Error(`failed to post message to discord webhook with status ${response.status}.`);
			}
		}

		// reply
		const replyMessage = buildEmail(from, message.headers.get('Message-ID'));
		await message.reply(replyMessage);

		// forward
		await message.forward(forward);
	} catch (error: unknown) {
		if (error instanceof Error) {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: error.stack }),
			});

			if (!response.ok) throw new Error('Failed to post error to Discord webhook.' + (await response.json()));
		}
	}
}
