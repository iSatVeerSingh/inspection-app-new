import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  RangeSelection,
  LexicalEditor,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isAtNodeEnd } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { createPortal } from "react-dom";
import { Flex, IconButton } from "@chakra-ui/react";
import {
  BoldIcon,
  ItalicIcon,
  JustifyIcon,
  LeftAlignIcon,
  LinkIcon,
  PencilIcon,
  RightAlignIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "../icons";

const LowPriority = 1;

function positionEditorElement(editor: any, rect: DOMRect | null) {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + 5}px`;
    editor.style.left = `${rect.right}px`;
  }
}

function FloatingLinkEditor({
  editor,
  linkRect,
}: {
  editor: LexicalEditor;
  linkRect: DOMRect;
}) {
  const editorRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection() as any;
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current as any;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection!.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection!.anchorNode)
    ) {
      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, linkRect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="link-editor">
      {isEditMode ? (
        <input
          ref={inputRef}
          className="link-input"
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== "") {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                }
                setEditMode(false);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <>
          <Flex
            className="link-input"
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>
            <IconButton
              aria-label="Edit Link"
              tabIndex={0}
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditMode(true)}
              icon={<PencilIcon boxSize={5} />}
            />
          </Flex>
        </>
      )}
    </div>
  );
}

function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const linkBtnRef = useRef<HTMLButtonElement>(null);
  const [linkRect, setLinkRect] = useState<any>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    if (linkBtnRef.current) {
      const rect = linkBtnRef.current.getBoundingClientRect();
      setLinkRect(rect);
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <Flex ref={toolbarRef} gap={1}>
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
      <IconButton
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        icon={<StrikethroughIcon />}
        aria-label="Strikethrough"
        size="sm"
        isActive={isStrikethrough}
        borderRadius="none"
      />
      <IconButton
        onClick={insertLink}
        icon={<LinkIcon />}
        aria-label="Insert Link"
        size="sm"
        isActive={isLink}
        borderRadius="none"
        ref={linkBtnRef}
      />
      {isLink &&
        linkRect &&
        createPortal(
          <FloatingLinkEditor linkRect={linkRect} editor={editor} />,
          document.body
        )}
      <IconButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        icon={<LeftAlignIcon />}
        aria-label="Left align"
        size="sm"
        borderRadius="none"
      />
      <IconButton
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        icon={<RightAlignIcon />}
        aria-label="Right align"
        size="sm"
        borderRadius="none"
      />
      <IconButton
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        icon={<JustifyIcon />}
        aria-label="Justify align"
        size="sm"
        borderRadius="none"
      />
    </Flex>
  );
}
