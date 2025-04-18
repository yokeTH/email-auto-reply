const CHUNK_SIZE = 1900;

export function partition(message: string): string[] {
	const words = message.trim().split(/\s+/);
	const result: string[] = [];

	let chunk = '';

	for (const word of words) {
		const nextChunk = chunk ? `${chunk} ${word}` : word;

		if (nextChunk.length > CHUNK_SIZE) {
			result.push(chunk);
			chunk = word;
		} else {
			chunk = nextChunk;
		}
	}

	if (chunk) {
		result.push(chunk);
	}

	return result;
}
