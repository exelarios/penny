import { useMemo } from "react";
import { default as RN_BottomSheet } from "@gorhom/bottom-sheet";

type BottomSheetProps = {
  children: React.ReactNode;
}

export function BottomSheet(props: BottomSheetProps) {
  const snapPoints = useMemo(() => {
    return ["15%", "50%", "90%"];
  }, []);

  return (
    <RN_BottomSheet snapPoints={snapPoints}>
      {props.children}
    </RN_BottomSheet>
  );
}

export * from "@gorhom/bottom-sheet";