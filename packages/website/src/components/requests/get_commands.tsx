interface CommandOption {
    name: string;
    description: string;
    required: boolean;
    type: number;
    choices?: Array<{name: string, value: string}>;
    autocomplete?: boolean;
  }
  
  export interface Command {
    name: string;
    category: string;
    description: string;
    examples: string[];
    options: CommandOption[];
    type: number;
    cooldown?: number;
  }
  
  export default async function GetCommands(): Promise<Command[]> {
    try {
      const response = await fetch("http://0.0.0.0:8080/get_commands", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      let commandsArray;
      
      if (Array.isArray(data)) {
        commandsArray = data;
      } else if (data.commands) {
        if (typeof data.commands === 'string') {
          try {
            commandsArray = JSON.parse(data.commands);
          } catch (e) {
            console.error("Failed to parse commands string:", e);
            return [];
          }
        } else if (Array.isArray(data.commands)) {
          commandsArray = data.commands;
        }
      }
      
      if (!Array.isArray(commandsArray)) {
        console.error("Unexpected response format:", data);
        return [];
      }
  
      const slashCommands = commandsArray.filter((cmd: Command) => cmd.type === 1);
      return slashCommands.map((cmd: Command) => {
        const processedOptions = (cmd.options || []).map(option => {
          return {
            ...option,
            required: option.required ?? false
          };
        });
        
        return {
          ...cmd,
          options: processedOptions,
          examples: cmd.examples || []
        };
      });
    } catch (error) {
      console.error("Error fetching commands:", error);
      return [];
    }
  }