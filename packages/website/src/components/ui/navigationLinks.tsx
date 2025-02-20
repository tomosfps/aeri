import { NavLink as Link } from "react-router-dom";

interface NavigationLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export function NavigationLink({ href, children, onClick }: NavigationLinkProps) {
    return (
        <Link to={href} target={href.startsWith("https") ? "_blank" : "_self"} className="hover:underline hover:text-csecondary-light/40 dark:hover:text-csecondary-dark/40 underline-offset-4 text-csecondary-light dark:text-csecondary-dark" prefetch="none" onClick={onClick}>
            {children}
        </Link>
    );
}
