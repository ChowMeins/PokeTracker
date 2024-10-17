<script lang='ts'>
    import { onMount } from 'svelte';
    import type { Pokemon, shinyHunt } from '$lib/data';
    import { encounterMethods, pokemonGames } from '$lib/data';
	import { auth, db } from '$lib/firebase';
	import type { User } from 'firebase/auth';
    import { onAuthStateChanged } from "firebase/auth";
	import { addDoc, collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
    import { fade } from 'svelte/transition';
	import Checkmark from '../../components/svg/checkmark.svelte';
	import Plus from '../../components/svg/plus.svelte';
	import Grass from '../../components/svg/grass.svelte';
	import Gameboy from '../../components/svg/gameboy.svelte';
	import Pokeball from '../../components/svg/pokeball.svelte';
	import Confirm from '../../components/svg/confirm.svelte';
	import Trashcan from '../../components/svg/trashcan.svelte';
	import QuestionMark from '../../components/svg/questionMark.svelte';
	import Decrement from '../../components/svg/decrement.svelte';
	import Increment from '../../components/svg/increment.svelte';


    let pokemonList: Pokemon[] = [];
    let searchList: Pokemon[] = [];
    let searchCriteria: string = "";
    let option: number = 0;
    let newShinyHunt: shinyHunt | null = {pokemon: null, game: null, method: null, encounters: 0, dateCreated: null, dateEnded: null};
    let currentCollection: shinyHunt[] = [];
    let showAlert: boolean = false;
    let alertType: boolean | null = null;
    let userId: string | undefined;
    let selectedHuntIndex: number | undefined;
    let selectedHunt: shinyHunt | undefined;
    let selectedPokemon: Pokemon | null;
    $: {
        selectedHunt = selectedHuntIndex !== undefined ? currentCollection[selectedHuntIndex] : undefined;
        selectedPokemon = selectedHunt ? selectedHunt.pokemon : null;
    }

    async function loadPokemon() {
        let url = 'https://pokeapi.co/api/v2/pokemon?limit=50';  // Set limit as needed (e.g., 100 Pokémon per page)
        let pokemonList: Pokemon[] = [];
            // Loop to handle pagination
            while(url) {
            // Fetch data from the current page
            let pokeApi = await fetch(url);
            let json = await pokeApi.json();
            let pokemonData = await json.results;
            // Loop through each Pokemon in the json
            pokemonData.forEach(async(data: any) => {
                const pokemon = await fetch(data.url);
                const pokeJson = await pokemon.json();
                if (parseInt(pokeJson.id) < 10000) {
                    pokemonList.push({name: pokeJson.name.toUpperCase(), id: pokeJson.id < 1000 ? String(pokeJson.id).padStart(3, '0') : pokeJson.id, spriteUrl: pokeJson.sprites.other.home.front_shiny});
                }       
            });
            // Extract names and accumulate them

            // Update URL to the next page if it exists
            url = json.next;
        }
        pokemonList.sort((a,b) => parseInt(a.id) - parseInt(b.id));
        return pokemonList; 
    }

    let filteredPokemonList = () => {
        if (searchCriteria === "") {
            searchList = [...pokemonList];
        }
        // Filter by name, ignoring case
        searchList = pokemonList.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchCriteria.toLowerCase()))
        searchList = [...searchList];
        return searchList
    };  

    function displayModal(id: string) {
        const modal: HTMLDialogElement | null = document.getElementById(id) as HTMLDialogElement;
        if (modal) {
            if(!modal.open) {
                requestAnimationFrame(() => {
                    modal.showModal();
                });
            } else {
                requestAnimationFrame(() => {
                    modal.close();
                });
            }
        }
        searchCriteria = "";
    }
    function dateToString(): string {
        const time: number = Date.now();
        const date = new Date(time);
        const pad = (num: number) => (num < 10 ? '0' + num : num);
        const month = pad(date.getMonth() + 1); // Months are 0-indexed
        const day = pad(date.getDate());
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const dateToString = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
        return dateToString;
    }
    async function handleSubmit(): Promise<boolean> {
        const user: User | null = auth.currentUser; 
        let userId: string | null = user ? user.uid : null;
        
        if(userId) {
            try {
                const pokemonCollection = await collection(db, "users", userId, "shinyHunt");
                if(newShinyHunt?.pokemon != null && newShinyHunt?.game != null && newShinyHunt.method != null) {
                    newShinyHunt.dateCreated = dateToString();
                    const docRef = await addDoc(pokemonCollection, newShinyHunt);
                    return true;
                } else {
                    alert("Please select options for all fields of the shiny hunt.");
                }
            } catch (error) {
                console.error("Unable to add new shiny hunt to collection.", error)
            }
        }
        return false;
        
    }
    async function deleteHunt() { 
        const user: User | null = auth.currentUser; 
        let userId: string | null = user ? user.uid : null;
        
        if(userId) {
            try {
                if(user && selectedHunt != undefined && selectedHunt.docId) {
                    console.log(selectedHunt.docId);
                    const huntDoc = await doc(db, "users", userId, "shinyHunt", selectedHunt.docId);
                    if (huntDoc) {
                        await deleteDoc(huntDoc);
                        displayModal('hunt-modal');
                        await loadCollection();
                    }
                }
            } catch (error) {
                console.error("Unable to delete shiny hunt.", error)
            }
        }
        return false;
    }
    function displayConfirmation() {
        showAlert = true;
        setTimeout(() => {
            showAlert = false;
        }, 7500)
    }
    async function loadCollection() {
        if(userId) {
        const collectionRef = collection(db, "users", userId, "shinyHunt");
            try {
                const querySnapshot = await getDocs(collectionRef);
                currentCollection = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        pokemon: data.pokemon,
                        game: data.game,
                        method: data.method,
                        encounters: data.encounters,
                        docId: doc.id,
                        dateCreated: data.dateCreated,
                        dateEnded: data.dateEnded
                    } as shinyHunt
                });
            } catch (error) {
                console.log(error);
            }
        }
    }
    /* */
    onMount( async() =>{ 
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                pokemonList = await loadPokemon();
                searchList = [...pokemonList];
                await loadCollection();
                console.log('Auth state changed.')
            } else {
                console.log("No user signed in.");
            }
        });
    });
