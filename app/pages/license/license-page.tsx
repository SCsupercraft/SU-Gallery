import { config } from '~/data/config';
import { type BlankResource, createBlankResource } from '~/lib/resource';
import { useMemo } from 'react';

export const supportedLicenses = [
	'MIT',
	'GPL-3.0',
	'LGPL-3.0',
	'MPL-2.0',
	'CC-0',
	'CC-BY-2.5',
	'CC-BY-4.0',
	'CC-BY-SA-4.0',
	'APACHE-2.0',
	'OFL-LOBSTER',
	'ZLIB',
	'BSD-3-CLAUSE',
];
const resources: { [key: string]: BlankResource<string> } = {};

function getLicense(license: string): string {
	if (resources[license]) return resources[license].get();

	const resource = createBlankResource(async () => {
		return await fetch(`${config.basename}licenses/${license}.txt`).then(
			(res) => {
				if (!res.ok)
					throw new Error(`Unexpected status code: ${res.status}`);
				return res.text();
			}
		);
	});
	resources[license] = resource;
	return resource.get();
}

export function LicensePage({ license }: { license: string }) {
	const parsed = useMemo(() => {
		if (!supportedLicenses.includes(license)) return '';

		let text = getLicense(license);
		if (!text) return '';

		return text.split('\n').map((line) => (
			<>
				{line.replace(/ /g, '\u2009')}
				<br />
			</>
		));
	}, [license]);

	if (!parsed)
		return (
			<p className="text-4xl font-bold">
				Failed to find {license} License
			</p>
		);

	return (
		<>
			<p className="text-4xl font-bold">{license} License</p>
			<p className="font-mono max-w-[90%]">{parsed}</p>
		</>
	);
}
