import React, { useState, createContext } from "react";
import secureLocalStorage from "react-secure-storage";

export const SearchAndUserEventsDataContext = createContext();

//https://devtrium.com/posts/how-use-react-context-pro

export function SearchAndUserEventsDataContextProvider(props) {
  const [searchUsersData, setSearchUsersData] = useState(null);
  //const [imagesList, setImagesList] = useState(null);
  const [defaultTab1, setDefaultTab1] = useState("searchevents");
  const [defaultTab2, setDefaultTab2] = useState("createdevents");

  const [logininitsDone, setLogininitsDone] = useState(false);

  return (
    <SearchAndUserEventsDataContext.Provider
      value={{
        searchUsersData,
        setSearchUsersData,
        //imagesList,
        //setImagesList,
        defaultTab1,
        setDefaultTab1,
        defaultTab2,
        setDefaultTab2,
        logininitsDone,
        setLogininitsDone,
      }}
    >
      {props.children}
    </SearchAndUserEventsDataContext.Provider>
  );
}
