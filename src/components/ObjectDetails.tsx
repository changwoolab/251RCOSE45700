import { ObjectInfo } from "@/types/objects";
import { Nullable, NullableProperty } from "@/types/typeUtils";
import { Box, Text } from "@chakra-ui/react";

export function ObjectDetails({objectInfo}: {objectInfo: Nullable<ObjectInfo>}) {
  const { id, startPoint, currentPoint, color } = objectInfo ?? {};

  return (
    <Box minW={300}>
      <Text>Object Id: {id}</Text>
      <Text>
        Start Point: ({startPoint?.x}, {startPoint?.y})
      </Text>
      <Text>
        Current Point: ({currentPoint?.x}, {currentPoint?.y})
      </Text>
      <Text>Color: {color}</Text>
    </Box>
  );
}