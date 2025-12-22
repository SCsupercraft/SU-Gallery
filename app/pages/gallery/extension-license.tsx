import { supportedLicenses } from '~/pages/license/license-page';
import { useMemo, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { config } from '~/data/config';

export function ExtensionLicense({ licenseString }: { licenseString: string }) {
	const licenses: ReactNode[] = useMemo(() => {
		return licenseString
			.trim()
			.split(' ')
			.filter((s) => s.length != 0)
			.map((s, i) => (
				<>
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
				</>
			));
	}, [licenseString]);

	return (
		<p className="pb-1 text-1xl">Licensed under the {licenses} license.</p>
	);
}
