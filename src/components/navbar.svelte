<script lang='ts'>
	import { authHandler } from "../store/store";

    
</script>
<header class="bg-red-500 text-white shadow-lg">
    <nav class="my-auto px-6 py-3">
      <div class="flex items-center">
        <div class="oswald font-semibold text-xl font-bold">Pokémon Tracker </div>
        <div class="grid grid-rows-1 gap-16 grid-cols-5 text-center text-sm ml-auto lato-bold">
        
          <a href="/" class="hover:text-gray-200">Home</a>
          <a href="/profiles" class="hover:text-gray-200">Profiles</a>
          <a href="/" class="hover:text-gray-200">Shiny Hunts</a>
          <a href="/" class="hover:text-gray-200">EV Tracker</a>
          <button on:click={authHandler.logout}> Logout </button>
        </div>
        </div>
    </nav>
</header>