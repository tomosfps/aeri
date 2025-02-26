export type Command = {
    name: string;
    description: string;
    cooldown: number | null;
    options: string[];
    examples: string[];
    category: string;
}

export default async function GetCommands(): Promise<Command[]> {
    return fetch("http://0.0.0.0:8080/get_commands")
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => data.commands)
        .catch(error => {
            console.error("Error fetching commands:", error);
            return [];
        });
}