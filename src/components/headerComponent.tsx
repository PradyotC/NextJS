import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';

const HeaderComponent: React.FC = () => {
    const navItems = [
        { name: "Home", path: "/" },
        { name: "TMDB", path: "/tmdb" },
        { name: "Test", path: "/test" },
    ];

    return (
        <div className="navbar bg-base-300 text-base-content shadow-lg border-b border-base-200">
            <div className="navbar-start">
                <div className="dropdown">
                    <button aria-label="Open navigation menu" tabIndex={0} className="btn btn-ghost btn-circle">
                        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                    </button>

                    <ul className="menu menu-sm dropdown-content bg-base-200 text-base-content rounded-box z-10 mt-3 w-52 p-2 shadow">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={item.path}
                                    className="hover:text-primary transition-colors duration-200"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="navbar-center">
                <Link href="/" className="btn btn-ghost normal-case text-xl text-base-content">
                    TestNextJS
                </Link>
            </div>

            <div className="navbar-end space-x-1">
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
