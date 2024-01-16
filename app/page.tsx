"use client";
import React, { useEffect, useState } from "react";
import Keycloak from "keycloak-js";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default function App() {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isKeycloakInitialized, setIsKeycloakInitialized] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // State to store the authenticated user's name

  useEffect(() => {
    async function initializeKeycloak() {
      const keycloakInstance = new Keycloak({
        url: "https://ai.eunomatix.com:4116/auth/", // Replace with your Keycloak server URL
        realm: "RealmTest", // Replace with your Keycloak realm
        clientId: "client_gpt", // Replace with your Keycloak client ID
      });

      try {
        const authenticated = await keycloakInstance.init({
          onLoad: "login-required",
        });
        setKeycloak(keycloakInstance);
        setAuthenticated(authenticated);

        if (authenticated) {
          // Set the user's name in the state
          setUserName(keycloakInstance.idTokenParsed?.preferred_username);
        }
      } catch (error) {
        console.error("Keycloak init error:", error);
      } finally {
        setIsKeycloakInitialized(true);
      }
    }

    initializeKeycloak();
  }, []);

  if (keycloak) {
    console.log("Authenticated");
    return (
      <div>
        <p>Welcome, {userName}</p>
        <Home />
      </div>
    );
  }

  return <div>Loading...</div>;
}
