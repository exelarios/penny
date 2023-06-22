import { createContext, useContext, useMemo, useReducer } from "react";
import { Machine, MachineGroup, MachineRegion } from "@/types";

interface MarkerState {
  currentRegion: MachineRegion;
  regions: MachineRegion[];
  cities: MachineGroup[];
  machines: Machine[];
}

type Action = {
  type: "SET_REGIONS"
  payload: MachineRegion[]
} | {
  type: "SET_CITIES"
  payload: MachineGroup[]
} | {
  type: "SET_MACHINES"
  payload: Machine[]
} | {
  type: "SET_CURRENT_REGION"
  payload: MachineRegion
}

type MarkerContext = MarkerState & {
  dispatch: ReturnType<typeof markerUtils>;
}

const MarkerContext = createContext<MarkerContext | undefined>(undefined);

function reducer(state: MarkerState, action: Action) {
  switch(action.type) {
    case "SET_REGIONS": {
      return {
        ...state,
        regions: action.payload
      };
    }
    case "SET_CITIES": {
      return {
        ...state,
        cities: action.payload
      };
    }
    case "SET_CURRENT_REGION": {
      return {
        ...state,
        currentRegion: action.payload
      }
    }
  }
  throw new Error(`Invoked ${action.type}, an invaild action type.`);
}

interface MarkerProvider {
  children: React.ReactNode;
}

const initialState: MarkerState = {
  currentRegion: null,
  regions: [],
  cities: [],
  machines: []
}

const sortAlphabetically = (a: MachineRegion, b: MachineRegion) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function markerUtils(dispatch: React.Dispatch<Action>) {
  const setRegions = (payload: MachineRegion[]) => {
    dispatch({
      type: "SET_REGIONS",
      payload: payload.sort(sortAlphabetically)
    });
  }

  const setCurrentRegion = (payload: MachineRegion) => {
    dispatch({
      type: "SET_CURRENT_REGION",
      payload
    });
  }

  return {
    setRegions,
    setCurrentRegion
  }
}

export function MarkerProvider(props: MarkerProvider) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => {
    return {
      ...state,
      dispatch: markerUtils(dispatch)
    }
  }, [state]);

  return (
    <MarkerContext.Provider value={value}>
      {props.children}
    </MarkerContext.Provider>
  );
}

export function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (context === undefined) {
    throw new Error("useMarkerContext must be used inside of MarkerContext.Provider.");
  }

  return context;
}