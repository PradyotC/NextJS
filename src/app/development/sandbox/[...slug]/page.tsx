import { notFound } from "next/navigation";
import { SNIPPETS } from "@/lib/sandbox-data";
import CodePlayground from "@/components/Sandbox/CodePlayground";
import { toSlug } from "@/lib/nav-util";

type Props = {
  params: Promise<{ slug: string[] }>; // <--- Change: slug is now an Array
};

export async function generateStaticParams() {
  return SNIPPETS.map((snippet) => {
    // We map the snippet to its expected folder so Next.js knows valid paths
    let folder = "others";
    if (snippet.language === "go") folder = "go";
    if (snippet.language === "python") folder = "python";

    return {
      slug: [folder, toSlug(snippet.navTitle)], // Generates /go/go-worker-pool
    };
  });
}

export default async function SandboxPage({ params }: Props) {
  const { slug } = await params;
  
  // The slug is now an array: ['go', 'go-worker-pool']
  // We want the last part ('go-worker-pool') to find the snippet
  const activeSlug = slug[slug.length - 1]; 

  const snippet = SNIPPETS.find((s) => toSlug(s.navTitle) === activeSlug);

  if (!snippet) {
    notFound();
  }

  return <CodePlayground snippet={snippet} />;
}