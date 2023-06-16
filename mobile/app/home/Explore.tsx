import { Dispatch, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Text, StyleSheet, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";

import DropDownPicker, { RenderListItemPropsInterface } from "react-native-dropdown-picker";

import { Entypo } from '@expo/vector-icons';
import useLocationQuery from "../../hooks/useLocationQuery";

type Coordinate = {
  latitude: number;
  longitude: number;
}

type Location = {
  area: number;
  name: string;
  coordinate: Coordinate;
}

type ExploreContext = {
  region: number;
  setRegion: Dispatch<React.SetStateAction<number>>;
  locations: Location[];
}

const ExploreContext = createContext<ExploreContext | undefined>(undefined);

function useExploreContext() {
  const context = useContext(ExploreContext);
  if (context === undefined) {
    Error("useExploreContext must be used inside of Explore.Provider");
  }

  return context;
}

function Header() {
  const { region, setRegion, locations } = useExploreContext();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [regionName, setRegionName] = useState("");

  const items = useMemo(() => {
    return locations?.map((location) => {
      return {
        label: location.name,
        value: location.area
      }
    });
  }, [locations]);

  const Item = (props: RenderListItemPropsInterface<number>) => {
    const { label, value } = props.item;

    const onPress = useCallback(() => {
      setRegionName(label);
      props.onPress(value);
      setRegion(value);
    }, [value, regionName, props.onPress]);

    return (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.section}>
      <Text>Explore</Text>
      <DropDownPicker
        placeholder={regionName.length !== 0 ? regionName : "Select a region"}
        modalTitle="Region"
        modalAnimationType="slide"
        listMode="MODAL"
        open={isPickerOpen}
        value={region}
        setValue={setRegion}
        items={items}
        setOpen={setIsPickerOpen}
        renderListItem={(props) => <Item {...props}/>}
      />
    </SafeAreaView>
  );
}

function Explore() {
  const [currentRegion, setCurrentRegion] = useState<number>(-1);
  const [camera, setCamera] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0
  });

  const locations = useLocationQuery();

  const value = useMemo(() => {
    return {
      region: currentRegion,
      setRegion: setCurrentRegion,
      locations: locations.data
    }
  }, [currentRegion, locations.data]);

  const markers = useMemo(() => {
    return locations.data?.map((location) => {
      const handleOnPress = () => {
        setCurrentRegion(location.area);
      };

      return (
        <Marker
          key={location.area}
          onPress={handleOnPress}
          coordinate={{
            latitude: location.coordinate.latitude,
            longitude: location.coordinate.longitude}
          }>
          <View style={styles.marker}>
            <Text style={styles.text}>{location.name}</Text>
          </View>
        </Marker>
      );
    });
  }, [locations, currentRegion]);

  useEffect(() => {
    const regionInfo = locations.data.filter((l) => l.area === currentRegion);

    // Failed to find any region with the given region's code.
    if (regionInfo.length === 0) return;

    const targetRegion = regionInfo[0];

    setCamera({
      latitude: targetRegion.coordinate.latitude,
      longitude: targetRegion.coordinate.longitude,
      latitudeDelta: 10,
      longitudeDelta: 10
    });
  }, [currentRegion]);

  if (locations.isLoading) {
    return (
      <View>
        <Text>Loading Map.</Text>
      </View>
    );
  }
  
  return (
    <ExploreContext.Provider value={value}>
      <SafeAreaView style={styles.container}>
        <Header/>
        <MapView
          region={camera}
          style={styles.map}>
            {markers}
        </MapView>
      </SafeAreaView>
    </ExploreContext.Provider>
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
    width: "100%",
    height: "100%"
  },
  text: {
    fontSize: 10,
    padding: 10,
    color: "white"
  },
  section: {
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 1
  }
});

export default Explore;