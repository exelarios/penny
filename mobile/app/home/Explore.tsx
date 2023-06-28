import { useCallback, useRef, useMemo, useState } from "react";
import { StyleSheet, View, Image, SafeAreaView } from "react-native";
import MapView, { Animated, PROVIDER_GOOGLE, Marker, Region } from "react-native-maps";

import Text from "@/components/Text";
import MachineDetailsSheet from "@/components/MachineDetailsSheet";
import GroupRegionBottomSheet from "@/components/GroupRegionBottomSheet";
import RegionsBottomSheet from "@/components/RegionsBottomSheet";
import useRegionQuery from "@/hooks/useRegionQuery";

import { useMachineByCitiesQuery } from "@/hooks/useMachineQuery";
import { useMarkerContext } from "@/context/MarkerContext";
import { Ionicons } from '@expo/vector-icons';
import { ExploreProvider, useExploreContext } from "@/context/ExploreContext";
import { Machine } from "@/types";
import useMap from "@/hooks/useMap";

import CityMachineIcon from "@/assets/city-machines.png";
import RegionMachineIcon from "@/assets/region-machines.png";
import MachineIcon from "@/assets/machine.png";

function Header() {
  const { currentRegion, machines, dispatch } = useMarkerContext();
  const map = useMap();

  const handleBackButton = useCallback(() => {
    if (currentRegion !== null && machines.length !== 0) {
      dispatch.clearMachines();
      map.setRegion(currentRegion.coordinate);
    } else {
      dispatch.setCurrentRegion(null)
      map.setRegion({
        latitude: 38.34831785788287, 
        longitude: -93.48790638148783,
        latitudeDelta: 0,
        longitudeDelta: 0
      });
    }
  }, [currentRegion, machines]);

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={[styles.dropShadow, {
        backgroundColor: "#f2f2f2",
        borderRadius: 50,
        padding: "1%",
        alignItems: "center" 
      }]}>
        <Ionicons onPress={handleBackButton} name="arrow-back" size={24} color="black" />
      </View>
      <View style={[styles.dropShadow, styles.headerTitle]}>
        <Text variant="h2">{currentRegion.name}</Text>
      </View>
    </SafeAreaView>
  );
}

function Overlay() {
  const { currentRegion, currentMachine } = useMarkerContext();
  // user selects a specifc machine
  if (!currentRegion) {
    return (
      <RegionsBottomSheet/>
    );
  }

  if (currentMachine !== null) {
    return (
      <>
        <Header/>
        <MachineDetailsSheet/>
      </>
    );
  }

  // allow user to choose a city.
  return (
    <>
      <Header/>
      <GroupRegionBottomSheet/>
    </>
  );
};

type MachineMarkerProps = {
  details: Machine
}

function MachineMarker(props: MachineMarkerProps) {
  const { dispatch } = useMarkerContext();
  const { details } = props;

  const handleOnPress = useCallback(() => {
    dispatch.selectCurrentMachine(details)
  }, []);

  return (
    <Marker 
      key={details.id}
      onPress={handleOnPress}
      coordinate={details.coordinate}>
        <View style={styles.marker}>
          <Image
            source={MachineIcon}
            style={{ width: 50, height: 50 }}
          />
        </View>
    </Marker>
  );
}

function Explore() {
  const map = useRef<MapView>(null)
  const { regions, regionsUtils } = useRegionQuery();
  const { currentRegion, machines, dispatch } = useMarkerContext();
  const { cities } = useMachineByCitiesQuery();

  const regionMarkers = useMemo(() => {
    return regions?.map((region) => {

      // Hide the region currentRegion marker.
      if (currentRegion && region.area === currentRegion.area) {
        return null;
      }

      const handleOnPress = async () => {
        dispatch.setCurrentRegion(region);
        map.current.animateToRegion({
          ...region.coordinate,
          latitudeDelta: 10,
          longitudeDelta: 10
        }, 300);
      };

      return (
        <Marker
          key={region.area}
          onPress={handleOnPress}
          coordinate={{
            latitude: region.coordinate.latitude,
            longitude: region.coordinate.longitude
          }}>
          <View style={styles.markerContainer}>
            <View style={styles.marker}>
              <Image
                source={RegionMachineIcon}
                style={{ width: 50, height: 50 }}
              />
            </View>
          </View>
        </Marker>
      );
    });
  }, [regions, currentRegion]);

  const onRegionChange = useCallback(async (region: Region) => {
    if (!map.current) return;
    const position = await map.current.getCamera();
    // console.log(position.center);
  }, [map.current]);

  const citiesMarkers = useMemo(() => {
    return cities?.map((city) => {
      // if the city ony has one machine, we'll just render that single machine.
      if (city.group.length === 1) {
        return (
          <MachineMarker
            key={city.name}
            details={city.group[0]}
          />
        );
      }

      const handleOnPress = () => {
        dispatch.selectMachines(city.group);

        const coordinates = city.group?.map((machine) => {
          return machine.coordinate;
        });

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

      return (
        <Marker
          key={city.name}
          onPress={handleOnPress}
          coordinate={city.coordinate}>
            <View style={styles.marker}>
              <Text
                style={styles.cityMachineCounter}>
                {city.group.length}
              </Text>
              <Image
                source={CityMachineIcon}
                style={{ width: 50, height: 50 }}
              />
            </View>
        </Marker>
      );
    });
  }, [cities, currentRegion, dispatch]);

  const machinesMarkers = useMemo(() => {
    return machines?.map((machine) => {
      return (
        <MachineMarker
          key={machine.id}
          details={machine}
        />
      );
    });
  }, [machines]);

  if (regionsUtils.isLoading) {
    return (
      <View>
        <Text>Loading Map.</Text>
      </View>
    );
  }

  return (
    <ExploreProvider map={map}>
      <View style={styles.container}>
        <Animated
          ref={map}
          provider={PROVIDER_GOOGLE}
          onMapReady={() => {}}
          showsUserLocation
          showsTraffic={false}
          // region={region}
          onRegionChange={onRegionChange}
          style={styles.map}>
            {regionMarkers}
            {currentRegion !== null && machines.length === 0 ? citiesMarkers : machinesMarkers}
        </Animated>
        <Overlay/>
      </View>
    </ExploreProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
  },
  map: {
    width: "100%",
    flexGrow: 1
  },
  markerContainer: {
    padding: 10
  },
  marker: {
    borderRadius: 50,
    backgroundColor: "#f2f2f2",
    padding: 5,
    overflow: "visible",
    borderColor: "#e1e1e1",
    shadowColor: "#000",
    shadowRadius: 3,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 1,
      height: 1
    }
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
  headerContainer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    flexDirection: "row",
    margin: "3%",
    alignItems: "center",
    gap: 15 
  },
  headerTitle: {
    backgroundColor: "#f2f2f2",
    width: "80%",
    padding: "2%",
    borderRadius: 10,
  },
  dropShadow: {
    shadowColor: "#000",
    shadowRadius: 3,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 1,
      height: 1
    }
  },
  cityMachineCounter: {
    zIndex: 1,
    fontSize: 20,
    position: "absolute",
    bottom: 0,
    right: 0,
    fontWeight: "bold",
  }
});

export default Explore;