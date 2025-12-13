'use client'; 

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import ThemeToggle from "@/components/ThemeToggle"; 

const HeaderComponent: React.FC = () => {
    const pathname = usePathname(); 

    const navItems = [
        { name: "Home", path: "/" },
        { name: "TMDB", path: "/tmdb" },
        { name: "Test", path: "/test" },
        { name: "Jamendo", path: "/jamendo"},
        { name: "Freesound", path: "/freesound"},
        { name: "News", path: "/news"},
        { name: "Stocks", path: "/stocks"},
    ];

    const getLinkClasses = (path: string) => {
        const isActive = pathname === path;
        const baseClasses = "font-extrabold transition-colors duration-200 px-3 py-2 rounded-lg relative"; 
        const activeClasses = "text-info underline decoration-info decoration-2 underline-offset-4";
        const inactiveClasses = "text-base-content";

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <div 
        // 1. Force Dark Mode context (Text becomes light, standard vars become dark)
        data-theme="dark"
        // 2. Use the CUSTOM variable for the Night Blue background. 
        //    'bg-base-200' would just make it dark grey.
        className="navbar bg-[var(--header-bg)] text-base-content shadow-lg border-b border-base-200/50 sticky top-0 z-30 transition-colors duration-300"
        >
            
            {/* ... (The rest of your JSX remains exactly the same) ... */}
            
            <div className="navbar-start">
                <div className="dropdown lg:hidden">
                    <label tabIndex={0} aria-label="Open navigation menu" className="btn btn-ghost btn-circle">
                        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                    </label>

                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 text-base-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={item.path}
                                    className={getLinkClasses(item.path)}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link 
                    href="/" 
                    className="btn btn-ghost normal-case text-xl text-base-content gap-2"
                >
                    <Image src="/icon.svg" alt='Main Icon' width={26} height={26}/>
                    <span className="font-semibold">TestNextJS</span>
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal space-x-0">
                    {navItems.map((item, index) => (
                        <li key={index} className="p-0 m-0">
                            <Link
                                href={item.path}
                                className={getLinkClasses(item.path)}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="navbar-end space-x-1">
                <ThemeToggle/>
                <button aria-label="Search" className="btn btn-ghost btn-circle">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5" />
                </button>

                <button aria-label="Notifications" className="btn btn-ghost btn-circle">
                    <div className="indicator">
                        <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                        <span className="italic badge badge-xs badge-primary indicator-item">3</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default HeaderComponent;