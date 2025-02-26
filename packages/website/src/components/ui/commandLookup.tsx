import { useState, useEffect } from "react";
import { Button } from "./button";
import { Search, Clock } from "lucide-react";
import { Input } from "./input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "./badge";
import GetCommands, { type Command} from "../requests/get_commands";

export function CommandLookup() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch commands when component mounts
  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const commandData = await GetCommands();
        setCommands(commandData);
      } catch (error) {
        console.error("Failed to fetch commands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);
  
  const categories = Array.from(new Set(commands.map(cmd => cmd.category)));
  
  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? cmd.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline"
              size="sm"
              className={`border-cprimary-light bg-cbackground-light hover:bg-cprimary-light/10 hover:text-ctext-light
                ${selectedCategory === null ? 'bg-cprimary-light text-cbackground-light hover:bg-cprimary-light/90' : 'text-ctext-light'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                className={`border-csecondary-light bg-cbackground-light hover:bg-csecondary-light/10 hover:text-ctext-light
                  ${selectedCategory === category ? 'bg-csecondary-light text-cbackground-light hover:bg-csecondary-light/90' : 'text-ctext-light'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
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
        
        {/* Mobile-friendly command list with expandable details */}
        {!loading && (
          <div className="space-y-3">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((command) => (
                <Card 
                  key={command.name} 
                  className="overflow-hidden border-cborder-light bg-cbackground-light odd:bg-cprimary-light/5 even:bg-csecondary-light/5 odd:hover:bg-cprimary-light/15 even:hover:bg-csecondary-light/15 transition-colors"
                >
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedCommand(expandedCommand === command.name ? null : command.name)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                      <div>
                        <CardTitle className="text-lg flex items-center text-cprimary-light">
                          /{command.name}
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-cbackground-light border border-cborder-light text-csecondary-light">
                            {command.category}
                          </span>
                          {command.cooldown && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs flex items-center text-ctext-light/80">
                              <Clock className="h-3 w-3 mr-1" />
                              {command.cooldown}s
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-1 text-ctext-light/80">
                          {command.description}
                        </CardDescription>
                      </div>
                      {expandedCommand === command.name ? 
                        <ChevronDown className="h-5 w-5 text-cprimary-light" /> : 
                        <ChevronRight className="h-5 w-5 text-cprimary-light" />
                      }
                    </CardHeader>
                  </button>
                  
                  {expandedCommand === command.name && (
                    <CardContent className="pb-4 pt-0">
                      <Tabs defaultValue="options" className="w-full">
                        <TabsList className="mb-2 bg-cbackground-light border border-cborder-light">
                          <TabsTrigger 
                            value="options"
                            className="text-ctext-light data-[state=active]:bg-cprimary-light data-[state=active]:text-cbackground-light"
                          >
                            Options
                          </TabsTrigger>
                          <TabsTrigger 
                            value="examples"
                            className="text-ctext-light data-[state=active]:bg-cprimary-light data-[state=active]:text-cbackground-light"
                          >
                            Examples
                          </TabsTrigger>
                          <TabsTrigger 
                            value="description"
                            className="text-ctext-light data-[state=active]:bg-cprimary-light data-[state=active]:text-cbackground-light"
                          >
                            Details
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="options">
                          {command.options.length > 0 ? (
                            <div className="bg-cbackground-light p-3 rounded-md border border-cborder-light space-y-2">
                              {command.options.map((option, index) => {
                                const [name, description] = option.split(':');
                                const isRequired = description.includes("[Required]");
                                
                                return (
                                  <div key={index} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono text-cprimary-light">{name}</span>
                                      <Badge className={`${isRequired ? 'bg-cprimary-light' : 'bg-csecondary-light'} text-cbackground-light text-xs`}>
                                        {isRequired ? 'Required' : 'Optional'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-ctext-light/80 ml-1">
                                      {description.replace(/\[(Required|Optional)\]\s/, '')}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-cbackground-light p-3 rounded-md border border-cborder-light text-ctext-light/80">
                              This command has no options
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="examples">
                          <div className="bg-cbackground-light rounded-md border border-cborder-light">
                            {command.examples.map((example, index) => (
                              <div 
                                key={index} 
                                className={`p-2 font-mono text-sm ${index < command.examples.length - 1 ? 'border-b border-cborder-light' : ''}`}
                              >
                                <span className="text-cprimary-light">{example}</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="description">
                          <div className="text-sm text-ctext-light p-3 bg-cbackground-light rounded-md border border-cborder-light">
                            <p>{command.description}</p>
                            {command.cooldown && (
                              <p className="mt-2 flex items-center text-ctext-light/80">
                                <Clock className="h-4 w-4 mr-1 inline" />
                                Cooldown: {command.cooldown} seconds
                              </p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-csecondary-light bg-cbackground-light/50 rounded-lg border border-cborder-light">
                No commands found
              </div>
            )}
          </div>
        )}
        
        {/* Empty space filler if needed */}
        {!loading && filteredCommands.length < 3 && (
          <div className="mt-8 py-12 bg-cbackground-light"></div>
        )}
      </div>
    </div>
  );
}