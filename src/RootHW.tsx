import {Miya8, V8_FRAMES} from './Miya8/Video8';
import {Miya14, V14_FRAMES} from './Miya8/Video14';
import {Miya13, V13_FRAMES} from './Miya8/Video13';
import {Miya12, V12_FRAMES} from './Miya8/Video12';
import {Miya11, V11_FRAMES} from './Miya8/Video11';
import {Miya10, V10_FRAMES} from './Miya8/Video10';
import {Miya9, V9_FRAMES} from './Miya8/Video9';
import {Miya7, V7_FRAMES} from './Miya7/Video7';
import {Miya3D, Q3_FRAMES} from './Miya3/Video3';
import {MiyaQuiet, Q_FRAMES} from './Miya2/ShortQ';
import {MiyaPicto} from './Miya2/ShortP';
import {ThumbStyle, STYLES} from './ThumbsStyles';
import {ThumbA, ThumbB, ThumbC, W3_KEYS, ThumbFin13} from './ThumbsWorld3';
import {ThumbW2, CFG2} from './ThumbsWorld2';
import {Thumb4, V4_KEYS} from './ThumbsWorld4';
import {Thumb5, V5_KEYS} from './ThumbsWorld5';
import {Thumb6, V6_KEYS} from './ThumbsWorld6';
import React from 'react';
import {Composition} from 'remotion';
import {Miyazawa, MIYA_FRAMES} from './Miya/Video';
import {MiyaShort, SHORT_FRAMES} from './Miya2/Short';
import {HWTest} from './HWTest';
import {SameArmy, SA_FRAMES} from './SameArmy';
import {Indo, INDO_FRAMES} from './Indo';
import {Indo2, indoFrames} from './Indo2';
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
import {Burn, BURN_FRAMES, TAIL_OFF} from './Burn';
import {WorldVid, framesOf} from './World';
import {ThumbW, CFG as TWCFG} from './ThumbsWorld';
import {VIDS} from './World/vids';
import {ThumbBurn, BURN_THUMBS} from './ThumbsBurn';
import {ThumbBurn2, BURN_THUMBS2} from './ThumbsBurn2';
import {ThumbBurn3, ThumbZombie} from './ThumbsBurn3';
import {Civil, CIVIL_FRAMES} from './Civil';
import {Logo, LOGO_IDS} from './Logos';
import {Banner, BANNER_IDS} from './Banners';
import {ShortHW, SHW_IDS, shwFrames} from './ShortHW';
import {ThumbHW} from './ThumbHW';
export const RootHW: React.FC = () => (
  <>
    <Composition id="MiyaPictoN" component={MiyaPicto} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="MiyaQuietN" component={MiyaQuiet} durationInFrames={Q_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="Miya3DN" component={Miya3D} durationInFrames={Q3_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="Miya7N" component={Miya7} durationInFrames={V7_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="Miya14N" component={Miya14} durationInFrames={V14_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: true}} />
    <Composition id="Miya13N" component={Miya13} durationInFrames={V13_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: true}} />
    <Composition id="Miya13NS" component={Miya13} durationInFrames={V13_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: false}} />
    <Composition id="Miya12N" component={Miya12} durationInFrames={V12_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: true}} />
    <Composition id="Miya12NS" component={Miya12} durationInFrames={V12_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: false}} />
    <Composition id="Miya11N" component={Miya11} durationInFrames={V11_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: true}} />
    <Composition id="Miya11NS" component={Miya11} durationInFrames={V11_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false, subs: false}} />
    <Composition id="Miya10N" component={Miya10} durationInFrames={V10_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="Miya9N" component={Miya9} durationInFrames={V9_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="Miya8N" component={Miya8} durationInFrames={V8_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="MiyaShortN" component={MiyaShort} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="MiyaN" component={Miyazawa} durationInFrames={MIYA_FRAMES} fps={30} width={1080} height={1920} defaultProps={{audio: false}} />
    <Composition id="HWTest" component={HWTest} durationInFrames={1800} fps={30} width={1920} height={1080} />
    <Composition id="SameArmy" component={SameArmy} durationInFrames={SA_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="SameArmyN" component={SameArmy} durationInFrames={SA_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Indo" component={Indo} durationInFrames={INDO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    {Object.keys(TWCFG).map((k) => <Composition key={"tw" + k} id={`TW-${k}`} component={ThumbW as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} />)}
    {Object.keys(CFG2).map((k) => <Composition key={"tw2" + k} id={`TW2-${k}`} component={ThumbW2 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} />)}
    {W3_KEYS.map((k) => <React.Fragment key={"w3" + k}><Composition id={`TA-${k}`} component={ThumbA as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} /><Composition id={`TB-${k}`} component={ThumbB as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} /><Composition id={`TC-${k}`} component={ThumbC as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} /></React.Fragment>)}
    {Object.keys(STYLES).map((id) => <Composition key={"st" + id} id={`TS-${id}`} component={ThumbStyle as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {V6_KEYS.map((k) => <Composition key={"w6" + k} id={`W6-${k}`} component={Thumb6 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} />)}
    {V5_KEYS.map((k) => <Composition key={"w5" + k} id={`W5-${k}`} component={Thumb5 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} />)}
    {V4_KEYS.map((k) => <Composition key={"wx" + k} id={`WX-${k}`} component={Thumb4 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k, nt: false}} />)}
    {V4_KEYS.map((k) => <Composition key={"wxn" + k} id={`WXN-${k}`} component={Thumb4 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k, nt: true}} />)}
    {W3_KEYS.map((k) => <Composition key={"tfin" + k} id={`TFIN-${k}`} component={ThumbFin13 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{k}} />)}
    <Composition id="TZOMBIE" component={ThumbZombie} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="TBURN3" component={ThumbBurn3} durationInFrames={1} fps={30} width={1280} height={720} />
    {BURN_THUMBS2.map((id) => <Composition key={id} id={`TBURN2-${id}`} component={ThumbBurn2} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {BURN_THUMBS.map((id) => <Composition key={id} id={`TBURN-${id}`} component={ThumbBurn} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{id}} />)}
    {Object.keys(VIDS).map((v) => <Composition key={v} id={`W-${v}`} component={WorldVid} durationInFrames={framesOf(v)} fps={30} width={1920} height={1080} defaultProps={{v, audio: false}} />)}
    <Composition id="BurnTailN" component={Burn} durationInFrames={BURN_FRAMES - TAIL_OFF} fps={30} width={1920} height={1080} defaultProps={{audio: false, off: TAIL_OFF}} />
    <Composition id="BurnN" component={Burn} durationInFrames={BURN_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Maduro3N" component={Maduro3} durationInFrames={MADURO3_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Maduro2N" component={Maduro2} durationInFrames={MADURO2_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
    <Composition id="Maduro2" component={Maduro2} durationInFrames={MADURO2_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="Maduro" component={Maduro} durationInFrames={MADURO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: true}} />
    <Composition id="MaduroN" component={Maduro} durationInFrames={MADURO_FRAMES} fps={30} width={1920} height={1080} defaultProps={{audio: false}} />
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
