'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const HeaderComponent:React.FC<{item:{name:string, path:string, allowed:boolean}}> = ({item}) => {
    const pathname = usePathname();

    const getLinkClasses = (path: string) => {
        const isActive = (pathname === "/" && path === "/") || (path !== "/" && pathname.startsWith(path));
        const baseClasses = "font-extrabold transition-colors duration-200 px-3 py-2 rounded-lg relative";
        const activeClasses = "text-base-content underline decoration-base-500 decoration-2 underline-offset-4 font-bold";
        const inactiveClasses = "text-base-content/60 font-normal";

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <Link
            href={item.path}
            className={getLinkClasses(item.path)}
        >
            {item.name}
        </Link>
    );
};

export default HeaderComponent;