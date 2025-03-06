"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FAQItemProps {
    question: string;
    answer: ReactNode;
    index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
    return (
        <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="mb-6"
        >
            <div className="bg-white/5 p-5 rounded-xl">
                <h3 className="text-xl font-semibold mb-2 text-csecondary-light">{question}</h3>
                <div className="text-ctext-light/70">{answer}</div>
            </div>
        </motion.div>
    );
}

interface FAQProps {
    title?: string;
    items: {
        question: string;
        answer: ReactNode;
    }[];
    className?: string;
}

export function FAQ({ 
    title = "Frequently Asked Questions", 
    items,
    className = ""
}: FAQProps) {
    return (
        <section className={`py-16 px-4 ${className}`}>
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-cprimary-light">{title}</h2>
                {items.map((faq, i) => (
                    <FAQItem 
                        key={i}
                        question={faq.question} 
                        answer={faq.answer} 
                        index={i}
                    />
                ))}
            </div>
        </section>
    );
}