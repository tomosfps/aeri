from nextcord import Interaction, Embed, slash_command, SlashOption
from nextcord.ext import commands
from aerialog import Logger
import os, nextcord

log = Logger()

class SlashAnilist(commands.Cog):
    def __init__(self, client):
        self.client = client

    @slash_command(name="anilist", description="Search for an anime on Anilist")
    async def anilist(self, ctx: Interaction):
        pass

def setup(client):
    client.add_cog(SlashAnilist(client))