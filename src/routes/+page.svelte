<script lang='ts'>
	import { auth } from '$lib/firebase';
	import { validatePassword } from 'firebase/auth';
	import Close from '../components/svg/close.svelte';
    import {authHandler, loadingStore} from '../store/store';
	import { onMount } from 'svelte';
	import type { PasswordValidationStatus } from 'firebase/auth/web-extension';

    let modal: HTMLDialogElement | null;
    let loginEmail = '';
    let loginPassword = '';
    let signUpEmail = '';
    let signUpPassword = '';
    let confirmPassword = '';
    let passwordStatus: PasswordValidationStatus;
    let passwordValid: boolean = false;
    
    onMount(() => {
        modal = document.getElementById('sign-up') as HTMLDialogElement;
        auth.signOut();
        loadingStore.update((state) => ({
            layoutLoaded: state.layoutLoaded,
            pageLoaded: true
        }));
    })

</script>

<div class='w-full min-h-screen flex text-black'>
    <div class='w-[40%] max-xl:w-1/2 max-lg:w-2/3 max-md:w-4/5 max-sm:w-[90%] h-fit my-auto mx-auto flex flex-col-reverse drop-shadow-md rounded-xl overflow-hidden'>
        <form class='w-full h-fit flex flex-col my-auto mx-auto p-8 bg-[#394047] text-white'>
            <h1 class='roboto-bold text-center text-4xl'> Login </h1>
            <label class='flex flex-col mt-8 font-semibold'> Email <input type='email' bind:value={loginEmail} autocomplete="on" class='p-1 text-black font-semibold bg-gray-100 rounded-md'> </label>
            <label class='flex flex-col mt-4 font-semibold'> Password <input type='password' bind:value={loginPassword} autocomplete="off" class='p-1 text-black font-semibold bg-gray-100 rounded-md'> </label>
            <button class='w-3/4 mx-auto mt-16 p-2 bg-red-500 font-semibold rounded-xl text-white shadow-lg' on:click={() => {authHandler.signInUserWithEmailAndPassword(loginEmail, loginPassword)}}> Login </button>
        </form>
        <div class='w-full h-full flex flex-col px-8 py-4 bg-red-400'>
            <h1 class='text-3xl text-center font-bold text-white'> Welcome to PokeTracker!</h1>
            <p class='text-xl mt-auto text-white text-center font-semibold'> Don't have an account?</p>
            <button class='w-1/2 text-white font-semibold bg-red-500 mt-2 p-2 mx-auto rounded-xl border-[3px] border-white justify-self-center shadow-xl' on:click={() => {modal?.showModal()}}> Sign Up! </button>
        </div>
    </div>
    <dialog id='sign-up' class='relative w-[30%] max-lg:w-1/2 min-w-[300px] h-fit rounded-xl text-white bg-[#394047] shadow-xl'>
        <button class='w-[40px] absolute top-1 right-1' on:click={() => {modal?.close()}}> <Close className="w-full h-auto p-2 rounded-full hover:bg-gray-600" color=''/> </button>
        <form class='w-full h-fit flex flex-col p-8'>
            <h1 class='text-3xl font-semibold text-center'> Sign Up </h1>
            <label class='flex flex-col mt-8'> Email <input id='sign-up-email' type='email' bind:value={signUpEmail} class='p-2 text-black bg-gray-100 rounded-md'/></label>
            <label class='flex flex-col mt-8'> Password <input id='sign-up-password' type='password' bind:value={signUpPassword} on:input={async() => {
                passwordStatus = await validatePassword(auth, signUpPassword);
                passwordValid = passwordStatus.isValid;
            }} class='p-2 text-black bg-gray-100 rounded-md'/>
            {#if !passwordValid}
            <p class='text-[12px] text-red-300'> <span class='text-red-400'> ✖ </span> Password is not valid. Please match all criteria. </p>
            {:else if passwordValid}
            <p class='text-[12px] text-green-300'> <span class='text-green-400'> ✔  </span> Password is valid! </p>
            {/if}
            </label>
            
            <label class='flex flex-col mt-8'> Confirm Password <input id='sign-up-confirm-password' type='password' bind:value={confirmPassword} class='p-2 text-black bg-gray-100 rounded-md'/>
            {#if passwordValid && signUpPassword !== confirmPassword}
            <p class='text-[12px] text-red-300'> <span class='text-red-400'> ✖ </span> Passwords do not match. Please try again. </p>
            {:else if passwordValid && signUpPassword === confirmPassword}
            <p class='text-[12px] text-green-300'> <span class='text-green-400'> ✔  </span> Passwords match! </p>
            {/if}
            </label>
            

            <div class='py-4 text-gray-500 text-sm'>
                <p class='text-gray-400'> Password Requires: </p>
                <hr class='my-2 border-2 border-gray-600'/>
                
                <p class={passwordStatus && passwordStatus.meetsMinPasswordLength ? 'text-green-300' : 'text-red-300'}>
                    Minimum password length: 8 {#if passwordStatus && passwordStatus.meetsMinPasswordLength} <span style="font-family: Times New Roman; color: green; "> ✔ </span> {:else} <span class='text-red-400'> ✖ </span> {/if}
                </p>
                
                <p class={passwordStatus && passwordStatus.containsUppercaseLetter ? 'text-green-300' : 'text-red-300'}>
                    Requires uppercase character {#if passwordStatus && passwordStatus.containsUppercaseLetter} <span style="font-family: Times New Roman; color: green; "> ✔ </span> {:else} <span class='text-red-400'> ✖ </span> {/if}
                </p>
                
                <p class={passwordStatus && passwordStatus.containsLowercaseLetter ? 'text-green-300' : 'text-red-300'}>
                    Requires lowercase character {#if passwordStatus && passwordStatus.containsLowercaseLetter} <span style="font-family: Times New Roman; color: green; "> ✔ </span> {:else} <span class='text-red-400'> ✖ </span> {/if}
                </p>
                
                <p class={passwordStatus && passwordStatus.containsNumericCharacter ? 'text-green-300' : 'text-red-300'}>
                    Requires numeric character {#if passwordStatus && passwordStatus.containsNumericCharacter} <span style="font-family: Times New Roman; color: green; "> ✔ </span> {:else} <span class='text-red-400'> ✖ </span> {/if}
                </p>
                
                <p class={passwordStatus && passwordStatus.containsNonAlphanumericCharacter ? 'text-green-300' : 'text-red-300'}>
                    Requires special character {#if passwordStatus && passwordStatus.containsNonAlphanumericCharacter} <span style="font-family: Times New Roman; color: green; "> ✔ </span> {:else} <span class='text-red-400'> ✖ </span> {/if}
                </p>
            </div>
            
            <button class='p-3 rounded-lg bg-red-400' on:click={
            async() => {
                if (!passwordValid) {
                    alert('Password is not valid. Please try a new password.');
                } else if (passwordValid && signUpPassword === confirmPassword) {
                    await authHandler.signUpUserWithEmailAndPassword(signUpEmail, signUpPassword);
                }
            }}> Sign Up </button>
        </form>
    </dialog>
</div>

<style>
    span {
        font-family: "Roboto", sans-serif;
    }
</style>