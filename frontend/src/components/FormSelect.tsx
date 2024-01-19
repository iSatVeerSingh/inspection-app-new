import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Select,
  SelectProps,
} from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

type FormSelectProps = FormControlProps &
  SelectProps & {
    inputError?: string;
    options: string[] | { text: string; value: string }[];
  };

const FormSelect = (
  { inputError, label, id, isRequired, options, ...props }: FormSelectProps,
  ref: Ref<HTMLInputElement>
) => {
  return (
    <FormControl
      isRequired={isRequired}
      isInvalid={inputError !== undefined && inputError !== ""}
    >
      {label && (
        <FormLabel htmlFor={id} mb={0} fontSize={"xl"} color={"text.700"}>
          {label}
        </FormLabel>
      )}
      <Select
        id={id}
        isRequired={isRequired}
        {...props}
        border={"stroke"}
        borderRadius={"full"}
        h="10"
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
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(FormSelect);
