export interface SibsiuGroup {
  id: number;
  name: string;
  department?: string;
}

export const SIBSIU_GROUPS: SibsiuGroup[] = [
  { id: 1, name: 'ПИМЦ-262' },
  { id: 2, name: 'ПИТЭ-26' },
  { id: 3, name: 'ПИС-26' },
  { id: 4, name: 'ПИСЭ-26' },
  { id: 5, name: 'ИС-21' },
  { id: 6, name: 'ИС-22' },
  { id: 7, name: 'Менеджмент' },
];
