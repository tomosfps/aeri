"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink as Link } from "react-router-dom";

interface FeatureProps {
    title: string;
    description: string;
    image: string;
    alt: string;
    altImage?: string;
    clickable?: boolean;
    commandExample?: string;
    learnMoreLink?: string;
    learnMoreText?: string;
    isRightAligned?: boolean;
    animationDirection?: 'left' | 'right';
    titleColor?: string;
}

export function Features({ 
    title, 
    description, 
    image, 
    alt, 
    altImage, 
    clickable,
    commandExample,
    learnMoreLink = "/commands",
    learnMoreText = "Learn more",
    isRightAligned = false,
    animationDirection = 'left',
    titleColor = "text-cprimary-light"
}: FeatureProps) {
    const [currentImage, setCurrentImage] = useState(image);

    const handleImageClick = () => {
        if (altImage) {
            setCurrentImage(currentImage === image ? altImage : image);
        }
    };

    // Determine animation direction
    const xValue = animationDirection === 'left' ? -50 : 50;

    return (
        <motion.div
            initial={{ opacity: 0, x: xValue }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20 lg:mb-32"
        >
            <div className="flex flex-col lg:flex-row items-center">
                {/* Text content */}
                <div className={`
                    ${isRightAligned ? "order-2 lg:pl-12" : "order-2 lg:order-1 lg:pr-12 lg:text-left"} 
                    lg:w-1/2 mt-8 lg:mt-0
                `}>
                    <div className={`bg-gradient-to-r ${isRightAligned ? "from-csecondary-light to-cprimary-light" : "from-cprimary-light to-csecondary-light"} p-px rounded-xl overflow-hidden`}>
                        <div className="bg-cbackground-light/80 backdrop-blur p-6 rounded-xl">
                            <h3 className={`text-2xl font-bold mb-3 ${titleColor}`}>{title}</h3>
                            <p className="text-ctext-light/80 leading-relaxed">
                                {description}
                            </p>
                            {learnMoreLink && (
                                <div className={`mt-4 flex ${isRightAligned ? "justify-start" : "justify-start lg:justify-end"}`}>
                                    <Link to={learnMoreLink} className={`${isRightAligned ? "text-cprimary-light" : "text-csecondary-light"} font-medium inline-flex items-center`}>
                                        {learnMoreText}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Image content */}
                <div className={`${isRightAligned ? "lg:w-1/2" : "order-1 lg:order-2 lg:w-1/2"}`}>
                    <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${isRightAligned ? "from-csecondary-light to-cprimary-light" : "from-cprimary-light to-csecondary-light"} rounded-xl opacity-30 blur-lg transform scale-105`}></div>
                        <div className={`relative rounded-xl overflow-hidden border border-white/10 shadow-xl ${clickable ? 'cursor-pointer transition-transform hover:scale-105 duration-300' : ''}`}>
                            <img 
                                src={currentImage} 
                                alt={alt} 
                                className="w-full h-auto rounded-xl" 
                                onClick={clickable ? handleImageClick : undefined}
                            />
                            {clickable && altImage && (
                                <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                                    Click to toggle
                                </div>
                            )}
                        </div>
                        {commandExample && (
                            <div className={`absolute ${isRightAligned ? "-left-4" : "-right-4"} -bottom-4 bg-${isRightAligned ? "cprimary" : "csecondary"}-light/30 backdrop-blur-sm rounded-lg p-3 border border-white/10 shadow-lg text-xs font-medium text-${isRightAligned ? "csecondary" : "cprimary"}-light`}>
                                {commandExample}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}