import { Select, SelectProps } from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

type FilterSelectProps = SelectProps & {
  options: string[] | { text: string; value: string }[];
};

const FilterSelect = (
  { options, ...props }: FilterSelectProps,
  ref: Ref<HTMLInputElement>
) => {
  return (
    <Select
      {...props}
      border={"filter"}
      borderRadius={"lg"}
      h="8"
      autoComplete="off"
      ref={ref}
    >
      {options.map((opt, index) =>
        typeof opt === "string" ? (
          <option value={opt} key={index}>
            {opt}
          </option>
        ) : (
          <option value={opt.value} key={index}>
            {opt.text}
          </option>
        )
      )}
    </Select>
  );
};

export default forwardRef(FilterSelect);
