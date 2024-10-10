<script lang='ts'>
	import { authHandler } from "../store/store";

    
</script>

<header class="bg-[#212529] shadow-lg">
    <nav class="my-auto px-6 py-3 max-sm:px-0">
      <div class="flex items-center">
        <div class="max-sm:hidden oswald text-center font-semibold text-xl font-bold">Pokémon Tracker </div>
        <div class="w-full max-sm:w-full font-semibold grid grid-rows-1 grid-cols-5 text-center text-[80%] lato-bold">
          <a href="/home" class="hover:text-gray-200">HOME</a>
          <a href="/collection" class="hover:text-gray-200">COLLECTION</a>
          <a href="/" class="hover:text-gray-200">SHINY HUNTS</a>
          <a href="/" class="hover:text-gray-200">EV TRACKER</a>
          <button class="hover:text-gray-200" on:click={authHandler.logout}> LOGOUT </button>
        </div>
        </div>
    </nav>
</header>
