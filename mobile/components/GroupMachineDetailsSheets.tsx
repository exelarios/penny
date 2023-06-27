import { useMemo } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";

function GroupMachineDetailsSheets() {

  const snapPoints = useMemo(() => {
    return ["15%", "50%", "90%"];
  }, []);

  return (
    <BottomSheet snapPoints={snapPoints}>

    </BottomSheet>
  );
}

export default GroupMachineDetailsSheets;