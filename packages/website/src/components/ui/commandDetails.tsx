import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { CardContent } from "./card";
import { memo } from "react";
import { Command } from "../requests/getCommands";
import { Clock } from "lucide-react";
import { CommandOptions } from "./commandOptions";
import { formatSeconds } from "../utils/formatUtils";

export const CommandDetails = memo(({ command }: { command: Command }) => {
    const formatExample = (example: string) => {
      const commandMatch = example.match(/^\/[a-zA-Z0-9-_]+/);
      
      if (!commandMatch) {
        return <span className="text-cprimary-light">{example}</span>;
      }
      
      const commandPart = commandMatch[0];
      const optionsPart = example.slice(commandPart.length);
      const optionSegments = optionsPart.split(/(\s+[a-zA-Z0-9-_]+:)/g).filter(Boolean);
      
      return (
        <>
          <span className="text-cprimary-light font-medium">{commandPart}</span>
          {optionSegments.map((segment, i) => {
            if (segment.trim().endsWith(':')) {
              return <span key={i} className="text-csecondary-light font-medium">{segment}</span>;
            }
            return <span key={i}>{segment}</span>;
          })}
        </>
      );
    };

    return (
      <CardContent className="pb-4 pt-0">
        <Tabs defaultValue="options" className="w-full">
          <TabsList className="mb-3 bg-cbackground-light border border-cborder-light rounded-md p-1 flex gap-1">
            <TabsTrigger
              value="options"
              className="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all text-ctext-light data-[state=active]:bg-cprimary-light data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Options
            </TabsTrigger>
            <TabsTrigger
              value="examples"
              className="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all text-ctext-light data-[state=active]:bg-cprimary-light data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Examples
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all text-ctext-light data-[state=active]:bg-cprimary-light data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Description
            </TabsTrigger>
          </TabsList>
  
          <TabsContent value="options">
            {command.options && command.options.length > 0 ? (
              <div className="bg-cbackground-light p-3 rounded-md border border-cborder-light space-y-3">
                {command.options.map((option, index) => (
                  <CommandOptions key={index} option={option} />
                ))}
              </div>
            ) : (
              <div className="bg-cbackground-light p-3 rounded-md border border-cborder-light text-ctext-light/80">
                This command has no options
              </div>
            )}
          </TabsContent>
  
          <TabsContent value="examples">
            <div className="bg-cbackground-light rounded-md border border-cborder-light">
              {command.examples && command.examples.length > 0 ? (
                command.examples.map((example, index) => (
                  <div
                    key={index}
                    className={`p-3 text-ctext-light ${index < command.examples.length - 1 ? 'border-b border-cborder-light' : ''}`}
                  >
                    {formatExample(example)}
                  </div>
                ))
              ) : (
                <div className="p-3 text-ctext-light/80">
                  No examples available
                </div>
              )}
            </div>
          </TabsContent>
  
          <TabsContent value="description">
            <div className="bg-cbackground-light p-3 rounded-md border border-cborder-light text-ctext-light/80">
              <p>{command.description}</p>
              {command.cooldown !== undefined && command.cooldown > 0 && (
                <p className="mt-2 flex items-center text-ctext-light/80">
                  <Clock className="h-4 w-4 mr-1 inline" />
                  Cooldown: {formatSeconds(command.cooldown)}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    );
});