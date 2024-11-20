<script lang='ts'>
	import { encounterMethods, pokemonGames, type completedHunt, type HuntedPokemon, type Pokemon, type shinyHunt } from "$lib/data";
	import { auth, db } from "$lib/firebase";
	import { onAuthStateChanged } from "firebase/auth";
	import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
	import { onMount } from "svelte";
	import Plus from "../../components/svg/plus.svelte";
	import Close from "../../components/svg/close.svelte";
	import Decrement from "../../components/svg/decrement.svelte";
	import Increment from "../../components/svg/increment.svelte";
	import QuestionMark from "../../components/svg/questionMark.svelte";
	import Trashcan from "../../components/svg/trashcan.svelte";
    import Pokeball from "../../components/svg/pokeball.svelte";
	import { loadCollection, notificationStore, pokemonList, userCollection, userHunts, userId } from "../../store/pokemonStore";
	import { loadingStore } from "../../store/store";
	import Filter from "../../components/svg/filter.svelte";
	import Gameboy from "../../components/svg/gameboy.svelte";
	import Grass from "../../components/svg/grass.svelte";
	import Confirm from "../../components/svg/confirm.svelte";
	import Edit from "../../components/svg/edit.svelte";

    // Current Collection
    let currentCollection: completedHunt[] = [];
    let searchCriteria: string = "";
    let filteredCollection: completedHunt[] = [];
    let selectedHunt: completedHunt | null = null;
    let selectedPokemon: HuntedPokemon | null = null;

    // Adding/Editing Pokemon
    let editMode: boolean = false;
    let searchPokemon: string = "";
    let searchList: Pokemon[] = [];
    let newPokemon: completedHunt = {pokemon: null, game: null, method: null, encounters: 0, docId: null, dateCreated: null, dateEnded: null, nickname: ''};
    let option: number = 0;
    let deleted: boolean = false;    
    // EVs
    let hp: number = 0, attack: number = 0, spAttack: number = 0, defense: number = 0, spDefense: number = 0, speed: number = 0;
    let remaining: number = 510;
    let incrementCount: number = 1;
    let showDescription: boolean = false;
    let showEVs: boolean = false;
        
    $: {currentCollection = $userCollection.hunts; 
        filteredCollection = currentCollection};
    $: searchList = $pokemonList.pokemonList;

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
    }

    function changeOption(val: number) {
        option = val;
        const currWindow = document.getElementById('scroll-area');
        currWindow?.scrollTo(0,0);
    }

    function filterCollection(searchCriteria: string) {
        if (searchCriteria === "") {
            filteredCollection = currentCollection;
        } else {
            filteredCollection = currentCollection.filter((p) => {
                return p.pokemon?.name.toLowerCase().includes(searchCriteria);
            });
        }
    }
    function filterPokemonList() {
        if (searchPokemon === "") {
            searchList = $pokemonList.pokemonList;
        } else {
            searchList = $pokemonList.pokemonList.filter((p) => {
                return p.name.toLowerCase().includes(searchPokemon.toLowerCase());
            })
        }
    }
    let totalEVs = () => {
        return hp + attack + defense + spAttack + spDefense + speed;
    }

    function calcEV(stat: string, amount: number) {
        switch(stat) {
            case("hp"):
                if(hp + amount >= 0 && hp + amount <= 252) {
                    hp += amount;
                } else if (hp + amount < 0) {
                    hp = 0;
                } else if (hp + amount > 252) {
                    hp = 252;
                }
                break;
            case("atk"):
                if(attack + amount >= 0 && attack + amount <= 252) {
                    attack += amount;
                } else if (attack + amount < 0) {
                    attack = 0;
                } else if (attack + amount > 252) {
                    attack = 252;
                }
                break;
            case("def"):
                if(defense + amount >= 0 && defense + amount <= 252) {
                    defense += amount;
                } else if (defense + amount < 0) {
                    defense = 0;
                } else if (defense + amount > 252) {
                    defense = 252;
                }
                break;
            case("spAtk"):
                if(spAttack + amount >= 0 && spAttack + amount <= 252) {
                    spAttack += amount;
                } else if (spAttack + amount < 0) {
                    spAttack = 0;
                } else if (spAttack + amount > 252) {
                    spAttack = 252;
                }
                break;
            case("spDef"):
                if(spDefense + amount >= 0 && spDefense + amount <= 252) {
                    spDefense += amount;
                } else if (spDefense + amount < 0) {
                    spDefense = 0;
                } else if (spDefense + amount > 252) {
                    spDefense = 252;
                }
                break;
            case("speed"):
                if(speed + amount >= 0 && speed + amount <= 252) {
                    speed += amount;
                } else if (speed + amount < 0) {
                    speed = 0;
                } else if (speed + amount > 252) {
                    speed = 252;
                }
                break;
        }
    }
    function updateSlider(id: string) {
        let stat: string = id.split('-')[0];
        if(totalEVs() <= 510) {
            switch(stat) {
                case("hp"):
                    if (hp !== null && hp !== undefined) {
                        if (hp < 0) {
                            hp = 0;
                        } else if (hp > 252) {
                            hp = 252;
                        }
                    } else {
                        hp = 0;
                    }
                    break;
                case("atk"):
                    if (attack < 0) {
                        attack = 0;
                    } else if (attack > 252) {
                        attack = 252;
                    }
                    break;
                case("def"):
                    if (defense < 0) {
                        defense = 0;
                    } else if (defense > 252) {
                        defense = 252;
                    }
                    break;
                case("spatk"):
                    if (spAttack < 0) {
                        spAttack = 0;
                    } else if (spAttack > 252) {
                        spAttack = 252;
                    }
                    break;
                case("spdef"):
                    if (spDefense < 0) {
                        spDefense = 0;
                    } else if (spDefense > 252) {
                        spDefense = 252;
                    }
                    break;
                case("speed"):
                    if (speed < 0) {
                        speed = 0;
                    } else if (speed > 252) {
                        speed = 252;
                    }
                    break;
            }
        } else if (totalEVs() > 510) {
            switch(stat) {
                case("hp"):
                    hp = 510 - attack - defense - spAttack - spDefense - speed;
                    break;
                case("atk"):
                    attack = 510 - hp - defense - spAttack - spDefense - speed;
                    break;
                case("def"):
                    defense = 510 - hp - attack - spAttack - spDefense - speed;
                    break;
                case("spatk"):
                    spAttack = 510 - hp - attack - defense - spDefense - speed;
                    break;
                case("spdef"):
                    spDefense = 510 - hp - attack - defense - spAttack - speed;
                    break;
                case("speed"):
                    speed = 510 - hp - attack - defense - spAttack - spDefense;
                    break;
            }
        }
            remaining = 510 - totalEVs();
        }

    function resetEVs() {
        hp = 0; hp = 0;
        attack = 0; attack = 0;
        defense = 0; defense = 0;
        spAttack = 0; spAttack = 0;
        spDefense = 0; spDefense = 0;
        speed = 0; speed = 0;
        remaining = 510;
    }

    async function loadEVs() {
        const selectedPokemon = selectedHunt?.pokemon;
        if (selectedPokemon) {
            hp = selectedPokemon.EVs.hp;
            attack = selectedPokemon.EVs.attack;
            defense = selectedPokemon.EVs.defense;
            spAttack = selectedPokemon.EVs.spAttack;
            spDefense = selectedPokemon.EVs.spDefense;
            speed = selectedPokemon.EVs.speed;
            remaining = 510 - totalEVs();
        }
    }
    function comparePokemon(p1: HuntedPokemon, p2: HuntedPokemon) {
        if (p1.name === p2.name &&
            p1.id === p2.id &&
            p1.spriteUrl === p2.spriteUrl &&
            p1.EVs.hp === hp &&
            p1.EVs.attack === attack &&
            p1.EVs.defense === defense &&
            p1.EVs.spAttack === spAttack &&
            p1.EVs.spDefense === spDefense &&
            p1.EVs.speed === speed
        )   {
            return true;
        }
        return false;
    }
    async function updatePokemon() {
        if(userId && selectedHunt && selectedHunt.docId) {
            const docRef = doc(db, "users", userId, "collection", selectedHunt.docId);
            const collectionDoc = await getDoc(docRef);
            const collectionData: completedHunt = collectionDoc.data() as completedHunt;
            const EVs = collectionData?.pokemon?.EVs;

            if (
                collectionData.pokemon && newPokemon.pokemon &&
                comparePokemon(collectionData.pokemon, newPokemon.pokemon) &&
                collectionData?.game === newPokemon.game &&
                collectionData?.method === newPokemon.method &&
                collectionData?.nickname === newPokemon.nickname &&
                collectionData?.encounters === newPokemon.encounters &&
                collectionData?.dateCreated === inputToDate(newPokemon.dateCreated ?? '') && 
                collectionData?.dateEnded === inputToDate(newPokemon.dateEnded ?? '')
            ) {
                console.log('All values match! No values changed.');
            } else {
                if (selectedHunt) {
                    selectedHunt.pokemon = newPokemon.pokemon;
                    selectedHunt.game = newPokemon.game;
                    selectedHunt.method = newPokemon.method;
                    selectedHunt.dateCreated = inputToDate(newPokemon.dateCreated ?? '');
                    selectedHunt.dateEnded = inputToDate(newPokemon.dateEnded ?? '');
                    selectedHunt.encounters = newPokemon.encounters;
                    if (selectedHunt.pokemon) {
                        selectedHunt.nickname = newPokemon.nickname;
                        selectedHunt.pokemon.EVs = {
                            hp: hp,
                            attack: attack,
                            defense: defense,
                            spAttack: spAttack,
                            spDefense: spDefense,
                            speed: speed
                        };
                    }
                    userCollection.update((store) => {
                        return {
                            hunts: store.hunts,
                            isLoaded: store.isLoaded
                        }
                    });
                    // Write to FireStore
                    await updateDoc(docRef, {
                        pokemon: selectedHunt.pokemon,
                        game: selectedHunt.game,
                        method: selectedHunt.method,
                        encounters: selectedHunt.encounters,
                        nickname: selectedHunt.nickname,
                        dateCreated: selectedHunt.dateCreated,
                        dateEnded: selectedHunt.dateEnded
                    })
                    console.log('Updated Pokemon!');
                }
            }
        }
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
    function dateToInput(date: string): string {
        const splitDate = date.split(' ');
        if (splitDate.length === 2) {
            const inputDate = splitDate[0].split('/');
            const inputTime = splitDate[1].split(':');
            const input = `${inputDate[2]}-${inputDate[0]}-${inputDate[1]}T${inputTime[0]}:${inputTime[1]}`;
            return input;
        }
        return '';
    }
    function inputToDate(date: string): string {
        const splitDate = date.split('T');
        if (splitDate.length === 2) {
            const dateParts = splitDate[0].split('-');
            const timeParts = splitDate[1].split(':');
            const newDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]} ${timeParts[0]}:${timeParts[1]}`
            return newDate;
        }
        return date;
    }
    async function addPokemon(): Promise<boolean> {
        if(userId) {
            try {
                const pokemonCollection = await collection(db, "users", userId, "collection");
                if(newPokemon?.pokemon != null && newPokemon?.game != null && newPokemon.method != null) {
                    const docRef = await addDoc(pokemonCollection, {
                        pokemon: newPokemon.pokemon,
                        nickname: newPokemon.nickname != null ? newPokemon.nickname : '',
                        game: newPokemon.game,
                        method: newPokemon.method,
                        encounters: 0,
                        dateCreated: inputToDate(newPokemon.dateCreated ?? ''),
                        dateEnded: inputToDate(newPokemon.dateEnded ?? '')
                    });
                    const addPokemonDoc = await getDoc(docRef);
                    const addPokemon: completedHunt = {...addPokemonDoc.data(), docId: docRef.id} as completedHunt;
                    userCollection.update((store) => {
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

    async function deletePokemon() {
        if (userId && selectedHunt && selectedHunt.docId) {
            try {
                const docRef = doc(db, "users", userId, "collection", selectedHunt.docId);
                if (docRef) {
                    const docToDelete = await deleteDoc(docRef);
                    userCollection.update((collection) => {
                        const updatedCollection = collection.hunts.filter(pokemon => pokemon.docId !== selectedHunt?.docId);
                        return {
                            hunts: updatedCollection,
                            isLoaded: collection.isLoaded
                        }
                    })
                }
            } catch (error) {
                console.error(error);
            }


        }
    }
    function resetNewPokemon() {
        newPokemon.pokemon = null;
        newPokemon.game = null;
        newPokemon.method = null;
        newPokemon.docId = null;
        newPokemon.dateCreated = '';
        newPokemon.dateEnded = '';
        newPokemon.encounters = 0;
        newPokemon.nickname = '';
    }
    onMount( async() =>{ 
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                if ($userCollection.isLoaded == false) {
                    await loadCollection();
                    loadingStore.update((state) => ({
                        layoutLoaded: state.layoutLoaded,
                        pageLoaded: true
                    }));
                    //console.log("Loaded Collection from FireBase");
                } else {
                    //console.log("Loaded Collection from Store");
                }
            }
        });
    });
</script>

<div class='w-full flex flex-col flex-grow overflow-y-auto bg-[#161A1A]'>
    <div class='w-full flex bg-[#212529]'> 
        <button class='w-fit h-full my-auto text-sm pointer' on:click={()=>{displayModal('new-poke-modal')}}> <Plus className='w-[24px] h-[24px] mx-4 rounded-full border-2 border-white stroke-green-400' /> </button>
        <input type='text' placeholder="Search..." bind:value={searchCriteria} on:input={() => {filterCollection(searchCriteria)}} class='w-full my-3 mr-3 px-4 py-2 text-sm font-semibold rounded-full outline-none border-2 focus:border-red-300'/>
    </div>
    <!-- Current Collection -->
    {#if filteredCollection.length === 0}
    <div class='w-1/3 max-sm:w-fit border-2 border-grey-600 bg-[#212529] my-auto mx-auto p-[2vw] font-semibold text-3xl text-center rounded-xl'>
        <h1 class='py-8'> Your Collection </h1>
        <button class='py-8' on:click={() => {displayModal('new-poke-modal')}}> + </button>
    </div>
    {:else} 
    <div class='overflow-y-auto grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1 px-4 py-4 gap-4'>
        {#each filteredCollection as hunt}
        <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 border-red-300 shadow-lg' on:click={() => {
            selectedHunt = hunt;
            newPokemon = {...hunt,
                dateCreated: dateToInput(hunt.dateCreated ?? ''),
                dateEnded: dateToInput(hunt.dateEnded ?? '')
            };
            loadEVs();
            displayModal('poke-modal');
        }}>
            <div class='w-fit flex flex-col flex-grow text-sm max-lg:text-[15px] max-sm:text-[13px] text-left text-wrap'>
                <p class='w-fit px-2 font-bold text-red-100'> {hunt.pokemon?.name}</p>
                <p class='w-fit px-2 font-semibold'> #{hunt.pokemon?.id} </p>
            </div>
            <div class='w-full h-full flex-grow flex justify-end'>
                <img src={hunt.pokemon?.spriteUrl} alt={hunt.pokemon?.name} draggable='false' class='w-2/5 object-fit mx-auto max-sm: ml-auto m-0 p-0'/>
            </div> 
        </button>
        {/each}
    </div>
    {/if}
        <!-- Pokemon Window -->
        <dialog id='poke-modal' class='w-2/5 min-w-[340px] max-xl:w-2/3 max-md:w-full bg-[#343A40] rounded-xl' on:close={async() => { 
            if (!deleted) {
                await updatePokemon(); 
            }
            resetEVs(); 
            editMode = false; 
            resetNewPokemon(); 
            selectedHunt = null; 
            }}>            
            <div class='relative flex flex-col'>
                <div class='flex px-2 pt-2 gap-2'>
                    <button class='w-fit p-2 hover:bg-gray-600 text-md text-white rounded-xl' on:click={() => {showDescription = true; showEVs = false;}}> <QuestionMark className="w-[32px] h-[32px]" /> </button>
                    <button class='w-fit p-2 hover:bg-gray-600 text-md text-white rounded-xl' on:click={() => {
                        option = 0;
                        editMode = true;
                        displayModal('new-poke-modal');
                    }}> <Edit className='w-[32px] h-[32px]' /> </button>
                    <button class='w-fit ml-auto p-2 hover:bg-gray-600 text-md text-white rounded-xl' on:click={() =>{ displayModal('poke-modal'); showEVs = false;}}> <Close className="w-[32px] h-[32px]" color=''/> </button>
                </div>
                <p class='text-center text-4xl text-white font-semibold'> {selectedHunt?.pokemon?.name ? selectedHunt.pokemon.name.charAt(0).toUpperCase() + selectedHunt.pokemon.name.slice(1).toLowerCase() : ''}  </p>
                <img src={selectedHunt?.pokemon?.spriteUrl} alt='Pokemon Sprite' class='w-1/2 mx-auto'/>
                <!-- Show Description -->
                {#if showDescription && selectedHunt}
                    <div class='absolute overflow-y-auto w-full h-fit top-0 text-sm font-semibold bg-gray-600 rounded-xl drop-shadow-md'>
                        <div class='w-full flex flex-col'>
                            <button class='w-fit ml-auto p-1 m-1 rounded-full hover:bg-gray-700' on:click={() => {showDescription = false;}}><Close className='w-[24px] h-[24px]' color='' /> </button>
                            <p class='p-4 text-white border-t-2 border-[#a1a1a1]'> <span class='text-red-200'> Nickname: </span>{selectedHunt.nickname != '' ? selectedHunt.nickname : 'N/A'} </p>
                            <p class='p-4 text-white border-t-2 border-[#a1a1a1]'> <span class='text-red-200'> Game: </span>{selectedHunt.game} </p>
                            <p class='p-4 text-white border-t-2 border-[#a1a1a1]'> <span class='text-red-200'> Method: </span> {selectedHunt.method} </p>
                            <p class='p-4 text-white border-t-2 border-[#a1a1a1]'> <span class='text-red-200'> Encounters: </span>{selectedHunt.encounters} </p>
                            <p class='p-4 text-white border-t-2 border-[#a1a1a1]'> <span class='text-red-200'> Date Started: </span>{selectedHunt.dateCreated !== '' ? selectedHunt.dateCreated : 'N/A'} </p>
                            <p class='p-4 text-white border-t-2 border-[#a1a1a1]'> <span class='text-red-200'> Date Ended: </span>{selectedHunt.dateEnded !== '' ? selectedHunt.dateEnded : 'N/A'} </p>
                        </div>
                    </div>
                {/if}
                
                <!-- EV Window -->
                {#if showEVs}
                    <div class='absolute overflow-y-auto w-full h-fit bottom-0 pb-3 text-sm font-semibold bg-gray-600 rounded-xl drop-shadow-md'>
                        <div class='w-full flex py-2 px-3'>
                            <p class='text-white my-auto'> Remaining EVs: {remaining} </p>
                            <label class='ml-auto my-auto text-md text-white font-semibold mr-2'> Increment Count: <input type='number' min=0 max=252 bind:value={incrementCount} class='w-[5ch] text-black rounded-sm'/> </label>
                            <button class='w-fit rounded-full p-2 hover:bg-gray-500' on:click={() => {showEVs = false;}}> <Close className='w-[32px] h-[32px]' color=''/> </button>
                        </div> <hr class='border-1 border-[#b1b1b1]'/>
                        <!-- HP Stat -->
                        <div class='w-full h-fit flex mt-3 px-3 gap-3'>
                            <p class='min-w-[7ch] h-full my-auto text-white'> HP: </p>
                            <input type='number' min=0 max="252" bind:value={hp} on:input={() => {updateSlider('hp-slider')}} class='w-fit h-fit my-auto rounded-sm'>
                            <input id='hp-slider' type="range" max="252" bind:value={hp} class='slider w-full min-w-[64px]' on:input={() => {updateSlider('hp-slider');}}/>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('hp', incrementCount * -1); updateSlider('hp-slider'); }}> <Decrement className="w-[24px] h-[24px]"/> 
                            </button>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('hp', incrementCount); updateSlider('hp-slider'); }}> <Increment className="w-[24px] h-[24px]" /> 
                            </button>
                        </div> 
                        <!-- Attack Stat -->
                        <div class='w-full h-fit flex mt-3 px-3 gap-3'>
                            <p class='min-w-[7ch] h-fit text-white my-auto'> Attack: </p>
                            <input type='number' min=0 max="252" bind:value={attack} class='w-fit h-fit my-auto rounded-sm'>
                            <input id='atk-slider' type="range" max="252" bind:value={attack} class='slider w-full' on:input={() => {
                                updateSlider('atk-slider');
                            }}/>
                            <button class='w-fit h-fit' on:click={() => {
                                calcEV('atk', incrementCount * -1); updateSlider('atk-slider');}}> <Decrement className="w-[24px] h-[24px]"/> 
                            </button>
                            <button class='w-fit h-fit' on:click={() => {
                                calcEV('atk', incrementCount); updateSlider('atk-slider');}}> <Increment className="w-[24px] h-[24px]" /> 
                            </button>
                        </div> 
                        <!-- Defense Stat -->
                        <div class='w-full h-fit flex mt-3 px-3 gap-3'>
                            <p class='min-w-[7ch] text-white'> Defense: </p>
                            <input type='number' min=0 max="252"  bind:value={defense} class='w-fit h-fit my-auto rounded-sm'>
                            <input id='def-slider' type="range" max="252" bind:value={defense} class='slider w-full' on:input={() => {
                                updateSlider('def-slider');
                            }}/>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('def', incrementCount * -1); updateSlider('def-slider');}}> <Decrement className="w-[24px] h-[24px]" /> </button>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('def', incrementCount); updateSlider('def-slider');}}> <Increment className="w-[24px] h-[24px]" /> </button>
                        </div> 
                        <!-- Sp. Attack Stat -->
                        <div class='w-full h-fit flex mt-3 px-3 gap-3'>
                            <p class='min-w-[7ch] text-white'> Sp. Atk: </p>
                            <input type='number' min=0 max="252" bind:value={spAttack} class='w-fit h-fit my-auto rounded-sm'>
                            <input id='spatk-slider' type="range" max="252" bind:value={spAttack} class='slider w-full' on:input={() => {
                                updateSlider('spatk-slider');
                            }}/>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('spAtk', incrementCount * -1); updateSlider('spatk-slider');}}> <Decrement className="w-[24px] h-[24px]" /> </button>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('spAtk', incrementCount); updateSlider('spatk-slider');}}> <Increment className="w-[24px] h-[24px]" /> </button>
                        </div> 
                        <!-- Sp. Defense Stat -->
                        <div class='w-full h-fit mt-3 flex px-3 gap-3'>
                            <p class='min-w-[7ch] text-white'> Sp. Def: </p>
                            <input type='number' min=0 max="252" bind:value={spDefense} class='w-fit h-fit my-auto rounded-sm'>
                            <input id='spdef-slider' type="range" max="252" bind:value={spDefense} class='slider w-full' on:input={() => {
                                updateSlider('spdef-slider');
                            }}/>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('spDef', incrementCount * -1); updateSlider('spdef-slider');}}> <Decrement className="w-[24px] h-[24px]" /> </button>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('spDef', incrementCount); updateSlider('spdef-slider');}}> <Increment className="w-[24px] h-[24px]" /> </button>
                        </div> 
                        <!-- Speed Stat -->
                        <div class='w-full h-fit mt-3 flex px-3 gap-3'>
                            <p class='min-w-[7ch] text-white'> Speed: </p>
                            <input type='number' min=0 max="252" bind:value={speed} class='w-fit h-fit my-auto rounded-sm'/>
                            <input id='speed-slider' type="range" bind:value={speed} max="252" class='slider w-full' on:input={() => {
                                updateSlider('speed-slider');
                            }}/>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('speed', incrementCount * -1); updateSlider('speed-slider');}}> <Decrement className="w-[24px] h-[24px]" /> </button>
                            <button class='w-fit h-fit touch-manipulation' on:click={() => {
                                calcEV('speed', incrementCount); updateSlider('speed-slider');}}> <Increment className="w-[24px] h-[24px]" /> </button>
                        </div> 
                    </div>
                {/if}
                <div class='flex h-full mt-auto p-2'>
                    <button class='w-fit hover:bg-gray-600 text-md text-white rounded-xl' on:click={() => {showEVs = !showEVs; showDescription = false;}}> <Filter className='w-[32px] h-[32px]'/> </button>
                    <button class='w-fit hover:bg-gray-600 ml-auto p-1 rounded-xl' title="Delete Pokémon" on:click={async () => {
                        const result = confirm("Delete Pokemon from your collection?");
                        if (result) {
                            try {
                                await deletePokemon();
                                notificationStore.enqueue({message: "Pokemon successfully removed from your collection!", color: "#00FF00", timeout: 3000});
                                deleted = true;
                                displayModal('poke-modal');
                            } catch (error) {
                                notificationStore.enqueue({message: "Unable to delete Pokemon. Please try again later.", color: "#FF0000", timeout: 3000});

                            }
                        };
                    }}> <Trashcan className="w-[32px] h-[32px]"/> </button>
                    
                </div>
            </div>
        </dialog>

        <dialog id='new-poke-modal' class='w-full h-[90%] bg-[#212529] rounded-l-xl max-sm:rounded-xl font-semibold overflow-auto' on:close={() => { 
            if(!editMode) {
                resetNewPokemon();
            } else if (editMode && selectedHunt) {
                newPokemon = {...selectedHunt};
            }
            changeOption(0);       
            }}> 
            <div class='flex flex-row text-[#dee2ff] h-full'>
                <!-- Left Side of Hunt Menu -->
                <div class='w-fit h-full flex flex-col px-8 max-sm:px-2 pt-2 pb-4 max-sm:px-1 max-sm:py-2 text-[18px] bg-[#2D3238] text-left'>
                    <div class='w-[100px] flex flex-col max-sm:hidden'>
                        <button class='py-2 text-wrap font-semibold {newPokemon?.pokemon ? 'text-green-400' : ''}' on:click={() => {changeOption(0);}}>  {newPokemon?.pokemon ? newPokemon.pokemon.name.charAt(0) + newPokemon.pokemon.name.slice(1).toLowerCase() : 'Pokemon'} </button>
                        <button class='py-2 text-wrap font-semibold {newPokemon?.game ? 'text-green-400' : ''}' on:click={()=>{changeOption(1);}}> {newPokemon?.game ? newPokemon?.game : "Game"} </button>
                        <button class='py-2 text-wrap font-semibold {newPokemon?.method ? 'text-green-400' : ''}' on:click={() => {changeOption(2);}}> {newPokemon?.method ? newPokemon?.method : "Method"} </button>
                        <button class='py-2 text-wrap font-semibold {newPokemon?.dateCreated && newPokemon?.dateEnded ? 'text-green-400' : ''}' on:click={() => changeOption(3)}> Other Info</button>
                    </div>
                    <div class='hidden w-[60px] max-sm:flex max-sm:flex-col'>
                        <button class='flex mx-auto min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] py-1' on:click={() => {changeOption(0);}}>
                            {#if newPokemon?.pokemon}
                            <img src={newPokemon.pokemon?.spriteUrl} alt={newPokemon.pokemon?.name} class="mx-auto h-full object-cover rounded-md {newPokemon.pokemon ? 'border-2 border-green-400' : ''}"/>
                            {:else}
                            <Pokeball className="mx-auto w-4/5 h-full  {newPokemon?.game ? "fill-green-500" : ""}"/>
                            {/if}
                        </button>
                        <button class='min-w-[56px] max-w-[56px] h-fit mx-auto py-1' on:click={() => {changeOption(1);}}> <Gameboy className="m-auto w-[70%] {newPokemon?.game ? "fill-green-500" : ""}"/> </button>
                        <button class='min-w-[56px] max-w-[56px] h-fit mx-auto py-1' on:click={() => {changeOption(2);}}> <Grass className="m-auto w-3/5 {newPokemon?.method ? "fill-green-500" : ""}" /> </button>
                    </div>
                    <button class='mt-auto rounded-xl py-2' on:click={async() => { 
                        if (editMode === true) {
                            await updatePokemon();
                            displayModal('new-poke-modal');
                            notificationStore.enqueue({ message: "Pokemon successfully updated!!", color: "#00FF00", timeout: 3000 });
                        }
                        else if (editMode === false && await addPokemon() == true) { 
                            displayModal('new-poke-modal');
                            notificationStore.enqueue({ message: "New Shiny Added!", color: "#00FF00", timeout: 3000 });
                            option = 0;
                        }
                        }}> 
                    <p class='inline-block font-semibold max-sm:hidden {newPokemon?.pokemon && newPokemon?.game && newPokemon?.method ? "text-green-400" : ""}'> {editMode === true ? 'Confirm Edits' : 'Add Pokémon'} </p>
                    <Confirm className="w-1/2 hidden max-sm:inline-block" strokeOne={newPokemon?.pokemon && newPokemon?.game && newPokemon?.method ? "#64C37D" : "#ffffff"} />
                    </button>
                    
                </div>
                
                <!-- Right Side of Hunt Menu -->
                <div class="w-full h-full flex flex-col">
                    <!-- Search Bar and Close Button (Static) -->
                    <div class='w-full h-fit flex flex-col bg-[#2D3238] px-4'>
                        <div class='flex'>
                            {#if option === 0} 
                            <h1 class='text-lg my-auto'> Select Your Pokémon </h1>
                            {:else if option === 1}
                            <h1 class='text-lg my-auto'> Select Your Game </h1>
                            {:else if option === 2}
                            <h1 class='text-lg my-auto'> Select Your Method </h1>
                            {:else if option === 3}
                            <h1 class='text-lg my-auto'> Other Details </h1>
                            {/if}
                            <button class='w-[3%] max-xl:w-[5%] max-sm:w-[10%] my-2 p-1 h-fit ml-auto hover:bg-gray-600 rounded-full' on:click={() => {
                                displayModal('new-poke-modal'); 
                            }}> <Close className='w-full h-fit' color=''/> 
                            </button>
                        </div>
                            {#if option === 0}
                            <label class='pb-4'> <input type='text' bind:value={searchPokemon} on:input={() => {filterPokemonList();}} class='w-full h-[36px] mx-auto font-semibold text-black text-sm rounded-full m-1 px-3 outline-none border-2 focus:border-red-400' placeholder="Search Pokémon..."/> </label>
                            {/if}
                    </div>
                
                    <!-- Scrollable Section  -->
                    <div id='scroll-area' class="min-w-[340px] max-h-full overflow-y-auto pt-4">
                        {#if $pokemonList.isLoaded}
                        <!-- Pokemon Selector -->
                            {#if option == 0}
                                <div class='grid grid-cols-6 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-8 px-4 pb-4 text-left'>
                                    {#each searchList as pokemon}
                                    <button class='w-full h-fit max-sm:flex-row flex flex-col mt-1 p-1 rounded-xl bg-[#2D3238] border-2 {newPokemon.pokemon?.name === pokemon.name ? 'border-green-400' : 'border-[#dee2ff]'} shadow-lg' on:click={() => {
                                        newPokemon.pokemon = {...pokemon,
                                            EVs: {
                                                hp: hp,
                                                attack: attack,
                                                defense: defense,
                                                spAttack: spAttack,
                                                spDefense: spDefense,
                                                speed: speed
                                            }
                                        };
                                        changeOption(1);
                                    }}>
                                        <div class='w-fit flex flex-col flex-grow text-sm text-left text-wrap {newPokemon.pokemon?.name == pokemon.name ? 'text-green-300' : ''}'>
                                            <p class='w-fit px-2 font-bold'> {pokemon.name} </p>
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
                                        <button class='p-1 text-center text-[18px] border-2 rounded-xl {newPokemon?.game == game ? 'border-green-400 text-green-400' : "" }' on:click={()=>{newPokemon.game = game; changeOption(2);}}> {game} </button>
                                    {/each}
                                    </div>
                                {/each}  
                                </div>
                            <!-- Method Selector -->
                            {:else if option == 2}
                            <div class='grid grid-cols-2 max-sm:grid-cols-1 gap-8 px-4 py-4'>
                                {#each encounterMethods as method}
                                    <button class='border-2 text-[24px] p-1 rounded-xl  {newPokemon?.method == method ? 'border-green-400 text-green-400' : "" }' on:click={() => {newPokemon.method = method; changeOption(3);}}> {method} </button>
                                {/each}
                            </div>
                            {:else if option == 3}
                            <div class='w-full h-full flex flex-col px-4'>
                                <label class='flex flex-col py-3'> Date Created: <input type='datetime-local' bind:value={newPokemon.dateCreated} class='p-1 rounded-md outline-none'/></label>
                                <label class='flex flex-col py-3'> Date Ended: <input type='datetime-local' bind:value={newPokemon.dateEnded} class='p-1 rounded-md outline-none'/></label>
                                <label class='flex flex-col py-3'> Encounters: <input type='number' bind:value={newPokemon.encounters} class='p-1 rounded-md outline-none'/> </label>
                                <label class='flex flex-col py-3'> <p class='flex'> Nickname: <span class='px-1 opacity-[50%]'> (optional) </span> </p> <input type='text' bind:value={newPokemon.nickname} class='p-1 rounded-md outline-none'/> </label>
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
        color: black;
    }
    .slider {
        cursor: pointer;
        outline: none;
        overflow: hidden;
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.6); /* Dark backdrop with 70% opacity */
    }
    ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
        appearance: none;
    }
</style>