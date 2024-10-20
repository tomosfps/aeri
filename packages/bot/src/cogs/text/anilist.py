from nextcord import Interaction
from nextcord.ext import commands


class Anilist(commands.Cog):
    def __init__(self, client):
        self.client = client

    @commands.command(name="anilist", description="Search for an anime on Anilist")
    async def anilist(self, ctx: Interaction, *, query):
        pass


def setup(client):
    client.add_cog(Anilist(client))