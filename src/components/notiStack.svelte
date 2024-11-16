<script lang='ts'>
	import { CustomNotification } from "$lib/data";
	import type { Writable } from "svelte/store";
	import { notifications, notificationStore } from "../store/pokemonStore";
	import Close from "./svg/close.svelte";
	import { fade } from "svelte/transition";
	
	let notis: CustomNotification[];
	$: { 
		notis = $notifications; 
	}
</script>

<div class='absolute flex flex-col w-full {notis.length > 0 ? 'h-fit' : 'h-0'} bg-none'>
	{#each notis as noti, i}
		<div id='noti-{i}' transition:fade={{duration: 250}} class='w-fit h-fit flex mx-auto gap-8 z-[10] bg-green-500 my-2 p-2 rounded-xl'> 
			<p class='my-auto px-4 text-md font-semibold'> {noti.message} </p> 
			<button class='w-fit' on:click={() => {notificationStore.dequeue(noti)}}> <Close className="w-[24px] h-fit" color=""/> </button>
		</div>
	{/each}
</div>