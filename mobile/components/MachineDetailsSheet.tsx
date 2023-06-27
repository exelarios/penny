import { useMemo } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

import Text from "@/components/Text";
import Screen from "@/components/Screen";
import { useMarkerContext } from "@/context/MarkerContext";

function MachineDetailsSheet() {
  const { currentMachine } = useMarkerContext();
  const { name, city, location, designs } = currentMachine;

  const snapPoints = useMemo(() => {
    return ["15%", "50%", "90%"];
  }, []);

  return (
    <BottomSheet snapPoints={snapPoints}>
      <Screen>
        <Text variant="h2">{location}, {city}</Text>
        <Text variant="h1">{name}</Text>
      </Screen>
    </BottomSheet>
  );
}

export default MachineDetailsSheet;