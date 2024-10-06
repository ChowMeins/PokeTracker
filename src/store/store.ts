import { goto } from "$app/navigation";
import { auth, googleProvider } from "$lib/firebase";
import { signInWithPopup, type User } from "firebase/auth";
import { writable } from "svelte/store";

export const authStore = writable<{user: User | null}>({
    user: null
});

export const authHandler = {
    logout: async () => {
        await auth.signOut();
        goto("/");
    },
    loginWithGoogle: async () => {
        console.log("Attemping login...");
        await signInWithPopup(auth, googleProvider);
        goto("/home");
    }
}