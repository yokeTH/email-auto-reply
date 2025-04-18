import puppeteer from '@cloudflare/puppeteer';

export async function screenshot(content: string, env: any, isHtml: boolean = false): Promise<Blob> {
	const browser = await puppeteer.launch(env.MYBROWSER);
	const page = await browser.newPage();

	if (isHtml) {
		await page.setContent(content, { waitUntil: 'networkidle0' });
	} else {
		const htmlContent = `${content}`;
		const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
		await page.goto(dataUrl, { waitUntil: 'networkidle0' });
	}

	const buffer = (await page.screenshot({ type: 'png' })) as Buffer;

	await browser.close();

	const blob = new Blob([buffer], { type: 'image/png' });
	return blob;
}
