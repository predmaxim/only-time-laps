import React from "react";
import TimeSegmentsBlock from "@components/TimeSegmentsBlock";
import { demo } from "@/mocks";

const App: React.FC = () => {
  return <TimeSegmentsBlock segments={demo} />;
};

export default App;
