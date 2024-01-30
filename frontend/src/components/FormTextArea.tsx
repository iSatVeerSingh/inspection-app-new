import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Text,
  Textarea,
  TextareaProps,
} from "@chakra-ui/react";
import { Ref, forwardRef } from "react";

type FormTextAreaProps = FormControlProps &
  TextareaProps & {
    inputError?: string;
    subLabel?: string;
  };

const FormTextArea = (
  { inputError, label, id, isRequired, subLabel, ...props }: FormTextAreaProps,
  ref: Ref<HTMLTextAreaElement>
) => {
  return (
    <FormControl
      isRequired={isRequired}
      isInvalid={inputError !== undefined && inputError !== ""}
    >
      {label && (
        <FormLabel mb={0} fontSize={"lg"} color={"text.700"} htmlFor={id}>
          {label}
          {subLabel && (
            <Text as="span" color={"text.500"} fontSize={"sm"} ml={3}>
              {subLabel}
            </Text>
          )}
        </FormLabel>
      )}
      <Textarea
        id={id}
        border={"stroke"}
        borderRadius={"xl"}
        isRequired={isRequired}
        {...props}
        autoComplete="off"
        ref={ref}
      />
      {inputError && <FormErrorMessage>{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(FormTextArea);
