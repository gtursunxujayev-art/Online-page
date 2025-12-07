import { useState, useEffect } from "react";

// returns the current hash location (excluding the '#' symbol)
const currentLocation = () => {
  const hash = window.location.hash.replace(/^#/, "");
  // Ensure it starts with a slash for wouter to match correctly
  return hash.startsWith("/") ? hash : "/" + hash;
};

export const navigate = (to: string) => (window.location.hash = to);

export const useHashLocation = () => {
  const [loc, setLoc] = useState(currentLocation());

  useEffect(() => {
    const handler = () => setLoc(currentLocation());

    // subscribe to hash changes
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return [loc, navigate];
};
