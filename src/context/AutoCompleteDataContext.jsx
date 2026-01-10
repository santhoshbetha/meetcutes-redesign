import { useState, createContext, useEffect } from "react";
import { isObjEmpty } from "@/utils/util";
import secureLocalStorage from "react-secure-storage";

export const AutoCompleteDataContext = createContext();
//https://devtrium.com/posts/how-use-react-context-pro
// /https://medium.com/twodigits/persisting-state-in-react-that-survives-closing-the-browser-tab-f89483ab0e9c
//https://medium.com/twodigits/persisting-state-in-react-that-survives-closing-the-browser-tab-f89483ab0e9c
//https://www.youtube.com/watch?v=65C5wAGvW6U  <-- this is used 

export const AutoCompleteDataContextProvider = (props) => {
  const initialState =
    secureLocalStorage.getItem("autocompletedata") == "undefined"
      ? null
      : JSON.parse(secureLocalStorage.getItem("autocompletedata"));
  const [autocompletedata, setAutoCompletedata] = useState(initialState);

  useEffect(() => {
    if (isObjEmpty(autocompletedata)) {
      secureLocalStorage.setItem("autocompletedata", JSON.stringify([]));
    } else {
      secureLocalStorage.setItem(
        "autocompletedata",
        JSON.stringify(autocompletedata),
      );
    }
  }, [autocompletedata]);

  return (
    <AutoCompleteDataContext.Provider
      value={{
        autocompletedata,
        setAutoCompletedata,
      }}
    >
      {props.children}
    </AutoCompleteDataContext.Provider>
  );
}
