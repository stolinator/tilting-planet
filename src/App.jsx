import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ChakraProvider,
  Container,
  Box,
  Text,
  Link,
  Heading,
  Image,
  Button,
  Center,
  Flex,
  Spacer,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Spinner,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import TinderCard from 'react-tinder-card';

axios.defaults.baseURL = 'http://192.168.1.59:5000';
axios.defaults.headers.post['Content-Type'] = 'application/json';

const getJobs = async () => {
  //return (await axios.get('/jobs')).data.slice(0, 10);
  return (await axios.get('/jobs')).data;
}

const JobItem = ({index, job, removeJob}) => {
  const {title, description, employer, url, photos} = job;
  const [image, setImage] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  if (index === 0) {
    return (
      <Box height="100%">
        <Flex flexDirection="column" height="100%">
          <Spacer flexGrow="0.12"/>
          <Center flexGrow="0.12">
            <Box>
              <Heading>{title}</Heading>
              <Text><em>{employer}</em></Text>
            </Box>
          </Center>
          <Spacer flexGrow="0.12"/>
          <TinderCard
            onCardLeftScreen={(dir) => {
              console.log('you swiped', dir)
              removeJob();
            }}
            preventSwipe={['up', 'down']}
          >
            <Center
              onClick={() => setImage((image + 1) % photos.length)}
              onTouchEnd={() => setImage((image + 1) % photos.length)}
              bgImage={photos[image]}
              bgPosition="center"
              bgRepeat="no-repeat"
              bgSize="100%"
              minHeight="400px"
              
            >
            </Center>
          </TinderCard>
          <Spacer />
          <Box marginTop="24px" marginBottom="24px">
              <Button w="100%" minHeight="24px" ref={btnRef} onClick={onOpen}>Job Details</Button>
          </Box>
          <Drawer
            isOpen={isOpen}
            placement='bottom'
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader><Center>Details</Center></DrawerHeader>
              <DrawerBody>
                <Text><strong>Job Title</strong> {title}</Text>
                <Text><strong>Employer</strong> {employer}</Text>
                <Link color="teal" href={url}>Link to Job Post</Link>
                <Text><strong>Description</strong></Text>
                <Text>{description}</Text>
              </DrawerBody>
              <DrawerFooter>
                <Button variant='outline' mr={3} onClick={onClose}>Close</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Box>
    );
  } else return null;
};
const App = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(0);
  useEffect(() => {
    setIsLoading(true);
    (async () => setJobs(await getJobs()) )();
  }, []);
  useEffect(() => {
    setIsLoading(false);
  }, [jobs]);
  return (
    <ChakraProvider height="100%">
      <Tabs h="100%">
        <TabList h="7%">
          <Tab>Search Jobs</Tab>
          <Tab>Job Picks</Tab>
        </TabList>
        <TabPanels h="93%">
          <TabPanel h="100%">
            { isLoading ? (
              <Spinner />
            ) : (
            <Container maxW='960px' height="100%">
              { jobs.map((job, i) => <JobItem key={job.id} index={i} job={job} removeJob={() => setJobs(jobs.slice(1))} /> )}
              {/* jobs.length ? <JobItem nextJob={() => setJob(job + 1)} job={jobs[job]} jobs={jobs} /> : null */}
            </Container>
            ) }
          </TabPanel>
          <TabPanel>
            <Text>picked jobs will go here</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
};

export default App;
