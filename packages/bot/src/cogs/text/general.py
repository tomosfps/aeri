from nextcord import Interaction, Embed
from typing import Optional
from nextcord.ext import commands
from aerialog import Logger

from ...utils.avatar_viewer import avatarViewer

log = Logger()

class General(commands.Cog):
    def __init__(self, client):
        self.client = client

    # Fetch Users Avatar
    # _________________________________________________________________________________________

    @commands.command(aliases=['av', 'ava'], description="Fetch the avatar of a user, or yourself")
    async def avatar(self, ctx: Interaction, *member: Optional[str]):
        member = ' '.join(member)
        member = member if member else ctx.author.name
        converter = commands.MemberConverter()

        try:
            member = await converter.convert(ctx, member)
            log.info(f"Fetching {member.name}", "General")
        except commands.MemberNotFound:
            log.error(f"Member {member} was not found.", "General")
            return await ctx.send(f"Could not find member ` {member} `", ephemeral=True)
        
        if member.avatar == None:
            log.warn(f"{member.name} does not have an avatar, using default avatar", "General")
            member.avatar = member.default_avatar
        
        embed = Embed(title=f"{member.name}'s avatar", color=0x2F3136)
        embed.set_image(url=member.avatar.url)
        
        if member.guild_avatar != None:
            log.log(f"Member {member.name} has a guild avatar, adding to embed", "General")
            await ctx.send(embed=embed, view=avatarViewer(member.guild_avatar.url, member.avatar.url, embed))
        else:
            await ctx.send(embed=embed)
    
    # Fetch Users Banner
    # _________________________________________________________________________________________

    @commands.command(aliases=['bn'], description="Fetches the banner of a user")
    async def banner(self, ctx: Interaction, *member: Optional[str]):
        member = ' '.join(member)
        member = member if member else ctx.author.name
        converter = commands.MemberConverter()

        try:
            member = await converter.convert(ctx, member)
            log.info(f"Fetching banner for {member.name}", "General")
        except commands.MemberNotFound:
            log.error(f"Member {member.name} was not found.", "General")
            return await ctx.send(f"member ` {member} ` was not found.", ephemeral=True)
        member = await self.client.fetch_user(member.id) # Fetch the user to get the banner

        try:
            embed = Embed(title=f"{member.name}'s banner", color=0x2F3136)
            embed.set_image(url=member.banner.url)
            await ctx.send(embed=embed)
            log.info(f"Member {member.name} has a banner, sending embed", "Slash General")
        except AttributeError as error:
            log.error(f"{error}", "Slash General")
            return await ctx.send(f"` {member.name} ` does not have a banner.", ephemeral=True)
        
    # View Server Information
    # _________________________________________________________________________________________

    @commands.command(aliases=['serverinfo', 'si'], description="Information about a server")
    async def server(self, ctx: Interaction):
        log.info("Fetching server information", "Slash General")
        guildName = ctx.guild.name
        guildMembers = ctx.guild.member_count
        guildRoles = len(ctx.guild.roles)
        guildChannels = len(ctx.guild.channels)
        guildEmojis = len(ctx.guild.emojis)
        guildCreationDate = ctx.guild.created_at.strftime("%d/%m/%Y ~ %H:%M:%S")
        guildID = ctx.guild.id
        guildAvatar = ctx.guild.icon.url if ctx.guild.icon else None
        guildBanner = ctx.guild.banner.url if ctx.guild.banner else None

        descriptionEmbed = f"""
        <:home:1263186875917533265> **{str.center(guildName,4)}**
        <:people:1263186877482012672> `{str.center(str(guildMembers),4)} members` <:emoji:1263191670673899530> `{str.center(str(guildEmojis),4)} emojis`
        <:shield:1263186872323145749> `{str.center(str(guildRoles),4)} roles` <:hashtag:1263186874969882725> `{str.center(str(guildChannels),4)} channels`
        <:calendar:1263186871245213857> `{str.center(guildCreationDate,4)}`
        """

        log.info(f"Creating embed for {guildName}", "Slash General")
        embed = Embed(description=descriptionEmbed, color=0x2F3136)
        embed.set_footer(text=f"• {guildID} •")
        embed.set_image(url=guildBanner)
        embed.set_thumbnail(url=guildAvatar)
        await ctx.send(embed=embed)

def setup(client):
    client.add_cog(General(client))