import { Input, InputProps } from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

type FilterInputProps = InputProps;

const FilterInput = (
  { ...props }: FilterInputProps,
  ref: Ref<HTMLInputElement>
) => {
  return (
    <Input
      {...props}
      border={"filter"}
      bg={"primary.100"}
      type="button"
      borderRadius={"lg"}
      h="8"
      cursor={"pointer"}
      maxW={"max-content"}
      autoComplete="off"
      ref={ref}
    />
  );
};

export default forwardRef(FilterInput);
