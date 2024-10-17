export interface Pokemon {
    name: string,
    id: string,
    spriteUrl: string
};

export interface shinyHunt {
    pokemon: Pokemon | null,
    game: string | null,
    method: string | null,
    encounters: number,
    docId: string | null,
    dateCreated: string | null,
    dateEnded: string | null
}

export type GenerationGames = {
    [generation: string]: string[];
};
export const pokemonGames: GenerationGames = {
    "Generation 1": [
        "Pokémon Red",
        "Pokémon Blue",
        "Pokémon Yellow"
    ],
    "Generation 2": [
        "Pokémon Gold",
        "Pokémon Silver",
        "Pokémon Crystal"
    ],
    "Generation 3": [
        "Pokémon Ruby",
        "Pokémon Sapphire",
        "Pokémon FireRed",
        "Pokémon LeafGreen",
        "Pokémon Emerald"
    ],
    "Generation 4": [
        "Pokémon Diamond",
        "Pokémon Pearl",
        "Pokémon Platinum",
        "Pokémon HeartGold",
        "Pokémon SoulSilver"
    ],
    "Generation 5": [
        "Pokémon Black",
        "Pokémon White",
        "Pokémon Black 2",
        "Pokémon White 2"
    ],
    "Generation 6": [
        "Pokémon X",
        "Pokémon Y",
        "Pokémon Omega Ruby",
        "Pokémon Alpha Sapphire"
    ],
    "Generation 7": [
        "Pokémon Sun",
        "Pokémon Moon",
        "Pokémon Ultra Sun",
        "Pokémon Ultra Moon",
        "Pokémon Let's Go, Pikachu!",
        "Pokémon Let's Go, Eevee!"
    ],
    "Generation 8": [
        "Pokémon Sword",
        "Pokémon Shield",
        "Pokémon Brilliant Diamond",
        "Pokémon Shining Pearl",
        "Pokémon Legends: Arceus"
    ],
    "Generation 9": [
        "Pokémon Scarlet",
        "Pokémon Violet"
    ]
};

export const encounterMethods: string[] = [
    "Random Encounter",
    "Fossil Restore",
    "Soft Resetting",
    "Masuda Method",
    "Breeding",
    "PokéRadar",
    "Run Away",
    "Event",
    "Mystery Gift",
    "Trade"
];