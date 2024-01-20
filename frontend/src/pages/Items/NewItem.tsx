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
          `<p><span>The relevant Australian Standard AS 2870 Residential Slabs and Footings states in section 6.4.6 Fixing of reinforcement and void formers that</span><span><i><b>‘Reinforcement and void formers shall be fixed in position prior to concreting by means of proprietary spacers, bar chairs with bases, ligatures or other appropriate fixings so as to achieve the required reinforcement position and concrete cover’</b></i></span><span>. Additionally, section 5.3.2 Reinforcement that</span><span><i><b>‘The slab mesh shall be placed towards the top of the raft or slab’</b></i></span><span>.</span></p><p><span>These bar chairs must be properly installed prior to any concrete being poured.</span></p>
        `,
          "text/html"
        );

        const nodes = $generateNodesFromDOM(editorRef.current!, dom);
        // $getRoot().select();
        // editorRef.current?.setEditorState(nodes);
        $insertNodes(nodes);
        console.log(nodes);
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
