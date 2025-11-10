import { Church, FileText, Flower, Heart, Music2, Users } from "lucide-react";
import { KeySignature, LiturgicalSeason, LiturgicalYear } from "@/types/models";

export const liturgicalSeasonItems = [
    { label: "Advent", value: LiturgicalSeason.ADVENT },
    { label: "Christmas", value: LiturgicalSeason.CHRISTMAS },
    { label: "Ordinary Time", value: LiturgicalSeason.ORDINARY_TIME },
    { label: "Lent", value: LiturgicalSeason.LENT },
    { label: "Easter", value: LiturgicalSeason.EASTER },
    { label: "Pentecost", value: LiturgicalSeason.PENTECOST },
    { label: "Easter Triduum", value: LiturgicalSeason.TRIDUUM }
];

export const liturgyTemplates = [
    {
        id: "sunday-mass",
        name: "Sunday Mass",
        description: "Standard Sunday liturgy with common Mass parts",
        icon: Church,
        liturgy: "Sunday Mass",
        themes: [
            "Sunday Mass",
            "Ordinary Time"
        ],
        parts: [
            "Processional",
            "Kyrie",
            "Gloria",
            "Responsorial Psalm",
            "Gospel Acclamation",
            "Creed",
            "Prayers of the Faithful",
            "Offertory",
            "Consecration",
            "Sanctus",
            "Memorial Acclamation",
            "Pater Noster",
            "Agnus Dei",
            "Communion",
            "Recessional",
        ],
    },
    {
        id: "wedding",
        name: "Wedding",
        description: "Catholic nuptial Mass wedding ceremony",
        icon: Heart,
        liturgy: "Matrimony",
        themes: [
            "Wedding",
            "Matrimony",
            "Love and Unity",
            "Sacred Union"
        ],
        parts: [
            "Processional",
            "Responsorial Psalm",
            "Gospel Acclamation",
            "Prayers of the Faithful",
            "Offertory",
            "Sanctus",
            "Memorial Acclamation",
            "Pater Noster",
            "Agnus Dei",
            "Communion",
            "Signing the Register",
            "Recessional",
        ],
    },
    {
        id: "ordination",
        name: "Ordination",
        description: "Ordination ceremony with special liturgical parts",
        icon: Users,
        liturgy: "Ordination",
        themes: [
            "Ordination",
            "Holy Orders",
            "Vocation",
            "Holy Spirit",
            "Ministry",
            "Priest"
        ],
        parts: [
            "Processional",
            "Kyrie",
            "Gloria",
            "Responsorial Psalm",
            "Gospel Acclamation",
            "Litany of Saints",
            "Fraternal Kiss",
            "Offertory",
            "Consecration",
            "Sanctus",
            "Memorial Acclamation",
            "Pater Noster",
            "Agnus Dei",
            "Communion",
            "Recessional",
        ],
    },
    {
        id: "funeral",
        name: "Funeral",
        description: "Funeral Mass with appropriate liturgical selections",
        icon: Flower,
        liturgy: "Requiem Mass",
        themes: [
            "Funeral",
            "Requiem Mass",
            "Eternal Rest",
            "Resurrection",
            "Comfort"
        ],
        parts: [
            "Processional",
            "Kyrie",
            "Responsorial Psalm",
            "Gospel Acclamation",
            "Creed",
            "Prayers of the Faithful",
            "Offertory",
            "Sanctus",
            "Memorial Acclamation",
            "Pater Noster",
            "Agnus Dei",
            "Communion",
            "Song of Farewell",
            "Recessional",
        ],
    },
    {
        id: "weekday-mass",
        name: "Weekday Mass",
        description: "Weekday Mass with only essential Mass parts",
        icon: Music2,
        liturgy: "Mass",
        themes: [
            "Weekday Mass",
            "Mass",
            "Daily Mass"
        ],
        parts: [
            "Processional",
            "Offertory",
            "Communion",
            "Recessional"
        ],
    },
    {
        id: "blank",
        name: "Blank Template",
        description: "Start with an empty template and add your own parts",
        icon: FileText,
        liturgy: "",
        themes: [],
        parts: [],
    },
];

