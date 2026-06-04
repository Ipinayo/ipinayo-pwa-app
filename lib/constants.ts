import { Church, FileText, Flower, Heart, Music2, Users } from "lucide-react";
import { KeySignature, LiturgicalSeason, LiturgicalYear } from "@/types/models";

import { ActivityEventMap } from '../types/utils';

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
        "name": "Woodwind",
        "children": [
            {
                "name": "Clarinet",
                "children": []
            },
            {
                "name": "Saxophone",
                "children": []
            },
            {
                "name": "Oboe",
                "children": []
            },
            {
                "name": "Bassoon",
                "children": []
            },
            {
                "name": "Flute",
                "children": []
            }
        ]
    },
    {
        "name": "Percussion",
        "children": [
            {
                "name": "Tambourine",
                "children": []
            },
            {
                "name": "Xylophone",
                "children": []
            },
            {
                "name": "Cymbals",
                "children": []
            },
            {
                "name": "Drum",
                "children": []
            },
            {
                "name": "Triangle",
                "children": []
            }
        ]
    },
    {
        "name": "Voice",
        "children": [
            {
                "name": "Alto",
                "children": []
            },
            {
                "name": "Bass",
                "children": []
            },
            {
                "name": "Soprano",
                "children": []
            },
            {
                "name": "Tenor",
                "children": []
            }
        ]
    },
    {
        "name": "Strings",
        "children": [
            {
                "name": "Double Bass",
                "children": []
            },
            {
                "name": "Guitar",
                "children": []
            },
            {
                "name": "Violin",
                "children": []
            },
            {
                "name": "Cello",
                "children": []
            },
            {
                "name": "Viola",
                "children": []
            },
            {
                "name": "Harp",
                "children": []
            }
        ]
    },
    {
        "name": "Brass",
        "children": [
            {
                "name": "French Horn",
                "children": []
            },
            {
                "name": "Tuba",
                "children": []
            },
            {
                "name": "Trumpet",
                "children": []
            },
            {
                "name": "Trombone",
                "children": []
            },
            {
                "name": "Euphonium",
                "children": []
            }
        ]
    },
    {
        "name": "Keyboards",
        "children": [
            {
                "name": "Harpsichord",
                "children": []
            },
            {
                "name": "Piano",
                "children": []
            },
            {
                "name": "Organ",
                "children": []
            },
            {
                "name": "Accordion",
                "children": []
            }
        ]
    }
]

export const genreOptions = [
    "Contemporary Liturgical",
    "Liturgical Canticle",
    "Gospel",
    "Antiphon",
    "Oratorios",
    "Chant",
    "Polyphony",
    "Contemporary Classical",
    "Hymn",
    "Children",
    "Motet",
    "Gregorian Chant",
    "Classical"
]

export const seasonsFilter = [
    { label: "All Seasons", value: "all" },
    ...liturgicalSeasonItems,
];

export const yearsFilter = [{ label: "All Years", value: "all" }, ...liturgicalYearItems];

export const typesFilter = [
    { label: "All", value: "all" },
    { label: "Public", value: "true" },
    { label: "Private", value: "false" },
];

export const userNotificationEvents: Partial<Record<keyof ActivityEventMap, { label: string; description: string; default: { inApp: boolean; email: boolean; push: boolean } }>> = {
    "selection.created_by_self": {
        label: "Selection Created",
        description: "These are notifications for selections you create",
        default: { inApp: false, email: false, push: false },
    },
    "selection.cloned_by_self": {
        label: "Selection Cloned",
        description: "These are notifications for when you clone a selection",
        default: { inApp: false, email: false, push: false },
    },
    "selection.cloned_by_other": {
        label: "Your Selection Cloned",
        description: "These are notifications for when someone clones your selection",
        default: { inApp: true, email: false, push: true },
    },
    "selection.updated_by_self": {
        label: "Selection Updated",
        description: "These are notifications for when you update a selection",
        default: { inApp: false, email: false, push: false },
    },
    "selection.deleted_by_self": {
        label: "Selection Deleted",
        description: "These are notifications for when you delete a selection",
        default: { inApp: false, email: false, push: false },
    },
    "draft.created_by_self": {
        label: "Draft Created",
        description: "These are notifications for when you create a new draft",
        default: { inApp: false, email: false, push: false },
    },
    "draft.updated_by_self": {
        label: "Draft Updated",
        description: "These are notifications for when you update a draft",
        default: { inApp: false, email: false, push: false },
    },
    "draft.expiring": {
        label: "Draft Expiring",
        description: "These are notifications for when your draft is about to expire",
        default: { inApp: true, email: true, push: true },
    },
    "draft.expired": {
        label: "Draft Expired",
        description: "These are notifications for when your draft has expired and will be automatically deleted",
        default: { inApp: true, email: true, push: true },
    },
    "draft.deleted_by_self": {
        label: "Draft Deleted",
        description: "These are notifications for when you delete a draft",
        default: { inApp: false, email: false, push: false },
    },
    "draft.deleted_by_other": {
        label: "My Draft Deleted",
        description: "These are notifications for when someone else deletes your draft",
        default: { inApp: true, email: false, push: true },
    },
    "system.announcement": {
        label: "System Announcements",
        description: "Important updates from Ìpínayò.",
        default: { inApp: true, email: true, push: true },
    }
}