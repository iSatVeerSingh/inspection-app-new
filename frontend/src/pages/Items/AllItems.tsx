import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";

const AllItems = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="Library Items"
      btn="Create Item"
      onClick={() => navigate("./new")}
      isRoot
    >
      <Card>Libite itesm</Card>
    </PageLayout>
  );
};

export default AllItems;
