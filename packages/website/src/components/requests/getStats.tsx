export type Statistics = {
    guilds: number;
    userInstalls: number;
    commands?: number;
};

export default async function GetStats(): Promise<Statistics[]> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json()
    }
    catch (error: any) {
        console.error("Failed to fetch statistics", error);
        return [];
    }
}
