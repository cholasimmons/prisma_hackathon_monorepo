import { getMakeLogo } from './vehicle-makes';

const COMMON_MAKES = [
	'toyota',
	'mazda',
	'nissan',
	'ford',
	'bmw',
	'mercedes-benz',
	'honda',
	'audi'
];

export async function preloadMakeLogos(): Promise<void> {
	await Promise.all(
		COMMON_MAKES.map((make) => getMakeLogo(make))
	);
}
