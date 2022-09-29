import React, { useState, useEffect, useReducer } from 'react';
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
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  CheckIcon,
  NotAllowedIcon,
  DeleteIcon,
  ChevronDownIcon,
  EmailIcon,
} from '@chakra-ui/icons';
import TinderCard from 'react-tinder-card';
import useInterval from 'react-useinterval';
import { format } from 'timeago.js';
import config from '../client.config.js';

axios.defaults.baseURL = config.SERVER_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const getJobs = async () => {
  //return (await axios.get('/jobs')).data.slice(0, 10);
  return (await axios.get('/jobs')).data;
}

const sawJob = (job, direction, username='default') => {
  //console.log('direction is:', direction);
  const accept = direction == 'left' ? false : true;
  axios.post('/jobs', {id: job.id, accept: accept, username: username});
};

const getUser = async () => {
  const res = (await axios.get('/user'));
  return res.data.username;
};

const getAccepted = async () => {
  const res = (await axios.get('/jobs/accepted'));
  return res.data;
};

const removeAccepted = (id) => {
  axios.delete('/jobs/accepted', {data: {id}});
}

const getMessages = () => {
  return axios.get('/messages')
}

function newMessages() {
  const toast = useToast();
  toast({
    title: 'New messages!',
    description: "You have a new message from an employer!",
    status: 'success',
    duration: 5000,
    isClosable: true,
  });
}

