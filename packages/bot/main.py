import nextcord, os
from nextcord.ext import commands
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set Intents
intents = nextcord.Intents.default()
intents.message_content = True

client = commands.AutoShardedBot(
    shard_count=int(os.getenv('SHARD_COUNT')),
    application_id=int(os.getenv('DISCORD_APPLICATION_ID')),
    command_prefix='a..', case_insensitive=True,
    intents=intents, help_command=None
)

# Initialize cogs
for folder in os.listdir('./src/cogs/'):
    for filename in os.listdir(f'./src/cogs/{folder}'):
        if filename.endswith('.py'):
            try:
                client.load_extension(f'src.cogs.{folder}.{filename[:-3]}')
            except Exception as e:
                print(f'Failed to load cog {filename[:-3]}. Error: {e}')

@client.event
async def on_ready():
    print(f'[+] Logged in as {client.user} (ID: {client.user.id})')
    
if __name__ == '__main__':
    client.run(os.getenv('DISCORD_TOKEN'))