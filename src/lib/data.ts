import { writable, type Writable } from "svelte/store";

export interface LoadingState {
    layoutLoaded: boolean;
    pageLoaded: boolean;
};
export class CustomNotification {
    message: string;
    color: string;
    timeout: number;

    constructor(message: string, color: string, timeout: number) {
        this.message = message;
        this.color = color;
        this.timeout = timeout;
    }
};

export class NotificationStore {
    private queue: CustomNotification[] = [];
    private timeoutIds = new Map();
    private store = writable<CustomNotification[]>(this.queue);

    get notifications() {
        return this.store;
    }

    enqueue(notification: CustomNotification): void {
        this.queue.push(notification);
        this.updateStore();
        this.scheduleDequeue(notification);
        //console.log("Notification added:", notification);
    }

    private scheduleDequeue(notification: CustomNotification): void {
        const timeoutId = setTimeout(() => {
            this.dequeue(notification);
            this.timeoutIds.delete(notification);
        }, notification.timeout);
        this.timeoutIds.set(notification, timeoutId);
    }

    dequeue(notification: CustomNotification): void {
        const timeoutId = this.timeoutIds.get(notification);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeoutIds.delete(notification);
        }
        const index = this.queue.indexOf(notification);
        if (index > -1) {
            this.queue.splice(index, 1);
            this.updateStore();
            //console.log("Notification removed:", notification);
        }
    }

    private updateStore(): void {
        this.store.set([...this.queue]);
    }
}



export interface Pokemon {
    name: string,
    id: string,
    spriteUrl: string
};

export interface PokemonStore {
    pokemonList: Pokemon[],
    isLoaded: boolean
};

export interface HuntedPokemon extends Pokemon {
    EVs: {
        hp: number;
        attack: number;
        defense: number;
        spAttack: number;
        spDefense: number;
        speed: number;
    }
};
export interface Hunt {
    game: string | null,
    method: string | null,
    encounters: number,
    docId: string | null,
    dateCreated: string | null,
    dateEnded: string | null
};

export interface shinyHunt extends Hunt {
    pokemon: Pokemon | null
};

export interface completedHunt extends Hunt {
    pokemon: HuntedPokemon | null,
    nickname: string | null
}

export interface ShinyHuntStore {
    hunts: shinyHunt[];
    isLoaded: boolean;
};

export interface CollectionStore {
    hunts: completedHunt[];
    isLoaded: boolean;
};

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