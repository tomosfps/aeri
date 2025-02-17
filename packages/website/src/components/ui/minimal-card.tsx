import { ReactNode } from 'react';

export function MinimalCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <div className="bg-whiteBackground dark:bg-darkBackground rounded-lg shadow-xl mx-2 p-4 mb-4 hover:border-whiteAccent dark:hover:border-darkAccent transition duration-300 border-2 border-transparent dark:border-darkSecondary w-full max-w-sm">
      <div className="flex items-center mb-2">
        <div className="bg-whiteAccent dark:bg-darkAccent text-whiteText dark:text-darkText rounded-full p-2 mr-2">
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}