</script>

<!-- Pokemon List -->
 <div class='w-full flex-grow flex flex-col mx-auto text-3xl font-semibold'>
    <div class='w-full flex px-4 mt-4 gap-4 '> 
        <button class='h-fit my-auto text-sm rounded-full border-2' on:click={()=>{displayModal('poke-modal')}}> <Plus className='w-4 h-4 stroke-green-400' /> </button>
        <input type='text' placeholder="Search..." class='w-full p-2 text-sm rounded-full'/>
    </div>
    {#if showAlert}
    <div transition:fade={{ duration: 500 }} id='confirm-message' class='absolute flex w-fit mx-auto mt-4 px-4 bg-green-500 rounded-xl shadow-md'> <Checkmark className='w-6'/> <p class='my-auto text-sm text-center text-white'> New Shiny Hunt added to the Collection! </p> </div>
    {/if}
        {#if currentCollection.length == 0}
        <div class='w-1/3 max-sm:w-fit border-2 border-grey-600 bg-[#212529] my-auto mx-auto p-[2vw] text-center rounded-xl'>
            <h1 class='py-8'> Your Collection </h1>
            <button class='py-8' on:click={() => {displayModal('poke-modal')}}> + </button>
        </div>

        {:else}
        <!-- Current Collection Grid -->
        <div class='grid grid-cols-5 max-md:grid-cols-3 max-sm:grid-cols-1 m-4 gap-4'>
            {#each currentCollection as hunt, i}
            <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 shadow-lg' on:click={() => { selectedHuntIndex = i; selectedHunt = currentCollection[selectedHuntIndex]; displayModal('hunt-modal')}}>
                <div class='w-fit flex flex-col flex-grow text-sm max-lg:text-[15px] max-sm:text-[3vw] text-left text-wrap'>
                    <p class='w-fit px-2 font-bold'> {hunt.pokemon?.name}</p>
                    <p class='w-fit px-2 font-semibold'> #{hunt.pokemon?.id} </p>
                </div>
                <div class='w-full h-full flex-grow flex justify-end'>
                    <img src={hunt.pokemon?.spriteUrl} alt={hunt.pokemon?.name} draggable='false' class='w-2/5 object-fit mx-auto max-sm: ml-auto m-0 p-0'/>
                </div>
            </button>
            <!-- Current Selected Shiny Hunt -->
            <dialog id='hunt-modal' class='w-1/3 max-xl:w-2/3 max-md:w-full p-4 bg-[#343A40] rounded-xl'> 
                <div class='relative flex flex-col'>
                    <button class='w-[8%] absolute top-0 left-0 p-1 hover:bg-gray-600 text-sm text-white rounded-xl'> <QuestionMark className='w-full h-fit '/> </button>
                    <button class='w-fit absolute top-0 right-0 p-1 hover:bg-gray-600 text-md text-white rounded-xl' on:click={() => {selectedHuntIndex = undefined; displayModal('hunt-modal');}}> X </button>
                    <div class='flex flex-col text-center my-8 text-white bg-[#343A40]'>
                        <p> {selectedPokemon?.name ? selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1).toLowerCase() : ''}</p>
                        <img src={selectedPokemon?.spriteUrl} alt='pokemon sprite' class='w-1/2 mx-auto'/>
                        <div class='w-full mt-16 gap-8 flex justify-center'>
                            <Decrement className="w-fit"/>
                            <p class='w-1/2 h-full my-auto bg-white text-5xl text-center rounded-xl text-black'> {selectedHunt?.encounters }</p>
                            <Increment className="w-fit"/>
                        </div>
                        <p> {selectedHunt?.dateCreated} </p>
                    </div>
                    <button class='w-[8%] ml-auto rounded-xl p-2 hover:bg-gray-600' on:click={() => {
                        const result = confirm("Do you want to delete this hunt?");
                        if (result) {
                            deleteHunt();
                        }
                    }}> <Trashcan className="w-full h-fit mx-auto" /> </button>
                </div>
                
            </dialog>
            {/each}
        </div>
        {/if}

        <dialog id='poke-modal' class='w-full h-[90%] bg-[#212529] rounded-l-xl max-sm:rounded-xl'> 
            <div class='flex flex-row text-[#dee2ff] h-full'>
                <!-- Static Menu -->
                <div class='w-[15%] flex flex-col px-8 max-lg:px-2 pt-2 pb-4 max-sm:px-1 max-sm:py-2 text-[18px] bg-[#2D3238] text-left'>
                    <div class='w-full flex flex-col max-md:hidden'>
                        <button class='py-1 {newShinyHunt?.pokemon ? 'text-green-400' : ''}' on:click={() => {option = 0;}}>  {newShinyHunt.pokemon ? newShinyHunt.pokemon.name.charAt(0) + newShinyHunt.pokemon.name.slice(1).toLowerCase() : 'Pokemon'} </button>
                        <button class='py-1 text-wrap {newShinyHunt.game ? 'text-green-400' : ''}' on:click={()=>{option = 1;}}> {newShinyHunt.game ? newShinyHunt.game : "Game"} </button>
                        <button class='py-1 text-wrap {newShinyHunt.method ? 'text-green-400' : ''}' on:click={() => {option = 2;}}> {newShinyHunt.method ? newShinyHunt.method : "Method"} </button>
                    </div>
                    <div class='hidden w-full max-md:flex max-md:flex-col'>
                        <button class='flex mx-auto min-h-[64px] max-h-[64px] py-1' on:click={() => {option = 0;}}>
                            {#if newShinyHunt.pokemon}
                            <img src={newShinyHunt.pokemon?.spriteUrl} alt={newShinyHunt.pokemon?.name} class="mx-auto h-full object-cover rounded-md {newShinyHunt.pokemon ? 'border-2 border-green-400' : ''}"/>
                            {:else}
                            <Pokeball className="mx-auto w-4/5 h-full  {newShinyHunt.game ? "fill-green-500" : ""}"/>
                            {/if}
                        </button>
                        <button class='py-1' on:click={() => {option = 1;}}> <Gameboy className="m-auto w-[70%] {newShinyHunt.game ? "fill-green-500" : ""}"/> </button>
                        <button class='py-1' on:click={() => {option = 2;}}> <Grass className="m-auto w-3/5 {newShinyHunt.method ? "fill-green-500" : ""}" /> </button>
                    </div>
                    <button class='mt-auto rounded-xl' on:click={async() => {
                        if (await handleSubmit() == true) { 
                            displayModal('poke-modal'); 
                            displayConfirmation(); 
                            loadCollection();
                        }
                        }}> 
                    <p class='inline-block max-md:hidden {newShinyHunt.pokemon && newShinyHunt.game && newShinyHunt.method ? "text-green-400" : ""}'> Begin Hunt </p>
                    <Confirm className="w-3/5 hidden max-md:inline-block" strokeOne={newShinyHunt.pokemon && newShinyHunt.game && newShinyHunt.method ? "#64C37D" : "#ffffff"} />
                    </button>
                    
                </div>
                
                <!-- Scrollable Grid Container -->
                <div class="w-full">
                    <!-- Search Bar and Close Button (Static) -->
                    <div class='flex flex-col px-4'>
                        <button class='ml-auto py-4 text-sm font-bold' on:click={() => {displayModal('poke-modal'); newShinyHunt.pokemon = null; newShinyHunt.game = null; newShinyHunt.method = null; option = 0;}}> X </button>
                        <input type='text' bind:value={searchCriteria} on:input={filteredPokemonList} class='w-full mx-auto text-sm rounded-full m-1 px-3 py-1 border-none' placeholder="Search Pokémon..."/>
                    </div>
                
                    <!-- Scrollable Grid Container -->
                    <div class="max-h-[75vh] overflow-y-auto mt-4">
                        {#if pokemonList.length > 0}
                        <!-- Pokemon Selector -->
                            {#if option == 0}
                                <div class='grid grid-cols-6 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-8 px-4 text-left'>
                                    {#each searchList as pokemon}
                                    <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 {newShinyHunt.pokemon == pokemon ? 'border-green-400' : 'border-[#dee2ff]'} shadow-lg' on:click={() => {newShinyHunt.pokemon = pokemon; option = 1;}}>
                                        <div class='w-fit flex flex-col flex-grow text-sm max-lg:text-[15px] max-sm:text-[3vw] text-left text-wrap {newShinyHunt.pokemon == pokemon ? 'text-green-300' : ''}'>
                                            <p class='w-fit px-2 font-bold'> {pokemon.name}</p>
                                            <p class='w-fit px-2 font-semibold'> #{pokemon.id} </p>
                                        </div>
                                        <div class='w-full h-full flex-grow flex justify-end'>
                                            <img src={pokemon.spriteUrl} alt={pokemon.name} draggable='false' class='w-4/5 object-fit mx-auto max-sm: ml-auto m-0 p-0'/>
                                        </div>
                                    </button>
                                    {/each}
                                </div>
                            <!-- Game Selector -->
                            {:else if option == 1}
                                <div class='px-4 text-left'>
                                {#each Object.entries(pokemonGames) as [generation, games]}
                                    <h1 class='py-4 text-md'> {generation}</h1>
                                    <div class='grid grid-cols-3 max-sm:grid-cols-1 gap-4'>
                                    {#each games as game}
                                        <button class='p-1 text-center text-sm border-2 rounded-xl' on:click={()=>{newShinyHunt.game = game; option = 2;}}> {game} </button>
                                    {/each}
                                    </div>
                                {/each}  
                                </div>
                            <!-- Method Selector -->
                            {:else if option == 2}
                            <div class='grid grid-cols-2 gap-4 px-4 py-4'>
                                {#each encounterMethods as method}
                                    <button class='border-2 rounded-xl' on:click={() => {newShinyHunt.method = method}}> {method} </button>
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


<style>
    #confirm-message {
        left: 50%;
        transform: translate(-50%, 0);
        transition-duration: 2s;
    }
    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.6); /* Dark backdrop with 70% opacity */
    }
    input {
        outline: none;
        color: black;
    }
</style>