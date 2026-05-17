"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    isMobile?: boolean;
}

export function NavLink({ href, children, onClick, isMobile = false }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    if (isMobile) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className={`text-[18px] w-full text-center py-3 border-b border-gray-100 transition-colors ${isActive
                        ? "font-[700] text-primary"
                        : "font-[500] text-[#8C959F] active:text-[#57606a]"
                    }`}
            >
                {children}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`relative text-[16px] xl:text-[20px] py-1 flex flex-col items-center transition-colors ${isActive
                    ? "font-[700] text-primary"
                    : "font-[500] text-[#8C959F] hover:text-[#57606a]"
                }`}
        >
            {children}
            {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>
            )}
        </Link>
    );
}
