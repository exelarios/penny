import { Dispatch, createContext, useCallback, useRef , useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import Text from "@/components/Text";
import RegionsBottomSheet from "@/components/RegionsBottomSheet";
import useRegionQuery from "@/hooks/useRegionQuery";
import useMachineQuery from "@/hooks/useMachineQuery";
import { Machine, MachineGroup, MachineRegion } from "@/types";
import { useMarkerContext } from "@/context/MarkerContext";

type ExploreContext = {
  region: number;
  setRegion: Dispatch<React.SetStateAction<number>>;
  locations: MachineRegion[];
}

const ExploreContext = createContext<ExploreContext | undefined>(undefined);

function Explore() {
  const [camera, setCamera] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0
  });

  const { regions, regionsUtils } = useRegionQuery();

  const { currentRegion, dispatch } = useMarkerContext();

  const regionMarkers = useMemo(() => {
    return regions?.map((region) => {

      // Hide the region currentRegion marker.
      if (currentRegion && region.area === currentRegion.area) {
        return null;
      }

      const handleOnPress = () => {
        dispatch.setCurrentRegion(region);
      };

      return (
        <Marker
          key={region.area}
          onPress={handleOnPress}
          coordinate={{
            latitude: region.coordinate.latitude,
            longitude: region.coordinate.longitude
          }}>
          <View style={styles.marker}>
            <Image
              source={require("@/assets/multiple_penny_machine.png")}
              style={{ width: 50, height: 50 }}
            />
            {/* <Text style={styles.text}>{region.name}</Text> */}
          </View>
        </Marker>
      );
    });
  }, [regions]);

  // const machinesBasedOnCity = useCallback(() => {
  //   const noCoordinates = [];
  //   let cities = new Set<string>();
  //   const group: Machine[] = [];

  //   for (const machine of machines.data) {
  //     // If the machine doesn't have any coordinates, we will just ignore them.
  //     if (machine.coordinate === null) {
  //       noCoordinates.push(`${machine.name}, ${machine.location}`);
  //       continue;
  //     }
  //     cities.add(machine.city);
  //   }
  //   console.log(cities);

  //   const machineCityNames = Array.from(cities);
  //   const output: MachineGroup[] = machineCityNames.map((city) => {
  //     let latitude = 0;
  //     let longitude = 0;
  //     let amountOfMachines = 0;

  //     for (const machine of machines.data) {
  //       if (machine.coordinate === null) continue;

  //       if (machine.city === city) {
  //         latitude = latitude + machine.coordinate.latitude;
  //         longitude = longitude + machine.coordinate.longitude;
  //         amountOfMachines = amountOfMachines + 1;
  //         group.push(machine);
  //       }
  //     }

  //     latitude = latitude / amountOfMachines;
  //     longitude = longitude / amountOfMachines;

  //     return {
  //       name: city,
  //       group: group,
  //       coordinate: {
  //         latitude,
  //         longitude
  //       },
  //     }
  //   })

  //   console.log("No coordinates:\n", noCoordinates.join("\n"));

  //   return output;
  // }, [machines?.data]);

  // const machineMarkers = useMemo(() => {
  //   if (machines?.data === undefined) return;

  //   const cities = machinesBasedOnCity();

  //   return cities.map((city) => {
  //     return (
  //       <Marker
  //         key={city.name}
  //         coordinate={city.coordinate}>
  //           <View style={styles.marker}>
  //             <Text style={styles.text}>{city.name}</Text>
  //           </View>
  //       </Marker>
  //     )
  //   })
  // }, [machines, currentRegion]);

  useEffect(() => {
    if (regionsUtils.isLoading) return;
    console.log('hello');

    // dispatch.setRegions(regionQuery.data);

    // const regionInfo = locations.data.filter((l) => l.area === currentRegion);

    // // Failed to find any region with the given region's code.
    // if (regionInfo.length === 0) return;

    // const targetRegion = regionInfo[0];

    // setCamera({
    //   latitude: targetRegion.coordinate.latitude,
    //   longitude: targetRegion.coordinate.longitude,
    //   latitudeDelta: 10,
    //   longitudeDelta: 10
    // });
  }, [regionsUtils.isLoading ]);

  if (regionsUtils.isLoading) {
    return (
      <View>
        <Text>Loading Map.</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* <Header/> */}
      <MapView
        showsUserLocation
        showsTraffic={false}
        region={camera}
        style={styles.map}>
          {regionMarkers}
          {/* {machineMarkers} */}
      </MapView>
      <RegionsBottomSheet/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex"
  },
  map: {
    width: "100%",
    flexGrow: 1
  },
  marker: {
    borderRadius: 50,
    backgroundColor: "#f2f2f2",
    padding: 3,
    borderWidth: 3,
    borderColor: "#a1a1a1"
  },
  text: {
    fontSize: 10,
    padding: 10,
    color: "white"
  },
  section: {
    margin: "2%",
    backgroundColor: "f2f2f2",
    zIndex: 1
  },
});

export default Explore;