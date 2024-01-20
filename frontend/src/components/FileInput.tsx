import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  Text,
} from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

type FileInputProps = FormControlProps &
  InputProps & {
    inputError?: string;
    subLabel?: string;
  };

const FileInput = (
  { inputError, label, id, isRequired, subLabel, ...props }: FileInputProps,
  ref: Ref<HTMLInputElement>
) => {
  return (
    <FormControl
      isRequired={isRequired}
      isInvalid={inputError !== undefined && inputError !== ""}
    >
      {label && (
        <FormLabel mb={0} fontSize={"xl"} color={"text.700"} htmlFor={id}>
          {label}
          {subLabel && (
            <Text as="span" color={"text.500"} fontSize={"sm"} ml={3}>
              {subLabel}
            </Text>
          )}
        </FormLabel>
      )}
      <Input
        type="file"
        id={id}
        px={0}
        cursor={"pointer"}
        {...props}
        border={"stroke"}
        borderRadius={"full"}
        h="10"
        autoComplete="off"
        ref={ref}
      />
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(FileInput);
