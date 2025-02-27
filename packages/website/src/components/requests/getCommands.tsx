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
    
    if (!data.commands || !Array.isArray(data.commands)) {
      console.error("Unexpected response: ", data);
      return [];
    }

    const processedCommands = data.commands.map((commandTuple: [string, string]) => {
      const commandName = commandTuple[0];
      let commandData;
      
      try {
        commandData = JSON.parse(commandTuple[1]);
      } catch (e) {
        console.error(`Failed to parse command data for ${commandName}:`, e);
        return null;
      }
    
      let options: CommandOption[] = [];
      try {
        if (commandData.options && typeof commandData.options === 'string') {
          options = JSON.parse(commandData.options);
        }
      } catch (e) {
        console.error(`Failed to parse options for ${commandName}:`, e);
        options = [];
      }

      let examples: string[] = [];
      try {
        if (commandData.examples && typeof commandData.examples === 'string') {
          examples = JSON.parse(commandData.examples);
        }
      } catch (e) {
        console.error(`Failed to parse examples for ${commandName}:`, e);
        examples = [];
      }

      return {
        name: commandData.commandName || commandName,
        description: commandData.description || '',
        category: commandData.category || 'Utility',
        cooldown: typeof commandData.cooldown === 'number' ? commandData.cooldown : 0,
        options: options,
        examples: examples,
        type: 1 
      } as Command;
    }).filter(Boolean) as Command[];

    return processedCommands;
    
  } catch (error) {
    console.error("Error fetching commands: ", error);
    return [];
  }
}