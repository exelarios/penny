import { useState, useCallback, useMemo } from "react";
import { GestureResponderEvent, Pressable, TouchableOpacity, View, Linking, Platform, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Device } from "@/types";

import Text from "@/components/Text";
import { UseMachineDetailsQuery } from "@/hooks/useMachineDetailsQuery";
import { Icon } from "@expo/vector-icons/build/createIconSet";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type CallToActionProps = {
  label: string;
  icon: string;
  iconComponent: Icon<any, any>;
  onPress?: () => void;
}

function CallToAction(props: CallToActionProps) {
  const { label, iconComponent: IconComponent, onPress, icon } = props;
  const size = 30;
  return (
    <View style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eeeeee",
          margin: 5,
          borderRadius: 100,
          width: size + 15,
          height: size + 15 
        }}>
        <IconComponent size={size} name={icon} color="#363636"/>
      </TouchableOpacity>
      <Text style={{ textAlign: "center" }}>{label}</Text>
    </View>
  );
}

function Button() {

}

function MachineDetailsSheet() {
  const { machine, machineUtils } = UseMachineDetailsQuery();
  const [showFullComments, setShowFullComments] = useState(false);

  const snapPoints = useMemo(() => {
    return ["15%", "50%", "90%"];
  }, []);

  const handleMakePhone = () => {
    const phone = parseInt(machine.phone.replace(/[^0-9.]/g, ""));
    Linking.openURL(Platform.OS === "android" ? `tel:${phone}` : `telprompt:${phone}`);
  }

  const content = () => {
    if (machineUtils.isLoading) {
      return (
        <Text variant="h1">LOADING . .</Text>
      );
    }

    const renderItem = ({ item }: { item: Device }) => {
      return (
        <View>
          <Text style={{ fontSize: 17 }}>{item.name}</Text>
          <Text style={{ fontSize: 15 }}>Type: {item.deviceType}</Text>
          <Text style={{ fontSize: 15 }}>Designs: {item.designs}</Text>
        </View>
      );
    };

    return (
      <View style={{ flex: 1 }} key={machine.id}>
        <View style={{ padding: "2%" }}>
          <Text style={{ fontSize: 16, fontWeight: "500" }}>{machine.address}, {machine.city}</Text>
          <Text variant="h1">{machine.name}</Text>
          <Text style={{ fontSize: 18 }}>{machine.status} • {machine.country}</Text>
          <View style={{
              display: "flex",
              justifyContent: "space-around",
              flexDirection: "row",
              marginVertical: 15
            }}>
            {machine?.website ?
              <CallToAction
                label="Website"
                iconComponent={MaterialCommunityIcons}
                onPress={() => Linking.openURL(machine.website)}
                icon="web"
              /> : null
            }
            {machine?.phone ?
              <CallToAction
                label="Phone"
                iconComponent={MaterialCommunityIcons}
                onPress={handleMakePhone}
                icon="phone"
              /> : null
            }
            <CallToAction
              label="View map"
              iconComponent={MaterialCommunityIcons}
              onPress={() => console.log("open map")}
              icon="map"
            />
            <CallToAction
              label="Details"
              iconComponent={Feather}
              onPress={() => Linking.openURL(`http://209.221.138.252/Details.aspx?location=${machine.id}`)}
              icon="arrow-up-right"
            />
          </View>
        </View>
        <View style={{ padding: "2%" }}>
          <Text style={styles.sectionHeader}>Comments</Text>
          <Pressable onPress={() => setShowFullComments(!showFullComments)}>
            <ScrollView scrollEnabled={showFullComments}>
              <Text style={{ fontSize: 15 }} numberOfLines={showFullComments ? 0 : 10}>
                {machine.comments.trim()}
              </Text>
              {!showFullComments ? <Text style={{ fontWeight: "bold", textAlign: "right" }}>read more</Text> : null}
            </ScrollView>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: "2%" }}>
          <Text style={styles.sectionHeader}>Machines</Text>
        </View>
        <BottomSheetFlatList
          style={{ paddingHorizontal: "2%"}}
          data={machine.devices}
          renderItem={renderItem}
        />
      </View>
    );
  };

  return (
    <BottomSheet snapPoints={snapPoints}>
      {content}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: "90%",
    alignSelf: "center",
    marginVertical: "3%",
    backgroundColor: "#eaeaea",
    height: 1,
    borderRadius: 10
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5
  }
})

export default MachineDetailsSheet;