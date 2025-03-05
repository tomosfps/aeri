import { motion } from "framer-motion";
import { NavLink as Link } from "react-router-dom";

interface NavigationLinkProps {
    href: string;
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    activeClassName?: string;
    inactiveClassName?: string;
    renderLink?: (isActive: boolean) => React.ReactNode;
}

export function NavigationLink({ 
    href, 
    children, 
    onClick, 
    className = "",
    activeClassName = "",
    inactiveClassName = "",
    renderLink 
}: NavigationLinkProps) {
    const isExternal = href.startsWith("https");
    
    return (
        <Link 
            to={href} 
            target={isExternal ? "_blank" : undefined}
            className={({ isActive }) => 
                `${className} ${isActive && !isExternal ? activeClassName : inactiveClassName}`
            }
            onClick={onClick}
        >
            {({ isActive }) => renderLink ? renderLink(!isExternal && isActive) : children}
        </Link>
    );
}

export function NavigationItem({ href, label }: { href: string; label: string }) {
    return (
        <li className="relative">
            <NavigationLink
                href={href}
                className="relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center"
                activeClassName="text-cprimary-light"
                inactiveClassName="text-ctext-light/70 hover:text-ctext-light"
                renderLink={(isActive: boolean) => (
                    <>
                        {label}
                        {isActive && (
                            <motion.div 
                                layoutId="nav-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cprimary-light to-csecondary-light rounded-full mx-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                    </>
                )}
            >
                {label}
            </NavigationLink>
        </li>
    );
}

export function MobileNavItem({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
    return (
        <NavigationLink 
            href={href}
            onClick={onClick}
            activeClassName="bg-cprimary-light/10 text-cprimary-light font-medium border-l-2 border-cprimary-light"
            inactiveClassName="text-ctext-light/80 hover:bg-cprimary-light/5 hover:text-cprimary-light"
            className="flex items-center px-4 py-3 text-base"
        >
            {label}
        </NavigationLink>
    );
}