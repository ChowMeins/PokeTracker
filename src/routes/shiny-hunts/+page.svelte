<script lang='ts'>
    import { onMount } from 'svelte';
    import { CustomNotification, type completedHunt, type Pokemon, type shinyHunt } from '$lib/data';
    import { encounterMethods, pokemonGames } from '$lib/data';
	import { auth, db } from '$lib/firebase';
    import { loadPokemon, pokemonList, userCollection, userId, notificationStore, notifications } from '../../store/pokemonStore';
	import type { User } from 'firebase/auth';
    import { onAuthStateChanged } from "firebase/auth";
	import { addDoc, collection, doc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
    import { fade, fly, slide } from 'svelte/transition';
    import notiQueue from '../../components/notiStack.svelte';
    
    // SVG's
	import Plus from '../../components/svg/plus.svelte';
	import Grass from '../../components/svg/grass.svelte';
	import Gameboy from '../../components/svg/gameboy.svelte';
	import Pokeball from '../../components/svg/pokeball.svelte';
	import Confirm from '../../components/svg/confirm.svelte';
	import Trashcan from '../../components/svg/trashcan.svelte';
	import QuestionMark from '../../components/svg/questionMark.svelte';
	import Decrement from '../../components/svg/decrement.svelte';
	import Increment from '../../components/svg/increment.svelte';
    import Close from '../../components/svg/close.svelte';
	import Flag from '../../components/svg/flag.svelte';
	import { loadHunts, userHunts } from '../../store/pokemonStore';
	import { loadingStore } from '../../store/store';
	import Edit from '../../components/svg/edit.svelte';
    

    let searchList: Pokemon[] = [];
    let searchCriteria: string = "";

    // Adding/Editing Hunt
    let option: number = 0;
    let newShinyHunt: shinyHunt = {pokemon: null, game: null, method: null, encounters: 0, docId: null, dateCreated: null, dateEnded: null};
    let editMode: boolean = false;

    // User's current shiny hunts
    let currentHunts: shinyHunt[] = [];
    let searchHunts: shinyHunt[] = [];
    let searchHuntCriteria: string = "";

    // Selected Hunt
    let selectedHunt: shinyHunt | null;
    let selectedPokemon: Pokemon | null;
    let showDescription: boolean = false;
    let incrementCount: number = 1;
    
    
    $: selectedPokemon = selectedHunt ? selectedHunt.pokemon : null;
    $: {currentHunts = $userHunts.hunts;
        searchHunts = currentHunts;
    }
    $: searchList = $pokemonList.pokemonList;

    // Filter PokeDex
    let filteredPokemonList = () => {
        if (searchCriteria === "") {
            searchList = $pokemonList.pokemonList;
        }
        // Filter by name, ignoring case
        searchList = $pokemonList.pokemonList.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchCriteria.toLowerCase()))
        return searchList;
    };  

    // Filter user's collection
    function filterHuntList() {
        if(searchHuntCriteria === "") {
            searchHunts = currentHunts;
        } else {
            searchHunts = currentHunts.filter((hunt: shinyHunt) => { return hunt.pokemon?.name.toLowerCase().startsWith(searchHuntCriteria.toLowerCase()) });
        }
    }

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

    function changeOption(val: number) {
        option = val;
        const currWindow = document.getElementById('scroll-area');
        currWindow?.scrollTo(0,0);
    }

    function currentDateToString(): string {
        const time: number = Date.now();
        const date = new Date(time);
        const pad = (num: number) => (num < 10 ? '0' + num : num);
        const month = pad(date.getMonth() + 1); // Months are 0-indexed
        const day = pad(date.getDate());
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const dateToString = `${month}/${day}/${year} ${hours}:${minutes}`;
        return dateToString;
    }
    function resetNewShinyHunt() {
        if (newShinyHunt) {
            newShinyHunt = {
                pokemon: null,
                game: null,
                method: null,
                dateCreated: null,
                dateEnded: null,
                encounters: 0,
                docId: null
            }
        }
    }
    function comparePokemon(p1: Pokemon, p2: Pokemon): boolean {
        if (p1.name === p2.name &&
            p1.id === p2.id &&
            p1.spriteUrl === p2.spriteUrl
        ) {
            return true;
        }
        return false;

    }
    async function makeHunt(): Promise<boolean> {
        if(userId) {
            try {
                const pokemonCollection = await collection(db, "users", userId, "shinyHunts");
                if(newShinyHunt?.pokemon != null && newShinyHunt?.game != null && newShinyHunt.method != null) {
                    newShinyHunt.dateCreated = currentDateToString();
                    const docRef = await addDoc(pokemonCollection, {
                        pokemon: newShinyHunt.pokemon,
                        game: newShinyHunt.game,
                        method: newShinyHunt.method,
                        encounters: 0,
                        dateCreated: newShinyHunt.dateCreated
                    });
                    const addPokemonDoc = await getDoc(docRef);
                    const addPokemon: shinyHunt = {...addPokemonDoc.data(), docId: docRef.id} as shinyHunt;
                    userHunts.update((store) => {
                        return {
                            hunts: [...store.hunts, addPokemon],
                            isLoaded: store.isLoaded
                        }
                    })
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
    async function updateHunt() {
        let userId: string | null = auth.currentUser ? auth.currentUser.uid : null;
        if (userId && selectedHunt && selectedHunt.docId) {
            try {
                const huntRef = doc(db, "users", userId, "shinyHunts", selectedHunt.docId);
                const huntDoc = await getDoc(huntRef);
                const huntData = huntDoc.data();
                if(huntData) {
                    if (newShinyHunt.pokemon &&
                        huntData.method === newShinyHunt.method &&
                        huntData.game === newShinyHunt.game &&
                        huntData.dateCreated === newShinyHunt.dateCreated &&
                        huntData.encounters === newShinyHunt.encounters &&
                        comparePokemon(huntData.pokemon, newShinyHunt.pokemon)
                    ) {
                        console.log('No changes made!');
                    } else {
                        await updateDoc(huntRef, {
                            pokemon: newShinyHunt.pokemon,
                            game: newShinyHunt.game,
                            method: newShinyHunt.method,
                            encounters: newShinyHunt.encounters,
                        });
                        userHunts.update((store) => {
                            if (selectedHunt) {
                                const huntToChange = store.hunts.indexOf(selectedHunt);
                                store.hunts[huntToChange] = newShinyHunt;
                                selectedHunt = newShinyHunt;
                            }
                            return {
                                hunts: store.hunts,
                                isLoaded: store.isLoaded
                            }
                        });
                        console.log('Updated Shiny Hunt!');
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    async function deleteHunt() { 
        const user: User | null = auth.currentUser; 
        let userId: string | null = user ? user.uid : null;
        
        if(userId) {
            try {
                if(user && selectedHunt && selectedHunt.docId) {
                    const huntDoc = await doc(db, "users", userId, "shinyHunts", selectedHunt.docId);
                    if (huntDoc) {
                        await deleteDoc(huntDoc);
                        userHunts.update(store => {
                            // Filter out the hunt based on the docId
                            const updatedHunts = store.hunts.filter(hunt => hunt.docId !== selectedHunt?.docId);
                            // Return a new object with updated hunts and the existing isLoaded state
                            return { 
                                hunts: updatedHunts, 
                                isLoaded: store.isLoaded // Keep isLoaded as it is
                            };
                        });
                        notificationStore.enqueue({ message: "Shiny Hunt successfully deleted.", color: "#FF0000", timeout: 3000 });
                    }
                }
            } catch (error) {
                notificationStore.enqueue({ message: "Unable to delete Shiny Hunt.", color: "#FF0000", timeout: 3000 });
            }
        }
        return false;
    }
    async function completeHunt() {
        if(userId) {
            try {
                const collectionRef = await collection(db, "users", userId, "collection");
                if(selectedHunt) {
                    selectedHunt.dateEnded = currentDateToString();
                    const docRef = await addDoc(collectionRef, {
                        pokemon: selectedHunt.pokemon,
                        game: selectedHunt.game,
                        method: selectedHunt.method,
                        encounters: selectedHunt.encounters,
                        dateCreated: selectedHunt.dateCreated,
                        dateEnded: selectedHunt.dateEnded,
                        EVs: {
                            hp: 0,
                            attack: 0,
                            defense: 0,
                            spAttack: 0,
                            spDefense: 0,
                            speed: 0
                        },
                        nickname: ''
                    });
                    const pokemonDoc = await getDoc(docRef);
                    const pokemonData = {...pokemonDoc.data(), docId: pokemonDoc.id} as completedHunt;
                    userCollection.update((store) => {
                        return {
                            hunts: [...store.hunts, pokemonData],
                            isLoaded: store.isLoaded
                        }
                    })
                }
            } catch (error) {
                notificationStore.enqueue({message:"Hunt could not be completed. Please try again.", color:"#FF0000", timeout: 3000});
            }
        }
    }

    /* OnMount */
    onMount( async() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                if($userHunts.isLoaded == false) {
                    await loadHunts();
                    //console.log("Loaded hunts from FireBase");
                } else {
                    //console.log("Reloaded Hunts from Store");
                }
            }
        });
        loadingStore.update((state) => ({
            layoutLoaded: state.layoutLoaded,
            pageLoaded: true
        }));
    });
</script>

<!-- Pokemon List -->
 <div class='w-full flex flex-col flex-grow mx-auto text-3xl overflow-y-auto bg-[#161A1A] font-semibold'>
    <div class='w-full flex bg-[#212529]'> 
        <button class='w-fit h-full my-auto text-sm pointer' title="Add New Shiny Hunt" on:click={()=>{displayModal('poke-modal')}}> <Plus className='w-[24px] h-[24px] mx-4 rounded-full border-2 border-white stroke-green-400' /> </button>
        <input type='text' placeholder="Search..." bind:value={searchHuntCriteria} on:input={() => {filterHuntList();}} class='w-full my-3 mr-3 px-4 py-2 text-sm rounded-full outline-none border-2 focus:border-red-300'/>
    </div>
        {#if searchHunts.length == 0}
        <div class='w-1/3 max-sm:w-fit border-2 border-grey-600 bg-[#212529] my-auto mx-auto p-[2vw] text-center rounded-xl'>
            <h1 class='py-8'> Your Shiny Hunts </h1>
            <button class='py-8' on:click={() => {displayModal('poke-modal')}}> + </button>
        </div>

        {:else}
        <!-- Current Collection Grid -->
        <div class='w-full overflow-y-auto grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1 px-4 py-4 gap-4'>
            {#each searchHunts as hunt}
            <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 border-red-300 shadow-lg' on:click={() => { 
                selectedHunt = hunt; 
                newShinyHunt = hunt;
                displayModal('hunt-modal')}}>
                <div class='w-fit flex flex-col flex-grow text-sm max-lg:text-[15px] max-sm:text-[13px] text-left text-wrap'>
                    <p class='w-fit px-2 font-bold text-red-100'> {hunt.pokemon?.name}</p>
                    <p class='w-fit px-2 font-semibold'> #{hunt.pokemon?.id} </p>
                </div>
                <div class='w-full h-full flex-grow flex justify-end'>
                    <img src={hunt.pokemon?.spriteUrl} alt={hunt.pokemon?.name} draggable='false' class='w-2/5 object-fit mx-auto max-sm: ml-auto m-0 p-0'/>
                </div>
            </button>
            {/each}
            <!-- Current Selected Shiny Hunt Window -->
            <dialog id='hunt-modal' class='w-1/3 min-w-[340px] h-fit max-xl:w-2/3 max-md:w-full p-4 bg-[#343A40] rounded-xl' on:close={async () => {await updateHunt(); selectedHunt = null; resetNewShinyHunt(); showDescription = false; editMode = false;}}> 
                <div class='relative flex flex-col'>
                    <div class='flex gap-2'>
                        <button class='w-fit h-fit p-1 hover:bg-gray-600 text-sm text-white rounded-full' on:click={() => {showDescription = (!showDescription)}}> <QuestionMark className='w-[32px] h-[32px]'/> </button>
                        <button class='w-fit h-fit p-1 hover:bg-gray-600 text-sm text-white rounded-full' on:click={() =>{
                            resetNewShinyHunt();
                            editMode = true;
                            displayModal('poke-modal');
                        }}> <Edit className='w-[32px] h-[32px]' /> </button>
                        <button class='w-fit h-fit ml-auto p-1 hover:bg-gray-600 text-md text-white rounded-full' on:click={() =>{ displayModal('hunt-modal'); }}> <Close className="w-[32px] h-[32px]" color='' /> </button>
                    </div>
                    <div class='flex flex-col text-center mb-4 text-white bg-[#343A40]'>
                        <p> {selectedHunt?.pokemon?.name ? selectedHunt.pokemon.name.charAt(0).toUpperCase() + selectedHunt.pokemon.name.slice(1).toLowerCase() : ''}</p>
                        <img src={selectedHunt?.pokemon?.spriteUrl} alt='Pokemon Sprite' class='w-1/2 mx-auto'/>
                        <div class='w-full mt-8 flex justify-evenly'>
                            <button class='w-fit select-none touch-manipulation' on:click={() => {if (selectedHunt && (newShinyHunt.encounters - incrementCount >= 0)) { newShinyHunt.encounters -= incrementCount}}}> <Decrement className="w-[56px] h-[56px] mx-auto"/> </button>
                            <p class='w-full h-full my-auto mx-4 bg-white text-5xl max-sm:text-md text-center rounded-md text-black'> { newShinyHunt.encounters }</p>
                            <button class='w-fit select-none touch-manipulation' on:click={() => {if (selectedHunt) { newShinyHunt.encounters += incrementCount}}}> <Increment className="w-[56px] h-[56px] mx-auto"/> </button>
                        </div>
                    </div>
                    <div class='flex'>
                        <button class='w-fit mr-auto rounded-xl p-2 touch-manipulation hover:bg-gray-600' on:click={async () => {
                            const option = confirm("Pressing \"OK\" will complete the hunt. Continue?")
                            if (option) {
                                await completeHunt();
                                await deleteHunt();
                                displayModal('hunt-modal');
                                searchHunts = currentHunts;
                                selectedHunt = null;
                                showDescription = false;
                            }}}> <Flag className='w-[44px] h-[44px] mx-auto'/> </button>
                        <button class='w-fit rounded-xl p-2 touch-manipulation hover:bg-gray-600' on:click={async () => {
                            const result = confirm("Do you want to delete this hunt?");
                            if (result) {
                                await deleteHunt();
                                displayModal('hunt-modal')
                            }
                        }}> <Trashcan className="w-[44px] h-[44px] mx-auto" /> </button>
                    </div>
                </div>
            <!-- Description of hunt -->
                {#if showDescription}
                <div class='w-full h-fit absolute flex flex-col top-0 left-0 z-[1] text-sm text-gray-100 bg-[#69747c] rounded-xl drop-shadow-lg' transition:slide={{ axis: 'y' }}>
                    <button class='w-fit ml-auto m-1 p-1 text-xl rounded-full hover:bg-gray-600' on:click={() => {showDescription = false;}}> <Close className="w-[24px] h-[24px] ml-auto" color=''/> </button>
                    <p class='h-fit my-auto py-3 border-t-2 border-[#a4a4a4] px-4'> <span class='text-red-200'> Game: </span> {selectedHunt?.game} </p>
                    <p class='h-fit my-auto py-3 border-t-2 border-[#a4a4a4] px-4'> <span class='text-red-200'> Method: </span> {selectedHunt?.method} </p>
                    <p class='h-fit my-auto py-3 border-t-2 border-[#a4a4a4] px-4'> <span class='text-red-200'> Encounters: </span> {selectedHunt?.encounters} </p>
                    <p class='h-fit my-auto py-3 border-t-2 border-[#a4a4a4] px-4'> <span class='text-red-200'> Increment Count: </span>
                        <button class='text-xl text-red-400 select-none' on:click={() => {if(incrementCount - 1 > 0) {incrementCount -= 1}}}> - </button> 
                        <input type='number' class='w-[4ch] p-1' min="0" max="999" bind:value={incrementCount}> 
                        <button class='-xl text-green-400 select-none' on:click={() => {incrementCount += 1}}> + </button> </p>
                    <p class='h-fit my-auto py-3 border-t-2 border-[#a4a4a4] px-4'> <span class='text-red-200'> Date started: </span> {selectedHunt?.dateCreated} </p>
                </div>
                {/if}
            </dialog>
        </div>
        {/if}

        <!-- Start New Hunt Menu -->
        <dialog id='poke-modal' class='w-full h-[90%] bg-[#212529] rounded-l-xl max-sm:rounded-xl' on:close={() => {if(editMode && selectedHunt) {newShinyHunt = selectedHunt}}}> 
            <div class='flex flex-row text-[#dee2ff] h-full'>
                <!-- Left Side of Hunt Menu -->
                <div class='w-fit min-w-fit h-full flex flex-col px-8 max-lg:px-2 pt-2 pb-4 max-sm:px-1 max-sm:py-2 text-[18px] bg-[#2D3238] text-left'>
                    <div class='w-[100px] flex flex-col max-sm:hidden'>
                        <button class='py-1 {newShinyHunt?.pokemon ? 'text-green-400' : ''}' on:click={() => {changeOption(0);}}>  {newShinyHunt?.pokemon ? newShinyHunt.pokemon.name.charAt(0) + newShinyHunt.pokemon.name.slice(1).toLowerCase() : 'Pokemon'} </button>
                        <button class='py-1 text-wrap {newShinyHunt?.game ? 'text-green-400' : ''}' on:click={()=>{changeOption(1);}}> {newShinyHunt?.game ? newShinyHunt?.game : "Game"} </button>
                        <button class='py-1 text-wrap {newShinyHunt?.method ? 'text-green-400' : ''}' on:click={() => {changeOption(2);}}> {newShinyHunt?.method ? newShinyHunt?.method : "Method"} </button>
                    </div>
                    <div class='hidden w-[60px] max-sm:flex max-sm:flex-col'>
                        <button class='flex mx-auto min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] py-1' on:click={() => {changeOption(0);}}>
                            {#if newShinyHunt?.pokemon}
                            <img src={newShinyHunt.pokemon?.spriteUrl} alt={newShinyHunt.pokemon?.name} class="mx-auto h-full object-cover rounded-md {newShinyHunt.pokemon ? 'border-2 border-green-400' : ''}"/>
                            {:else}
                            <Pokeball className="mx-auto w-4/5 h-full  {newShinyHunt.game ? "fill-green-500" : ""}"/>
                            {/if}
                        </button>
                        <button class='min-w-[56px] max-w-[56px] h-fit mx-auto py-1' on:click={() => {changeOption(1);}}> <Gameboy className="m-auto w-[70%] {newShinyHunt?.game ? "fill-green-500" : ""}"/> </button>
                        <button class='min-w-[56px] max-w-[56px] h-fit mx-auto py-1' on:click={() => {changeOption(2);}}> <Grass className="m-auto w-3/5 {newShinyHunt.method ? "fill-green-500" : ""}" /> </button>
                    </div>
                    <button class='mt-auto rounded-xl' on:click={async() => {
                        if (editMode) { 
                            await updateHunt();
                        } else {
                            if (await makeHunt() == true) { 
                                notificationStore.enqueue({ message: "New Shiny Added!", color: "#00FF00", timeout: 3000 });
                                searchHunts = currentHunts;
                                newShinyHunt.pokemon = newShinyHunt.game = newShinyHunt.method = null;
                                option = 0;
                            }
                        }
                        displayModal('poke-modal'); 
                    }}> 
                    <p class='inline-block max-sm:hidden {newShinyHunt.pokemon && newShinyHunt.game && newShinyHunt.method ? "text-green-400" : ""}'> {editMode ? 'Edit Hunt' : 'Begin Hunt'} </p>
                    <Confirm className="w-1/2 hidden max-sm:inline-block" strokeOne={newShinyHunt.pokemon && newShinyHunt.game && newShinyHunt.method ? "#64C37D" : "#ffffff"} />
                    </button>
                    
                </div>
                
                <!-- Right Side of Hunt Menu -->
                <div class="w-full h-full flex flex-col">
                    <!-- Search Bar and Close Button (Static) -->
                    <div class='w-full h-fit flex flex-col '>
                        <button class='w-fit h-fit ml-auto mr-2 my-2 p-1 hover:bg-gray-600 rounded-full' on:click={() => {displayModal('poke-modal'); newShinyHunt.pokemon = null; newShinyHunt.game = null; newShinyHunt.method = null; option = 0;}}> <Close className='w-[32px] h-[32px]' color=''/> </button>
                        {#if option === 0}
                        <input type='text' bind:value={searchCriteria} on:input={filteredPokemonList} class='w-[92%] mx-auto text-sm rounded-full m-1 px-3 py-1 border-none' placeholder="Search Pokémon..."/>
                        {/if}
                    </div>
                
                    <!-- Scrollable Section  -->
                    <div id='scroll-area' class="max-h-full overflow-y-auto mt-4">
                        {#if $pokemonList.isLoaded}
                        <!-- Pokemon Selector -->
                            {#if option == 0}
                                <div class='grid grid-cols-6 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-8 px-4 pb-4 text-left'>
                                    {#each searchList as pokemon}
                                    <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 {newShinyHunt.pokemon?.name == pokemon.name ? 'border-green-400' : 'border-[#dee2ff]'} shadow-lg' on:click={() => {
                                        newShinyHunt.pokemon = pokemon; 
                                        option = 1;
                                        document.getElementById('scroll-area')?.scrollTo(0,0); 
                                    }}>
                                        <div class='w-fit flex flex-col flex-grow text-sm max-lg:text-[15px] max-sm:text-[3vw] text-left text-wrap {newShinyHunt.pokemon?.name == pokemon.name ? 'text-green-300' : ''}'>
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
                                    <h1 class='text-[24px]'> {generation}</h1>
                                    <div class='grid grid-cols-3 max-sm:grid-cols-1 py-4 gap-4'>
                                    {#each games as game}
                                        <button class='p-1 text-center text-[18px] border-2 rounded-xl {newShinyHunt?.game == game ? 'border-green-400 text-green-400' : "" }' on:click={()=>{newShinyHunt.game = game; option = 2;}}> {game} </button>
                                    {/each}
                                    </div>
                                {/each}  
                                </div>
                            <!-- Method Selector -->
                            {:else if option == 2}
                            <div class='grid grid-cols-2 max-sm:grid-cols-1 gap-8 px-4 py-4'>
                                {#each encounterMethods as method}
                                    <button class='border-2 rounded-xl {newShinyHunt?.method == method ? 'border-green-400 text-green-400' : "" }' on:click={() => {newShinyHunt.method = method}}> {method} </button>
                                {/each}
                            </div>
                            {:else if option === 3}
                            <div>
                                <label> <p> Date Created: </p> <input /> </label>
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
    input {
        outline: none;
        color: black;
    }
    /* Chrome, Safari, Edge, Opera */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
</style>