export type Event = {
  id: string;
  title: string;
  description: string;
};

export type TimeSegment = {
  id: string;
  label: string;
  value: number;
  events: Event[];
};
