import React from 'react';
import {Composition} from 'remotion';
import {WarsShort} from './WarsShort';
import {ThumbSalary} from './ThumbSalary';
import {TOPICS} from './topics';
const IDS = ['wars', 'spend', 'battles', 'invaded', 'peace', 'bases', 'bunkers'];
export const RootSW: React.FC = () => (<>
  {IDS.map((id) => <Composition key={id} id={`SW-${id}`} component={WarsShort} durationInFrames={Math.round((TOPICS[id].dur ?? 6) * 30)} fps={30} width={1080} height={1920} defaultProps={{topic: id}} />)}
  {['A', 'B', 'C', 'AES', 'AES0'].map((v) => <Composition key={v} id={`TS-sal-${v}`} component={ThumbSalary} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{v}} />)}
</>);
