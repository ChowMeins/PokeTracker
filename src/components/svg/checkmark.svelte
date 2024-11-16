<script lang="ts">
    export let className: string; // Accept className as a prop
	export let color: string;
</script>

<svg class={className} width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
	><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
		id="SVGRepo_tracerCarrier"
		stroke-linecap="round"
		stroke-linejoin="round"
	></g><g id="SVGRepo_iconCarrier">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M9.9647 14.9617L17.4693 7.44735L18.5307 8.50732L9.96538 17.0837L5.46967 12.588L6.53033 11.5273L9.9647 14.9617Z"
			fill={color ? color :"#ffffff"}
		></path>
	</g></svg
>
