import React from "react";
import TimeSegmentsBlock from "@components/TimeSegmentsBlock";
import { demo } from "@/mocks";
import "@styles/index.scss";

const App: React.FC = () => {
  return <TimeSegmentsBlock segments={demo} />;
};

export default App;
