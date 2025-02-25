# Aeri
## Aeri, an all in one Anime/Manga bot.

> [!IMPORTANT]
> ### COMMANDS
> If you want to just use the bot, I'm currently hosting one which you can [invite from this link](https://discord.com/oauth2/authorize?client_id=795916241193140244)<br/>
> You can find all of the commands at [aeri's website](https://aeri.live)
> If you want to use any of the packages, ensure that you follow the Licencse of that package.
> And read the README for anything important

## Features
- [x] Display information from my own Rust API, with automatic caching.
- [x] Setup user accounts to display scores (which also get cached), or unlink
- [x] Wide spread use, can be used across multiple servers and only needs one setup!
- [x] Extremely fast and built in logging
- [x] Covers anime, manga, users, staff, studio, character and more to come
- [x] Includes OAuth

## Using Aeri

### Prequiries
- Docker         (v27.3.1)
- Docker Compose (v2.32.4)
- Rust           (2024 edition)
- Node           (v23.7.0)
- PNPM           (v9.9.0)

> [!CAUTION]
> It's likely to work on older versions, these are the ones that were used and tested. <br/>
> Use older versions at your own caution. If they don't proceed to work, try the same versions as us.

### Hosting Locally
1.  Use the `.env.example` as a base, you can do `cat .env.example > .env` and then use your preffered text editor to edit it.
2.  Ensure that the following values are set in your .env <br/>
    `POSTGRES_HOST` and `REDIS_HOST` are both `"localhost"` <br/>
    `API_HOST` is set to `"0.0.0.0"` or `"localhost` (either one should work, but test them both in case.) <br/>
    `WEBSITE_URL` is set to `http://localhost:5173` <br/>
    `ANILIST_REDIRECT_URL` is set to `http://0.0.0.0:8080/oauth/anilist` <br/>
3. Once you have them set, just run the following commands and you're good to go. <br/>
   `docker compose -f docker-compose.local.yml up`, `pnpm api`, `pnpm gateway`, `pnpm handler`, `pnpm website` <br/>

### Hosting On A Server
1.  Use the `.env.example` as a base, you can do `cat .env.example > .env` and then use your preffered text editor to edit it.
2.  Simply run `pnpm all` and it will build for docker and use the `.env` you created recently.

## Contributing to Aeri
If you feel like Aeri is missing certain features, or would like to see more stuff implemented<br/>
Feel free to open a pull requests or issue.

1. Fork the repository
2. Create a new branch: `git checkout -b '<branch_name>'`
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin '<aeri>/<location>'`
5. Create the pull request

## License
This project uses the following license: [MIT LICENSE](https://github.com/tomosfps/aeri/blob/main/LICENSE.md).