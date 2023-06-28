import { useExploreContext } from "@/context/ExploreContext";
import { Coordinate } from "@/types";

type SetRegionParams = Coordinate & {
  latitudeDelta?: number;
  longitudeDelta?: number;
}

function useMap() {
  const { map } = useExploreContext();

  const fitRegion = (coordinates: Coordinate[]) => {
    map.current.fitToCoordinates(coordinates, {
      animated: true,
      edgePadding: {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
      }
    });
  }

  const setRegion = (coordinate: SetRegionParams) => {
    map.current.animateToRegion({
      ...coordinate,
      latitudeDelta: coordinate?.latitudeDelta || 10,
      longitudeDelta: coordinate?.longitudeDelta || 10
    }, 300);
  }

  return {
    fitRegion,
    setRegion
  }
}

export default useMap;