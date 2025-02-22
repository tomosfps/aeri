/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
            '1920p': '1920px',
            '2k': '2560px',
            '4k': '3840px',
        },
        extend: {
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                cprimary: {
                    light: "#F9A8D4",
                    DEFAULT: "#EC4899",
                    dark: "#BE185D",
                },

                csecondary: {
                    light: "#A5B4FC",
                    DEFAULT: "#6366F1",
                    dark: "#4338CA",
                },

                caccent: {
                    light: "#86EFAC",
                    DEFAULT: "#34D399",
                    dark: "#15803D",
                },

                cbackground: {
                    light: "#FDF7FA",
                    dark: "#1E1B1E",
                },

                ccard: {
                    light: "#FFFFFF",
                    dark: "#2A1F2D",
                },

                ctext: {
                    light: "#1F2937",
                    dark: "#E5E7EB",
                },

                cborder: {
                    light: "#E5E7EB",
                    dark: "#4B2C3D",
                },

                gradient: {
                    white: `bg-gradient-to-r from-[#7e61a6] via-[#d1adcc] to-[#b983a7]`,
                    dark: `bg-gradient-to-r from-[#75589d] via-[#522e4d] to-[#7c466a]`,
                },

                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    1: "hsl(var(--chart-1))",
                    2: "hsl(var(--chart-2))",
                    3: "hsl(var(--chart-3))",
                    4: "hsl(var(--chart-4))",
                    5: "hsl(var(--chart-5))",
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
