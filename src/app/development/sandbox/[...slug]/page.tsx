import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import CodePlayground from "@/components/Sandbox/CodePlayground";
import { Snippet } from "@/lib/server/github-fetcher";
type Props = { params: Promise<{ slug: string[] }> };

export default async function SandboxPage({ params }: Props) {
	const { slug } = await params;

	const dbSlug = slug[slug.length - 1];

	// Fetch Full Data (Code + Description) ONLY here
	const snippet = await prisma.codeSnippet.findUnique({
		where: { slug: dbSlug }
	});

	if (!snippet) {
		notFound();
	}

	const ret:Snippet = snippet;

	return <CodePlayground snippet={ret} />;
}