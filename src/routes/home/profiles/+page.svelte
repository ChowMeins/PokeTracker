<script>
    let profileList = [
      { name: 'Jason', game: 'Pokemon Platinum', shinyHunts: 0, totalEncounters: 0},
      { name: 'Chow', game: 'Pokemon HeartGold', shinyHunts: 1024, totalEncounters: 0}
    ];
  
    let newProfile = { name: '', game: '', shinyHunts: 0, totalEncounters: 0};
  
    function addProfile() {
        profileList = [...profileList, {...newProfile}]
    }
  </script>
  
  <div class="min-h-screen">  
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold mb-6">Select a Profile</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each profileList as profile}
          <div class="profile bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-2">{profile.name} <img src='https://www.spriters-resource.com/resources/sheet_icons/24/26778.png?updated=1460949349' alt="{profile.name} avatar"> </h2>
            <p class="text-gray-600 mb-4"> <span class='text-black font-semibold'> Game: </span> {profile.game}</p>
          </div>
        {/each}
      </div>
  
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-4">Add New Profile</h2>
        <form on:submit|preventDefault={addProfile} class="space-y-4">
          <div>
            <label for="shinyHunts" class="block text-sm font-medium text-gray-700">Name</label>
            <input type="number" id="shinyHunts" bind:value={newProfile.name} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="evHp" class="block text-sm font-medium text-gray-700">Game Name</label>
              <input type="number" id="evHp" bind:value={newProfile.game} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50">
            </div>
          </div>
          <button type="submit" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
            Add Pokémon
          </button>
        </form>
      </div>
    </main>
  </div>

<style>
    .profile {
        cursor: pointer;
    }
</style>