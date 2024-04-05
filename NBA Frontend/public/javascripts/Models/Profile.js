class Profile {
  constructor(profileTitle, favouriteGame, discord, twitter, youtube, website) {
    this.profileTitle = profileTitle;
    this.favouriteGame = favouriteGame;
    this.discord = discord;
    this.twitter = twitter;
    this.youtube = youtube;
    this.website = website;
  }

  toString() {
    return `
      Profile Title: ${this.profileTitle}
      Favorite Game: ${this.favouriteGame}
      Discord: ${this.discord}
      Twitter: ${this.twitter}
      YouTube: ${this.youtube}
      Website: ${this.website}
    `;
  }
}

module.exports = Profile;
