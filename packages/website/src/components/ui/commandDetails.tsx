import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { CardContent } from "./card";
import { memo } from "react";
import { Command } from "../requests/get_commands";
import { Clock } from "lucide-react";
import { CommandOptions } from "./commandOptions";

export const CommandDetails = memo(({ command }: { command: Command }) => {
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
                    className={`p-2 text-base ${index < command.examples.length - 1 ? 'border-b border-cborder-light' : ''}`}
                  >
                    <span className="p-3 text-cprimary-light">{example}</span>
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
    );
});