import { KeySignature, LiturgicalSeason, LiturgicalYear, Prisma, PrismaClient } from '@/lib/generated/prisma'

import { capitalize } from '@/lib/utils'

const prisma = new PrismaClient()

export type NewMassSelection = Omit<Prisma.MassSelectionCreateInput, 'id' | 'updatedAt' | 'createdBy' | 'themes' | 'parishLocation'> & {
    themes: string[]
    parts: Omit<Prisma.MassPartCreateInput, 'massSelection'>[]
    parishLocation?: Prisma.LocationCreateInput
};

export async function saveSelection(selection: NewMassSelection, userId: string) {

    const { parts, date, themes, parishLocation, ...rest } = selection

    const data: Prisma.MassSelectionCreateInput = {
        ...rest,
        date: new Date(date),
        themes: {
            connectOrCreate: themes.map(name => ({
                where: { name: name.toLowerCase() },
                create: { name: name.toLowerCase() }
            }))
        },
        parts: {
            create:
                parts?.map((part, index) => ({
                    partName: part.partName,
                    keySignature: part.keySignature,
                    notes: part.notes,
                    songTitle: part.songTitle,
                    order: index,
                })) || [],
        },
        createdBy: {
            connect: { id: userId }
        },
    }

    if (parishLocation && parishLocation.country) {
        data.parishLocation = {
            connectOrCreate: {
                where: {
                    country_state_city: {
                        country: parishLocation.country,
                        state: parishLocation.state || '',
                        city: capitalize(parishLocation.city || ''),
                    }
                },
                create: {
                    country: parishLocation.country,
                    countryCode: parishLocation.countryCode,
                    state: parishLocation.state,
                    stateCode: parishLocation.stateCode,
                    city: capitalize(parishLocation.city || ''),
                    latitude: parishLocation.latitude,
                    longitude: parishLocation.longitude,
                    timezone: parishLocation.timezone,
                }
            }
        }
    }

    return await prisma.massSelection.create({
        data
    })

}

