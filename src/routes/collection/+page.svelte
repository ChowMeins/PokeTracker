<script lang='ts'>
    import { onMount } from 'svelte';
    import { collection, doc, getDocs, query, setDoc } from "firebase/firestore"; 
    import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged, type User } from 'firebase/auth';
	import { goto } from '$app/navigation';

    interface Pokemon {
        name: string,
        id: string,
        spriteUrl: string
    };
    let userID: string;
    let pokemonCount: number;
    let pokemonList: Pokemon[] = [];
    let searchList: Pokemon[] = [];
    let searchCriteria: string = "";
    
    let modal: HTMLDialogElement | null;
    let selectedPokemon: Pokemon | null = null;

    async function fetchAllPokemonNames() {
        let url = 'https://pokeapi.co/api/v2/pokemon?limit=50';  // Set limit as needed (e.g., 100 Pokémon per page)
        let pokemonData;
            // Loop to handle pagination
            while(url) {
            // Fetch data from the current page
            let pokeApi = await fetch(url);
            let json = await pokeApi.json();
            pokemonData = await json.results;
            // Loop through each Pokemon in the json
            pokemonData.forEach(async(data: any) => {
                const pokemon = await fetch(data.url);
                const pokeJson = await pokemon.json();
                if (parseInt(pokeJson.id) < 10000) {
                    pokemonList.push({name: pokeJson.name.toUpperCase(), id: pokeJson.id < 1000 ? String(pokeJson.id).padStart(3, '0') : pokeJson.id, spriteUrl: pokeJson.sprites.other.home.front_default});
                }       
            });
            // Extract names and accumulate them

            // Update URL to the next page if it exists
            url = json.next;
        }
        pokemonList.sort((a,b) => parseInt(a.id) - parseInt(b.id));
        pokemonList = [...pokemonList]
    }
        // Filtered list based on search criteria
    let filteredPokemonList = () => {
        if (searchCriteria === "") {
            searchList = [...pokemonList];
        }
        // Filter by name, ignoring case
        searchList = pokemonList.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchCriteria.toLowerCase()))
        searchList = [...searchList];
        return searchList
    };
    function displayModal() {
        if (modal) {
            if(!modal.open) {
                modal.showModal();
            } else {
                modal.close();
            }
        }
        searchCriteria = "";
    }
    onMount(() =>{ 
        modal = document.getElementById('poke-modal') as HTMLDialogElement | null;
        fetchAllPokemonNames().then(() => {
            searchList = [...pokemonList];
        });
    });
</script>

<!-- Pokemon List -->
 <div class='w-full flex-grow flex flex-col mx-auto text-3xl font-semibold'>
    <div class='w-1/3 max-sm:w-fit border-2 border-grey-600 bg-[#212529] my-auto mx-auto p-[2vw] text-center rounded-xl'>
        <h1 class='py-8'> Your Collection </h1>
        <button class='py-8' on:click={displayModal}> + </button>
        <dialog id='poke-modal' class=' w-full h-[90%] bg-[#212529] rounded-l-xl'> 
            <div class='flex flex-row text-[#dee2ff] h-full'>
                <!-- Static Menu -->
                <div class='w-1/10 flex flex-col px-16 py-8 max-sm:px-1 max-sm:py-2 text-[18px] bg-[#2D3238] text-left'>
                    <div class='flex flex-col max-sm:hidden'>
                        <button class='py-1 {selectedPokemon ? 'text-green-400' : ''}' on:click={() => {selectedPokemon = null;}}>  {selectedPokemon ? selectedPokemon.name.charAt(0) + selectedPokemon.name.slice(1).toLowerCase() : 'Pokemon'} </button>
                        <button class='py-1'> Game </button>
                        <button class='py-1'> Method </button>
                    </div>
                    <div class='hidden w-full max-sm:flex max-sm:flex-col'>
                        <button class='w-full py-1' on:click={() => {selectedPokemon = null;}}>
                            <img src={selectedPokemon?.spriteUrl} alt={selectedPokemon?.name} class="min-w-[64px] max-w-[64px] h-auto object-cover rounded-md {selectedPokemon ? 'border-2 border-green-400' : ''}"/>
                        </button>
                        <button class='py-1'> G </button>
                        <button class='py-1'> M </button>
                    </div>
                </div>
                
                <!-- Scrollable Grid Container -->
                <div class="w-full">
                    <!-- Search Bar and Close Button (Static) -->
                    <div class='flex flex-col px-4'>
                        <button class='ml-auto py-4 text-sm font-bold' on:click={() => {displayModal(); selectedPokemon = null;}}> X </button>
                        <input type='text' bind:value={searchCriteria} on:input={filteredPokemonList} class='w-full mx-auto rounded-xl m-1 px-3 py-1 border-none' placeholder="Search Pokémon..."/>
                    </div>
                
                    <!-- Scrollable Grid Container -->
                    <div class="max-h-[75vh] overflow-y-auto mt-4">
                        {#if pokemonList.length > 0}
                            {#if selectedPokemon}
                                <img src={selectedPokemon.spriteUrl} alt={selectedPokemon.name} />
                            {:else}
                                <div class='grid grid-cols-6 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-8 px-4 text-left'>
                                    {#each searchList as pokemon}
                                    <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 border-[#dee2ff] shadow-lg' on:click={() => selectedPokemon = pokemon}>
                                        <div class='flex flex-col flex-grow text-[18px] max-md:text-[14px] max-sm:text-md text-nowrap'>
                                            <p class='w-fit px-2'> {pokemon.name}</p>
                                            <p class='w-fit px-2'> #{pokemon.id} </p>
                                        </div>
                                        <div class='w-full h-full flex-grow flex justify-end'>
                                            <img src={pokemon.spriteUrl} alt={pokemon.name} class='w-2/3 mx-auto max-sm: ml-auto p-0'/>
                                        </div>
                                    </button>
                                    {/each}
                                </div>
                            {/if}
                        {:else}
                            <p class='text-center'>Loading Pokémon...</p>
                        {/if}
                    </div>
                </div>
            </div>
        </dialog>
    </div>
 </div>


<style>
    .profile {
        width: 100%;
        cursor: pointer;
    }
</style>