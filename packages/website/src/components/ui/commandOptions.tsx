import { memo } from "react";
import { Badge } from "./badge";
import { Command } from "../requests/getCommands";

export const CommandOptions = memo(({ option }: { option: Command['options'][0] }) => {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-cprimary-light font-medium">{option.name}</span>
          <Badge 
            className={`${option.required ? 'bg-cprimary-light' : 'bg-csecondary-light'} 
              text-cbackground-light text-xs pointer-events-none`}
          >
            {option.required ? 'Required' : 'Optional'}
          </Badge>
        </div>
        <div className="bg-cbackground-light/50 p-2 rounded border border-cborder-light/50">
          <p className="text-sm text-ctext-light">
            {option.description}
          </p>
          {option.choices && option.choices.length > 0 && (
            <div className="mt-2 pt-2 border-t border-cborder-light/30">
              <p className="text-xs text-ctext-light/70 mb-1.5">Available Choices:</p>
              <div className="flex flex-wrap gap-1.5">
                {option.choices.map((choice, i) => (
                  <Badge
                    key={i}
                    className="bg-cbackground-light text-csecondary-light border border-csecondary-light/30 text-xs"
                  >
                    {choice.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
});