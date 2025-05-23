export type Event = {
  id: string;
  title: string;
  description: string;
};

export type TimeSegmentType = {
  id: string;
  label: string;
  value: number;
  events: Event[];
};
