export function load({ url }) {
	return {
		plate: url.searchParams.get('plate')
	};
}