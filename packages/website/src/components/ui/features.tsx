interface FeatureProps {
    title: string;
    description: string;
    image: string;
    alt: string;
}

export function Features({ title, description, image, alt }: FeatureProps) {
    return (
        <div className="xl:even:flex-row xl:odd:flex-row-reverse flex flex-col items-center space-y-4 w-full max-w-7xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl xl:text-5xl font-bold">{title}</h2>
                <p className="text-center mx-12 xl:text-2xl">{description}</p>
            </div>
            <div className="xl:w-full bg-gradient-to-r from-cprimary-light to-csecondary-light dark:from-cprimary-dark dark:to-csecondary-dark rounded-t-3xl px-4 pt-4">
                <img src={image} alt={alt} className="rounded-t-3xl w-full max-w-4xl mx-auto select-none" />
            </div>
        </div>
    );
}