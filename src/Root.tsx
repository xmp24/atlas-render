import React from 'react';
import {Composition} from 'remotion';
import {War} from './War';
import {War2} from './War2';
import {War3, Thumb} from './War3';
import {War4} from './War4';
import {WarWorld, ThumbBR} from './War6';
import {WarCont} from './War7';
import {ShortCont, SCD} from './ShortsCont';
import {ShortGL, SGL, WarGLCut, CUTDUR} from './ShortsGL';
import {ThumbGL} from './ThumbsGL';
import {ThumbPack} from './ThumbsPack';
import {MiniWar, MINI_FRAMES, MiniThumb} from './MiniWar';
import {MiniWar2, MINI2_FRAMES, MiniThumb2} from './MiniWar2';
import {MiniWarG, MiniThumbG, MW_IDS, mwFrames} from './MiniWarG';
import {War9, W9_IDS, w9Frames} from './War9';
import {ShortW9, SW9} from './ShortsW9';
import {MiniWarF, MiniThumbF, MWF_IDS, mwfFrames} from './MiniWarF';
import {ThumbW9} from './ThumbsW9';
import {ThumbCont} from './ThumbsCont';
import {ThumbBR2} from './ThumbsBR2';
import {ThumbCont2} from './ThumbsCont2';
import {WarGL} from './War8';
import {ShortBR, SBR} from './ShortsBR';
import {War5, ThumbFinal, ThumbV, ShortV, SHORT_DEFS} from './War5';

