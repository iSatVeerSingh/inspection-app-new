import { Button, ButtonProps } from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

const ButtonOutline = (
  { children, ...props }: ButtonProps,
  ref: Ref<HTMLButtonElement>
) => {
  return (
    <Button
      {...props}
      px={3}
      borderRadius={"full"}
      color={"primary.500"}
      bg={"primary.50"}
      border="2px"
      borderColor={"primary.500"}
      ref={ref}
    >
      {children}
    </Button>
  );
};

export default forwardRef(ButtonOutline);
