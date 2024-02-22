import { Link, useParams } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import Loading from "../../components/Loading";
import Card from "../../components/Card";
import { Flex, Grid, Heading, Text } from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";

const ViewPreviousItems = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [previousItems, setPreviousItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const filterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get(
        `/previous-items?report_id=${response.data.report_id}`
      );
      if (!response.success) {
        setLoading(false);
        return;
      }
      setPreviousItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    })();
  }, []);

  const filterSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchTerm = e.target.value.trim();
    if (!searchTerm || searchTerm === "") {
      return;
    }

    const filtered = previousItems.filter(
      (item: any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredItems(filtered);
  };

  const clearSearch = () => {
    setFilteredItems(previousItems);
    filterRef.current!.value = "";
  };

  return (
    <PageLayout title="View Previous Items">
      {loading ? (
        <Loading />
      ) : (
        <>
          <Card>
            <Heading
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight={"semibold"}
              color={"text.700"}
            >
              &#35;{job?.jobNumber} - {job?.category}
            </Heading>
            <Flex alignItems={"center"} mb={3}>
              <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                Name On Report
              </Text>
              <Text color={"text.600"}>{job?.customer?.nameOnReport}</Text>
            </Flex>
          </Card>
          <Flex mt={2} alignItems={"center"} gap={2}>
            <FilterInput
              placeholder="Search by name, category"
              onChange={filterSearch}
              ref={filterRef}
            />
            <InputBtn value="Clear" onClick={clearSearch} />
          </Flex>
          {filteredItems.length !== 0 ? (
            <Grid gap={2} mt={2}>
              {filteredItems.map((item: any) => (
                <Link to={"./" + item?.id} key={item?.id}>
                  <Card>
                    <Flex
                      alignItems={"center"}
                      justify={"space-between"}
                      gap={3}
                    >
                      <Text fontSize={"lg"} color={"text.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"text.500"} ml={"auto"}>
                        Previous Images: {item?.previousItemImages?.length}
                      </Text>
                      <Text color={"text.500"}>
                        New Images: {item?.images?.length}
                      </Text>
                    </Flex>
                    <Text
                      bg={"primary.50"}
                      px={3}
                      borderRadius={"md"}
                      maxW={"max-content"}
                    >
                      {item?.category}
                    </Text>
                    <Text color={"text.600"} mt={1}>
                      Note:{" "}
                      {item?.note && item?.note !== "" ? item.note : "N/A"}
                    </Text>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default ViewPreviousItems;
