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
      borderRadius={"lg"}
      h="8"
      autoComplete="off"
      ref={ref}
    />
  );
};

export default forwardRef(FilterInput);