export const Root: React.FC = () => (
  <>
    <Composition id="MiniGuerra" component={War} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="Guerra2m" component={War2} durationInFrames={3600} fps={30} width={1920} height={1080} />
    <Composition id="Guerra3" component={War3} durationInFrames={16200} fps={30} width={1920} height={1080} />
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Guerra4" component={War4} durationInFrames={5400} fps={30} width={1920} height={1080} />
    <Composition id="GuerraFinal" component={War5} durationInFrames={16200} fps={30} width={1920} height={1080} />
    <Composition id="ThumbFinal" component={ThumbFinal} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbA" component={ThumbV} defaultProps={{v: 'A'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbB" component={ThumbV} defaultProps={{v: 'B'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbC" component={ThumbV} defaultProps={{v: 'C'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbD" component={ThumbV} defaultProps={{v: 'D'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbE" component={ThumbV} defaultProps={{v: 'E'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    {SHORT_DEFS.map((d) => <Composition key={d.part} id={`Short${d.part}`} component={ShortV} defaultProps={{part: d.part}} durationInFrames={Math.round(d.map[d.map.length - 1][0] * 30)} fps={30} width={1080} height={1920} />)}
    <Composition id="BattleRoyale" component={WarWorld} durationInFrames={18000} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRA" component={ThumbBR} defaultProps={{v: 'A'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRB" component={ThumbBR} defaultProps={{v: 'B'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRC" component={ThumbBR} defaultProps={{v: 'C'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    {SBR.map((d) => <Composition key={`br${d.part}`} id={`ShortBR${d.part}`} component={ShortBR} defaultProps={{part: d.part}} durationInFrames={Math.round(d.map[d.map.length - 1][0] * 30)} fps={30} width={1080} height={1920} />)}
    <Composition id="ContWar" component={WarCont} durationInFrames={15960} fps={30} width={1920} height={1080} />
    {SCD.map((d) => <Composition key={`sc${d.part}`} id={`ShortCont${d.part}`} component={ShortCont} defaultProps={{part: d.part}} durationInFrames={Math.round(d.map[d.map.length - 1][0] * 30)} fps={30} width={1080} height={1920} />)}
    {SGL.map((d) => <Composition key={`sg${d.part}`} id={`ShortGL${d.part}`} component={ShortGL} defaultProps={{part: d.part}} durationInFrames={Math.round(d.map[d.map.length - 1][0] * 30)} fps={30} width={1080} height={1920} />)}
    {['ru','br','cont','gl'].map((v) => <Composition key={`tp${v}`} id={`ThumbPack-${v}`} component={ThumbPack} defaultProps={{v}} durationInFrames={1} fps={30} width={1080} height={1920} />)}
    {['1','2','3','4','5','6','7','8','9','10'].map((v) => <Composition key={`tg${v}`} id={`ThumbGL${v}`} component={ThumbGL} defaultProps={{v}} durationInFrames={1} fps={30} width={1920} height={1080} />)}
    <Composition id="ThumbContA" component={ThumbCont} defaultProps={{v: 'A'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContB" component={ThumbCont} defaultProps={{v: 'B'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContC" component={ThumbCont} defaultProps={{v: 'C'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContD" component={ThumbCont} defaultProps={{v: 'D'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContE" component={ThumbCont} defaultProps={{v: 'E'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRx1" component={ThumbBR2} defaultProps={{v: '1'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRx2" component={ThumbBR2} defaultProps={{v: '2'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRx3" component={ThumbBR2} defaultProps={{v: '3'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRx4" component={ThumbBR2} defaultProps={{v: '4'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRx5" component={ThumbBR2} defaultProps={{v: '5'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbBRx6" component={ThumbBR2} defaultProps={{v: '6'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContx1" component={ThumbCont2} defaultProps={{v: '1'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContx2" component={ThumbCont2} defaultProps={{v: '2'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContx3" component={ThumbCont2} defaultProps={{v: '3'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContx4" component={ThumbCont2} defaultProps={{v: '4'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContx5" component={ThumbCont2} defaultProps={{v: '5'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbContx6" component={ThumbCont2} defaultProps={{v: '6'}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="GreenlandWar" component={WarGL} durationInFrames={16260} fps={30} width={1920} height={1080} />
    {W9_IDS.map((id) => <Composition key={`w9${id}`} id={`War9-${id}`} component={War9} defaultProps={{id}} durationInFrames={w9Frames(id)} fps={30} width={1920} height={1080} />)}
    {MWF_IDS.map((id) => <Composition key={`mwf${id}`} id={`MWF-${id}`} component={MiniWarF} defaultProps={{id}} durationInFrames={mwfFrames(id)} fps={30} width={1080} height={1920} />)}
    {MWF_IDS.map((id) => <Composition key={`mwfn${id}`} id={`MWFN-${id}`} component={MiniWarF} defaultProps={{id, audio: false}} durationInFrames={mwfFrames(id)} fps={30} width={1080} height={1920} />)}
    {MWF_IDS.map((id) => <Composition key={`mwft${id}`} id={`MWFT-${id}`} component={MiniThumbF} defaultProps={{id}} durationInFrames={1} fps={30} width={1080} height={1920} />)}
    {SW9.map((s) => <Composition key={`sw9${s.id}${s.part}`} id={`SW9-${s.id}-${s.part}`} component={ShortW9} defaultProps={{id: s.id, part: s.part}} durationInFrames={s.frames} fps={30} width={1080} height={1920} />)}
    {["iran1","iran2","iran3","iran4","taiwan1","taiwan2","taiwan3","taiwan4"].map((v) => <Composition key={`tw9${v}`} id={`TW9-${v}`} component={ThumbW9} defaultProps={{v}} durationInFrames={1} fps={30} width={1920} height={1080} />)}
    <Composition id="MiniWar1" component={MiniWar} durationInFrames={MINI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MiniWar1NoAudio" component={MiniWar} defaultProps={{audio: false}} durationInFrames={MINI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MiniThumb1" component={MiniThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="MiniWar2" component={MiniWar2} durationInFrames={MINI2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MiniWar2NoAudio" component={MiniWar2} defaultProps={{audio: false}} durationInFrames={MINI2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MiniThumb2" component={MiniThumb2} durationInFrames={1} fps={30} width={1080} height={1920} />
    {MW_IDS.map((id) => <Composition key={`mw${id}`} id={`MW-${id}`} component={MiniWarG} defaultProps={{id}} durationInFrames={mwFrames(id)} fps={30} width={1080} height={1920} />)}
    {MW_IDS.map((id) => <Composition key={`mwn${id}`} id={`MWN-${id}`} component={MiniWarG} defaultProps={{id, audio: false}} durationInFrames={mwFrames(id)} fps={30} width={1080} height={1920} />)}
    {MW_IDS.map((id) => <Composition key={`mwt${id}`} id={`MWT-${id}`} component={MiniThumbG} defaultProps={{id}} durationInFrames={1} fps={30} width={1080} height={1920} />)}
    <Composition id="GreenlandCut" component={WarGLCut} durationInFrames={CUTDUR} fps={30} width={1920} height={1080} />
  </>
);
