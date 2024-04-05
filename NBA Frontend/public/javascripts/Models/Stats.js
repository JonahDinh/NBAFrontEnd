class Stats {
  constructor(
      gamesPlayed,
      playerId,
      season,
      totalRebounds,
      assists,
      steals,
      blocks,
      points,
  ) {
    this.gamesPlayed = gamesPlayed;
    this.playerId = playerId;
    this.season = season;
    this.totalRebounds = totalRebounds;
    this.assists = assists;
    this.steals = steals;
    this.blocks = blocks;
    this.points = points;
  }
}

module.exports = Stats;

