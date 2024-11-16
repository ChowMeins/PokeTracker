import { CustomNotification, NotificationStore, type CollectionStore, type completedHunt, type HuntedPokemon, type Pokemon, type PokemonStore, type shinyHunt, type ShinyHuntStore } from "$lib/data";
import { writable } from "svelte/store";
import { authStore } from "./store";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "$lib/firebase";

export const notificationStore = new NotificationStore();
export const notifications = notificationStore.notifications;
export const pokemonList = writable<PokemonStore>({pokemonList: [], isLoaded: false});
export const userHunts = writable<ShinyHuntStore>({hunts: [], isLoaded: false});
export const userCollection = writable<CollectionStore>({hunts: [], isLoaded: false});
export let userId: string | undefined;

$: userId = auth.currentUser?.uid;


// Loads all Pokemon from PokeAPI
export async function loadPokemon() {
    let url = 'https://pokeapi.co/api/v2/pokemon?limit=50';  // Set limit as needed (e.g., 100 Pokémon per page)
    let loadedPokemonList: Pokemon[] = [];

    // Loop to handle pagination
    while(url) {
        // Fetch data from the current page
        let pokeApi = await fetch(url);
        let json = await pokeApi.json();
        let pokemonData = await json.results;
        
        // Loop through each Pokemon in the json
        await Promise.all(pokemonData.map(async (data: any) => {
            const pokemonResponse = await fetch(data.url);
            const pokeJson = await pokemonResponse.json();
            const imageUrl = pokeJson.sprites.other.home.front_shiny;
            if (parseInt(pokeJson.id) < 10000 && imageUrl) {
                // Add Pokémon data to the list
                loadedPokemonList.push({
                    name: pokeJson.name.toUpperCase(),
                    id: pokeJson.id < 1000 ? String(pokeJson.id).padStart(3, '0') : pokeJson.id,
                    spriteUrl: imageUrl // Store the URL for later use
                });
            }
        }));
        // Update URL to the next page if it exists
        url = json.next;
    }
    loadedPokemonList.sort((a,b) => parseInt(a.id) - parseInt(b.id));
    pokemonList.set({
        pokemonList: loadedPokemonList,
        isLoaded: true
    }); 
}

// Loads hunts from Firebase
export async function loadHunts() {
    //console.log("Reading from FireBase...");
    userId = auth.currentUser?.uid;
    if(userId) {
    const collectionRef = collection(db, "users", userId, "shinyHunts");
        try {
            const querySnapshot = await getDocs(collectionRef);
            const loadedHunts = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    pokemon: data.pokemon,
                    game: data.game,
                    method: data.method,
                    encounters: data.encounters,
                    docId: doc.id,
                    dateCreated: data.dateCreated,
                    dateEnded: data.dateEnded
                } as shinyHunt;
            });
            loadedHunts.sort(compareHuntsByDate);
            userHunts.set({hunts: loadedHunts, isLoaded: true});
        } catch (error) {
            console.error(error);
        }
    } else {
        //console.log("No user found.");
    }
}

// Loads collection from FireBase
export async function loadCollection() {
    userId = auth.currentUser?.uid;
    if(userId) {
        try {
            const collectionRef = collection(db, "users", userId, "collection");
            const querySnapshot = await getDocs(collectionRef);
            let loadedCollection: completedHunt[];
            loadedCollection = (querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const huntedPokemon: HuntedPokemon = {
                    ...data.pokemon, 
                };
                return {
                    pokemon: huntedPokemon,
                    game: data.game,
                    method: data.method,
                    encounters: data.encounters,
                    docId: doc.id,
                    dateCreated: data.dateCreated,
                    dateEnded: data.dateEnded,
                    nickname: data.nickname
                } as completedHunt
            }));
            loadedCollection.sort(compareHuntsByDate);
            userCollection.set({hunts: loadedCollection, isLoaded: true});
        } catch (error) {
            console.log(error);
        }
    }
}

function stringToDate(dateString: string) {
    // dateString format:  ${month}/${day}/${year} ${hours}:${minutes}:${seconds}
    // Split the string into date and time parts
    const [datePart, timePart] = dateString.split(' ');

    // Split date into month, day, and year
    const [month, day, year] = datePart.split('/').map(Number);
    
    // Split time into hours, minutes, and seconds
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    // Create a new Date object using the components
    return new Date(year, month - 1, day, hours, minutes, seconds); // month is 0-indexed
}

function compareHuntsByDate(a: shinyHunt, b: shinyHunt): number {
    let dateA: Date | null = null;
    let dateB: Date | null = null;

    // Convert dateCreated to Date objects if they exist
    if (a.dateCreated) {
        dateA = stringToDate(a.dateCreated);
    }
    if (b.dateCreated) {
        dateB = stringToDate(b.dateCreated);
    }

    // Handle cases where one or both dates might be null
    if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime(); // Use getTime() for numeric comparison
    } else if (dateA) {
        return -1; // dateA exists, so it comes first
    } else if (dateB) {
        return 1; // dateB exists, so it comes first
    } else {
        return 0; // Both dates are invalid, keep their original order
    }
}
