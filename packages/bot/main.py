import nextcord, os
from nextcord.ext import commands
from dotenv import load_dotenv
from aerialog import Logger

"""
Load environment variables from .env file
These will be public to all files in the project
"""
load_dotenv()
logger = Logger()

"""
Setup the intents for the bot
Enable message content for command prefix detection
"""
intents = nextcord.Intents.default()
intents.message_content = True

client = commands.AutoShardedBot(
    shard_count=int(os.getenv('SHARD_COUNT')),
    application_id=int(os.getenv('DISCORD_APPLICATION_ID')),
    command_prefix='a..', case_insensitive=True,
    intents=intents, help_command=None,
    default_guild_ids=[int(os.getenv('DISCORD_TEST_GUILD_ID'))],
)

"""
Load all cogs from the cogs folder
Cogs to be loaded are text based commands and slash commands
"""
loaded_cogs = []
for folder in os.listdir('./src/cogs/'):
    for filename in os.listdir(f'./src/cogs/{folder}'):
        if filename.endswith('.py'):
            try:
                client.load_extension(f'src.cogs.{folder}.{filename[:-3]}')
                loaded_cogs.append(f'{folder}/{filename[:-3]}')
            except Exception as error:
                logger.error(f'Failed to load cog {folder}/{filename[:-3]}. Error: {error}', "Main")

@client.event
async def on_ready():
    logger.info(f"Loaded {len(loaded_cogs)} cogs: {', '.join(loaded_cogs)}", "Main")
    logger.info(f'Logged in as {client.user} (ID: {client.user.id})', "Main")
    
if __name__ == '__main__':
    client.run(os.getenv('DISCORD_TOKEN'))