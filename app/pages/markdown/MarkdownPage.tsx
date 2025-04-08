import Markdown from 'markdown-it';
import MarkdownAnchor from 'markdown-it-anchor';

// @ts-expect-error
import MarkdownTOC from 'markdown-it-table-of-contents';
import { useEffect, useRef } from 'react';

const MarkdownRenderer = Markdown({
	html: true,
	xhtmlOut: true,
	linkify: true,
	breaks: false,
});

MarkdownRenderer.use(MarkdownAnchor);
MarkdownRenderer.use(MarkdownTOC);

export function MarkdownPage({ md }: { md: string }) {
	const page = useRef<HTMLDivElement>(null);

	useEffect(() => {
		page.current!.innerHTML = MarkdownRenderer.render(md);
	}, []);

	return (
		<div
			ref={page}
			className="markdown"
		></div>
	);
}
