import { supportedLicenses } from '~/pages/license/license-page';
import { useMemo, type ReactNode } from 'react';
import { config } from '~/data/config';

export function ExtensionLicense({ licenseString }: { licenseString: string }) {
	const licenses: ReactNode[] = useMemo(() => {
		return licenseString
			.trim()
			.split(' ')
			.filter((s) => s.length != 0)
			.map((s, i) => (
				<span key={s}>
					{i == 0 ? '' : ' '}
					{supportedLicenses.includes(s.toUpperCase()) ? (
						<a
							href={`${config.basename}licenses/${s.toUpperCase()}`}
							target="_blank"
							className="text-blue-400"
						>
							{s}
						</a>
					) : (
						s
					)}
				</span>
			));
	}, [licenseString]);

	return (
		<p className="pb-1 text-1xl">Licensed under the {licenses} license.</p>
	);
}
