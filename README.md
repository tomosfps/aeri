# Aeri
A Discord bot made using the Anilist API, built in Python + Rust.

> [!WARNING]
> ### INTENDED USE
> This API is mainly to be used with [Aeri](https://github.com/devtomos/aeri), a discord bot that I made<br/>
> To automatically grab scores and display information. If you feel the need<br/>
> That certain things should be implemented, refer to [Contributing to API](#contributing-to-the-api)

## Features
- [x] Cache scores for media, media itself and user information
- [x] Dynamic caching for media (if they're airing it'll refresh the cache 2 afters the next episode aires.)
- [x] Multiple endpoints with ease of use
- [x] Extremely fast and built in logging
- [x] Requires little to none setup

## Using Aeri API

1.  Use the `.env.example` to create an `.env` file
2.  Once setup the `.env` file, ensure you have both Docker and Docker Compose installed for your system
3.  Run `docker compose build && docker compose up`
4.  View the endpoints and their methods to use the API

The API is typically on `0.0.0.0:8080` but can be changed through the `.env` file.

## Available Endpoints

<details>
    <summary><strong>/relations</strong></summary>

    - Method:        POST
    - Description:   Search for media by their name and media type, getting the closest relations to that media.
    - Parameters:
        - media_name (String): The title of the media to search for.
        - media_type (String): The type of media (ANIME or MANGA).
    - Response:      JSON
</details>

<details>
    <summary><strong>/media</strong></summary>

    - Method:        POST
    - Description:   Search for a media by their ID and type.
    - Parameters:
        - media_id   (32bit Integer): The ID of the media
        - media_type (String)       : The type of media (ANIME or MANGA).
    - Response:      JSON
</details>

<details>
    <summary><strong>/user</strong></summary>

    - Method:        POST
    - Description:   Get user profile information.
    - Parameters:
        - username  (String): The username of the user.
    - Response:     JSON
</details>

<details>
    <summary><strong>/user/score</strong></summary>
    
    - Method:        POST
    - Description:   Get specific scores, progression (manga included) for a media
    - Parameters:
        - user_id   (32bit Integer): The ID of the user
        - media_id  (32bit Integer): The ID of the media
    - Response:     JSON
</details>

## Example usage
In case you need more help on how to use the API.<br/>
I've left a few examples on how to use the endpoints in different languages.

```python
# Python example using requests library
import requests

url = "http://0.0.0.0:8080/media"
data = {
    "media_id": 170083,
    "media_type": "ANIME"
}

response = requests.post(url, json=data)
print(response.json())
```

```javascript
// JavaScript example using fetch API
const url = "http://0.0.0.0:8080/media";
const data = {
    media_id: 170083,
    media_type: "ANIME"
};

fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));
```

```bash
# cURL example
curl -X POST http://0.0.0.0:8080/media \
-H "Content-Type: application/json" \
-d '{"media_id": 170083, "media_type": "ANIME"}'
```


## Contributing to the API
If you feel like Aeri-API is missing certain features, or would like to see more stuff implemented<br/>
Feel free to open a pull requests or issue.

1. Fork the repository
2. Create a new branch: `git checkout -b '<branch_name>'`
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin '<aeri-api>/<location>'`
5. Create the pull request

## License
This project uses the following license: [MIT LICENSE](https://github.com/devtomos/aeri-api/blob/main/LICENSE.md).