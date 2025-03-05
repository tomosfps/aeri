import { memo } from "react";
import { Command } from "../requests/getCommands";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { CommandDetails } from "./commandDetails";
import { formatSeconds } from "../utils/formatUtils";

export const CommandCard = memo(({ 
    command, 
    isExpanded,
    id,
    onToggleExpand 
  }: { 
    command: Command; 
    isExpanded: boolean;
    id: string;
    onToggleExpand: (name: string) => void;
  }) => {
    return (
    <Card
      className="overflow-hidden border-cborder-light bg-cbackground-light odd:bg-cprimary-light/5 even:bg-csecondary-light/5 transition-colors"
      id={id}
    >
      <button
        className="w-full text-left"
        onClick={() => onToggleExpand(command.name)}
        >
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex-1 min-w-0"> {/* Container for all content */}
            <CardTitle className="text-lg flex items-center text-cprimary-light flex-nowrap">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap mr-2 flex-shrink" title={`/${command.name}`}>
                /{command.name}
              </div>
              <span className="px-2 py-0.5 text-xs rounded-full bg-cbackground-light border border-cborder-light text-csecondary-light whitespace-nowrap flex-shrink-0 mr-2">
                {command.category}
              </span>
              {command.cooldown !== undefined && command.cooldown > 0 && (
              <span className="px-1.5 py-0.5 text-xs flex items-center text-ctext-light/80 whitespace-nowrap flex-shrink-0">
                <Clock className="h-3 w-3 mr-1" />
                {formatSeconds(command.cooldown)}
              </span>
              )}
            </CardTitle>
            <CardDescription className="line-clamp-1 text-ctext-light/80 mt-1">
              {command.description}
            </CardDescription>
          </div>
          <div className="ml-2 flex-shrink-0">
            {isExpanded ? 
              <ChevronDown className="h-5 w-5 text-cprimary-light" /> : 
              <ChevronRight className="h-5 w-5 text-cprimary-light" />
            }
          </div>
        </CardHeader>
      </button>
    
      {isExpanded && <CommandDetails command={command} />}
    </Card>
  );
});