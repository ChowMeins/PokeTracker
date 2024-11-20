<script lang='ts'>
    import "../app.css";
	import Navbar from "../components/navbar.svelte";
    import type { User } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import { authStore, loadingStore } from "../store/store";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import type { LoadingState } from "$lib/data";
	import LoadingSpinner from "../components/svg/loadingSpinner.svelte";
	import { loadPokemon, pokemonList } from "../store/pokemonStore";
	import { page } from "$app/stores";
	import NotiStack from "../components/notiStack.svelte";

    let currentUser: User | null;
    authStore.subscribe((value) => {
        currentUser = value.user;
    });
    let loadingState: LoadingState

    $: { loadingState = $loadingStore };

    onMount(async () => {
    // Handle auth state changes
        auth.onAuthStateChanged(async(user) => {
            if (user) {
                authStore.update(() => {
                    return {
                        user: user
                    };
                });
                if ($pokemonList.isLoaded == false) {
                    await loadPokemon();
                }
            } else {
                authStore.update(() => {
                    return {
                        user: null
                    };
                });
                //console.log("No user logged in.")
                goto("/");

            }
        });
        loadingStore.update((state) => ({
            layoutLoaded: true,
            pageLoaded: state.pageLoaded
        }));
        //console.log($page.url.pathname);
    });

</script>

<div class='min-w-[240px] min-h-dvh max-h-dvh flex flex-row max-lg:flex-col max-sm:flex-col-reverse'>
    {#if currentUser && $page.url.pathname != '/'}
        <Navbar/>
    {/if}
    <slot />
    <NotiStack />
    {#if !loadingState.layoutLoaded || !loadingState.pageLoaded}
    <div class='absolute flex flex-col w-full h-full bg-[#212529]'> 
        <div class='flex flex-col my-auto text-center'>
            <p class='font-semibold text-xl p-4'> Loading </p>
            <LoadingSpinner className='w-1/4 h-1/4 mx-auto'/> 
        </div>  
    </div>
    {/if}

</div>