import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createContext } from "react";
import UserStore from "./store/userStore";

export const RootStoreContext = createContext();
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RootStoreContext.Provider
    value={{
      userStore: new UserStore(),
      //postStore: new PostStore(),
      //commentStore: new CommentStore(),
    }}
  >
    <App />
  </RootStoreContext.Provider>
);
