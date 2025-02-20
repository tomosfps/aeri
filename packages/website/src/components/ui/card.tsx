import { FaGithubAlt } from "react-icons/fa";

type GithubCardProps = {
    title: string;
    description: string;
    image: string;
    url: string;
    languages?: string[];
}

export function Card({ title, description, image, url, languages }: GithubCardProps) {
    return (
        <a href={url} target="_blank" rel="noreferrer" className="w-fit 2xl:w-max m-4">
            <div className="bg-ccard-light dark:bg-ccard-dark shadow-soft dark:shadow-strong border-2 hover:border-cprimary-light dark:hover:border-cprimary-dark rounded-xl p-4 mx-auto max-w-sm 2xl:max-w-7xl">

                <div className="w-min bg-cprimary-light dark:bg-cprimary-dark text-ctext-light dark:text-ctext-dark flex flex-row items-center space-x-2 px-2 py-2 rounded-lg text-sm mb-4 font-semibold">
                    <FaGithubAlt />
                    <h6>GITHUB</h6>
                </div>

                <img src={image} alt={title} className="rounded-xl w-full max-w-4xl mx-auto" />
                <div className="mt-4 text-left">
                    <h2 className="text-2xl font-bold text-ctext-light dark:text-ctext-dark">{title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {languages?.map((language) => (
                            <span key={language} className="bg-csecondary-light dark:bg-csecondary-dark text-ctext-light dark:text-ctext-dark px-2 py-1 rounded-lg text-sm">{language}</span>
                        ))}
                    </div>
                </div>
            </div>
        </a>
    );
}