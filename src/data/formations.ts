import { Formation } from '../types/card';

export const FORMATIONS: Formation[] = [
  {
    id: '4-3-3',
    name: '4-3-3 (Attack)',
    slots: [
      { id: 'gk', position: 'GK', x: 50, y: 88 },
      { id: 'lb', position: 'LB', x: 15, y: 68 },
      { id: 'cb1', position: 'CB', x: 38, y: 70 },
      { id: 'cb2', position: 'CB', x: 62, y: 70 },
      { id: 'rb', position: 'RB', x: 85, y: 68 },
      { id: 'cm1', position: 'CM', x: 28, y: 46 },
      { id: 'cam', position: 'CAM', x: 50, y: 38 },
      { id: 'cm2', position: 'CM', x: 72, y: 46 },
      { id: 'lw', position: 'LW', x: 18, y: 18 },
      { id: 'st', position: 'ST', x: 50, y: 14 },
      { id: 'rw', position: 'RW', x: 82, y: 18 },
    ]
  },
  {
    id: '4-4-2',
    name: '4-4-2 (Standard)',
    slots: [
      { id: 'gk', position: 'GK', x: 50, y: 88 },
      { id: 'lb', position: 'LB', x: 15, y: 68 },
      { id: 'cb1', position: 'CB', x: 38, y: 70 },
      { id: 'cb2', position: 'CB', x: 62, y: 70 },
      { id: 'rb', position: 'RB', x: 85, y: 68 },
      { id: 'lm', position: 'LM', x: 15, y: 42 },
      { id: 'cm1', position: 'CM', x: 38, y: 45 },
      { id: 'cm2', position: 'CM', x: 62, y: 45 },
      { id: 'rm', position: 'RM', x: 85, y: 42 },
      { id: 'st1', position: 'ST', x: 36, y: 16 },
      { id: 'st2', position: 'ST', x: 64, y: 16 },
    ]
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1 (Control)',
    slots: [
      { id: 'gk', position: 'GK', x: 50, y: 88 },
      { id: 'lb', position: 'LB', x: 15, y: 68 },
      { id: 'cb1', position: 'CB', x: 38, y: 70 },
      { id: 'cb2', position: 'CB', x: 62, y: 70 },
      { id: 'rb', position: 'RB', x: 85, y: 68 },
      { id: 'cdm1', position: 'CDM', x: 35, y: 52 },
      { id: 'cdm2', position: 'CDM', x: 65, y: 52 },
      { id: 'lam', position: 'CAM', x: 22, y: 32 },
      { id: 'cam', position: 'CAM', x: 50, y: 28 },
      { id: 'ram', position: 'CAM', x: 78, y: 32 },
      { id: 'st', position: 'ST', x: 50, y: 14 },
    ]
  },
  {
    id: '3-5-2',
    name: '3-5-2 (Total Attack)',
    slots: [
      { id: 'gk', position: 'GK', x: 50, y: 88 },
      { id: 'cb1', position: 'CB', x: 25, y: 70 },
      { id: 'cb2', position: 'CB', x: 50, y: 72 },
      { id: 'cb3', position: 'CB', x: 75, y: 70 },
      { id: 'cdm1', position: 'CDM', x: 38, y: 52 },
      { id: 'cdm2', position: 'CDM', x: 62, y: 52 },
      { id: 'lm', position: 'LM', x: 12, y: 38 },
      { id: 'cam', position: 'CAM', x: 50, y: 34 },
      { id: 'rm', position: 'RM', x: 88, y: 38 },
      { id: 'st1', position: 'ST', x: 35, y: 15 },
      { id: 'st2', position: 'ST', x: 65, y: 15 },
    ]
  }
];