export const keySignatureItems: { label: string; value: KeySignature }[] = [
    { label: "C Major", value: KeySignature.C_MAJOR },
    { label: "G Major", value: KeySignature.G_MAJOR },
    { label: "D Major", value: KeySignature.D_MAJOR },
    { label: "A Major", value: KeySignature.A_MAJOR },
    { label: "E Major", value: KeySignature.E_MAJOR },
    { label: "B Major", value: KeySignature.B_MAJOR },
    { label: "F♯ Major", value: KeySignature.F_SHARP_MAJOR },
    { label: "C♯ Major", value: KeySignature.C_SHARP_MAJOR },
    { label: "F Major", value: KeySignature.F_MAJOR },
    { label: "B♭ Major", value: KeySignature.B_FLAT_MAJOR },
    { label: "E♭ Major", value: KeySignature.E_FLAT_MAJOR },
    { label: "A♭ Major", value: KeySignature.A_FLAT_MAJOR },
    { label: "D♭ Major", value: KeySignature.D_FLAT_MAJOR },
    { label: "G♭ Major", value: KeySignature.G_FLAT_MAJOR },
    { label: "C♭ Major", value: KeySignature.C_FLAT_MAJOR },

    { label: "A Minor", value: KeySignature.A_MINOR },
    { label: "E Minor", value: KeySignature.E_MINOR },
    { label: "B Minor", value: KeySignature.B_MINOR },
    { label: "F♯ Minor", value: KeySignature.F_SHARP_MINOR },
    { label: "C♯ Minor", value: KeySignature.C_SHARP_MINOR },
    { label: "G♯ Minor", value: KeySignature.G_SHARP_MINOR },
    { label: "D♯ Minor", value: KeySignature.D_SHARP_MINOR },
    { label: "A♯ Minor", value: KeySignature.A_SHARP_MINOR },
    { label: "D Minor", value: KeySignature.D_MINOR },
    { label: "G Minor", value: KeySignature.G_MINOR },
    { label: "C Minor", value: KeySignature.C_MINOR },
    { label: "F Minor", value: KeySignature.F_MINOR },
    { label: "B♭ Minor", value: KeySignature.B_FLAT_MINOR },
    { label: "E♭ Minor", value: KeySignature.E_FLAT_MINOR },
    { label: "A♭ Minor", value: KeySignature.A_FLAT_MINOR },
];

export const liturgicalYearItems = [
    { label: "Year A", value: LiturgicalYear.A },
    { label: "Year B", value: LiturgicalYear.B },
    { label: "Year C", value: LiturgicalYear.C },
]

export const vocalFachOptions = [
    // General voice types
    "Soprano",
    "Mezzo-Soprano",
    "Contralto",
    "Tenor",
    "Baritone",
    "Bass",

    // Common soprano fachs
    "Lyric Soprano",
    "Dramatic Soprano",
    "Coloratura Soprano",
    "Spinto Soprano",

    // Mezzo-soprano and contralto
    "Lyric Mezzo-Soprano",
    "Dramatic Mezzo-Soprano",
    "Coloratura Mezzo-Soprano",
    "Lyric Contralto",
    "Dramatic Contralto",

    // Tenor
    "Lyric Tenor",
    "Dramatic Tenor",
    "Heldentenor",

    // Baritone
    "Lyric Baritone",
    "Dramatic Baritone",
    "Verdi Baritone",

    // Bass
    "Basso Cantante",
    "Basso Profundo",
]

export const instrumentOptions = [
    {
        "name": "woodwind",
        "children": [
            {
                "name": "clarinet",
                "children": []
            },
            {
                "name": "saxophone",
                "children": []
            },
            {
                "name": "oboe",
                "children": []
            },
            {
                "name": "bassoon",
                "children": []
            },
            {
                "name": "flute",
                "children": []
            }
        ]
    },
    {
        "name": "percussion",
        "children": [
            {
                "name": "tambourine",
                "children": []
            },
            {
                "name": "xylophone",
                "children": []
            },
            {
                "name": "cymbals",
                "children": []
            },
            {
                "name": "drum",
                "children": []
            },
            {
                "name": "triangle",
                "children": []
            }
        ]
    },
    {
        "name": "voice",
        "children": [
            {
                "name": "alto",
                "children": []
            },
            {
                "name": "bass",
                "children": []
            },
            {
                "name": "soprano",
                "children": []
            },
            {
                "name": "tenor",
                "children": []
            }
        ]
    },
    {
        "name": "strings",
        "children": [
            {
                "name": "double bass",
                "children": []
            },
            {
                "name": "guitar",
                "children": []
            },
            {
                "name": "violin",
                "children": []
            },
            {
                "name": "cello",
                "children": []
            },
            {
                "name": "viola",
                "children": []
            },
            {
                "name": "harp",
                "children": []
            }
        ]
    },
    {
        "name": "brass",
        "children": [
            {
                "name": "french horn",
                "children": []
            },
            {
                "name": "tuba",
                "children": []
            },
            {
                "name": "trumpet",
                "children": []
            },
            {
                "name": "trombone",
                "children": []
            },
            {
                "name": "euphonium",
                "children": []
            }
        ]
    },
    {
        "name": "keyboards",
        "children": [
            {
                "name": "harpsichord",
                "children": []
            },
            {
                "name": "piano",
                "children": []
            },
            {
                "name": "organ",
                "children": []
            },
            {
                "name": "accordion",
                "children": []
            }
        ]
    }
]

export const genreOptions = [
    "contemporary liturgical",
    "liturgical canticle",
    "gospel",
    "antiphon",
    "oratorios",
    "chant",
    "polyphony",
    "contemporary classical",
    "hymn",
    "children",
    "motet",
    "gregorian chant",
    "classical"
]
