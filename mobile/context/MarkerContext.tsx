import { createContext, useContext, useMemo, useReducer } from "react";
import { Machine, MachineGroup, MachineRegion } from "@/types";

interface MarkerState {
  currentRegion: MachineRegion;
  currentMachine: Machine;
  machines: Machine[];
}

type Action = {
  type: "SET_MACHINES"
  payload: Machine[]
} | {
  type: "SET_CURRENT_REGION"
  payload: MachineRegion
} | {
  type: "CLEAR_MACHINES"
} | {
  type: "SELECT_CURRENT_MACHINE",
  payload: Machine
}

type MarkerContext = MarkerState & {
  dispatch: ReturnType<typeof markerUtils>;
}

const MarkerContext = createContext<MarkerContext | undefined>(undefined);

function reducer(state: MarkerState, action: Action): MarkerState {
  switch(action.type) {
    case "SET_CURRENT_REGION":
      const currentRegion = action.payload;
      return {
        ...state,
        currentRegion,
        currentMachine: null,
        machines: []
      }
    case "SET_MACHINES":
      return {
        ...state,
        machines: action.payload,
        currentMachine: null
      }
    case "CLEAR_MACHINES":
      return {
        ...state,
        machines: [],
        currentMachine: null
      }
    case "SELECT_CURRENT_MACHINE": {
      return {
        ...state,
        currentMachine: action.payload
      }
    }
  }
}

interface MarkerProvider {
  children: React.ReactNode;
}

const initialState: MarkerState = {
  currentRegion: null,
  currentMachine: null,
  machines: []
}

function markerUtils(dispatch: React.Dispatch<Action>) {

  const setCurrentRegion = (payload: MachineRegion) => {
    dispatch({
      type: "SET_CURRENT_REGION",
      payload: payload
    });
  }

  const selectMachines = (payload: Machine[]) => {
    dispatch({
      type: "SET_MACHINES",
      payload: payload
    });
  }

  const clearMachines = () => {
    dispatch({
      type: "CLEAR_MACHINES"
    });
  }

  const selectCurrentMachine = (payload: Machine) => {
    dispatch({
      type: "SELECT_CURRENT_MACHINE",
      payload: payload
    });
  }

  return {
    selectMachines,
    selectCurrentMachine,
    setCurrentRegion,
    clearMachines
  }
}

export function MarkerProvider(props: MarkerProvider) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => {
    return {
      ...state,
      dispatch: markerUtils(dispatch),
    }
  }, [state, dispatch, markerUtils]);

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