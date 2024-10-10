<script lang='ts'>
    import "../app.css";
	import Navbar from "../components/navbar.svelte";
    import type { User } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import { authStore } from "../store/store";
	import { onDestroy, onMount } from "svelte";

    let currentUser: User | null;
    authStore.subscribe((value) => {
        currentUser = value.user;
    });

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async(user) => {
            if (!user) {
                authStore.update(() => {
                    return {
                        user: null
                    }
                })
            } else {
                authStore.update(() => {
                    return {
                        user : user
                    }
                })
            }
        })
        //console.log(currentUser)
    });

</script>

<div class='min-h-screen min-w-screen flex flex-col max-sm:flex-col-reverse'>
    {#if currentUser}
    <Navbar />
    {/if}
    <slot/>
</div>