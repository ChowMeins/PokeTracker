<script lang='ts'>
    import {authHandler} from '../store/store';
    import { goto } from "$app/navigation";

</script>

<div class='w-full'>
    <h1 class='roboto font-[500] text-5xl text-center mt-16 py-4'> Welcome to PokeTracker! </h1>
    <form class='bg-white w-[40rem] grid mt-24 mx-auto rounded-xl p-8 drop-shadow-md'>
        <h1 class='roboto-bold text-center text-4xl'> Login </h1>
        <label class='grid-row-1 font-semibold'> User Name</label> <input class='bg-gray-100'> 
        <label class='grid-row-1 mt-4 font-semibold'> Password</label> <input class='bg-gray-100'> 
        <button class='w-3/4 mx-auto mt-16 p-2 bg-red-500 font-semibold rounded-xl text-white'> Login </button>
        <button class='w-3/4 mx-auto mt-8 p-2 bg-red-500 font-semibold rounded-xl text-white' on:click={authHandler.loginWithGoogle}> Login with Google </button>

    </form>

</div>