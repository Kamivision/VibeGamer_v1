import { useState } from "react";
import { handleSignIn, handleSignUp } from "../utilities";

const initialFormData = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
};


export default function AuthForm({ mode, onAuthSuccess }) {
    const isSignUp = mode === "signup";
    const [formData, setFormData] = useState(initialFormData);
    const [errorMessage, setErrorMessage] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");

        if (isSignUp && formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            const authenticatedUser = isSignUp
                ? await handleSignUp(
                    {
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                    }
                ) : await handleSignIn(
                    {
                        email: formData.email,
                        password: formData.password,
                    }
                );

            if (authenticatedUser) {
                onAuthSuccess(authenticatedUser);
                setFormData(initialFormData);
                return;
            }

            setErrorMessage(
                isSignUp ? "Unable to create account." : "Unable to sign in."
            );
        } catch (error) {
            setErrorMessage(
                isSignUp ? "Sign up failed." : "Invalid email or password."
            );
        }
            
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">{isSignUp ? "Sign Up" : "Sign In"}</h2>
            { isSignUp ? (
                <p>We'll never share your email with anyone else.</p>
            ) : null}
            {isSignUp ? (
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="rounded border p-2"
                />
            ) : null}

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded border p-2"
            />
            
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="rounded border p-2"
            />

            {isSignUp ? (
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="rounded border p-2"
                />
            ) : null}

            {errorMessage ? (
                <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <button type="submit" className="rounded bg-cyan-500 p-2 text-white">
                {isSignUp ? "Sign Up" : "Sign In"}
            </button>
        </form>
    );
}