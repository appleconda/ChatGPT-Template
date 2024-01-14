"use client";
import React, { useEffect, useState } from "react";
import Keycloak from "keycloak-js";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  // Update the state initialization to match Keycloak's type
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const keycloakInstance = new Keycloak({
      url: "http://localhost:8080/auth/", // Replace with your Keycloak server URL
      realm: "RealmTest", // Replace with your Keycloak realm
      clientId: "client_gpt", // Replace with your Keycloak client ID
    });

    keycloakInstance
      .init({ onLoad: "login-required" })
      .then((authenticated) => {
        setKeycloak(keycloakInstance); // No type error should occur here
        setAuthenticated(authenticated);
      })
      .catch((error) => {
        console.error("Keycloak init error:", error);
      });
  }, []);

  console.log("authenticated: ", authenticated);
  if (keycloak) {
    if (authenticated)
      return <Home />; // Render Home component after successful authentication
    else return <div>Unable to authenticate!</div>;
  }
  //  return <div>Initializing Keycloak</div>
  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
