"use client";
import { useState } from 'react';

interface FeatureProps {
    title: string;
    description: string;
    image: string;
    alt: string;
    altImage?: string;
    clickable?: boolean;
}

export function Features({ title, description, image, alt, altImage, clickable }: FeatureProps) {
    const [currentImage, setCurrentImage] = useState(image);

    const handleImageClick = () => {
        if (altImage) {
            setCurrentImage(currentImage === image ? altImage : image);
        }
    };

    return (
        <div className="feature-content flex flex-col md:flex-row items-center md:items-start justify-between w-full max-w-6xl mx-auto px-4 gap-6 md:gap-8 lg:gap-12">

            <div className="w-full md:w-2/5 space-y-3 md:space-y-4 flex items-center justify-center flex-col">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cprimary-light text-center">
                    {title}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-ctext-light/80 text-center ">
                    {description}
                </p>
            </div>
            

            <div className={`w-full md:w-3/5 ${clickable ? 'cursor-pointer transition-transform hover:scale-105 duration-300' : ''}`}>
                <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-lg">
                    <img
                        loading="lazy"
                        src={currentImage}
                        alt={alt}
                        className="w-full h-full object-cover object-center select-none"
                        onClick={clickable ? handleImageClick : undefined}
                    />
                    {clickable && (
                        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                            Click to toggle
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}