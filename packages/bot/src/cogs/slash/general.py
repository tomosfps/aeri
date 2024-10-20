from nextcord import Interaction, Embed, slash_command, SlashOption
from nextcord.ext import commands
from aerialog import Logger
import os, nextcord
from ...utils.avatar_viewer import avatarViewer

log = Logger()

class SlashGeneral(commands.Cog):
    def __init__(self, client):
        self.client = client

    # Fetch Users Avatar
    # _________________________________________________________________________________________

    @slash_command(name="avatar", description="Fetch the avatar of a user, or yourself")
    async def avatar(self, ctx: Interaction, member: nextcord.Member = SlashOption("member", description="A member to grab their banner", required=False)):
        member = member if member else ctx.user
        log.info(f"Fetching {member.name}", "Slash General")
        
        if member.avatar == None:
            log.warn(f"{member.name} does not have an avatar, using default avatar", "Slash General")
            member.avatar = member.default_avatar
        
        embed = Embed(title=f"{member.name}'s avatar", color=0x2F3136)
        embed.set_image(url=member.avatar.url)
        
        if member.guild_avatar != None:
            log.log(f"Member {member.name} has a guild avatar, adding to embed", "Slash General")
            await ctx.send(embed=embed, view=avatarViewer(member.guild_avatar.url, member.avatar.url, embed))
        else:
            await ctx.send(embed=embed)
    
    # Fetch Users Banner
    # _________________________________________________________________________________________

    @slash_command(name="banner", description="Fetches the banner of a user")
    async def banner(self, ctx: Interaction, member: nextcord.Member = SlashOption("member", description="A member to grab their banner", required=False)):
        member = member if member else ctx.user
        log.info(f"Fetching banner for {member.name}", "Slash General")
        member = await self.client.fetch_user(member.id)

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

    @slash_command(name="server", description="Information about a server")
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
    client.add_cog(SlashGeneral(client))