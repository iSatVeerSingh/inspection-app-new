import { Box, BoxProps } from "@chakra-ui/react";

const Card = ({ children, ...props }: BoxProps) => {
  return (
    <Box p={3} borderRadius={"xl"} bg={"main-bg"} shadow={"xs"} zIndex={100} {...props}>
      {children}
    </Box>
  );
};

export default Card;
