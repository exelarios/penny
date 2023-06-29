import { useState, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import BottomSheet, { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { TextInput } from "react-native-gesture-handler";
import { useMachineByCitiesQuery } from "@/hooks/useMachineQuery";
import { MachineGroup } from "@/types";
import { useMarkerContext } from "@/context/MarkerContext";

import { FontAwesome } from "@expo/vector-icons";
import useMap from "@/hooks/useMap";

type RenderItemProps = {
  item: MachineGroup
}

function GroupRegionBottomSheet() {
  const { currentRegion, dispatch } = useMarkerContext();
  const map = useMap();
  const { cities } = useMachineByCitiesQuery();
  const sheet = useRef<BottomSheet>(null);

  const inputRef = useRef<TextInput>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const handleOnSearchOpen = useCallback(() => {
    setIsFilterOpen(true);
    inputRef.current?.focus();
  }, [isFilterOpen]);

  const handleSearchOnClose = useCallback(() => {
    setIsFilterOpen(false);
    inputRef.current?.blur();
  }, [isFilterOpen]);

  const snapPoints = useMemo(() => {
    return ["15%", "50%", "90%"];
  }, []);

  const regionsFiltered = useMemo(() => {
    return cities?.filter(city => city.name.toLowerCase().includes(filterValue.toLowerCase()));
  }, [cities, filterValue]);

  const handleOnChangeText = useCallback((value: string) => {
    setFilterValue(value);
  }, [filterValue]);

  const renderItem = useCallback(({ item }: RenderItemProps) => {
    const amountOfMachines = item.group.length;
    const handleOnPress = () => {
      dispatch.selectMachines(item.group);
      const coorindates = item.group?.map((machine) => {
        return machine.coordinate;
      });
      sheet.current.collapse();
      map.fitRegion(coorindates);
    };

    return (
      <TouchableOpacity onPress={handleOnPress}>
        <View style={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          padding: 10,
          flexDirection: "row",
          width: "100%"
        }}>
          <View>
            <Text variant="h2">{item.name}</Text>
            <Text>{currentRegion.name}, United States</Text>
          </View>
          <Text>{amountOfMachines} Machines</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <BottomSheet ref={sheet} snapPoints={snapPoints}>
      <View style={styles.header}>
        <Text variant="h1">Cities</Text>
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
      <BottomSheetFlatList data={regionsFiltered} renderItem={renderItem}/>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent:"space-between",
    marginHorizontal: "2%",
    alignItems: "center",
    width: "90%",
    alignSelf: "center"
  },
  regionDivider: {
    width: "90%",
    alignSelf: "center",
    marginHorizontal: "2%",
    backgroundColor: "#eaeaea",
    height: 1,
    borderRadius: 10
  },
  bottomSheetInput: {
    fontSize: 30,
    margin: "2%"
  }
});

export default GroupRegionBottomSheet;
