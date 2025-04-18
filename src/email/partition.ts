const CHUNK_SIZE = 1900;

export function partition(message: string): string[] {
	const words = message.trim().split(/\s+/);
	const result: string[] = [];

	let chunk = '';

	for (const word of words) {
		if ((chunk + ' ' + word).trim().length > CHUNK_SIZE) {
			result.push(chunk.trim());
			chunk = word;
		} else {
			chunk += ' ' + word;
		}
	}

	if (chunk) {
		result.push(chunk.trim());
	}

	return result;
}
