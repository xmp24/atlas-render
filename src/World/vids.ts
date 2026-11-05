// registro de vídeos y escenas propias
import type React from 'react';
import cold from './data/cold.json';
import ocean from './data/ocean.json';
export const VIDS: Record<string, any> = {cold, ocean};
export const CUSTOM: Record<string, Record<string, React.FC<any>>> = {};
