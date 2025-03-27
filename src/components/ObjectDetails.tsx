import { ObjectInfo } from "@/types/objects";
import { Nullable, NullableProperty } from "@/types/typeUtils";
import { Box, Text } from "@chakra-ui/react";

export function ObjectDetails({objects}: {objects: ObjectInfo[]}) {
  return (
    <Box minW={300}>
      {objects.map((object) => (
        <ObjectDetail objectInfo={object} />
      ))}
    </Box>
  );
}

function ObjectDetail({objectInfo}: {objectInfo: NullableProperty<ObjectInfo>}) {
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