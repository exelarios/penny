import { Dispatch, createContext, useContext, useMemo, useState } from "react";
import MapView, { Region } from "react-native-maps";

const ExploreContext = createContext<ExploreContext | undefined>(undefined);

type ExploreContext = {
  map: MapView
}

export function useExploreContext() {
  const context = useContext(ExploreContext);
  if (context === undefined) {
    throw new Error("useExploreContext must be used inside of ExploreContext.Provider");
  }

  return context;
}

type ExploreProviderProps = {
  map: MapView
  children: React.ReactNode;
}

export function ExploreProvider(props: ExploreProviderProps) {
  const { map } = props;

  const value = {
    map
  }

  return (
    <ExploreContext.Provider value={value}>
      {props.children}
    </ExploreContext.Provider>
  );
}