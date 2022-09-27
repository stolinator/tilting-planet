import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ChakraProvider,
  Container,
  Text,
  Image
} from '@chakra-ui/react';

axios.defaults.baseURL = 'http://192.168.1.59:5000';
axios.defaults.headers.post['Content-Type'] = 'application/json';

const getJobs = async () => {
  return (await axios.get('/jobs')).data;
}

const JobItem = ({job}) => {
  const {title, description, employer, url, photos} = job;
  const [image, setImage] = useState(0);
  return (
    <div>
      <h3>{title}</h3>
      <p><strong>Employer:</strong>{employer}</p>
      <img src={photos[image]} onClick={() => setImage((image + 1) % photos.length)} />
      <p><strong>Description:</strong>{description}</p>
      <a href={url}>Link to Job Post</a>
    </div>
  );
};
const App = (props) => {
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(0);
  useEffect(() => {
    (async () => setJobs(await getJobs()) )();
  }, []);
  return (
    <ChakraProvider>
      <Container>
        { jobs.slice(0, 1).map(job => <JobItem key={job.id} job={job} /> )}
        {/*<JobItem job={ jobs[] }/>*/}
      </Container>
    </ChakraProvider>
  );
};

export default App;
