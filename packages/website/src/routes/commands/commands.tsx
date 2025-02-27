"use client";

import GetCommands, { Command } from "@/components/requests/get_commands";
import { CategoryButton } from "@/components/ui/categoryButton";
import { CommandCard } from "@/components/ui/commandCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Commands() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
    const [commands, setCommands] = useState<Command[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchCommands = async () => {
            try {
                const commandData = await GetCommands();
                if (isMounted) {
                    setCommands(commandData);
                }
            } catch (error) {
                console.error("Failed to fetch commands:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCommands();
        return () => { isMounted = false; };
    }, []);

    const categories = useMemo(() => 
        Array.from(new Set(commands.map(cmd => cmd.category))), 
        [commands]
    );

    const filteredCommands = useMemo(() => 
        commands.filter(cmd => {
        const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? cmd.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
        }),
        [commands, searchQuery, selectedCategory]
    );

    const handleToggleExpand = useCallback((name: string) => {
        setExpandedCommand(prev => prev === name ? null : name);
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const timeoutId = setTimeout(() => {
        setSearchQuery(value);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="w-full min-h-screen bg-cbackground-light mx-auto px-4 py-8 text-ctext-light">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-cprimary-light">Command Lookup</h2>

                {/* Search and filter area */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-cprimary-light" />
                    <Input
                    placeholder="Search commands..."
                    className="pl-9 bg-cbackground-light border-cprimary-light focus-visible:ring-cprimary-light text-ctext-light"
                    defaultValue={searchQuery}
                    onChange={handleSearchChange}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <CategoryButton 
                    category={null} 
                    isSelected={selectedCategory === null} 
                    onClick={() => setSelectedCategory(null)} 
                    />
                    {categories.map(category => (
                    <CategoryButton 
                        key={category} 
                        category={category}
                        isSelected={selectedCategory === category}
                        onClick={() => setSelectedCategory(category)}
                    />
                    ))}
                </div>
                </div>

                {/* Loading state */}
                {loading && (
                <div className="text-center py-16">
                    <div className="w-12 h-12 border-4 border-cprimary-light/20 border-t-cprimary-light rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-ctext-light">Loading commands...</p>
                </div>
                )}

                {/* Command List */}
                {!loading && (
                <div className="space-y-3">
                    {filteredCommands.length > 0 ? (
                    filteredCommands.map((command) => (
                        <CommandCard 
                        key={command.name}
                        command={command}
                        isExpanded={expandedCommand === command.name}
                        onToggleExpand={handleToggleExpand}
                        />
                    ))
                    ) : (
                    <div className="text-center py-8 text-csecondary-light bg-cbackground-light/50 rounded-lg border border-cborder-light">
                        No commands found
                    </div>
                    )}
                </div>
                )}

                {/* Filler Space */}
                {!loading && filteredCommands.length < 3 && (
                <div className="mt-8 py-12 bg-cbackground-light"></div>
                )}
            </div>
        </div>
    );
}
