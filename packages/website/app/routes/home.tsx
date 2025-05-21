import '~/styles/home.css';
import Statistics from '~/components/home/Statistics';
import Invite from '~/components/home/Invite';
import Hero from '~/components/home/Hero';
import Features from '~/components/home/Features';

export function meta() {
  return [{ title: "Your Anime Companion | Aeri" }];
}

export default function Home() {
  return (
    <div className="home-container">
      <Hero />
      <Features />
      <Statistics />
      <Invite />
    </div>
  )
}