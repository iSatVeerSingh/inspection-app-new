import { useLocation } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";
import ItemForm from "./ItemForm";

const NewItem = () => {
  const { state } = useLocation();
  const { categories } = state;

  return (
    <PageLayout title="New Library Item">
      <ItemForm categories={categories} isEditing={false} />
    </PageLayout>
  );
};

export default NewItem;
