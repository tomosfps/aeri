import nextcord
from nextcord import Interaction

class avatarViewer(nextcord.ui.View):
    def __init__(self, guild_avatar, actual_avatar, embed: nextcord.Embed):
        super().__init__()
        self.guild = guild_avatar
        self.avatar = actual_avatar
        self.embed = embed

    @nextcord.ui.button(label="Change Avatar", style=nextcord.ButtonStyle.green)
    async def changeAvatar(self, button: nextcord.ui.Button, ctx: Interaction):
        if self.embed.image.url == self.guild: self.embed.set_image(url=self.avatar)
        else: self.embed.set_image(url=self.guild)
        return await ctx.edit(embed=self.embed)