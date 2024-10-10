<script lang='ts'>
	import { auth } from '$lib/firebase';
    import {authHandler} from '../store/store';
	import { onMount } from 'svelte';

    let modal: HTMLElement | null;
    let loginEmail = '';
    let loginPassword = '';
    let signUpEmail = '';
    let signUpPassword = '';
    onMount(() => {
        modal = document.getElementById('sign-up');
        auth.signOut();
    })

</script>

<div class='w-full min-h-screen flex'>
    <div class='max-sm:w-full w-2/3 h-full my-auto max-sm:my-0 mx-auto flex max-sm:flex-col-reverse drop-shadow-md'>
        <form class='w-[100%] h-fit bg-white grid my-auto mx-auto p-8'>
            <h1 class='roboto-bold text-center text-4xl'> Login </h1>
            <label class='flex flex-col mt-8 font-semibold'> Email <input type='email' bind:value={loginEmail} class='p-1 bg-gray-100'> </label>
            <label class='flex flex-col mt-4 font-semibold'> Password <input type='password' bind:value={loginPassword} class='p-1 bg-gray-100'> </label>
            <button class='w-3/4 mx-auto mt-16 p-2 bg-red-500 font-semibold rounded-xl text-white shadow-lg' on:click={() => {authHandler.signInUserWithEmailAndPassword(loginEmail, loginPassword)}}> Login </button>
            <button class='w-3/4 mx-auto mt-8 p-2 bg-red-500 font-semibold rounded-xl text-white shadow-lg' on:click={authHandler.loginWithGoogle}> Login with Google </button>
        </form>
        <div class='w-full px-8 pb-4 bg-red-400 flex flex-col'>
            <h1 class='text-3xl text-center mt-8 font-bold text-white'> Welcome to PokeTracker!</h1>
            <p class='text-xl mt-32 text-white text-center font-semibold'> Don't have an account?</p>
            <button class='w-1/2 text-white font-semibold bg-red-500 mt-2 p-2 mx-auto rounded-xl border-[3px] border-white justify-self-center shadow-xl' on:click={modal?.showModal()}> Sign Up! </button>
        </div>
    </div>
    <dialog id='sign-up' class='relative w-2/3 h-fit rounded-xl border-4 border-red-600 shadow-xl'>
        <button class='absolute top-2 right-2 bg-gray-300 font-bold text-2xl'on:click={modal?.close()}> X </button>
        <form class='w-full h-fit flex flex-col p-8'>
            <h1 class='text-3xl font-semibold text-center'> Sign Up </h1>
            <label class='flex flex-col mt-16'> Email <input id='sign-up-email' type='email' bind:value={signUpEmail} class='p-2 bg-gray-100'/></label>
            <label class='flex flex-col mt-8'> Password <input id='sign-up-password' type='password' bind:value={signUpPassword} class='p-2 bg-gray-100'/> </label>
            <button class='p-4 mt-32 rounded-lg bg-red-400' on:click={
            () => {
                authHandler.signUpUserWithEmailAndPassword(signUpEmail, signUpPassword);
                modal?.close();
            }}> Sign Up </button>
        </form>
    </dialog>
</div>