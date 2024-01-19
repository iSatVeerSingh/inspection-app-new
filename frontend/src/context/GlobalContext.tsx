import { createContext, useContext } from "react";

export const GlobalContext = createContext<any>({});

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
