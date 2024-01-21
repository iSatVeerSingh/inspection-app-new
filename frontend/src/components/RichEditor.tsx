import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ToolbarPlugin from "./ToolbarPlugin";
import { forwardRef } from "react";
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
} from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";

const editorConfig = {
  namespace: "ItemEditor",
  // The editor theme
  theme: {
    placeholder: "editor-placeholder",
    paragraph: "editor-paragraph",
    link: "editor-link",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      overflowed: "editor-text-overflowed",
      hashtag: "editor-text-hashtag",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
      underlineStrikethrough: "editor-text-underlineStrikethrough",
      code: "editor-text-code",
    },
  },
  // Handling of errors during update
  onError(error: any) {
    console.log(error);
  },
  // Any custom nodes go here
  nodes: [LinkNode],
};

type EditorProps = {
  label?: string;
  inputError?: string;
};

const RichEditor = ({ label, inputError }: EditorProps, ref: any) => {
  return (
    <FormControl isInvalid={inputError !== undefined && inputError !== ""}>
      {label && (
        <FormLabel color="text-big" fontSize="xl" mb="0">
          {label}
        </FormLabel>
      )}
      <LexicalComposer initialConfig={editorConfig}>
        <Box
          borderRadius={"xl"}
          overflow={"hidden"}
          shadow={"xs"}
          border={"1px"}
          borderColor={"gray.400"}
          fontSize={"sm"}
        >
          <ToolbarPlugin />
          <Box position="relative">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={
                <Text position="absolute" top="5px" left="5px" opacity="0.5">
                  Start typing here
                </Text>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <LinkPlugin />
            <ClearEditorPlugin />
            <EditorRefPlugin editorRef={ref} />
          </Box>
        </Box>
      </LexicalComposer>
      {inputError && <FormErrorMessage mt="0">{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(RichEditor);
