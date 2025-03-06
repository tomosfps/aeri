import { NavLink as Link } from "react-router-dom";
import { Suspense } from "react";
import LoadingSpinner from "./loadingSpinner";

export function SocialButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={href}
            className="bg-cprimary-light/90 relative group h-9 w-9 flex items-center justify-center rounded-full bg-cbackground-light border border-cprimary-light/20 hover:bg-cprimary-light/40 transition-colors"
            target="_blank"
            title={label}
        >
            <Suspense fallback={<LoadingSpinner fullScreen={false} message="Loading Icon..." />}>
                {icon}
            </Suspense>
            <span className="sr-only">{label}</span>
        </Link>
    );
}