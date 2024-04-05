class Team {
  constructor(abbreviation, city, conference, name ) {
    this.abbreviation = abbreviation;
    this.city = city;
    this.conference = conference;
    this.name = name;
    this.nameWOSpaces=((name).replaceAll(' ', '')).toUpperCase();
  }

  toString() {
    // eslint-disable-next-line max-len
    return `Abbreviation: ${this.abbreviation}\nCity: ${this.city}\nConference: ${this.conference}\nName: ${this.name}`;
  }
}

module.exports = Team;
