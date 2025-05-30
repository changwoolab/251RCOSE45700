import type { Mode } from "@/types/objects";
import { Button, Flex, Spacer } from "@chakra-ui/react";

interface SidebarProps {
  setMode: (mode: Mode) => void;
  clear: () => void;
}

export function Sidebar({ setMode, clear }: SidebarProps) {
  return (
    <Flex direction={"column"} bgColor={'gray'} p={4}>
      <Button onClick={() => setMode("line")}>Line</Button>
      <Spacer p={1} />
      <Button onClick={() => setMode("rectangle")}>Rectangle</Button>
      <Spacer p={1} />
      <Button onClick={() => setMode("circle")}>Circle</Button>
      <Spacer p={1} />
      <Button onClick={() => setMode("select")}>Select</Button>
      <Spacer p={1} />
      <Button onClick={clear}>Clear</Button>
    </Flex>
  );
}