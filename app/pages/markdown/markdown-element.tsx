import MarkdownIt from 'markdown-it';
import MarkdownAnchor from 'markdown-it-anchor';

// @ts-expect-error
import MarkdownTOC from 'markdown-it-table-of-contents';
import { useEffect, useRef } from 'react';

const MarkdownRenderer = MarkdownIt({
	html: true,
	xhtmlOut: true,
	linkify: true,
	breaks: false,
});

MarkdownRenderer.use(MarkdownAnchor);
MarkdownRenderer.use(MarkdownTOC);

export function Markdown({ markdown }: { markdown: string }) {
	const page = useRef<HTMLDivElement>(null);

	useEffect(() => {
		page.current!.innerHTML = MarkdownRenderer.render(markdown);
	}, []);

	return (
		<div
			ref={page}
			className="markdown"
		></div>
	);
}
