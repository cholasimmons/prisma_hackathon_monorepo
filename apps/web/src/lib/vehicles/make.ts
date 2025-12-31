function normalizeMake(input: string): string {
	const cleaned = input
		.trim()
		.replace(/\s+/g, ' ')
		.toLowerCase();

	return cleaned
		.split(' ')
		.map(word =>
			word
				.split('-')
				.map(part =>
					part
						.split("'")
						.map(p => p.charAt(0).toUpperCase() + p.slice(1))
						.join("'")
				)
				.join('-')
		)
		.join(' ');
}


const MAKE_ALIASES: Record<string, string> = {
	VW: 'Volkswagen',
	BMW: 'BMW',
	Beamer: 'BMW',
	Mercedes: 'Mercedes-Benz',
	Benz: 'Mercedes-Benz',
	Aston: 'Aston Martin',
};

function canonicalizeMake(make: string) {
	return MAKE_ALIASES[make] ?? make;
}


export { normalizeMake, canonicalizeMake }