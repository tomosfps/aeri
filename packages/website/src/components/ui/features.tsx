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
                <h2 className="text-3xl xl:text-5xl font-bold text-cprimary-light">{title}</h2>
                <p className="text-center text-ctext-light mx-12 xl:text-xl md:mx-48 lg:mx-52 xl:mx-12">{description}</p>
            </div>
            <div className="2xl:w-2/4 md:w-2/3 lg:w-2/4 xl:w-2/4 2xl:w-3/4 px-4 pt-4">
                <img loading="lazy" src={image} alt={alt} width="600" height="400" className="rounded-2xl w-full max-w-4xl mx-auto select-none" />
            </div>
        </div>
    );
}