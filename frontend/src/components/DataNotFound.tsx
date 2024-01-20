import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import Card from "./Card";

const DataNotFound = () => {
  return (
    <Center minH={'300px'}>
      <Card>
        <Alert status="warning">
          <AlertIcon />
          Couldn't find any data for your request
        </Alert>
      </Card>
    </Center>
  );
};

export default DataNotFound;
