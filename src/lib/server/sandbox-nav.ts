// src/lib/server/sandbox-nav.ts
import { prisma } from "./prisma";
import { faGolang, faPython } from "@fortawesome/free-brands-svg-icons";
import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import { RawNavItem } from "./nav-util";

export async function getSandboxNavItems() {
    // 1. Fetch only necessary fields
    const rawItems = await prisma.codeSnippet.findMany({
        select: {
            slug: true,
            navTitle: true,
            language: true,
        },
        orderBy: { navTitle: 'asc' }
    });

    // 2. Buckets
    const goItems: RawNavItem[] = [];
    const pyItems: RawNavItem[] = [];
    const otherItems: RawNavItem[] = [];

    // 3. Sort into buckets
    for (const item of rawItems) {
        const navItem: RawNavItem = {
            title: item.navTitle,
            // Use the database slug directly
            href: `/development/sandbox/${item.slug}`,
            icon: item.language === "go" ? faGolang : item.language === "python" ? faPython : faTerminal
        };

        if (item.language === "go") goItems.push(navItem);
        else if (item.language === "python") pyItems.push(navItem);
        else otherItems.push(navItem);
    }

    // 4. Build Folders
    const folders: RawNavItem[] = [];
    if (goItems.length) folders.push({ title: "Go", icon: faGolang, noLink: true, subItems: goItems });
    if (pyItems.length) folders.push({ title: "Python", icon: faPython, noLink: true, subItems: pyItems });
    if (otherItems.length) folders.push({ title: "Other", icon: faTerminal, noLink: true, subItems: otherItems });

    return folders;
}