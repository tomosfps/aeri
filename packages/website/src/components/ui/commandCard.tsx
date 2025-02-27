import { memo } from "react";
import { Command } from "../requests/getCommands";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { CommandDetails } from "./commandDetails";

export const CommandCard = memo(({ 
    command, 
    isExpanded, 
    onToggleExpand 
  }: { 
    command: Command; 
    isExpanded: boolean; 
    onToggleExpand: (name: string) => void;
  }) => {
    return (
    <Card
      className="overflow-hidden border-cborder-light bg-cbackground-light odd:bg-cprimary-light/5 even:bg-csecondary-light/5 transition-colors"
    >
      <button
        className="w-full text-left"
        onClick={() => onToggleExpand(command.name)}
        >
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div>
            <CardTitle className="text-lg flex items-center text-cprimary-light">
              /{command.name}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-cbackground-light border border-cborder-light text-csecondary-light">
              {command.category}
                </span>
              {command.cooldown !== undefined && command.cooldown > 0 && (
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
          {isExpanded ? 
            <ChevronDown className="h-5 w-5 text-cprimary-light" /> : 
            <ChevronRight className="h-5 w-5 text-cprimary-light" />
          }
        </CardHeader>
      </button>
    
      {isExpanded && <CommandDetails command={command} />}
    </Card>
  );
});