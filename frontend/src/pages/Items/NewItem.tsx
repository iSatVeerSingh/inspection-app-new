import { useRef, useState } from "react";
import Card from "../../components/Card";
import RichEditor from "../../components/RichEditor";
import PageLayout from "../../layout/PageLayout";
import ButtonOuline from "../../components/ButtonOuline";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes, LexicalEditor } from "lexical";

const NewItem = () => {
  const editorRef = useRef<LexicalEditor>(null);

  const handledemo = () => {
    // if(editorRef.current) {
    //   const myhtml = $generateHtmlFromNodes(editorRef.current, null);
    //   console.log(myhtml)

    // }
    if (editorRef.current) {
      editorRef.current.update(() => {
        // const myhtml = $generateHtmlFromNodes(editorRef.current!, null);
        // console.log(myhtml);
        const paraser = new DOMParser();
        const dom = paraser.parseFromString(
          `<p dir="ltr"><span style="white-space: pre-wrap;">Internally, Lexical maintains the state of a given editor in memory, updating it in response to user inputs. Sometimes, it's useful t</span><b><strong class="editor-text-bold" style="white-space: pre-wrap;">o convert </strong></b><span style="white-space: pre-wrap;">this state into a serialized format in order to transfer it between editors or store it for retrieval at some later time. In order to make</span><i><em class="editor-text-italic" style="white-space: pre-wrap;"> this process easier, Lexical provides some APIs that allow Nodes to specify how they should be represented in common serialized for</em></i><span style="white-space: pre-wrap;">mats.</span></p>
        `,
          "text/html"
        );

        const nodes = $generateNodesFromDOM(editorRef.current!, dom);
        // $getRoot().select();
        // editorRef.current?.setEditorState(nodes);
        $insertNodes(nodes)
        console.log(nodes) 
      });
    }
  };

  return (
    <PageLayout title="New Library Item">
      <Card>
        <RichEditor ref={editorRef} />
        <ButtonOuline onClick={handledemo}>dmeo</ButtonOuline>
      </Card>
    </PageLayout>
  );
};

export default NewItem;
