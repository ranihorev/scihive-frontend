import React from 'react';
import PapersList from '../components/PaperList';
import { BasePage } from './BasePage';

const Home: React.FC = () => {
  return (
    <BasePage title="SciHive">
      <PapersList />
    </BasePage>
  );
};

export default Home;
