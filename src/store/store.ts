import { goto } from "$app/navigation";
import { auth, googleProvider } from "$lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, validatePassword, verifyBeforeUpdateEmail, type Auth, type User } from "firebase/auth";
import { GoogleAuthProvider} from "firebase/auth/web-extension";
import { writable } from "svelte/store";
import { notificationStore } from "./pokemonStore";
import { FirebaseError } from "firebase/app";

export const authStore = writable<{user: User | null}>({
    user: null
});

export const loadingStore = writable({
    layoutLoaded: false,
    pageLoaded: false
});

export const authHandler = {
    logout: async () => {
        await auth.signOut();
        goto("/");
    },
    loginWithGoogle: async () => {
        try {
            console.log("Attemping login...");
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            console.error(error);
        }
    },
    signUpUserWithEmailAndPassword: async (email: string, password: string) => {
        console.log("Attemping to sign up...");
        try {
            const status = await validatePassword(auth, password);
            if (status.isValid) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await auth.signOut();
                await sendEmailVerification(userCredential.user);
                alert("Account created! Please verify your email and then log in.")
            }
        } catch (error: any) {
            if (error instanceof FirebaseError) {
                if (error.code === 'auth/email-already-in-use') {
                    alert('Email already in use. Please try a different email.');
                }
            } else {
                console.error(error)
                alert('Error creating account.');
            }
        }
    },
    signInUserWithEmailAndPassword: async (email: string, password: string) => {
        console.log("Attemping to login...");
        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            if (userCredentials.user.emailVerified) {
                await goto('/shiny-hunts');
            } else {
                await auth.signOut();
                const result = confirm("Email not verified. Please verify email to login. Resend verification link?");
                if (result) {
                    sendEmailVerification(userCredentials.user);
                }
            }
        } catch (error) {
            alert("Invalid credentials. Please try again.")
        }
    },
    changeEmail: async (user: User, email: string) => {
        //console.log(user.emailVerified);
        if (user && email) {
            try {
                const result = confirm("Confirm email change? You will be signed out once submitted.");
                if (result) {
                    await verifyBeforeUpdateEmail(user, email);
                    await auth.signOut();
                }
            } catch (error) {
                console.log(error)
                alert("Couldn't change email. Please try again.")
            }
        }
    },
    changePassword: async (auth: Auth, email: string) => {
        if (auth && email) {
            try {
                await sendPasswordResetEmail(auth, email);
                notificationStore.enqueue({message: "Password reset link sent to your email.", color: "#00FF00", timeout: 5000});
            } catch (error) {
                console.log(error)
                alert("Couldn't change email. Please try again.")
            }
        }
    }
}