async function main() {
    console.log('Starting database seeding...')

    // Clean existing data (optional - remove if you want to preserve existing data)
    await prisma.massPart.deleteMany()
    await prisma.massSelection.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.verificationToken.deleteMany()

    console.log('Cleaned existing data...')

    // Create Users
    const users = await Promise.all([
        // User 1: Experienced Music Director
        prisma.user.create({
            data: {
                name: 'Father Michael Rodriguez',
                email: 'frmichael@stmarys.org',
                emailVerified: new Date(),
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                createdAt: new Date('2023-01-15'),
                profile: {
                    create: {
                        bio: 'Parish priest and liturgical music coordinator with 15 years of experience. Specializes in traditional and contemporary Catholic liturgical music.',
                    }
                }
            }
        }),

        // User 2: Young Parish Music Leader
        prisma.user.create({
            data: {
                name: 'Sarah Thompson',
                email: 'sarah.music@holyfamily.org',
                emailVerified: new Date(),
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
                createdAt: new Date('2023-03-22'),
                profile: {
                    create: {
                        bio: 'Young adult ministry music leader with a passion for modern worship and youth engagement in liturgy.',
                    }
                }
            }
        }),

        // User 3: Traditional Choir Director
        prisma.user.create({
            data: {
                name: 'Margaret Catherine O\'Brien',
                email: 'margaret.obrien@cathedral.org',
                emailVerified: new Date(),
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
                createdAt: new Date('2022-11-08'),
                profile: {
                    create: {
                        bio: 'Cathedral choir director with expertise in Gregorian chant, polyphony, and traditional Catholic sacred music. 25+ years experience.',
                    }
                }
            }
        }),

        // User 4: Bilingual Music Minister
        prisma.user.create({
            data: {
                name: 'Carlos Mendoza',
                email: 'carlos.mendoza@guadalupe.org',
                emailVerified: new Date(),
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
                createdAt: new Date('2023-05-12'),
                profile: {
                    create: {
                        bio: 'Bilingual music minister serving diverse Hispanic community. Specializes in Spanish liturgical music and contemporary Catholic worship.',
                    }
                }
            }
        }),

        // User 5: New/Learning User
        prisma.user.create({
            data: {
                name: 'Emily Grace Wilson',
                email: 'emily.wilson@newparish.org',
                emailVerified: null, // Not yet verified
                image: null,
                createdAt: new Date('2024-01-20'),
                profile: {
                    create: {
                        bio: 'New to liturgical music planning. Recently appointed as volunteer music coordinator, eager to learn and serve the parish community.',
                    }
                }
            }
        })
    ])

    console.log('Created users...')

    // Helper function to get random future Sundays for different liturgical seasons
    const getSeasonDates = () => {
        const now = new Date()
        return {
            advent: new Date(2024, 11, 8), // December 8, 2024 (2nd Sunday of Advent)
            christmas: new Date(2024, 11, 29), // December 29, 2024 (Holy Family)
            ordinary1: new Date(2024, 1, 11), // February 11, 2024 (6th Sunday in Ordinary Time)
            lent: new Date(2024, 2, 17), // March 17, 2024 (5th Sunday of Lent)
            easter: new Date(2024, 4, 12), // May 12, 2024 (7th Sunday of Easter)
            ordinary2: new Date(2024, 8, 22), // September 22, 2024 (25th Sunday in Ordinary Time)
            allSaints: new Date(2024, 10, 3), // November 3, 2024 (31st Sunday in Ordinary Time)
        }
    }

    const seasonDates = getSeasonDates()

    // Mass Parts templates for different types of Masses
    const massPartsTemplates = {
        traditional: [
            { partName: 'Entrance', songTitle: 'Kyrie Eleison', keySignature: KeySignature.D_MAJOR, notes: 'Traditional Greek Kyrie, slow tempo' },
            { partName: 'Gloria', songTitle: 'Gloria in Excelsis Deo', keySignature: KeySignature.G_MAJOR, notes: 'Latin Gloria, congregation joins on refrain' },
            { partName: 'Alleluia', songTitle: 'Celtic Alleluia', keySignature: KeySignature.F_MAJOR, notes: 'Simple melody for congregation' },
            { partName: 'Offertory', songTitle: 'Ave Maria', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Schubert arrangement, solo with organ' },
            { partName: 'Sanctus', songTitle: 'Holy, Holy, Holy', keySignature: KeySignature.E_FLAT_MAJOR, notes: 'Traditional chant setting' },
            { partName: 'Communion', songTitle: 'Panis Angelicus', keySignature: KeySignature.A_FLAT_MAJOR, notes: 'Choir with organ accompaniment' },
            { partName: 'Recessional', songTitle: 'Te Deum', keySignature: KeySignature.D_MAJOR, notes: 'Triumphant closing hymn' }
        ],
        contemporary: [
            { partName: 'Entrance', songTitle: 'Here I Am, Lord', keySignature: KeySignature.C_MAJOR, notes: 'Guitar and piano arrangement' },
            { partName: 'Gloria', songTitle: 'Mass of Creation Gloria', keySignature: KeySignature.G_MAJOR, notes: 'Full congregation participation' },
            { partName: 'Alleluia', songTitle: 'Gospel Acclamation', keySignature: KeySignature.D_MAJOR, notes: 'Contemporary setting with keyboard' },
            { partName: 'Offertory', songTitle: 'Make Me a Channel of Your Peace', keySignature: KeySignature.F_MAJOR, notes: 'Solo with guitar accompaniment' },
            { partName: 'Sanctus', songTitle: 'Holy is the Lord', keySignature: KeySignature.A_MAJOR, notes: 'Contemporary Mass setting' },
            { partName: 'Communion', songTitle: 'Bread of Life', keySignature: KeySignature.E_MAJOR, notes: 'Meditative with soft instrumentation' },
            { partName: 'Recessional', songTitle: 'Go Make a Difference', keySignature: KeySignature.C_MAJOR, notes: 'Upbeat missionary sending song' }
        ],
        bilingual: [
            { partName: 'Entrada', songTitle: 'Pescador de Hombres', keySignature: KeySignature.A_MINOR, notes: 'Spanish entrance hymn with guitar' },
            { partName: 'Gloria', songTitle: 'Gloria (Bilingual)', keySignature: KeySignature.F_MAJOR, notes: 'Alternating Spanish and English verses' },
            { partName: 'Alleluia', songTitle: 'Aleluya', keySignature: KeySignature.G_MAJOR, notes: 'Spanish Gospel acclamation' },
            { partName: 'Ofertorio', songTitle: 'Vengan Todos / Come All You People', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Bilingual offertory song' },
            { partName: 'Santo', songTitle: 'Santo, Santo, Santo', keySignature: KeySignature.D_MAJOR, notes: 'Spanish Sanctus with congregation' },
            { partName: 'Comunión', songTitle: 'Pan de Vida', keySignature: KeySignature.C_MAJOR, notes: 'Spanish communion song' },
            { partName: 'Salida', songTitle: 'Vayan en Paz / Go in Peace', keySignature: KeySignature.E_MAJOR, notes: 'Bilingual recessional' }
        ],
        simple: [
            { partName: 'Entrance', songTitle: 'Come and See', keySignature: KeySignature.G_MAJOR, notes: 'Easy melody for new choir' },
            { partName: 'Glory to God', songTitle: 'Simple Gloria', keySignature: KeySignature.C_MAJOR, notes: 'One octave range, easy harmonies' },
            { partName: 'Alleluia', songTitle: 'Alleluia (Simple)', keySignature: KeySignature.F_MAJOR, notes: 'Three-chord progression' },
            { partName: 'Offertory', songTitle: 'We Offer Our Gifts', keySignature: KeySignature.D_MAJOR, notes: 'Instrumental version available' },
            { partName: 'Holy', songTitle: 'Holy God', keySignature: KeySignature.A_MAJOR, notes: 'Repetitive, easy to learn' },
            { partName: 'Communion', songTitle: 'Jesus, Bread of Life', keySignature: KeySignature.G_MAJOR, notes: 'Gentle, contemplative' },
            { partName: 'Closing', songTitle: 'Thanks Be to God', keySignature: KeySignature.D_MAJOR, notes: 'Short and joyful' }
        ],
        seasonal: [
            { partName: 'Entrance', songTitle: 'O Come, O Come Emmanuel', keySignature: KeySignature.E_MINOR, notes: 'Advent entrance antiphon' },
            { partName: 'Gloria', songTitle: 'Angels We Have Heard on High', keySignature: KeySignature.F_MAJOR, notes: 'Christmas Gloria with descant' },
            { partName: 'Alleluia', songTitle: 'Lenten Gospel Acclamation', keySignature: KeySignature.A_MINOR, notes: 'Solemn Lenten tone, no alleluia' },
            { partName: 'Offertory', songTitle: 'Were You There', keySignature: KeySignature.D_MINOR, notes: 'Lenten offertory hymn' },
            { partName: 'Sanctus', songTitle: 'Easter Sanctus', keySignature: KeySignature.D_MAJOR, notes: 'Joyful Easter setting with brass' },
            { partName: 'Communion', songTitle: 'Jesus Christ Is Risen Today', keySignature: KeySignature.C_MAJOR, notes: 'Easter communion song' },
            { partName: 'Recessional', songTitle: 'Crown Him with Many Crowns', keySignature: KeySignature.A_MAJOR, notes: 'Christ the King recessional' }
        ]
    }

    // Create comprehensive Mass Selections covering various scenarios
    const massSelections = []

    // Fr. Michael's Mass Selections (Traditional/Mixed approach)
    massSelections.push(
        // Advent Mass - Public
        await saveSelection({
            title: '2nd Sunday of Advent - Hope and Preparation',
            date: seasonDates.advent,
            liturgicalYear: LiturgicalYear.A,
            liturgicalSeason: LiturgicalSeason.ADVENT,
            liturgy: 'Sunday Mass',
            themes: ['hope', 'john the baptist', 'preparation', 'waiting'],
            pastoralFocus: 'Preparing hearts for Christ\'s coming, emphasis on hope and repentance',
            isPublic: true,
            createdAt: new Date('2024-11-15'),
            parishName: 'St. Mary\'s Cathedral',
            choirName: 'Cathedral Schola Cantorum',
            parishLocation: {
                country: 'United States',
                state: 'California',
                city: 'San Francisco',
                countryCode: 'US',
                stateCode: 'CA',
                latitude: 37.7749,
                longitude: -122.4194,
                timezone: 'America/Los_Angeles'
            },
            parts: massPartsTemplates.traditional.map(part => ({
                ...part,
                songTitle: part.partName === 'Entrance' ? 'O Come, O Come Emmanuel' : part.songTitle,
                keySignature: part.partName === 'Entrance' ? KeySignature.E_MINOR : part.keySignature,
                notes: part.partName === 'Entrance' ? 'Verse 2: O come, Thou Wisdom from on high. Choir begins, congregation joins verse 2' : part.notes
            }))
        }, users[0].id),

        // Christmas Mass - Public
        await saveSelection({
            title: 'Feast of the Holy Family - Christmas Season',
            date: seasonDates.christmas,
            liturgicalYear: LiturgicalYear.B,
            liturgicalSeason: LiturgicalSeason.CHRISTMAS,
            liturgy: 'Sunday Mass',
            themes: ['holy family', 'christmas joy', 'family values', 'christ child'],
            pastoralFocus: 'Celebrating family bonds and the example of the Holy Family',
            isPublic: true,
            createdAt: new Date('2024-12-15'),
            parishName: 'St. Mary\'s Cathedral',
            choirName: 'Cathedral Schola Cantorum',
            parishLocation: {
                country: 'United States',
                state: 'California',
                city: 'San Francisco',
                countryCode: 'US',
                stateCode: 'CA',
                latitude: 37.7749,
                longitude: -122.4194,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Entrance', songTitle: 'Joy to the World', keySignature: KeySignature.D_MAJOR, notes: 'Full organ, brass if available, congregation on all verses' },
                { partName: 'Gloria', songTitle: 'Angels We Have Heard on High', keySignature: KeySignature.F_MAJOR, notes: 'Gloria in Excelsis Deo refrain, choir on verses' },
                { partName: 'Alleluia', songTitle: 'Christmas Alleluia', keySignature: KeySignature.G_MAJOR, notes: 'Festive alleluia with organ flourish' },
                { partName: 'Offertory', songTitle: 'What Child Is This', keySignature: KeySignature.E_MINOR, notes: 'Solo verse 1, congregation verses 2-3' },
                { partName: 'Sanctus', songTitle: 'Holy, Holy, Holy (Festival)', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Christmas setting with descant' },
                { partName: 'Communion', songTitle: 'Silent Night', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Gentle, contemplative setting' },
                { partName: 'Recessional', songTitle: 'Hark! The Herald Angels Sing', keySignature: KeySignature.G_MAJOR, notes: 'Triumphant with brass and timpani' }
            ]
        }, users[0].id),

        // Lenten Mass - Public
        await saveSelection({
            title: '5th Sunday of Lent - Preparation for Holy Week',
            date: seasonDates.lent,
            liturgicalYear: LiturgicalYear.A,
            liturgicalSeason: LiturgicalSeason.LENT,
            liturgy: 'Sunday Mass',
            themes: ['death and life', 'preparation', 'sacrifice', 'conversion'],
            pastoralFocus: 'Final preparation for Holy Week, focus on dying to self and rising in Christ',
            isPublic: true,
            createdAt: new Date('2024-03-01'),
            parishName: 'St. Mary\'s Cathedral',
            choirName: 'Cathedral Schola Cantorum',
            parishLocation: {
                country: 'United States',
                state: 'California',
                city: 'San Francisco',
                countryCode: 'US',
                stateCode: 'CA',
                latitude: 37.7749,
                longitude: -122.4194,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Entrance', songTitle: 'Lord, Who Throughout These Forty Days', keySignature: KeySignature.D_MINOR, notes: 'Solemn, a cappella if possible' },
                { partName: 'Kyrie', songTitle: 'Kyrie Eleison (Lenten)', keySignature: KeySignature.A_MINOR, notes: 'Greek Kyrie, simple chant setting' },
                { partName: 'Gospel Acclamation', songTitle: 'Glory and Praise to You', keySignature: KeySignature.C_MAJOR, notes: 'No alleluia during Lent' },
                { partName: 'Offertory', songTitle: 'Jesus, Remember Me', keySignature: KeySignature.F_MAJOR, notes: 'Taizé chant, meditative repetition' },
                { partName: 'Sanctus', songTitle: 'Holy, Holy, Holy (Lenten)', keySignature: KeySignature.G_MAJOR, notes: 'Simplified setting, organ only' },
                { partName: 'Communion', songTitle: 'Were You There', keySignature: KeySignature.D_MINOR, notes: 'Solo verses, humming on chorus' },
                { partName: 'Recessional', songTitle: 'When I Survey the Wondrous Cross', keySignature: KeySignature.E_FLAT_MAJOR, notes: 'Reflective, not triumphant' }
            ]
        }, users[0].id)
    )

    // Sarah's Mass Selections (Contemporary/Youth-focused)
    massSelections.push(
        // Youth Mass - Public
        await saveSelection({
            title: 'Youth Sunday - 7th Sunday of Easter',
            date: seasonDates.easter,
            liturgicalYear: LiturgicalYear.B,
            liturgicalSeason: LiturgicalSeason.EASTER,
            liturgy: 'Youth Mass',
            themes: ['new life', 'young disciples', 'mission', 'joy'],
            pastoralFocus: 'Engaging young people in liturgy, emphasis on mission and discipleship',
            isPublic: true,
            createdAt: new Date('2024-04-20'),
            parishName: 'Holy Family Parish',
            choirName: 'Young Voices Choir',
            parishLocation: {
                country: 'United States',
                state: 'Texas',
                city: 'Austin',
                countryCode: 'US',
                stateCode: 'TX',
                latitude: 30.2672,
                longitude: -97.7431,
                timezone: 'America/Chicago'
            },
            parts: massPartsTemplates.contemporary
        }, users[1].id),

        // Modern Family Mass - Public
        await saveSelection({
            title: '25th Sunday in Ordinary Time - Family Life',
            date: seasonDates.ordinary2,
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Family Mass',
            themes: ['service', 'humility', 'community', 'discipleship'],
            pastoralFocus: 'Teaching about true greatness through service, family-friendly approach',
            isPublic: true,
            createdAt: new Date('2024-09-01'),
            parishName: 'Holy Family Parish',
            choirName: 'Family Worship Band',
            parishLocation: {
                country: 'United States',
                state: 'Texas',
                city: 'Austin',
                countryCode: 'US',
                stateCode: 'TX',
                latitude: 30.2672,
                longitude: -97.7431,
                timezone: 'America/Chicago'
            },
            parts: [
                { partName: 'Entrance', songTitle: 'Alive in Christ', keySignature: KeySignature.E_MAJOR, notes: 'Contemporary with piano and guitar' },
                { partName: 'Gloria', songTitle: 'Mass of New Wine Gloria', keySignature: KeySignature.A_MAJOR, notes: 'Contemporary setting with drums' },
                { partName: 'Alleluia', songTitle: 'Festival Alleluia', keySignature: KeySignature.D_MAJOR, notes: 'Upbeat with full band' },
                { partName: 'Offertory', songTitle: 'Table of Plenty', keySignature: KeySignature.G_MAJOR, notes: 'Folk style with guitar' },
                { partName: 'Sanctus', songTitle: 'Holy is the Lord (Contemporary)', keySignature: KeySignature.C_MAJOR, notes: 'Modern Mass setting' },
                { partName: 'Communion', songTitle: 'I Am the Bread of Life', keySignature: KeySignature.F_MAJOR, notes: 'Contemporary arrangement' },
                { partName: 'Recessional', songTitle: 'City of God', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Energetic sending forth song' }
            ]
        }, users[1].id),

        // Private Planning Mass - Not Public
        await saveSelection({
            title: 'Christmas Eve Midnight Mass - DRAFT',
            date: new Date(2024, 11, 24, 23, 30),
            liturgicalYear: LiturgicalYear.A,
            liturgicalSeason: LiturgicalSeason.CHRISTMAS,
            liturgy: 'Midnight Mass',
            themes: ['nativity', 'light in darkness', 'emmanuel', 'wonder'],
            pastoralFocus: 'Celebrating the birth of Christ at the sacred hour, maximum beauty and reverence',
            isPublic: false,
            createdAt: new Date('2024-11-20'),
            parishName: 'Holy Family Parish',
            choirName: 'Combined Choirs',
            parishLocation: {
                country: 'United States',
                state: 'Texas',
                city: 'Austin',
                countryCode: 'US',
                stateCode: 'TX',
                latitude: 30.2672,
                longitude: -97.7431,
                timezone: 'America/Chicago'
            },
            parts: [
                { partName: 'Prelude', songTitle: 'TBD - Instrumental', keySignature: null, notes: 'Need to decide between organ or piano/guitar' },
                { partName: 'Entrance', songTitle: 'O Come, All Ye Faithful', keySignature: KeySignature.G_MAJOR, notes: 'Consider full orchestration if budget allows' },
                { partName: 'Gloria', songTitle: 'TBD - Need to choose', keySignature: null, notes: 'Angels We Have Heard vs. contemporary setting?' },
                { partName: 'Offertory', songTitle: 'Mary Had a Baby', keySignature: KeySignature.D_MAJOR, notes: 'Solo option - check with cantor availability' }
            ]
        }, users[1].id)
    )

    // Margaret's Mass Selections (Traditional/Cathedral style)
    massSelections.push(
        // High Traditional Mass - Public
        await saveSelection({
            title: 'Solemnity of Christ the King - Cathedral High Mass',
            date: seasonDates.allSaints,
            liturgicalYear: LiturgicalYear.B,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Solemn High Mass',
            themes: ['christ the king', 'kingdom of god', 'final judgment', 'majesty'],
            pastoralFocus: 'Celebrating Christ\'s kingship with full cathedral ceremonial and musical splendor',
            isPublic: true,
            createdAt: new Date('2024-10-15'),
            parishName: 'Sacred Heart Cathedral',
            choirName: 'Cathedral Choir and Brass Ensemble',
            parishLocation: {
                country: 'United States',
                state: 'Massachusetts',
                city: 'Boston',
                countryCode: 'US',
                stateCode: 'MA',
                latitude: 42.3601,
                longitude: -71.0589,
                timezone: 'America/New_York'
            },
            parts: [
                { partName: 'Processional', songTitle: 'Ecce Sacerdos Magnus', keySignature: KeySignature.F_MAJOR, notes: 'Gregorian chant, schola cantorum' },
                { partName: 'Entrance', songTitle: 'Crown Him with Many Crowns', keySignature: KeySignature.A_MAJOR, notes: 'Full organ, brass quintet, timpani' },
                { partName: 'Kyrie', songTitle: 'Kyrie XI (Orbis Factor)', keySignature: null, notes: 'Gregorian chant, Mass Ordinary XI' },
                { partName: 'Gloria', songTitle: 'Gloria XV', keySignature: null, notes: 'Gregorian chant, alternating schola and congregation' },
                { partName: 'Gradual', songTitle: 'Dominus regnavit', keySignature: null, notes: 'Proper chant for Christ the King' },
                { partName: 'Alleluia', songTitle: 'Alleluia - Benedictus', keySignature: null, notes: 'Proper alleluia verse with soloists' },
                { partName: 'Offertory', songTitle: 'Ave Verum Corpus', keySignature: KeySignature.A_FLAT_MAJOR, notes: 'Mozart motet, full choir with strings' },
                { partName: 'Sanctus', songTitle: 'Sanctus XI', keySignature: null, notes: 'Gregorian chant' },
                { partName: 'Agnus Dei', songTitle: 'Agnus Dei XI', keySignature: null, notes: 'Gregorian chant' },
                { partName: 'Communion', songTitle: 'Christus vincit', keySignature: KeySignature.D_MAJOR, notes: 'Traditional acclamation with organ' },
                { partName: 'Recessional', songTitle: 'Te Deum Laudamus', keySignature: KeySignature.C_MAJOR, notes: 'Solemn tone with full ceremonial' }
            ]
        }, users[2].id),

        // Polyphony Showcase - Public
        await saveSelection({
            title: 'All Saints Day - Polyphony and Chant',
            date: new Date(2024, 10, 1),
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Solemnity',
            themes: ['communion of saints', 'heavenly glory', 'eternal life', 'intercession'],
            pastoralFocus: 'Honoring all saints with the highest forms of sacred music',
            isPublic: true,
            createdAt: new Date('2024-09-20'),
            parishName: 'Sacred Heart Cathedral',
            choirName: 'Cathedral Schola & Polyphony Choir',
            parishLocation: {
                country: 'United States',
                state: 'Massachusetts',
                city: 'Boston',
                countryCode: 'US',
                stateCode: 'MA',
                latitude: 42.3601,
                longitude: -71.0589,
                timezone: 'America/New_York'
            },
            parts: [
                { partName: 'Entrance', songTitle: 'Gaudeamus Omnes', keySignature: null, notes: 'Gregorian introit for All Saints' },
                { partName: 'Kyrie', songTitle: 'Kyrie from Missa Brevis', keySignature: KeySignature.G_MAJOR, notes: 'Palestrina, a cappella choir' },
                { partName: 'Gloria', songTitle: 'Gloria in Excelsis Deo', keySignature: KeySignature.C_MAJOR, notes: 'Victoria polyphonic setting' },
                { partName: 'Alleluia', songTitle: 'Alleluia - Venite ad me', keySignature: null, notes: 'Proper chant with elaborate melismas' },
                { partName: 'Offertory', songTitle: 'Sicut cervus', keySignature: KeySignature.A_MINOR, notes: 'Palestrina motet, double choir if possible' },
                { partName: 'Sanctus', songTitle: 'Sanctus from Mass for 4 voices', keySignature: KeySignature.F_MAJOR, notes: 'Byrd polyphonic setting' },
                { partName: 'Agnus Dei', songTitle: 'Agnus Dei from Missa Papae Marcelli', keySignature: KeySignature.G_MAJOR, notes: 'Palestrina, full choir' },
                { partName: 'Communion', songTitle: 'Beati mundo corde', keySignature: null, notes: 'Proper chant for All Saints' },
                { partName: 'Recessional', songTitle: 'For All the Saints', keySignature: KeySignature.G_MAJOR, notes: 'Vaughan Williams arrangement with descant' }
            ]
        }, users[2].id)
    )

    // Carlos's Mass Selections (Bilingual/Hispanic Community)
    massSelections.push(
        // Bilingual Community Mass - Public
        await saveSelection({
            title: 'Domingo de la Sagrada Familia / Holy Family Sunday',
            date: seasonDates.christmas,
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.CHRISTMAS,
            liturgy: 'Misa Dominical Bilingüe',
            themes: ['sagrada familia', 'unidad familiar', 'holy family', 'family unity'],
            pastoralFocus: 'Celebrating family values in bilingual community, honoring cultural traditions',
            isPublic: true,
            createdAt: new Date('2024-12-18'),
            parishName: 'Our Lady of Guadalupe Parish',
            choirName: 'Coro Guadalupano',
            parishLocation: {
                country: 'United States',
                state: 'Arizona',
                city: 'Phoenix',
                countryCode: 'US',
                stateCode: 'AZ',
                latitude: 33.4484,
                longitude: -112.0740,
                timezone: 'America/Phoenix'
            },
            parts: massPartsTemplates.bilingual
        }, users[3].id),

        // Día de los Muertos Memorial Mass - Public
        await saveSelection({
            title: 'Misa de Todos los Santos / All Saints Day Memorial',
            date: new Date(2024, 10, 2),
            liturgicalYear: LiturgicalYear.B,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Misa de Difuntos / Memorial Mass',
            themes: ['remembrance', 'eternal life', 'recuerdo', 'vida eterna', 'community of saints'],
            pastoralFocus: 'Honoring deceased family members and friends, blending Mexican traditions with Catholic liturgy',
            isPublic: true,
            createdAt: new Date('2024-10-25'),
            parishName: 'Our Lady of Guadalupe Parish',
            choirName: 'Mariachi San Miguel & Parish Choir',
            parishLocation: {
                country: 'United States',
                state: 'Arizona',
                city: 'Phoenix',
                countryCode: 'US',
                stateCode: 'AZ',
                latitude: 33.4484,
                longitude: -112.0740,
                timezone: 'America/Phoenix'
            },
            parts: [
                { partName: 'Entrada', songTitle: 'Resucitó', keySignature: KeySignature.G_MAJOR, notes: 'Joyful resurrection hymn, mariachi style if available' },
                { partName: 'Kyrie', songTitle: 'Señor, Ten Piedad', keySignature: KeySignature.A_MINOR, notes: 'Simple Spanish Kyrie' },
                { partName: 'Primera Lectura', songTitle: 'Salmo Responsorial 23', keySignature: KeySignature.F_MAJOR, notes: 'El Señor es mi Pastor - Spanish psalm' },
                { partName: 'Alleluia', songTitle: 'Aleluya (Memorial)', keySignature: KeySignature.C_MAJOR, notes: 'Gospel acclamation with remembrance theme' },
                { partName: 'Ofertorio', songTitle: 'Las Mañanitas a la Virgen', keySignature: KeySignature.D_MAJOR, notes: 'Traditional Mexican hymn to Mary' },
                { partName: 'Santo', songTitle: 'Santo, Santo, Santo', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Traditional Spanish sanctus' },
                { partName: 'Comunión', songTitle: 'Alma Misionera', keySignature: KeySignature.E_MAJOR, notes: 'Communion song about eternal mission' },
                { partName: 'Salida', songTitle: 'Vamos Todos al Banquete', keySignature: KeySignature.A_MAJOR, notes: 'Sending forth to heavenly banquet' }
            ]
        }, users[3].id),

        // Our Lady of Guadalupe Feast - Public
        await saveSelection({
            title: 'Nuestra Señora de Guadalupe - Feast Day Mass',
            date: new Date(2024, 11, 12),
            liturgicalYear: LiturgicalYear.A,
            liturgicalSeason: LiturgicalSeason.ADVENT,
            liturgy: 'Misa Festiva',
            themes: ['Guadalupe', 'Mexican Heritage', 'Apparitions', 'Indigenous Culture', 'Mary'],
            pastoralFocus: 'Celebrating patroness of Americas, honoring Mexican and indigenous heritage',
            isPublic: true,
            createdAt: new Date('2024-11-28'),
            parishName: 'Our Lady of Guadalupe Parish',
            choirName: 'Mariachi Guadalupano & Parish Choir',
            parishLocation: {
                country: 'United States',
                state: 'Arizona',
                city: 'Phoenix',
                countryCode: 'US',
                stateCode: 'AZ',
                latitude: 33.4484,
                longitude: -112.0740,
                timezone: 'America/Phoenix'
            },
            parts: [
                { partName: 'Procesión', songTitle: 'La Guadalupana', keySignature: KeySignature.G_MAJOR, notes: 'Traditional mariachi processional' },
                { partName: 'Entrada', songTitle: 'Buenos Días Paloma Blanca', keySignature: KeySignature.C_MAJOR, notes: 'Traditional Guadalupe entrance hymn' },
                { partName: 'Gloria', songTitle: 'Gloria a Dios (Misa Panamericana)', keySignature: KeySignature.F_MAJOR, notes: 'Latin American Gloria setting' },
                { partName: 'Salmo', songTitle: 'Desde el Vientre de mi Madre', keySignature: KeySignature.A_MINOR, notes: 'Responsorial psalm about Mary' },
                { partName: 'Alleluia', songTitle: 'Aleluya Guadalupano', keySignature: KeySignature.D_MAJOR, notes: 'Special alleluia for Guadalupe feast' },
                { partName: 'Ofertorio', songTitle: 'Madre de los Pobres', keySignature: KeySignature.E_MINOR, notes: 'Offering song to Mary, mother of the poor' },
                { partName: 'Santo', songTitle: 'Santo (Misa Criolla)', keySignature: KeySignature.A_MAJOR, notes: 'Argentine folk mass setting' },
                { partName: 'Comunión', songTitle: 'Morenita Linda', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Tender communion song to Our Lady' },
                { partName: 'Mañanitas', songTitle: 'Las Mañanitas a la Virgen', keySignature: KeySignature.G_MAJOR, notes: 'Traditional birthday song to Mary after communion' },
                { partName: 'Salida', songTitle: 'Adiós Oh Virgen de Guadalupe', keySignature: KeySignature.D_MAJOR, notes: 'Farewell hymn to Our Lady' }
            ]
        }, users[3].id),

        // Private Planning - Quinceañera Mass
        await saveSelection({
            title: 'Misa de Quinceañera - Maria Elena Gonzalez',
            date: new Date(2024, 5, 15),
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Misa de Acción de Gracias',
            themes: ['Coming of Age', 'Gratitude', 'Womanhood', 'Family Celebration'],
            pastoralFocus: 'Celebrating transition to womanhood with thanksgiving and commitment to faith',
            isPublic: false,
            createdAt: new Date('2024-05-20'),
            parishName: 'Our Lady of Guadalupe Parish',
            choirName: 'Youth Choir & Mariachi',
            parishLocation: {
                country: 'United States',
                state: 'Arizona',
                city: 'Phoenix',
                countryCode: 'US',
                stateCode: 'AZ',
                latitude: 33.4484,
                longitude: -112.0740,
                timezone: 'America/Phoenix'
            },
            parts: [
                { partName: 'Entrada', songTitle: 'Ave María', keySignature: KeySignature.F_MAJOR, notes: 'Special processional for quinceañera - check if family prefers Schubert or Spanish version' },
                { partName: 'Gloria', songTitle: 'Gloria (simple)', keySignature: KeySignature.C_MAJOR, notes: 'Keep simple for family participation' },
                { partName: 'Salmo', songTitle: 'Salmo de Acción de Gracias', keySignature: KeySignature.G_MAJOR, notes: 'Psalm of thanksgiving, cantor to teach family' },
                { partName: 'Ofertorio', songTitle: 'Gracias Señor', keySignature: KeySignature.D_MAJOR, notes: 'Thank you song - family request' },
                { partName: 'Comunión', songTitle: 'Jesús mi Fiel Amigo', keySignature: KeySignature.A_MAJOR, notes: 'Jesus as faithful friend - age appropriate' },
                { partName: 'Acción de Gracias', songTitle: 'Te Damos Gracias', keySignature: KeySignature.E_MAJOR, notes: 'Special thanksgiving after communion' },
                { partName: 'Salida', songTitle: 'Viva la Virgen María', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Joyful Marian recessional' }
            ]
        }, users[3].id)
    )

    // Emily's Mass Selections (Learning/New coordinator)
    massSelections.push(
        // Simple Sunday Mass - Public (Her first public planning)
        await saveSelection({
            title: 'My First Mass Planning - 6th Sunday in Ordinary Time',
            date: seasonDates.ordinary1,
            liturgicalYear: LiturgicalYear.A,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Sunday Mass',
            themes: ['Healing', 'Compassion', 'Outreach', 'Community'],
            pastoralFocus: 'Simple, accessible music that builds confidence in new parish music ministry',
            isPublic: true,
            createdAt: new Date('2024-02-01'),
            parishName: 'St. Joseph the Worker Parish',
            choirName: 'Parish Choir',
            parishLocation: {
                country: 'United States',
                state: 'Oregon',
                city: 'Portland',
                countryCode: 'US',
                stateCode: 'OR',
                latitude: 45.5152,
                longitude: -122.6784,
                timezone: 'America/Los_Angeles'
            },
            parts: massPartsTemplates.simple
        }, users[4].id),

        // Practice/Draft Mass - Not Public
        await saveSelection({
            title: 'Practice Planning - Easter Vigil Ideas',
            date: new Date(2024, 3, 30),
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.TRIDUUM,
            liturgy: 'Easter Vigil',
            themes: ['Resurrection', 'New Life', 'Baptism', 'Light'],
            pastoralFocus: 'Learning to plan the most important liturgy - need mentor guidance!',
            isPublic: false,
            createdAt: new Date('2024-01-25'),
            parishName: 'St. Joseph the Worker Parish',
            choirName: 'Combined Choirs (planning)',
            parishLocation: {
                country: 'United States',
                state: 'Oregon',
                city: 'Portland',
                countryCode: 'US',
                stateCode: 'OR',
                latitude: 45.5152,
                longitude: -122.6784,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Service of Light', songTitle: 'Light of Christ', keySignature: KeySignature.G_MAJOR, notes: 'Need to learn about Easter fire ceremony' },
                { partName: 'Exsultet', songTitle: 'Easter Proclamation', keySignature: null, notes: 'Does someone know how to chant this?' },
                { partName: 'Readings', songTitle: 'Multiple Psalms', keySignature: null, notes: 'How many readings? Which psalms between?' },
                { partName: 'Baptisms', songTitle: 'Water songs?', keySignature: null, notes: 'What music during baptisms and confirmations?' },
                { partName: 'First Alleluia', songTitle: 'ALLELUIA!!!', keySignature: KeySignature.D_MAJOR, notes: 'First alleluia after Lent - make it special! Bells?' },
                { partName: 'Communion', songTitle: 'Easter communion song', keySignature: null, notes: 'Something joyful but not too difficult' },
                { partName: 'Closing', songTitle: 'Jesus Christ is Risen Today?', keySignature: KeySignature.C_MAJOR, notes: 'Classic choice but maybe too predictable?' }
            ]
        }, users[4].id),

        // Wedding Planning - Private
        await saveSelection({
            title: 'Johnson-Smith Wedding Mass - June 22',
            date: new Date(2024, 5, 22),
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Nuptial Mass',
            themes: ['Love', 'Unity', 'Commitment', 'Sacrament of Marriage'],
            pastoralFocus: 'Beautiful wedding liturgy focused on sacramental marriage and Christian love',
            isPublic: false,
            createdAt: new Date('2024-04-10'),
            parishName: 'St. Joseph the Worker Parish',
            choirName: 'Wedding Ensemble',
            parishLocation: {
                country: 'United States',
                state: 'Oregon',
                city: 'Portland',
                countryCode: 'US',
                stateCode: 'OR',
                latitude: 45.5152,
                longitude: -122.6784,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Prelude', songTitle: 'Jesu, Joy of Man\'s Desiring', keySignature: KeySignature.G_MAJOR, notes: 'Bride\'s request - instrumental version on organ' },
                { partName: 'Processional', songTitle: 'Canon in D', keySignature: KeySignature.D_MAJOR, notes: 'Classic choice - check if we have sheet music for strings' },
                { partName: 'Entrance', songTitle: 'All Creatures of Our God and King', keySignature: KeySignature.G_MAJOR, notes: 'Processional for couple - joyful but reverent' },
                { partName: 'Gloria', songTitle: 'Mass of Creation Gloria', keySignature: KeySignature.F_MAJOR, notes: 'Familiar to most guests' },
                { partName: 'Alleluia', songTitle: 'Celtic Alleluia', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Simple and beautiful' },
                { partName: 'Offertory', songTitle: 'The Wedding Song', keySignature: KeySignature.C_MAJOR, notes: 'There is Love - couples\' choice, practice with cantor' },
                { partName: 'Sanctus', songTitle: 'Holy, Holy, Holy Lord', keySignature: KeySignature.A_MAJOR, notes: 'Mass of Creation setting' },
                { partName: 'Communion', songTitle: 'On Eagle\'s Wings', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Meaningful to couple - groom\'s grandmother\'s favorite' },
                { partName: 'Recessional', songTitle: 'Ode to Joy', keySignature: KeySignature.D_MAJOR, notes: 'Triumphant exit - full organ if possible' },
                { partName: 'Postlude', songTitle: 'Trumpet Voluntary', keySignature: KeySignature.D_MAJOR, notes: 'While guests congratulate - check if we have trumpet player' }
            ]
        }, users[4].id),

        // Funeral Planning - Private
        await saveSelection({
            title: 'Memorial Mass - Mrs. Dorothy Williams',
            date: new Date(2024, 2, 15),
            liturgicalYear: LiturgicalYear.A,
            liturgicalSeason: LiturgicalSeason.LENT,
            liturgy: 'Funeral Mass',
            themes: ['Eternal Life', 'Resurrection Hope', 'Comfort', 'Remembrance'],
            pastoralFocus: 'Providing comfort to grieving family while celebrating hope of resurrection',
            isPublic: false,
            createdAt: new Date('2024-03-12'),
            parishName: 'St. Joseph the Worker Parish',
            choirName: 'Funeral Ministry Choir',
            parishLocation: {
                country: 'United States',
                state: 'Oregon',
                city: 'Portland',
                countryCode: 'US',
                stateCode: 'OR',
                latitude: 45.5152,
                longitude: -122.6784,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Entrance', songTitle: 'Amazing Grace', keySignature: KeySignature.G_MAJOR, notes: 'Family favorite - simple arrangement' },
                { partName: 'Responsorial Psalm', songTitle: 'Psalm 23 - The Lord is My Shepherd', keySignature: KeySignature.F_MAJOR, notes: 'Comforting psalm for grieving' },
                { partName: 'Alleluia', songTitle: 'Gospel Acclamation (Lenten)', keySignature: KeySignature.C_MAJOR, notes: 'No alleluia during Lent' },
                { partName: 'Offertory', songTitle: 'How Great Thou Art', keySignature: KeySignature.A_MAJOR, notes: 'Dorothy\'s requested hymn - have cantor ready' },
                { partName: 'Communion', songTitle: 'I Am the Bread of Life', keySignature: KeySignature.E_MAJOR, notes: 'Resurrection theme appropriate for funeral' },
                { partName: 'Song of Farewell', songTitle: 'May the Angels Lead You', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Final farewell before procession to cemetery' },
                { partName: 'Recessional', songTitle: 'For All the Saints', keySignature: KeySignature.G_MAJOR, notes: 'Hopeful but not overly triumphant - Dorothy was a saint!' }
            ]
        }, users[4].id)
    )

    // Add some additional Mass Selections to test edge cases
    massSelections.push(
        // Future dated Mass (for testing date ranges)
        await saveSelection({
            title: 'Future Planning - Palm Sunday 2025',
            date: new Date(2025, 3, 13),
            liturgicalYear: LiturgicalYear.B,
            liturgicalSeason: LiturgicalSeason.LENT,
            liturgy: 'Palm Sunday Mass',
            themes: ['Passion', 'Triumph', 'Palm Branches', 'Hosanna'],
            pastoralFocus: 'Long-term planning for major liturgical celebration',
            isPublic: false,
            createdAt: new Date('2024-12-01'),
            parishName: 'St. Mary\'s Cathedral',
            choirName: 'Cathedral Schola Cantorum',
            parishLocation: {
                country: 'United States',
                state: 'California',
                city: 'San Francisco',
                countryCode: 'US',
                stateCode: 'CA',
                latitude: 37.7749,
                longitude: -122.4194,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Palm Procession', songTitle: 'All Glory, Laud and Honor', keySignature: KeySignature.D_MAJOR, notes: 'Traditional palm processional' },
                { partName: 'Entrance', songTitle: 'Hosanna to the Son of David', keySignature: KeySignature.G_MAJOR, notes: 'After procession enters church' },
                { partName: 'Passion', songTitle: 'Were You There', keySignature: KeySignature.E_MINOR, notes: 'During passion reading' }
            ]
        }, users[0].id),

        // Mass with minimal parts (testing required vs optional parts)
        await saveSelection({
            title: 'Simple Weekday Mass',
            date: new Date(2024, 1, 14),
            liturgicalYear: LiturgicalYear.C,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Weekday Mass',
            themes: ['Love', 'Charity', 'Saint Valentine'],
            pastoralFocus: 'Simple weekday celebration with minimal music',
            isPublic: true,
            createdAt: new Date('2024-02-10'),
            parishName: 'St. Joseph the Worker Parish',
            choirName: 'Cantor Only',
            parishLocation: {
                country: 'United States',
                state: 'Oregon',
                city: 'Portland',
                countryCode: 'US',
                stateCode: 'OR',
                latitude: 45.5152,
                longitude: -122.6784,
                timezone: 'America/Los_Angeles'
            },
            parts: [
                { partName: 'Entrance', songTitle: 'Ubi Caritas', keySignature: KeySignature.D_MINOR, notes: 'Simple chant about love' },
                { partName: 'Alleluia', songTitle: 'Simple Alleluia', keySignature: KeySignature.C_MAJOR, notes: 'Basic alleluia verse' },
                { partName: 'Communion', songTitle: 'Where Charity and Love Prevail', keySignature: KeySignature.F_MAJOR, notes: 'Theme of Christian love' }
            ]
        }, users[4].id),

        // Mass with many parts (testing comprehensive liturgy)
        await saveSelection({
            title: 'Solemn Pontifical Mass - Bishop\'s Visit',
            date: new Date(2024, 9, 20),
            liturgicalYear: LiturgicalYear.B,
            liturgicalSeason: LiturgicalSeason.ORDINARY_TIME,
            liturgy: 'Pontifical High Mass',
            themes: ['Episcopal Visit', 'Unity', 'Teaching Authority', 'Apostolic Succession'],
            pastoralFocus: 'Welcoming bishop with full ceremonial honors and musical splendor',
            isPublic: true,
            createdAt: new Date('2024-09-15'),
            parishName: 'Sacred Heart Cathedral',
            choirName: 'Cathedral Orchestra & Choir',
            parishLocation: {
                country: 'United States',
                state: 'Massachusetts',
                city: 'Boston',
                countryCode: 'US',
                stateCode: 'MA',
                latitude: 42.3601,
                longitude: -71.0589,
                timezone: 'America/New_York'
            },
            parts: [
                { partName: 'Prelude', songTitle: 'Toccata and Fugue in D minor', keySignature: KeySignature.D_MINOR, notes: 'Bach - full organ registration' },
                { partName: 'Episcopal Entrance', songTitle: 'Ecce Sacerdos Magnus', keySignature: null, notes: 'Gregorian chant for bishop\'s entrance' },
                { partName: 'Processional', songTitle: 'Holy God, We Praise Thy Name', keySignature: KeySignature.F_MAJOR, notes: 'With full choir and brass' },
                { partName: 'Kyrie', songTitle: 'Lord Have Mercy', keySignature: KeySignature.A_MINOR, notes: 'Sung dialogue with bishop' },
                { partName: 'Gloria', songTitle: 'Glory to God in the Highest', keySignature: KeySignature.D_MAJOR, notes: 'Festive setting with orchestra' },
                { partName: 'First Reading', songTitle: 'Responsorial Psalm 110', keySignature: KeySignature.G_MAJOR, notes: 'You are a priest forever' },
                { partName: 'Second Reading', songTitle: 'Sequence (if applicable)', keySignature: null, notes: 'Check if feast day requires sequence' },
                { partName: 'Gospel Procession', songTitle: 'Alleluia with Incense', keySignature: KeySignature.C_MAJOR, notes: 'Solemn gospel procession' },
                { partName: 'Offertory', songTitle: 'Jesu dulcis memoria', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Palestrina motet during lengthy offertory' },
                { partName: 'Preface Dialog', songTitle: 'Lift Up Your Hearts', keySignature: KeySignature.F_MAJOR, notes: 'Sung preface dialogue' },
                { partName: 'Sanctus', songTitle: 'Holy, Holy, Holy Lord', keySignature: KeySignature.E_FLAT_MAJOR, notes: 'Pontifical setting with bells' },
                { partName: 'Memorial Acclamation', songTitle: 'We Proclaim Your Death', keySignature: KeySignature.A_FLAT_MAJOR, notes: 'Solemn memorial acclamation' },
                { partName: 'Great Amen', songTitle: 'Amen', keySignature: KeySignature.D_MAJOR, notes: 'Extended amen with full harmony' },
                { partName: 'Lord\'s Prayer', songTitle: 'Our Father', keySignature: KeySignature.G_MAJOR, notes: 'Sung Our Father' },
                { partName: 'Agnus Dei', songTitle: 'Lamb of God', keySignature: KeySignature.C_MAJOR, notes: 'Extended agnus dei for communion distribution' },
                { partName: 'Communion', songTitle: 'Panis Angelicus', keySignature: KeySignature.F_MAJOR, notes: 'César Franck setting with soloists' },
                { partName: 'Thanksgiving', songTitle: 'Adoro Te Devote', keySignature: KeySignature.E_FLAT_MAJOR, notes: 'Eucharistic hymn after communion' },
                { partName: 'Papal Blessing', songTitle: 'Tu es Petrus', keySignature: KeySignature.A_MAJOR, notes: 'If bishop gives papal blessing' },
                { partName: 'Recessional', songTitle: 'Crown Him with Many Crowns', keySignature: KeySignature.B_FLAT_MAJOR, notes: 'Triumphant recessional with brass and timpani' },
                { partName: 'Postlude', songTitle: 'Widor Toccata', keySignature: KeySignature.F_MAJOR, notes: 'Widor Symphony No. 5 - final Toccata' }
            ]
        }, users[2].id)
    )

    console.log(`✅ Successfully created ${massSelections.length} Mass Selections`);

    // Summary of what was created
    const totalUsers = await prisma.user.count()
    const totalProfiles = await prisma.userProfile.count()
    const totalMassSelections = await prisma.massSelection.count()
    const totalMassParts = await prisma.massPart.count()
    const totalAccounts = await prisma.account.count()
    const totalSessions = await prisma.session.count()
    const totalVerificationTokens = await prisma.verificationToken.count()

    console.log('\nSEEDING SUMMARY:')
    console.log(`Users: ${totalUsers}`)
    console.log(`User Profiles: ${totalProfiles}`)
    console.log(`OAuth Accounts: ${totalAccounts}`)
    console.log(`Active Sessions: ${totalSessions}`)
    console.log(`Verification Tokens: ${totalVerificationTokens}`)
    console.log(`Mass Selections: ${totalMassSelections}`)
    console.log(`Mass Parts: ${totalMassParts}`)

    console.log('\nUSER SCENARIOS COVERED:')
    console.log('1. Fr. Michael Rodriguez - Experienced priest/music coordinator')
    console.log('   - Traditional and mixed liturgical approaches')
    console.log('   - Public seasonal masses (Advent, Christmas, Lent)')
    console.log('   - Active session')

    console.log('\n2. Sarah Thompson - Young parish music leader')
    console.log('   - Contemporary and youth-focused masses')
    console.log('   - Family masses and modern approaches')
    console.log('   - Private planning (Christmas Eve draft)')
    console.log('   - Active session')

    console.log('\n3. Margaret O\'Brien - Traditional choir director')
    console.log('   - Cathedral-style high masses')
    console.log('   - Gregorian chant and polyphony')
    console.log('   - Solemn liturgical celebrations')
    console.log('   - Complex ceremonial masses (Bishop\'s visit)')

    console.log('\n4. Carlos Mendoza - Bilingual music minister')
    console.log('   - Spanish and bilingual liturgies')
    console.log('   - Cultural celebrations (Guadalupe, Día de los Muertos)')
    console.log('   - Private family events (Quinceañera)')
    console.log('   - Hispanic community focus')

    console.log('\n5. Emily Wilson - New/learning coordinator')
    console.log('   - Simple, accessible music selections')
    console.log('   - Practice/draft masses (Easter Vigil planning)')
    console.log('   - Private events (wedding, funeral)')
    console.log('   - Unverified email (pending verification token)')
    console.log('   - Learning progression from simple to complex')

    console.log('\n MUSICAL DIVERSITY:')
    console.log('• Traditional Gregorian chant and Latin')
    console.log('• Contemporary Catholic worship')
    console.log('• Bilingual Spanish/English liturgy')
    console.log('• Polyphonic classical sacred music')
    console.log('• Simple congregational hymns')
    console.log('• Cultural and ethnic musical traditions')
    console.log('• Seasonal and liturgical appropriate selections')
    console.log('• Various key signatures and difficulty levels')

    console.log('\n LITURGICAL COVERAGE:')
    console.log('• All major liturgical seasons')
    console.log('• Various Mass types (Sunday, weekday, solemn, private)')
    console.log('• Special celebrations (weddings, funerals, quinceañeras)')
    console.log('• Feast days and solemnities')
    console.log('• Past, present, and future dates')
    console.log('• Both public and private Mass selections')

    console.log('\n DATABASE TESTING SCENARIOS:')
    console.log('• User authentication (verified/unverified emails)')
    console.log('• OAuth integration (Google, GitHub)')
    console.log('• Session management')
    console.log('• Public vs private content filtering')
    console.log('• User-specific content queries')
    console.log('• Date range queries and filtering')
    console.log('• Complex relational data (Mass selections with parts)')
    console.log('• Liturgical season and theme searching')
    console.log('• Key signature and musical note storage')
    console.log('• Multi-language content support')

    console.log('\n Perfect for testing:')
    console.log('• User management and profiles')
    console.log('• Mass planning workflows')
    console.log('• Music selection and organization')
    console.log('• Liturgical calendar integration')
    console.log('• Multi-language support')
    console.log('• Permission-based content access')
    console.log('• Search and filtering functionality')
    console.log('• Reporting and analytics')
    console.log('• Import/export features')
    console.log('• Collaborative planning tools')

    console.log('\n Database seeding completed successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
        console.log('Seed script finished.')
    })
    .catch(async (e) => {
        console.error('Error during seeding:', e)
        await prisma.$disconnect()
        process.exit(1)
    })