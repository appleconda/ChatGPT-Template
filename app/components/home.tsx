"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { ModelProvider, Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";
import { removeFieldsWithKey } from "../utils/removeFieldWithKey";

import { getISOLang, getLang } from "../locales";

import Keycloak from "keycloak-js";

import { createContext, useContext } from "react";
import { useChatStore } from "../store";

import {
  getLocalAppState,
  loadDataFromRemote,
  saveDataToRemote,
  test,
} from "../utils/sync";

const KeycloakContext = createContext<Keycloak | null>(null);

export const useKeycloak = () => useContext(KeycloakContext);

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { AuthPage } from "./auth";
import { getClientConfig } from "../config/client";
import { ClientApi } from "../client/api";
import { useAccessStore } from "../store";
import { json } from "stream/consumers";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Auth;
  const isMobileScreen = useMobileScreen();
  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  return (
    <div
      className={
        styles.container +
        ` ${shouldTightBorder ? styles["tight-container"] : styles.container} ${
          getLang() === "ar" ? styles["rtl-screen"] : ""
        }`
      }
    >
      {isAuth ? (
        <>
          <AuthPage />
        </>
      ) : (
        <>
          <SideBar className={isHome ? styles["sidebar-show"] : ""} />

          <div className={styles["window-content"]} id={SlotID.AppBody}>
            <Routes>
              <Route path={Path.Home} element={<Chat />} />
              <Route path={Path.NewChat} element={<NewChat />} />
              <Route path={Path.Masks} element={<MaskPage />} />
              <Route path={Path.Chat} element={<Chat />} />
              <Route path={Path.Settings} element={<Settings />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

export function useLoadData() {
  const config = useAppConfig();

  var api: ClientApi;
  if (config.modelConfig.model === "gemini-pro") {
    api = new ClientApi(ModelProvider.GeminiPro);
  } else {
    api = new ClientApi(ModelProvider.GPT);
  }
  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function Home() {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const chatStore = useChatStore();

  useSwitchTheme();
  useLoadData();
  useHtmlLang();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    console.log("keycloak url", process.env.NEXT_PUBLIC_KEYCLOAK_URL);

    const initializeKeycloak = async () => {
      const keycloakInstance = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
        realm: "RealmTest",
        clientId: "dev",
      });

      try {
        const authenticated = await keycloakInstance.init({
          onLoad: "login-required",
        });
        if (authenticated) {
          setKeycloak(keycloakInstance);
          const userName = keycloakInstance.idTokenParsed?.preferred_username;
          setUserName(userName);
          // change to chat store
          chatStore.setUserName(userName);
        }
      } catch (error) {
        console.error("Keycloak init error:", error);
      }
    };

    initializeKeycloak();
    useAccessStore.getState().fetch();
  }, []);

  useEffect(() => {
    if (userName) {
      const fetchData = async () => {
        try {
          const didLoad = await loadDataFromRemote();

          if (!didLoad) {
            console.log("No remote data found, saving local data to remote");
            const localState = JSON.stringify(getLocalAppState());
            const localStateAsJson = JSON.parse(localState);
            saveDataToRemote(localStateAsJson);
          }
          // save the current session to database if doesn't exist
          else {
            const session = JSON.stringify(chatStore.currentSession());
            console.log("session ", session);
            const url = `/api/db/putSession/${userName}`;
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: session,
            });
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      };

      fetchData();
    }
  }, [userName]);

  if (!useHasHydrated() || !keycloak) {
    return <div>Loading...</div>;
  }

  return (
    <KeycloakContext.Provider value={keycloak}>
      <div>
        <p>Welcome, {userName}</p>
        <ErrorBoundary>
          <Router>
            <Screen />
          </Router>
        </ErrorBoundary>
      </div>
    </KeycloakContext.Provider>
  );
}