const JobItem = ({index, job, removeJob}) => {
  const {id, title, description, employer, url, photos} = job;
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
              //console.log('you swiped', dir)
              removeJob(job, dir);
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
          <Center>
            <Box marginBottom="12px">
              <Text>Use the buttons below, or click-drag / swipe to sort through these jobs!</Text>
              <Text>You can also select the image to peruse a job posts images</Text>
            </Box>
          </Center>
          <Flex flexGrow="0.5">
            <Spacer flexGrow="0.5"/>
            <NotAllowedIcon color='tomato' w={8} h={8} onClick={()=> removeJob(job, 'left')}/>
            <Spacer />
            <CheckIcon  color='teal' w={8} h={8} onClick={() => removeJob(job, 'right')}/>
            <Spacer flexGrow="0.5"/>
          </Flex>
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

const ChatMessages = ({messages, employer, username}) => {
  if (employer !== '') {
    return (
      <div>
        <Heading marginBottom="24px">Messages from {employer}</Heading>
        <Box>
          <Text marginBottom="10px">Reply to {employer}</Text>
          <form onSubmit={(event) => {
            event.preventDefault();
            let msgInput = document.getElementById('sendMessage');
            axios.post('/messages', { to: employer, from: username, at: new Date(), text: msgInput.value}).catch(err => console.error(err));
            msgInput.value = '';
            }}>
            <InputGroup>
              <InputLeftElement children={<EmailIcon />} />
              <Input marginBottom="24px" id="sendMessage" placeholder="hello, there!" />
            </InputGroup>
          </form>
        </Box>
        { messages.filter((msg) => (msg.from === employer) || (msg.to === employer)).reverse().map((msg,j) =>
          <Box
            marginBottom="8px"
            key={j}
            bgColor={msg.to === employer ? "blue.100" : "white"}
            borderRadius="8px"
            padding="8px 8px"
          >
            <p><strong>{msg.from}</strong>, <em>{format(msg.at)}</em></p>
            <p>{msg.text}</p>
            <Divider />
          </Box>
        )}
      </div>
    )
  } else return ''
};

const ChatRoom = ({ username, messages }) => {
  let employers = messages.filter(msg=> msg.from !== username).map(msg => msg.from)
  employers = Array.from(new Set(employers))
  const [currentConversation, setCurrentConversation] = useState('')
  if (messages.length) {
    return (
      <Flex flexDirection="column">
        <Menu >
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Conversations
          </MenuButton>
          <MenuList zIndex={2000}>
            { employers.map((employer, i) =>
              <MenuItem
                key={i}
                onClick={() => setCurrentConversation(employer)}
              >
                {employer}
              </MenuItem>)
            }
          </MenuList>
        </Menu>
        <ChatMessages username={username} employer={currentConversation} messages={messages} />
      </Flex>
    );
  } else {
    return <Text>Messages from potential employers will show up here</Text>
  }

};

const App = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(0);
  const [username, setUsername] = useState('');
  const [accepted, setAccepted] = useState([]);
  const [areMore, setAreMore] = useState(true);
  const [messages, setMessages] = useState([]);
  const checkMessages = (data) => {
    if ((data.length > 0) && (data.length > messages.length)) {
      setMessages(data);
    }
  }

  const messagesToast = useToast();
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (firstLoadComplete && (lastMessage.from !== username)) {
      messagesToast({
        title: 'New messages!',
        description: `You have a new message from ${lastMessage.from}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [messages]);

  useEffect(() => {
    setIsLoading(true);
    (async () => setJobs(await getJobs()) )();
    getUser().then(name => setUsername(name));
    setFirstLoadComplete(true);
  }, []);

  useInterval(() => {
    getMessages().then(res => checkMessages(res.data))
  }, 3000);

  useEffect(() => {
    //console.log('user is:', username);
  }, [username]);

  useEffect(() => {
    setIsLoading(false);
    if (jobs.length < 5 && areMore) {
      //console.log('jobs running low');
      getJobs().then(newJobs => {
        setAreMore(newJobs.length >= 15);
        const currentIds = jobs.map(j => j.id);
        const filtered = newJobs.filter(nj => !currentIds.includes(nj.id))
        setJobs(jobs.concat(filtered));
      });
    }
  }, [jobs]);

  return (
    <ChakraProvider bgColor='teal' height="100%">
      <Tabs h="100%">
        <TabList h="7%">
          <Tab>Search Jobs</Tab>
          <Tab
            onClick={() => {
              getAccepted().then(data => setAccepted(data));
            }}
          >Job Picks</Tab>
          <Tab>Messages</Tab>
          <Tab bgColor='tomato' color='white' onClick={(event) => {
            event.preventDefault();
            axios.get('/logout')
            window.location.href = config.SERVER_URL;
          }}
          >
            Log Out
          </Tab>
        </TabList>
        <TabPanels h="93%">
          <TabPanel h="100%">
            { isLoading ? (
              <Spinner />
            ) : (
            <Container maxW='960px' height="100%">
              { jobs.length > 0 ?
              ( jobs.map((job, i) =>
                <JobItem
                  key={job.id}
                  index={i}
                  job={job}
                  removeJob={(job, dir) => {
                    setJobs(jobs.slice(1));
                    sawJob(job, dir); // fix default user value once user accounts are a thing
                  }}
                />
              )) : <p>There are no new jobs right now! Check back later!</p> }
            </Container>
            ) }
          </TabPanel>
          <TabPanel marginLeft={[0, 5, 10, 20]} marginRight={[0, 5, 10, 20]}>
            <Center>
              <Box width="100%">
                <Heading marginBottom="24px">Jobs You've Picked ({accepted.length})</Heading>
                <Accordion>
                  { accepted.map((job) => (
                    <AccordionItem key={job.id}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text>{job.title}, {job.employer}</Text>
                          </Box>
                          <DeleteIcon color="tomato" h={6} w={6} onClick={(event) => {
                            removeAccepted(job.id)
                            let newList = accepted.filter(acc => acc.id != job.id)
                            setAccepted(newList);
                            }}
                          />

                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Link color="teal" href={job.url}>Original Post</Link>
                        <Text>{job.description}</Text>
                      </AccordionPanel>
                    </AccordionItem>
                  ))
                  }
                </Accordion>
              </Box>
            </Center>
          </TabPanel>
          <TabPanel>
            <ChatRoom messages={messages} username={username}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
};

export default App;
