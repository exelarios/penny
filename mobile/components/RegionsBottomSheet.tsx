import { useRef, useState, useMemo, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Pressable } from "react-native";
import BottomSheet, { BottomSheetTextInput, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";

import { FontAwesome } from "@expo/vector-icons";

import Text from "@/components/Text";
import { useMarkerContext } from "@/context/MarkerContext";
import useRegionQuery from "@/hooks/useRegionQuery";
import { MachineRegion } from "@/types";
import { useExploreContext } from "@/context/ExploreContext";

type RenderItemProps = {
  item: MachineRegion
}

function RegionsBottomSheet() {
  const { dispatch } = useMarkerContext();
  const { regions, regionsUtils } = useRegionQuery();
  const { map } = useExploreContext();
  const inputRef = useRef<TextInput>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const snapPoints = useMemo(() => {
    return ["15%", "50%", "90%"];
  }, []);

  const regionsFiltered = useMemo(() => {
    return regions.filter(region => region.name.toLowerCase().includes(filterValue.toLowerCase()));
  }, [regions, filterValue]);

  const renderItem = useCallback(({ item }: RenderItemProps) => {
    const handleOnPress = () => {
      dispatch.setCurrentRegion(item);
      map.animateToRegion({
        ...item.coordinate,
        latitudeDelta: 10,
        longitudeDelta: 10
      }, 300);
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

  const handleOnChangeText = useCallback((value: string) => {
    setFilterValue(value);
  }, [filterValue]);

  const handleOnSearchOpen = useCallback(() => {
    setIsFilterOpen(true);
    inputRef.current?.focus();
  }, [isFilterOpen]);

  const handleSearchOnClose = useCallback(() => {
    setIsFilterOpen(false);
    inputRef.current?.blur();
  }, [isFilterOpen]);

  return (
    <BottomSheet
      snapPoints={snapPoints}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.bottomSheetHeader}>
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
              Locations
            </Text>
          </View>
          <FontAwesome
            onPress={!isFilterOpen ? handleOnSearchOpen : handleSearchOnClose}
            name={!isFilterOpen ? "search" : "remove"}
            size={24}
            color="black"
          />
        </View>
        <BottomSheetTextInput
          ref={inputRef}
          style={[styles.bottomSheetInput, { display: `${isFilterOpen ? "flex" : "none"}` }]}
          onChangeText={handleOnChangeText}
          value={filterValue}
        />
        <View style={[styles.regionDivider, { marginVertical: 5, width: "100%" }]}/>
        {regionsUtils.isLoading ? 
          <Text>Loading . . . </Text>
        : <BottomSheetFlatList
          data={regionsFiltered}
          renderItem={renderItem}
          keyExtractor={(item) => item.area.toString()}
        />
        }
      </SafeAreaView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
  },
  bottomSheetInput: {
    fontSize: 30,
    margin: "2%"
  }
});

export default RegionsBottomSheet;