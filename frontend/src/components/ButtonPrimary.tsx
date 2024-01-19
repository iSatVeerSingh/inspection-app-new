import { Button, ButtonProps } from "@chakra-ui/react";

const ButtonPrimary = ({ children, ...props }: ButtonProps) => {
  return (
    <Button
      px="5"
      {...props}
      bg={"primary.500"}
      color={"white"}
      _hover={{
        backgroundColor: "primary.600",
      }}
      borderRadius={"full"}
    >
      {children}
    </Button>
  );
};

export default ButtonPrimary;
