import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Text,
} from "@chakra-ui/react";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "../icons";
import { forwardRef, useCallback, useEffect, useState } from "react";

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  return (
    <Flex gap={1}>
      <IconButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        icon={<BoldIcon />}
        aria-label="Bold"
        size="sm"
        borderRadius="none"
        isActive={isBold}
      />
      <IconButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        icon={<ItalicIcon />}
        aria-label="Italic"
        size="sm"
        borderRadius="none"
        isActive={isItalic}
      />
      <IconButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        icon={<UnderlineIcon />}
        aria-label="Underline"
        size="sm"
        isActive={isUnderline}
        borderRadius="none"
      />
    </Flex>
  );
};

type EditorProps = {
  label?: string;
  inputError?: string;
};

const RichEditor = ({ label, inputError }: EditorProps, ref: any) => {
  const editorConfig: InitialConfigType = {
    namespace: "LibraryEditor",
    theme: {
      text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        underlineStrikethrough: "editor-text-underlineStrikethrough",
      },
    },
    onError: (error: Error) => {
      console.log(error);
    },
  };

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
          bg={"card-bg-secondary"}
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
          </Box>
        </Box>
        {/* <OnChangePlugin onChange={onChange} /> */}
        <ClearEditorPlugin />
        <EditorRefPlugin editorRef={ref} />
      </LexicalComposer>
      {inputError && <FormErrorMessage mt="0">{inputError}</FormErrorMessage>}
    </FormControl>
  );
};

export default forwardRef(RichEditor);
