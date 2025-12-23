// src/lib/nav-util.ts

// --- Types ---
export type RawNavItem = {
    title: string;
    icon?: any;
    href?: string;
    noLink?: boolean;
    subItems?: RawNavItem[];
};

export type NavItem = {
    title: string;
    icon?: any;
    href?: string;
    subItems?: NavItem[];
};

// --- Helpers ---
function toSlug(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, "-");
}

export function generateNavLinks(
    items: RawNavItem[],
    parentPath: string = ""
): NavItem[] {
    return items.map((item) => {
        let currentPath: string;

        if (item.href) {
            // If href is explicitly provided (like from DB), use it
            currentPath = item.href;
        } else {
            // Otherwise generate it
            const prefix = parentPath === "/" ? "" : parentPath;
            currentPath = `${prefix}/${toSlug(item.title)}`;
        }

        const processedSubItems = item.subItems
            ? generateNavLinks(item.subItems, currentPath)
            : undefined;

        return {
            title: item.title,
            icon: item.icon,
            href: item.noLink ? undefined : currentPath,
            subItems: processedSubItems,
        };
    });
}