<script lang='ts'>
	import { authHandler } from "../store/store";
	import ShinyHuntSparkle from "./svg/shinyHuntSparkle.svelte";
  import { page } from '$app/stores';
	import Collection from "./svg/collection.svelte";
	import EvTracker from "./svg/evTracker.svelte";
	import Settings from "./svg/settings.svelte";


    /*          <a href="/ev-tracker" class="w-full my-auto hover:text-gray-200"> <div class='flex max-sm:flex-col'> <EvTracker className="w-1/5 min-w-[45px] max-sm:w-1/3 h-fit p-1 m-auto"/> <p class='w-fit mx-auto my-auto p-2 {$page.url.pathname === '/ev-tracker' ? 'text-red-300 bg-gray-600' : ''} rounded-xl'> EV TRACKER </p> </div> </a> */
</script>

<header class="w-full lg:w-fit bg-[#212529] shadow-lg drop-shadow-xl">
    <nav class="my-auto">
      <div class="flex flex-col max-lg:flex-row max-lg:h-full gap-4 ">
        <div class="w-full h-full my-auto max-sm:px-3 max-sm:py-1 font-semibold flex flex-col max-lg:flex-row justify-between max-lg:gap-4 text-[14px] max-md:text-[12px] max-sm:text-[9px] text-center lato-bold">
          <a href='/shiny-hunts' class="max-sm:hidden my-auto py-4 text-center font-semibold text-red-300 text-2xl font-bold lg:border-t-2 lg:border-b-1 border-gray-600"> <p class='sm:px-4'> Poké<span class='text-white'> Tracker </span> </p> </a>
          <a href="/shiny-hunts" class="w-full my-auto py-2 hover:text-gray-200 lg:border-t-2 lg:border-b-1 max-lg: border-gray-600"> <div class='flex max-sm:flex-col'> <ShinyHuntSparkle className="w-1/5 min-w-[45px] max-sm:w-1/3 h-fit p-1 m-auto"/> <p class='w-fit mx-auto my-auto p-1 {$page.url.pathname === '/shiny-hunts' ? 'text-red-300 bg-gray-600' : ''} rounded-xl'> SHINY HUNTS </p> </a>
          <a href="/collection" class="w-full my-auto py-2 hover:text-gray-200 lg:border-t-2 lg:border-b-1 border-gray-600"> <div class='flex max-sm:flex-col'> <Collection className="w-1/5 min-w-[45px] max-sm:w-1/3 h-fit p-1 m-auto"/> <p class='w-fit mx-auto my-auto p-2 {$page.url.pathname === '/collection' ? 'text-red-300 bg-gray-600' : ''} rounded-xl'> COLLECTION </p> </div> </a>
          <a href='/settings' class="w-full my-auto py-2 hover:text-gray-200 lg:border-t-2 lg:border-b-2 border-gray-600"> <div class='flex max-sm:flex-col'> <Settings className="w-1/5 min-w-[45px] max-sm:w-1/3 h-fit p-1 m-auto"/> <p class='w-fit mx-auto my-auto p-2 {$page.url.pathname === '/settings' ? 'text-red-300 bg-gray-600' : ''} rounded-xl'> SETTINGS </p> </div> </a>
        </div>
      </div>
    </nav>
</header>
 