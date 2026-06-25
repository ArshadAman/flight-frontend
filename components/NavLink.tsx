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
                className={`text-[18px] w-full text-center py-3 border-b border-border transition-colors ${isActive
                    ? "font-bold text-primary"
                    : "font-medium text-muted-foreground active:text-foreground"
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
            className={`relative text-base xl:text-xl py-1 flex flex-col items-center transition-colors ${isActive
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground"
                }`}
        >
            {children}
            {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>
            )}
        </Link>
    );
}
