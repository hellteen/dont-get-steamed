export interface SibsiuGroup {
  id: number;
  name: string;
  department: string;
}

export const SIBSIU_GROUPS: SibsiuGroup[] = [
  { id: 1, name: 'ПИМЦ-262', department: 'Прикладная информатика' },
  { id: 2, name: 'ПИТЭ-26', department: 'Прикладная информатика в экономике' },
  { id: 3, name: 'ПИС-26', department: 'Программная инженерия' },
  { id: 4, name: 'ПИСЭ-26', department: 'Программная инженерия' },
  { id: 5, name: 'ИС-21', department: 'Информационные системы' },
  { id: 6, name: 'ИС-22', department: 'Информационные системы' },
  { id: 7, name: 'Менеджмент', department: 'Экономика и управление' },
];
