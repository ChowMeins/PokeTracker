<script lang='ts'>
	import { onMount } from "svelte";
	import { onAuthStateChanged, updateEmail, type User } from "firebase/auth";
	import { auth } from "$lib/firebase";
	import { authHandler, authStore, loadingStore } from "../../store/store";
	import Signout from "../../components/svg/signout.svelte";
	import Close from "../../components/svg/close.svelte";
	import Checkmark from "../../components/svg/checkmark.svelte";
	import ProfilePic from "../../components/svg/profilePic.svelte";
	import { sendEmailVerification } from "firebase/auth/web-extension";

    let user: User | null;
    let userEmail: string | null | undefined;
    let userPhoto: string | null | undefined;
    let userVerified: boolean | undefined;
    let newEmail: string | null = "";
    
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

    onMount( async() => { 
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                user = user;
                userEmail = user.email;
                userPhoto = user.photoURL;
                userVerified = user.emailVerified;
                console.log(userPhoto);
                //userVerified = false;
                loadingStore.update((state) => ({
                    layoutLoaded: state.layoutLoaded,
                    pageLoaded: true
                }));
            };
    }); 
});
</script>

<div class='w-full flex-grow overflow-y-auto bg-[#161A1A]'>
    <div class='w-full h-full px-8 flex flex-col'>
        <h1 class='py-6 text-center text-3xl font-semibold'> Account </h1>
        <div class='w-full h-full px-8 flex flex-col'>
            {#if userPhoto}
            <img src={userPhoto} alt="Profile_Picture" class='w-[128px] h-[128px] max-sm:mx-auto border-2 rounded-full'/>
            {:else} 
            <ProfilePic className='w-[20%] border-2 rounded-full'/>
            {/if}
            
            <h1 class='text-xl font-semibold mt-4 py-2'> VERIFIED 
            <hr class='w-full border-1' />
                {#if userVerified}
                    <Checkmark className="w-[48px] h-[48px]" color="#43A047"/>
                {:else}
                    <div class='flex'>
                    <Close className="w-[48px] h-[48px]" color='#f45757'/>
                    <button class='h-fit p-2 ml-auto my-auto rounded-xl bg-gray-500' on:click={async() => {
                        if (user) {
                            sendEmailVerification(user)
                        }}}> 
                        
                        Verify Email 
                    </button>
                    </div>
                {/if}
             </h1>

            <h1 class='text-xl font-semibold mt-4 py-2'> EMAIL </h1>
            <hr class='w-full border-1' />
            <p class='w-full flex max-sm:flex-col text-xl py-4'> {userEmail} 
                <button class='w-fit ml-auto mt-4 max-sm:ml-0 p-2 font-semibold bg-gray-500 rounded-xl' on:click={() => {displayModal('email-modal')}}> Change Email </button> 
            </p>
            <h1 class='text-xl font-semibold py-2'> PASSWORD </h1>
            <hr class='w-full border-1' />
            <p class='w-full flex max-sm:flex-col text-xl py-4'> ************ 
                <button class='w-fit ml-auto mt-4 max-sm:ml-0 p-2 font-semibold bg-gray-500 rounded-xl' on:click={() => {
                    const result = confirm("Send password reset email?");
                    if (result && userEmail) {
                        authHandler.changePassword(auth, userEmail);
                    }
                }}> Change Password </button> 
            </p>
            <button class='w-fit mt-4 flex my-auto p-2 text-centertext-2xl font-semibold bg-gray-600 rounded-xl' on:click={authHandler.logout}> <Signout className="w-[32px] h-[32px]"/> <p class='w-full my-auto'>Logout</p> </button>
        </div>
    </div>

    <dialog id='email-modal' class='w-[400px] h-fit bg-[#0F141E] rounded-xl' on:close={() => {newEmail = "";}}>
        <div class='w-full h-fit flex flex-col px-4 py-4'>
            <button class='w-fit ml-auto' on:click={() => {displayModal('email-modal')}}> <Close className='w-[32px] h-[32px]' color=''/> </button>
            <form class='w-full h-full text-white'>
                <label class='w-full flex flex-col py-2 font-semibold'> OLD EMAIL <input type="email" readonly value={userEmail} class='p-2 text-black rounded-xl focus:outline-none'> </label>
                <label class='w-full flex flex-col py-2 font-semibold'> NEW EMAIL <input type="email" required bind:value={newEmail} placeholder='Enter New Email Here' class='p-2 text-black rounded-xl focus:outline-none'> </label>
            </form>
            <button type='submit' class='w-fit mx-auto my-4 font-semibold text-white bg-green-600 p-2 rounded-xl' on:click={async() => {
                if(user && newEmail) {
                    await authHandler.changeEmail(user, newEmail)
                }
            }}> Submit </button>
        </div>
    </dialog>
</div>