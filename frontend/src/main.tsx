import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";

import App from "./App.tsx";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/context/app.context.tsx";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient({ queryCache: new QueryCache() });

// Sui
const { networkConfig: suiNetworkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/*TODO: Change Sui network when going to mainnet*/}
      <SuiClientProvider networks={suiNetworkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect={true}>
          <BrowserRouter>
            <AppProvider>
              <App />

              <ToastContainer position="bottom-right" />
            </AppProvider>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
