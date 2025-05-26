export type Event = {
  id: string;
  title?: string; // title теперь может быть не обязательным, если мы его не используем в карточке
  description: string;
  year: number; // Добавляем поле года
};

export type TimeSegmentType = {
  id: string;
  label: string; // Это будет категория, отображаемая на круге
  value: number; // Это год, который будет основным в центре
  category: string; // Дублируем для ясности или если label будет чем-то другим
  events: Event[];
};
