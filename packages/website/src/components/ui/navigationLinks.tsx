import { NavLink as Link } from "react-router-dom";

interface NavigationLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function NavigationLink({ href, children, onClick, className }: NavigationLinkProps) {
    return (
        <Link to={href} target={href.startsWith("https") ? "_blank" : "_self"} className={` ${className} hover:underline hover:text-csecondary-light/40 underline-offset-4 text-csecondary-light font-semibold`}
         prefetch="none" onClick={onClick}>
            {children}
        </Link>
    );
}
