"use client";
import React, { useEffect, useState } from "react";
import Keycloak from "keycloak-js";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default function App() {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isKeycloakInitialized, setIsKeycloakInitialized] = useState(false);

  useEffect(() => {
    async function initializeKeycloak() {
      const keycloakInstance = new Keycloak({
        url: "http://localhost:8080/auth/", // Replace with your Keycloak server URL
        realm: "RealmTest", // Replace with your Keycloak realm
        clientId: "client_gpt", // Replace with your Keycloak client ID
      });

      try {
        const authenticated = await keycloakInstance.init({
          onLoad: "login-required",
        });
        setKeycloak(keycloakInstance);
        setAuthenticated(authenticated);
      } catch (error) {
        console.error("Keycloak init error:", error);
      } finally {
        setIsKeycloakInitialized(true);
      }
    }

    initializeKeycloak();
  }, []);

  if (keycloak && authenticated) {
    console.log("Authenticated");
    return <Home />;
  } else {
    return <div>Unable to authenticate!</div>;
  }
}
