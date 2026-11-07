import React from 'react';
import {Composition} from 'remotion';
import {HWTest} from './HWTest';
import {SameArmy, SA_FRAMES} from './SameArmy';
import {Indo, INDO_FRAMES} from './Indo';
import {Indo2, indoFrames} from './Indo2';
import {StatesBR, BRUS_FRAMES} from './StatesBR';
import {ThumbD5, D5_IDS} from './ThumbsD5';
import {ThumbD6, D6_IDS} from './ThumbsD6';
import {ThumbD7, D7_IDS} from './ThumbsD7';
import {ThumbD8, D8_IDS} from './ThumbsD8';
import {Cup, CUP_FRAMES} from './Cup';
import {IndoThumb, IndoShortOverlay} from './IndoExtras';
import {ThumbPro, THUMB_IDS} from './ThumbsPro';
import {ThumbMap, MAP_IDS} from './ThumbsMap';
import {ThumbMap2, MAP2_IDS} from './ThumbsMap2';
import {ThumbCB, CB_IDS} from './ThumbsCB';
import {ThumbCombo, COMBO_IDS} from './ThumbsCombo';
import {ThumbFinal, FINAL_IDS} from './ThumbsFinal';
import {ThumbMad, MAD_IDS} from './ThumbsMad';
import {ThumbD4, D4_IDS} from './ThumbsD4';
import {Maduro, MADURO_FRAMES} from './Maduro';
import {Maduro2, MADURO2_FRAMES} from './Maduro/index2';
import {Maduro3, MADURO3_FRAMES} from './Maduro/index3';
import {Civil, CIVIL_FRAMES} from './Civil';
import {Logo, LOGO_IDS} from './Logos';
import {Banner, BANNER_IDS} from './Banners';
import {ShortHW, SHW_IDS, shwFrames} from './ShortHW';
import {ThumbHW} from './ThumbHW';
export const RootHW: React.FC = () => (
  <>
    <Composition id="HWTest" component={HWTest} durationInFrames={1800} fps={30} width={1920} height={1080} />
    <Composition id="SameArmy" component={SameArmy} durationInFrames={SA_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="SameArmyN" component={SameArmy} durationInFrames={SA_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Indo" component={Indo} durationInFrames={INDO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="Maduro3N" component={Maduro3} durationInFrames={MADURO3_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Maduro2N" component={Maduro2} durationInFrames={MADURO2_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Maduro2" component={Maduro2} durationInFrames={MADURO2_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="Maduro" component={Maduro} durationInFrames={MADURO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="MaduroN" component={Maduro} durationInFrames={MADURO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    {D8_IDS.map((id) => <Composition key={id} id={`T8-${id}`} component={ThumbD8} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {D7_IDS.map((id) => <Composition key={id} id={`T7-${id}`} component={ThumbD7} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {D6_IDS.map((id) => <Composition key={id} id={`T6-${id}`} component={ThumbD6} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {D5_IDS.map((id) => <Composition key={id} id={`T5-${id}`} component={ThumbD5} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {D4_IDS.map((id) => <Composition key={id} id={`T4-${id}`} component={ThumbD4} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {MAD_IDS.map((id) => <Composition key={id} id={`TMD-${id}`} component={ThumbMad} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{id}} />)}
    {FINAL_IDS.map((id) => <Composition key={id} id={`TF-${id}`} component={ThumbFinal} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {COMBO_IDS.map((id) => <Composition key={id} id={`TX-${id}`} component={ThumbCombo} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {CB_IDS.map((id) => <Composition key={id} id={`TC-${id}`} component={ThumbCB} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {MAP2_IDS.map((id) => <Composition key={id} id={`TN-${id}`} component={ThumbMap2} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {MAP_IDS.map((id) => <Composition key={id} id={`TM-${id}`} component={ThumbMap} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {THUMB_IDS.map((id) => <Composition key={id} id={`TP-${id}`} component={ThumbPro} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    <Composition id="IdS1" component={Indo2} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, zf: 0.8, segs: [[446.8, 3.0], [452.6, 10.4], [470.5, 4.6]], hook: ["THE USA WAS WINNING", "UNTIL THIS..."], cta: ["HOW DID INDONESIA", "GET THIS FAR?"]}} />
    <Composition id="IdS2" component={Indo2} durationInFrames={597} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, zf: 0.8, segs: [[241.5, 3.0], [247.6, 7.0], [257.5, 3.5], [266.5, 3.6], [272.0, 2.8]], hook: ["INDONESIA WAS", "LOSING EUROPE..."], cta: ["EUROPE FELL.", "WHO IS NEXT?"]}} />
    <Composition id="IdS3" component={Indo2} durationInFrames={852} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, zf: 0.8, segs: [[70.9, 2.4], [106.4, 2.4], [139.3, 2.4], [166.7, 2.4], [217.3, 2.4], [268.0, 2.4], [324.8, 2.4], [377.1, 2.4], [402.6, 2.4], [417.8, 2.6], [421.6, 4.2]], hook: ["INDONESIA", "VS THE WORLD"], cta: ["ONLY THE USA", "IS LEFT..."]}} />
    <Composition id="IdS4" component={Indo2} durationInFrames={609} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, zf: 0.8, segs: [[345.8, 4.0], [352.5, 3.0], [357.8, 2.5], [363.5, 2.2], [369.3, 2.2], [374.0, 6.4]], hook: ["INDONESIA", "VS CHINA"], cta: ["NEXT: RUSSIA", "AND THE USA"]}} />
    <Composition id="CpS1" component={Cup} durationInFrames={666} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.8, segs: [[407.0, 11.6], [423.0, 5.0], [437.0, 5.6]], hook: ["CHINA ATTACKS", "WASHINGTON"], cta: ["WHO WINS", "THE WORLD WAR CUP?"]}} />
    <Composition id="CpS2" component={Cup} durationInFrames={480} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.8, segs: [[155.6, 10.0], [166.8, 6.0]], hook: ["JAPAN WAS", "WINNING..."], cta: ["128 COUNTRIES", "ONE TROPHY"]}} />
    <Composition id="CpS3" component={Cup} durationInFrames={408} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.8, segs: [[90.6, 3.0], [93.6, 5.6], [99.6, 5.0]], hook: ["THE UK PUSHED THEM", "INTO THE SEA..."], cta: ["WHO WINS", "THE WORLD WAR CUP?"]}} />
    <Composition id="CpS4" component={Cup} durationInFrames={480} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.8, segs: [[315.2, 4.4], [341.6, 3.8], [347.5, 3.2], [358.5, 4.6]], hook: ["MISSILES", "VS FIGHTER JETS"], cta: ["THE FINAL:", "USA VS CHINA"]}} />
    <Composition id="V-brus" component={StatesBR} durationInFrames={BRUS_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="V-breu" component={Indo2} durationInFrames={indoFrames('breu')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'breu'}} />
    <Composition id="V-braf" component={Indo2} durationInFrames={indoFrames('braf')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'braf'}} />
    <Composition id="V-bras" component={Indo2} durationInFrames={indoFrames('bras')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'bras'}} />
    <Composition id="V-cqru" component={Indo2} durationInFrames={indoFrames('cqru')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'cqru'}} />
    <Composition id="V-cqcn" component={Indo2} durationInFrames={indoFrames('cqcn')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'cqcn'}} />
    <Composition id="V-cqbr" component={Indo2} durationInFrames={indoFrames('cqbr')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'cqbr'}} />
    <Composition id="V-cqes" component={Indo2} durationInFrames={indoFrames('cqes')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'cqes'}} />
    <Composition id="V-taiwan" component={Indo2} durationInFrames={indoFrames('taiwan')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'taiwan'}} />
    <Composition id="V-rceu" component={Indo2} durationInFrames={indoFrames('rceu')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'rceu'}} />
    <Composition id="V-ukr" component={Indo2} durationInFrames={indoFrames('ukr')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'ukr'}} />
    <Composition id="V-usla" component={Indo2} durationInFrames={indoFrames('usla')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'usla'}} />
    <Composition id="V-ww3" component={Indo2} durationInFrames={indoFrames('ww3')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'ww3'}} />
    <Composition id="V-survive" component={Indo2} durationInFrames={indoFrames('survive')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'survive'}} />
    <Composition id="V-ww2" component={Indo2} durationInFrames={indoFrames('ww2')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'ww2'}} />
    <Composition id="V-grl" component={Indo2} durationInFrames={indoFrames('grl')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'grl'}} />
    <Composition id="LatamN" component={Indo2} durationInFrames={indoFrames('l')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'l'}} />
    <Composition id="HormuzN" component={Indo2} durationInFrames={indoFrames('h')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'h'}} />
    <Composition id="Usa" component={Indo2} durationInFrames={indoFrames('u')} fps={30} width={1920} height={1080} defaultProps={{audio: true, v: 'u'}} />
    <Composition id="UsaN" component={Indo2} durationInFrames={indoFrames('u')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'u'}} />
    <Composition id="Civil" component={Civil} durationInFrames={CIVIL_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="CivilN" component={Civil} durationInFrames={CIVIL_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="UsS1" component={Indo2} durationInFrames={474} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'u', W: 1080, H: 1920, zf: 0.8, segs: [[194.8, 3.4], [199.4, 3.6], [205.5, 6.0], [213.8, 2.8]], hook: ["AMERICA WAS", "INVADED..."], cta: ["THE USA VS", "THE WHOLE WORLD"]}} />
    <Composition id="UsS2" component={Indo2} durationInFrames={399} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'u', W: 1080, H: 1920, zf: 0.8, segs: [[134.4, 4.5], [140.4, 3.0], [145.5, 5.8]], hook: ["D-DAY", "IN 2026"], cta: ["THEN THE WHOLE", "WORLD STRIKES BACK"]}} />
    <Composition id="UsS3" component={Indo2} durationInFrames={546} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'u', W: 1080, H: 1920, zf: 0.8, segs: [[303.8, 4.0], [307.5, 2.6], [324.0, 2.6], [355.6, 9.0]], hook: ["CHINA & RUSSIA", "VS THE USA"], cta: ["HOW DID THE USA", "GET THIS FAR?"]}} />
    <Composition id="UsS4" component={Indo2} durationInFrames={762} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'u', W: 1080, H: 1920, zf: 0.8, segs: [[52.0, 2.2], [77.4, 2.2], [104.4, 2.2], [128.8, 2.2], [149.0, 2.2], [165.4, 2.2], [234.3, 2.2], [252.4, 2.2], [277.7, 2.2], [324.2, 2.2], [362.0, 3.4]], hook: ["THE USA", "VS THE WORLD"], cta: ["CAN ANYONE", "STOP THEM?"]}} />
    <Composition id="CvS1" component={Civil} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.62, segs: [[216.5, 5.0], [224.0, 13.0]], hook: ["WHO WINS A", "US CIVIL WAR?"], cta: ["WATCH HOW", "IT ALL STARTED"]}} />
    <Composition id="CvS2" component={Civil} durationInFrames={576} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.62, segs: [[9.6, 6.0], [16.8, 3.2], [26.0, 6.0], [37.0, 4.0]], hook: ["IF AMERICA", "SPLIT IN TWO..."], cta: ["RED VS BLUE", "WHO WOULD WIN?"]}} />
    <Composition id="CvS3" component={Civil} durationInFrames={390} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.62, segs: [[70.8, 4.0], [75.2, 4.0], [80.4, 5.0]], hook: ["TEXAS VS", "RED TANKS"], cta: ["THE WAR", "SPREADS..."]}} />
    <Composition id="CvS4" component={Civil} durationInFrames={588} fps={30} width={1080} height={1920} defaultProps={{audio: false, W: 1080, H: 1920, zf: 0.62, segs: [[104.6, 4.6], [109.0, 3.0], [123.8, 3.0], [139.0, 6.0], [167.0, 3.0]], hook: ["THE WORLD", "PICKS A SIDE"], cta: ["IT ONLY", "GETS WORSE..."]}} />
    {LOGO_IDS.map((id) => <Composition key={id} id={`LG-${id}`} component={Logo} durationInFrames={1} fps={30} width={1024} height={1024} defaultProps={{id}} />)}
    {BANNER_IDS.map((id) => <Composition key={id} id={`BN-${id}`} component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{id}} />)}
    <Composition id="IndoThumb1" component={IndoThumb} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{v: 1}} />
    <Composition id="IndoThumb2" component={IndoThumb} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{v: 2}} />
    <Composition id="IndoShortOv" component={IndoShortOverlay} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{part: 0}} />
    <Composition id="IndoA" component={Indo2} durationInFrames={indoFrames('a')} fps={30} width={1920} height={1080} defaultProps={{audio: true, v: 'a'}} />
    <Composition id="IndoAN" component={Indo2} durationInFrames={indoFrames('a')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'a'}} />
    <Composition id="IndoShort1" component={Indo2} durationInFrames={1326} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, off: 32.3, zf: 0.8, sdur: 44.2, hook: ["ONE COUNTRY", "VS THE WORLD"], cta: ["MALAYSIA WAS", "ONLY THE START..."]}} />
    <Composition id="IndoShort2" component={Indo2} durationInFrames={1620} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, off: 224.0, zf: 0.8, sdur: 54.0, hook: ["INDONESIA", "VS EUROPE"], cta: ["EUROPE HAS FALLEN.", "WHO IS NEXT?"]}} />
    <Composition id="IndoShort3" component={Indo2} durationInFrames={1365} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, off: 337.0, zf: 0.8, sdur: 45.5, hook: ["INDONESIA", "VS CHINA"], cta: ["ONLY RUSSIA & THE USA", "ARE LEFT..."]}} />
    <Composition id="IndoShort4" component={Indo2} durationInFrames={1314} fps={30} width={1080} height={1920} defaultProps={{audio: false, v: 'd', W: 1080, H: 1920, off: 404.5, zf: 0.8, sdur: 43.8, hook: ["THE FINAL", "BOSS"], cta: ["IT LOOKS LOST...", "HOW DID IT WIN?"]}} />
    <Composition id="Cup" component={Cup} durationInFrames={CUP_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="CupN" component={Cup} durationInFrames={CUP_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="IndoD" component={Indo2} durationInFrames={indoFrames('d')} fps={30} width={1920} height={1080} defaultProps={{audio: true, v: 'd'}} />
    <Composition id="IndoDN" component={Indo2} durationInFrames={indoFrames('d')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'd'}} />
    <Composition id="IndoC" component={Indo2} durationInFrames={indoFrames('c')} fps={30} width={1920} height={1080} defaultProps={{audio: true, v: 'c'}} />
    <Composition id="IndoCN" component={Indo2} durationInFrames={indoFrames('c')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'c'}} />
    <Composition id="IndoB" component={Indo2} durationInFrames={indoFrames('b')} fps={30} width={1920} height={1080} defaultProps={{audio: true, v: 'b'}} />
    <Composition id="IndoBN" component={Indo2} durationInFrames={indoFrames('b')} fps={30} width={1920} height={1080} defaultProps={{audio: false, v: 'b'}} />
    <Composition id="IndoN" component={Indo} durationInFrames={INDO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    {SHW_IDS.map((id) => <Composition key={id} id={`SHW-${id}`} component={ShortHW} durationInFrames={shwFrames(id)} fps={30} width={1080} height={1920} defaultProps={{id, audio: true}} />)}
    {SHW_IDS.map((id) => <Composition key={id} id={`SHWN-${id}`} component={ShortHW} durationInFrames={shwFrames(id)} fps={30} width={1080} height={1920} defaultProps={{id, audio: false}} />)}
    {[1, 2, 3].map((v) => <Composition key={v} id={`THW-${v}`} component={ThumbHW} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{v}} />)}
  </>
);
