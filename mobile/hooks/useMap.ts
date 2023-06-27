import { useExploreContext } from "@/context/ExploreContext";
import { Coordinate } from "@/types";

function useMap() {
  const { map } = useExploreContext();

  const fitRegion = (coordinates: Coordinate[]) => {
    map.fitToCoordinates(coordinates, {
      animated: true,
      edgePadding: {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
      }
    });
  }

  const setRegion = (coordinate: Coordinate) => {
    map.animateToRegion({
      ...coordinate,
      latitudeDelta: 10,
      longitudeDelta: 10
    }, 300);
  }

  return {
    fitRegion,
    setRegion
  }
}

export default useMap;