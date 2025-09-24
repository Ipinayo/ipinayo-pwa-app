export interface LiturgicalTemplate {
  id: string
  name: string
  description: string
  season?: string
  parts: {
    partName: string
    required: boolean
    description?: string
    suggestions?: string[]
  }[]
}

export const liturgicalTemplates: LiturgicalTemplate[] = [
  {
    id: "ordinary-time",
    name: "Ordinary Time Mass",
    description: "Standard Sunday Mass during Ordinary Time",
    season: "Ordinary Time",
    parts: [
      {
        partName: "Entrance Hymn",
        required: true,
        description: "Opening song to gather the community",
        suggestions: ["Gather Us In", "All Are Welcome", "Come, Christians, Join to Sing"],
      },
      {
        partName: "Kyrie",
        required: true,
        description: "Lord, have mercy",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Mass of the Angels"],
      },
      {
        partName: "Gloria",
        required: true,
        description: "Glory to God in the highest",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Mass of the Angels"],
      },
      {
        partName: "Responsorial Psalm",
        required: true,
        description: "Response to the first reading",
      },
      {
        partName: "Gospel Acclamation",
        required: true,
        description: "Alleluia before the Gospel",
        suggestions: ["Celtic Alleluia", "Mass of Creation", "Festival Alleluia"],
      },
      {
        partName: "Offertory Hymn",
        required: true,
        description: "Song during the preparation of gifts",
        suggestions: ["Take Our Bread", "We Gather Together", "Blessed Be God"],
      },
      {
        partName: "Holy, Holy, Holy",
        required: true,
        description: "Sanctus",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Mass of the Angels"],
      },
      {
        partName: "Memorial Acclamation",
        required: true,
        description: "When we eat this Bread...",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Mass of the Angels"],
      },
      {
        partName: "Great Amen",
        required: true,
        description: "Concluding acclamation of the Eucharistic Prayer",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Mass of the Angels"],
      },
      {
        partName: "Lamb of God",
        required: true,
        description: "Agnus Dei",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Mass of the Angels"],
      },
      {
        partName: "Communion Hymn",
        required: true,
        description: "Song during communion",
        suggestions: ["I Am the Bread of Life", "One Bread, One Body", "Taste and See"],
      },
      {
        partName: "Recessional Hymn",
        required: true,
        description: "Closing song",
        suggestions: ["Go Make a Difference", "City of God", "Sent Forth by God's Blessing"],
      },
    ],
  },
  {
    id: "advent",
    name: "Advent Mass",
    description: "Mass during the Advent season",
    season: "Advent",
    parts: [
      {
        partName: "Entrance Hymn",
        required: true,
        description: "Advent-themed opening song",
        suggestions: ["O Come, O Come Emmanuel", "Come, Lord Jesus", "Maranatha, Come"],
      },
      {
        partName: "Kyrie",
        required: true,
        description: "Lord, have mercy",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Responsorial Psalm",
        required: true,
        description: "Response to the first reading",
      },
      {
        partName: "Gospel Acclamation",
        required: true,
        description: "Alleluia before the Gospel (or Gospel Acclamation during Advent)",
        suggestions: ["Advent Gospel Acclamation", "Come, Lord Jesus"],
      },
      {
        partName: "Offertory Hymn",
        required: true,
        description: "Song during the preparation of gifts",
        suggestions: ["Wait for the Lord", "Come, Lord Jesus", "Prepare the Way"],
      },
      {
        partName: "Holy, Holy, Holy",
        required: true,
        description: "Sanctus",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Memorial Acclamation",
        required: true,
        description: "When we eat this Bread...",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Great Amen",
        required: true,
        description: "Concluding acclamation of the Eucharistic Prayer",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Lamb of God",
        required: true,
        description: "Agnus Dei",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Communion Hymn",
        required: true,
        description: "Song during communion",
        suggestions: ["O Come, O Come Emmanuel", "Come, Lord Jesus", "Wait for the Lord"],
      },
      {
        partName: "Recessional Hymn",
        required: true,
        description: "Closing song",
        suggestions: ["Come, Lord Jesus", "Maranatha, Come", "O Come, Divine Messiah"],
      },
    ],
  },
  {
    id: "christmas",
    name: "Christmas Mass",
    description: "Mass during the Christmas season",
    season: "Christmas",
    parts: [
      {
        partName: "Entrance Hymn",
        required: true,
        description: "Christmas-themed opening song",
        suggestions: ["O Come, All Ye Faithful", "Joy to the World", "Angels We Have Heard on High"],
      },
      {
        partName: "Gloria",
        required: true,
        description: "Glory to God in the highest (especially important at Christmas)",
        suggestions: ["Mass of Creation", "Angels We Have Heard on High", "Gloria in Excelsis"],
      },
      {
        partName: "Responsorial Psalm",
        required: true,
        description: "Response to the first reading",
      },
      {
        partName: "Gospel Acclamation",
        required: true,
        description: "Alleluia before the Gospel",
        suggestions: ["Celtic Alleluia", "Christmas Alleluia", "Festival Alleluia"],
      },
      {
        partName: "Offertory Hymn",
        required: true,
        description: "Song during the preparation of gifts",
        suggestions: ["What Child Is This", "The First Noel", "Mary Had a Baby"],
      },
      {
        partName: "Holy, Holy, Holy",
        required: true,
        description: "Sanctus",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Memorial Acclamation",
        required: true,
        description: "When we eat this Bread...",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Great Amen",
        required: true,
        description: "Concluding acclamation of the Eucharistic Prayer",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Lamb of God",
        required: true,
        description: "Agnus Dei",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Communion Hymn",
        required: true,
        description: "Song during communion",
        suggestions: ["Silent Night", "O Holy Night", "Mary Had a Baby"],
      },
      {
        partName: "Recessional Hymn",
        required: true,
        description: "Closing song",
        suggestions: ["Joy to the World", "Go Tell It on the Mountain", "Hark! The Herald Angels Sing"],
      },
    ],
  },
  {
    id: "lent",
    name: "Lenten Mass",
    description: "Mass during the Lenten season",
    season: "Lent",
    parts: [
      {
        partName: "Entrance Hymn",
        required: true,
        description: "Lenten-themed opening song",
        suggestions: ["Lord, Who Throughout These Forty Days", "Somebody's Knockin'", "Return to God"],
      },
      {
        partName: "Kyrie",
        required: true,
        description: "Lord, have mercy (especially important during Lent)",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior", "Lenten Kyrie"],
      },
      {
        partName: "Responsorial Psalm",
        required: true,
        description: "Response to the first reading",
      },
      {
        partName: "Gospel Acclamation",
        required: true,
        description: "Lenten Gospel Acclamation (not Alleluia)",
        suggestions: ["Praise to You, Lord Jesus Christ", "Glory and Praise to You", "Lenten Gospel Acclamation"],
      },
      {
        partName: "Offertory Hymn",
        required: true,
        description: "Song during the preparation of gifts",
        suggestions: ["Tree of Life", "Hosea", "Again We Keep This Solemn Fast"],
      },
      {
        partName: "Holy, Holy, Holy",
        required: true,
        description: "Sanctus",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Memorial Acclamation",
        required: true,
        description: "When we eat this Bread...",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Great Amen",
        required: true,
        description: "Concluding acclamation of the Eucharistic Prayer",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Lamb of God",
        required: true,
        description: "Agnus Dei",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Communion Hymn",
        required: true,
        description: "Song during communion",
        suggestions: ["Jesus, Remember Me", "Eat This Bread", "Be Not Afraid"],
      },
      {
        partName: "Recessional Hymn",
        required: true,
        description: "Closing song",
        suggestions: ["Lord, Who Throughout These Forty Days", "Parce Domine", "Return to God"],
      },
    ],
  },
  {
    id: "easter",
    name: "Easter Mass",
    description: "Mass during the Easter season",
    season: "Easter",
    parts: [
      {
        partName: "Entrance Hymn",
        required: true,
        description: "Easter-themed opening song",
        suggestions: ["Jesus Christ Is Risen Today", "Alleluia! Alleluia!", "This Is the Day"],
      },
      {
        partName: "Gloria",
        required: true,
        description: "Glory to God in the highest (returns after Lent)",
        suggestions: ["Mass of Creation", "Easter Gloria", "Festival Gloria"],
      },
      {
        partName: "Responsorial Psalm",
        required: true,
        description: "Response to the first reading",
      },
      {
        partName: "Gospel Acclamation",
        required: true,
        description: "Alleluia before the Gospel (returns after Lent)",
        suggestions: ["Celtic Alleluia", "Easter Alleluia", "Festival Alleluia"],
      },
      {
        partName: "Offertory Hymn",
        required: true,
        description: "Song during the preparation of gifts",
        suggestions: ["We Know That Christ Is Raised", "Alleluia! Alleluia!", "That Easter Day with Joy Was Bright"],
      },
      {
        partName: "Holy, Holy, Holy",
        required: true,
        description: "Sanctus",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Memorial Acclamation",
        required: true,
        description: "When we eat this Bread...",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Great Amen",
        required: true,
        description: "Concluding acclamation of the Eucharistic Prayer",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Lamb of God",
        required: true,
        description: "Agnus Dei",
        suggestions: ["Mass of Creation", "Mass of Christ the Savior"],
      },
      {
        partName: "Communion Hymn",
        required: true,
        description: "Song during communion",
        suggestions: ["I Am the Bread of Life", "Alleluia! Alleluia!", "We Know That Christ Is Raised"],
      },
      {
        partName: "Recessional Hymn",
        required: true,
        description: "Closing song",
        suggestions: ["Jesus Christ Is Risen Today", "Go Make a Difference", "Alleluia! Alleluia!"],
      },
    ],
  },
]

export function getTemplateById(id: string): LiturgicalTemplate | undefined {
  return liturgicalTemplates.find((template) => template.id === id)
}

export function getTemplatesBySeasons(seasons: string[]): LiturgicalTemplate[] {
  return liturgicalTemplates.filter((template) => template.season && seasons.includes(template.season))
}
