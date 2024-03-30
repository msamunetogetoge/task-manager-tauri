import { Box } from "@mui/material";

interface YAxisSpacerProp {
  height?: number;
}

export const YAxisSpacer = (prop: YAxisSpacerProp) => {
  const spacerHeight = prop.height ?? 1;
  const spacerHeightString = spacerHeight.toString() + "rem";
  return (
    <Box
      sx={{
        height: spacerHeightString,
      }}
    />
  );
};
