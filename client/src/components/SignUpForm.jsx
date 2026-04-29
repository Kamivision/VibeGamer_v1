import { useState } from "react";
import { handleSignUp } from "../utilities";

export default function SignUpForm({ onSignUp }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const authenticatedUser = await handleSignUp({
        username,
        email,
        password,
      });

      if (authenticatedUser) {
        onSignUp(authenticatedUser);
        return;
      }

      setErrorMessage("Unable to create account.");
    } catch (error) {
      setErrorMessage("Sign up failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Sign Up</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
        className="rounded border p-2"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="rounded border p-2"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        className="rounded border p-2"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        className="rounded border p-2"
      />

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button type="submit" className="rounded bg-cyan-500 p-2 text-white">
        Sign Up
      </button>
    </form>
  );
}