import {TimeSegment} from '@/types';

export const demo: TimeSegment[] = [
  {
    id: '1',
    label: 'Январь',
    value: 12,
    events: [
      { id: '1-1', title: 'Событие 1', description: 'Описание события 1 в январе.' },
      { id: '1-2', title: 'Событие 2', description: 'Описание события 2 в январе.' },
      { id: '1-3', title: 'Событие 3', description: 'Описание события 3 в январе.' },
    ],
  },
  {
    id: '2',
    label: 'Февраль',
    value: 8,
    events: [
      { id: '2-1', title: 'Событие 1', description: 'Описание события 1 в феврале.' },
      { id: '2-2', title: 'Событие 2', description: 'Описание события 2 в феврале.' },
    ],
  },
  {
    id: '3',
    label: 'Март',
    value: 15,
    events: [
      { id: '3-1', title: 'Событие 1', description: 'Описание события 1 в марте.' },
      { id: '3-2', title: 'Событие 2', description: 'Описание события 2 в марте.' },
      { id: '3-3', title: 'Событие 3', description: 'Описание события 3 в марте.' },
      { id: '3-4', title: 'Событие 4', description: 'Описание события 4 в марте.' },
    ],
  },
  {
    id: '4',
    label: 'Апрель',
    value: 6,
    events: [
      { id: '4-1', title: 'Событие 1', description: 'Описание события 1 в апреле.' },
    ],
  },
  {
    id: '5',
    label: 'Май',
    value: 20,
    events: [
      { id: '5-1', title: 'Событие 1', description: 'Описание события 1 в мае.' },
      { id: '5-2', title: 'Событие 2', description: 'Описание события 2 в мае.' },
    ],
  },
  {
    id: '6',
    label: 'Июнь',
    value: 10,
    events: [
      { id: '6-1', title: 'Событие 1', description: 'Описание события 1 в июне.' },
      { id: '6-2', title: 'Событие 2', description: 'Описание события 2 в июне.' },
      { id: '6-3', title: 'Событие 3', description: 'Описание события 3 в июне.' },
    ],
  },
];
