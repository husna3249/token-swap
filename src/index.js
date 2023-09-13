import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "../src/App";
import { BrowserRouter } from "react-router-dom";
import {configureChains,mainnet , WagmiConfig,createClient} from "wagmi";
import {publicProvider} from "wagmi/providers/public";

const{provider,webSocketProvider}= configureChains(
  [mainnet],
  [publicProvider()]
);
// Create a Wagmi client with the given configuration
const client=createClient({
  autoConnect:true,// Automatically try to connect to the provider on page load
  provider, // HTTP provider configured earlier
  webSocketProvider,// WebSocket provider for real-time updates
})
 // Get the root DOM element for rendering the React app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WagmiConfig client={client}> 
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </WagmiConfig>
  </React.StrictMode>
);
