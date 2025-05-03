import "~/styles/root.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, } from "react-router";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="title" content="Aeri | Discord Bot" />
        <meta name="keywords" content="Discord, bot, Aeri, anime, manga, anime bot, Discord anime bot, Aeri bot, Aeri Discord, Discord bot Aeri, anime lookup, anime search, anime tracking, MyAnimeList, AniList, anime recommendations, seasonal anime, Japanese animation, otaku bot, weeb bot" />
        <meta name="description" content="A powerful Discord bot with many features to enhance your server experience." />
        <meta name="subject" content="Aeri | Discord Bot" />
        <meta property="og:title" content="Aeri | Discord Bot" />
        <meta property="og:description"
          content="A powerful Discord bot with many features to enhance your server experience." />
        <meta property="og:image" content="https://cdn.aeri.live/bot_pfp.png" />
        <meta property="og:type" content="website" />

        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        <main>
          {children}
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}