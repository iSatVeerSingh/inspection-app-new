import { useEffect, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import clientApi from "../../api/clientApi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";

const ViewItems = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pages, setPages] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get("/categories");
      if (!response.success) {
        setLoading(false);
        return;
      }
      const allCategories = response.data.map((item: any) => item.name);
      setCategories(allCategories);
      // setLoading(false);
    })();
  }, []);

  const updateSearch = (key: string, value: string, includePage?: boolean) => {
    if (value && value !== "") {
      setSearchParams((prev) => {
        const updatedParams = {
          ...Object.fromEntries(prev),
          [key]: value,
        };

        if (!includePage) {
          delete updatedParams.page;
        }

        return updatedParams;
      });
    }
  };

  const getInspectionItems = async (url: string) => {
    setLoading(true);
    const { success, data } = await clientApi.get(url);
    if (!success) {
      setLoading(false);
      return;
    }
    setItems(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    const baseurl = `/jobs/inspection-items?jobNumber=${jobNumber}`;
    const searchUrl =
      searchParams.size === 0
        ? baseurl
        : baseurl + "&" + searchParams.toString();
    getInspectionItems(searchUrl);
  }, [searchParams]);

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("name", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

  return (
    <PageLayout title="View Items" backPage={"/jobs/" + jobNumber}>
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
          <Flex gap={3} mb={3} alignItems={"center"} mt={2}>
            <Text>Filter</Text>
            <FilterSelect
              value={searchParams.get("category") || ""}
              onChange={(e) => updateSearch("category", e.target.value)}
              placeholder="Select a category"
              options={categories}
              maxW={"300px"}
            />
            <FilterInput
              placeholder="Search by name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <InputBtn value="Search" onClick={searchByName} />
            <InputBtn value="Clear" onClick={clearSearch} />
          </Flex>
          {items.length !== 0 ? (
            <Grid gap={2} mt={2}>
              {items.map((item: any) => (
                <Link to={"./" + item?.id} key={item?.id}>
                  <Card>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"lg"} color={"text.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"text.500"}>
                        Images: {item?.images?.length}
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
      {pages && items.length !== 0 && (
        <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
          <Button
            borderRadius={"full"}
            isDisabled={pages.prev === null}
            onClick={() => updateSearch("page", pages.prev.toString(), true)}
          >
            Prev
          </Button>
          <Text>Current Page: {pages.current_page}</Text>
          <Button
            borderRadius={"full"}
            isDisabled={pages.next === null}
            onClick={() => updateSearch("page", pages.next.toString(), true)}
          >
            Next
          </Button>
        </Flex>
      )}
    </PageLayout>
  );
};

export default ViewItems;