// registro de vídeos y escenas propias
import type React from 'react';
import cold from './data/cold.json';
import ocean from './data/ocean.json';
import babies from './data/babies.json';
import heat from './data/heat.json'; import thirty from './data/thirty.json';
export const VIDS: Record<string, any> = {cold, ocean, babies, heat, thirty};
export const CUSTOM: Record<string, Record<string, React.FC<any>>> = {};
