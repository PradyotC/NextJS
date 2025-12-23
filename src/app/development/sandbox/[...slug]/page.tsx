import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import CodePlayground from "@/components/Sandbox/CodePlayground";
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

	return <CodePlayground snippet={snippet} />;
}