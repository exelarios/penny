import { Dispatch, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Pressable, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";

import { FontAwesome } from '@expo/vector-icons';
import Text from "@/components/Text";
import { BottomSheet, BottomSheetFlatList, BottomSheetView } from "@/components/BottomSheet";
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

type RenderItemProps = {
  item: MachineRegion
}

function RegionBottomSheet() {
  const { regions, dispatch } = useMarkerContext();

  const renderItem = useCallback(({ item }: RenderItemProps) => {
    const handleOnPress = () => {
      dispatch.setCurrentRegion(item);
    }

    return (
      <TouchableOpacity onPress={handleOnPress}>
        <View style={styles.regionPressableContainer}>
          <View>
            <Text variant="h2">{item.name}</Text>
            <Text>United States</Text>
          </View>
        </View>
        <View style={styles.regionDivider}/>
      </TouchableOpacity>
    );
  }, []);

  return (
    <BottomSheet>
      <View style={styles.bottomSheetHeader}>
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            Region
          </Text>
        </View>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={[{...styles.regionDivider}, { marginVertical: 5, width: "100%" }]}/>
      <BottomSheetFlatList
        data={regions}
        renderItem={renderItem}
        keyExtractor={(item) => item.area.toString()}
      />
    </BottomSheet>
  );
}

function Explore() {
  const [camera, setCamera] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0
  });

  const regionQuery = useRegionQuery();

  const { currentRegion, regions, dispatch } = useMarkerContext();

  const regionMarkers = useMemo(() => {
    return regions?.map((region) => {

      // Hide the region currentRegion marker.
      if (currentRegion && region.area === currentRegion.area) {
        return null;
      }

      const handleOnPress = () => {
        // setCurrentRegion(region.area);
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
            <Text style={styles.text}>{region.name}</Text>
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
    if (regionQuery.isLoading) return;

    dispatch.setRegions(regionQuery.data);

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
  }, [regionQuery.data]);

  if (regionQuery.isLoading) {
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
        region={camera}
        style={styles.map}>
          {regionMarkers}
          {/* {machineMarkers} */}
      </MapView>
      <RegionBottomSheet/>
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
    backgroundColor: "black",
    borderRadius: 10,
    width: "100%",
    height: "100%"
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
  regionIcon: {
    height: 50,
    width: 50,
    borderRadius: 50
  },
  regionPressableContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 10,
    alignSelf: "center",
    width: "90%"
  },
  regionDivider: {
    width: "90%",
    alignSelf: "center",
    marginHorizontal: "2%",
    backgroundColor: "#eaeaea",
    height: 1,
    borderRadius: 10
  },
  bottomSheetHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent:"space-between",
    marginHorizontal: "2%",
    alignItems: "center",
    width: "90%",
    alignSelf: "center"
  }
});

export default Explore;