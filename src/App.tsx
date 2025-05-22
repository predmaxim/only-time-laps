import React from 'react';
import '@styles/index.scss';
import TimeSegmentsBlock from '@components/TimeSegmentsBlock';
import {demo} from '@/mocks';

const App: React.FC = () => {
  return (
    <div>
      <TimeSegmentsBlock segments={demo} />
    </div>
  );
};

export default App;
