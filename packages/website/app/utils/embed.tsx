export const embedFields = [
    {
      title: "Search Any Anime",
      description: "Find detailed information about any anime with a simple command. Get synopses, ratings, episodes and more!",
      embed: {
        type: 'anime',
        title: "One Piece",
        thumbnail: "/images/features/one_piece_anime.jpg",
        fields: [
          { name: "Total Episodes", value: "1000+" },
          { name: "Status", value: "Ongoing" },
          { name: "Average Score", value: "8.7/10" },
          { name: "Mean Score", value: "86%" },
          { name: "Popularity", value: "#1" },
          { name: "Favourites", value: "80,345" },
          { name: "Start Date", value: "Oct 20, 1999" },
          { name: "End Date", value: "Still Airing" },
          { name: "Genres", value: "Action, Adventure, Fantasy" },
        ],
        color: 'var(--pastel-pink)',
        footer: "Information powered by AniList"
      },
      align: "right",
      emoji: "🔍",
      command: "/anime name:One Piece"
    },
    {
      title: "Track Your Watchlist",
      description: "Keep track of what you're watching, completed shows, and your plan-to-watch list. Aeri remembers everything for you!",
      embed: {
        type: 'user',
        title: "JavaScript's Profile",
        thumbnail: "https://s4.anilist.co/file/anilistcdn/user/avatar/large/b796884-G3JpzVbxdP9J.png",
        fields: [
          { name: "Anime Information", value: "" },
          { name: "Anime Count", value: "170" },
          { name: "Mean Score", value: "60.72" },
          { name: "Episodes Watched", value: "4,216" },
          { name: "Watch Time", value: "10 weeks, 1 day" },
          { name: "Manga Information", value: "" },
          { name: "Manga Count", value: "35" },
          { name: "Mean Score", value: "78.39" },
          { name: "Chapters Read", value: "7,296" },
          { name: "Volumes Read", value: "374" },
          { name: "Other Statistics", value: "" },
          { name: "Total Entries", value: "176" },
          { name: "Top Genre", value: "Action" },
          { name: "Favourite Format", value: "TV" },
          { name: "Completion Rate", value: "93%" },
        ],
        color: 'var(--pastel-blue)',
        footer: "Synced with AniList"
      },
      align: "left",
      emoji: "📝",
      command: "/user name:JavaScript"
    },
    {
      title: "Discover Manga",
      description: "Find your next favorite manga with detailed information including chapters, status, scores, and more!",
      embed: {
        type: 'manga',
        title: "Jujutsu Kaisen",
        thumbnail: "/images/features/jjk_manga.jpg",
        fields: [
          { name: "Total Chapters", value: "237+" },
          { name: "Status", value: "Publishing" },
          { name: "Average Score", value: "9.1/10" },
          { name: "Mean Score", value: "88%" },
          { name: "Popularity", value: "#3" },
          { name: "Favourites", value: "42,689" },
          { name: "Start Date", value: "Mar 5, 2018" },
          { name: "End Date", value: "Still Publishing" },
          { name: "Genres", value: "Action, Supernatural, Horror" },
        ],
        color: 'var(--pastel-pink)',
        footer: "Information powered by AniList"
      },
      align: "right",
      emoji: "✨",
      command: "/manga name:Jujutsu Kaisen"
    }
];