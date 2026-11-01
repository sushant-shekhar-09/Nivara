import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
  waitFor,
} from '@motion-canvas/core';
import {Circle, Img, Layout, Line, Node, Rect, Txt} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  // ─── AUTHENTIC NIVARA JAPANDI COLOR SYSTEM ─────────────────────────
  const IVORY = '#FBF9F4';          // Primary Canvas
  const CREAM = '#F5F1E9';          // Soft Surface
  const SURFACE_WHITE = '#FFFFFF';  // Crisp Elevated Card
  const SAND = '#ECE7DD';           // Subtle Sunken Layer
  const BEIGE = '#DAD4C8';          // Dividing Lines / Card Borders
  const EARTH = '#2F302B';          // Primary Text / Ink
  const MUTED_EARTH = '#6F6D63';    // Subtitles & Secondary Text
  const DEEP_SAGE = '#7C775F';      // Brand Hero Primary
  const SAGE_TINT = '#EAE8DE';      // Soft Sage Surface Accent
  const OLIVE = '#8C9678';          // Low Risk & Protective Attributions
  const MARIGOLD = '#E09F3E';       // Moderate Risk Indicator
  const TERRACOTTA = '#CE6F37';     // Elevated Risk / Attribution Bars
  const CRISIS_BG = '#FCEDE9';      // Emergency Gateway Surface
  const CRISIS_BORDER = '#E89E8F';  // Emergency Gateway Border
  const CRISIS_RED = '#C44B34';     // Emergency Gateway Highlight
  const DARK_OBSIDIAN = '#191815';   // Shot 1 & 2 Atmospheric Canvas

  // ─── MASTER NODES & CAMERA RIG ─────────────────────────────────────
  const stageBg = createRef<Rect>();
  const camera = createRef<Node>(); // Translates and scales the scene continuously

  // Background Ambient Botanical Orbs
  const ambientOrb1 = createRef<Circle>();
  const ambientOrb2 = createRef<Circle>();

  // ─── SHOT 1 & 2: THE HOOK & THE TENSION ────────────────────────────
  const shot1Group = createRef<Node>();
  const hookLine1 = createRef<Txt>();
  const hookLine2 = createRef<Txt>();

  const shot2Group = createRef<Node>();
  const cardFragment1 = createRef<Rect>(); // Deadline card
  const cardFragment2 = createRef<Rect>(); // Unfinished message
  const cardFragment3 = createRef<Rect>(); // Notification badge

  // ─── SHOT 3: THE SIGNATURE REVEAL ──────────────────────────────────
  const shot3Group = createRef<Node>();
  const convergenceRing = createRef<Circle>();
  const botanicalLogoShot3 = createRef<Img>();
  const revealWordmark = createRef<Txt>();

  // ─── SHOT 4: DUAL SCREENING ENTRY POINTS ───────────────────────────
  const shot4Group = createRef<Node>();
  const shot4Heading = createRef<Txt>();
  const voiceCard = createRef<Rect>();
  const manualCard = createRef<Rect>();
  const voicePulse = createRef<Circle>();

  // ─── SHOT 5: CLINICAL SCREENING IN ACTION ──────────────────────────
  const shot5Group = createRef<Node>();
  const questionnaireCard = createRef<Rect>();
  const qOpt1 = createRef<Rect>();
  const qOpt2 = createRef<Rect>();
  const qOpt3 = createRef<Rect>();
  const qOpt2Radio = createRef<Circle>();
  const qOpt2Dot = createRef<Circle>();
  const qOpt2Text = createRef<Txt>();
  const qCursor = createRef<Circle>();

  // ─── SHOT 6: TREESHAP EXPLAINABILITY & WATERFALL ───────────────────
  const shot6Group = createRef<Node>();
  const shapCardLeft = createRef<Rect>();
  const shapCardRight = createRef<Rect>();
  const shapBar1 = createRef<Rect>();
  const shapBar2 = createRef<Rect>();
  const shapBar3 = createRef<Rect>();
  const shapVal1 = createRef<Txt>();
  const shapVal2 = createRef<Txt>();
  const shapVal3 = createRef<Txt>();

  // ─── SHOT 7: INSTITUTIONAL GOVERNANCE & PRIVACY ────────────────────
  const shot7Group = createRef<Node>();
  const governanceCard = createRef<Rect>();
  const shieldIcon = createRef<Circle>();
  const suppressionPill = createRef<Rect>();

  // ─── SHOT 8: BRAND CLOSE & PRIMARY CALL TO ACTION ──────────────────
  const shot8Group = createRef<Node>();
  const finalLogo = createRef<Img>();
  const finalTitle = createRef<Txt>();
  const finalTagline = createRef<Txt>();
  const finalCta = createRef<Rect>();
  const finalArrow = createRef<Txt>();

  // ─── CONSTRUCT SCENE GRAPH ─────────────────────────────────────────
  view.add(
    <Rect
      ref={stageBg}
      width={'100%'}
      height={'100%'}
      fill={DARK_OBSIDIAN}
    >
      {/* Dynamic Ambient Background Aura */}
      <Circle
        ref={ambientOrb1}
        size={1100}
        fill={'rgba(178, 172, 145, 0.25)'}
        x={-420}
        y={-280}
        scale={0.7}
        opacity={0}
      />
      <Circle
        ref={ambientOrb2}
        size={950}
        fill={'rgba(236, 231, 221, 0.5)'}
        x={480}
        y={280}
        scale={0.7}
        opacity={0}
      />

      {/* Camera Rig (All shots live in camera coordinate space) */}
      <Node ref={camera}>

        {/* ════════════════════════════════════════════════════════════
            SHOT 1: THE HOOK (00:00 – 00:03)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot1Group} y={0}>
          <Txt
            ref={hookLine1}
            text={'Not every struggle'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={84}
            fontWeight={400}
            letterSpacing={-1.5}
            fill={'#F5F1E9'}
            y={-50}
            opacity={0}
          />
          <Txt
            ref={hookLine2}
            text={'is visible.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={84}
            fontStyle={'italic'}
            fontWeight={400}
            letterSpacing={-1.5}
            fill={'#C9C4AD'}
            y={45}
            opacity={0}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 2: THE TENSION (00:03 – 00:08)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot2Group} y={0} opacity={0}>
          {/* Fragment 1: Overdue Assignment Alert */}
          <Rect
            ref={cardFragment1}
            x={-340}
            y={-80}
            width={420}
            height={130}
            radius={20}
            fill={'#23211C'}
            stroke={'#3A362D'}
            lineWidth={1.5}
            rotation={-4}
            opacity={0}
            scale={0.8}
          >
            <Circle size={10} fill={'#E09F3E'} x={-170} y={-35} />
            <Txt
              text={'MIDTERM EXAM • 08:30 AM'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={'#A8A296'}
              x={-40}
              y={-35}
            />
            <Txt
              text={'Credit overload & CGPA requirements'}
              fontFamily={'DM Serif Display, serif'}
              fontSize={18}
              fill={'#F5F1E9'}
              x={-30}
              y={10}
            />
          </Rect>

          {/* Fragment 2: Unfinished Message */}
          <Rect
            ref={cardFragment2}
            x={220}
            y={40}
            width={480}
            height={140}
            radius={20}
            fill={'#23211C'}
            stroke={'#3A362D'}
            lineWidth={1.5}
            rotation={3}
            opacity={0}
            scale={0.8}
          >
            <Txt
              text={'UNSENT MESSAGE'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={10}
              fontWeight={700}
              letterSpacing={2}
              fill={'#C44B34'}
              x={-160}
              y={-40}
            />
            <Txt
              text={'"I don\'t think I can handle everything\nthis semester..."'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={16}
              fontStyle={'italic'}
              lineHeight={24}
              fill={'#EAE8DE'}
              x={-20}
              y={10}
            />
          </Rect>

          {/* Fragment 3: Notification Ping Badge */}
          <Rect
            ref={cardFragment3}
            x={-40}
            y={170}
            width={380}
            height={60}
            radius={30}
            fill={'rgba(206, 111, 55, 0.18)'}
            stroke={'#CE6F37'}
            lineWidth={1}
            opacity={0}
            scale={0.8}
          >
            <Txt
              text={'4 Unanswered Inquiries • Due Today'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={13}
              fontWeight={700}
              fill={'#FCE095'}
            />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 3: THE SIGNATURE REVEAL (00:08 – 00:12)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot3Group} y={650} opacity={0}>
          <Circle
            ref={convergenceRing}
            size={220}
            fill={null}
            stroke={DEEP_SAGE}
            lineWidth={2}
            scale={0.2}
            opacity={0}
          />
          <Img
            ref={botanicalLogoShot3}
            src={'/nivara-logo.svg'}
            width={180}
            y={-60}
            scale={0.7}
            opacity={0}
          />
          <Txt
            ref={revealWordmark}
            text={'Nivara AI'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={76}
            fontWeight={400}
            letterSpacing={-1.5}
            fill={EARTH}
            y={70}
            opacity={0}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 4: DUAL SCREENING ENTRY POINTS (00:12 – 00:19)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot4Group} y={1350} opacity={0}>
          <Txt
            ref={shot4Heading}
            text={'Speak, or answer at your own pace.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={48}
            fontWeight={400}
            fill={EARTH}
            y={-220}
            opacity={0}
          />

          {/* Pathway A: Conversational Voice AI Assistant */}
          <Rect
            ref={voiceCard}
            x={-240}
            y={10}
            width={420}
            height={360}
            radius={26}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            shadowColor={'rgba(47, 48, 43, 0.08)'}
            shadowBlur={35}
            shadowOffsetY={14}
            opacity={0}
            scale={0.88}
          >
            <Circle
              ref={voicePulse}
              size={64}
              fill={SAGE_TINT}
              stroke={DEEP_SAGE}
              lineWidth={1.5}
              y={-75}
            >
              <Txt text={'🎙️'} fontSize={24} y={-1} />
            </Circle>
            <Txt
              text={'CONVERSATIONAL PATHWAY'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={DEEP_SAGE}
              y={-15}
            />
            <Txt
              text={'Voice AI Assistant'}
              fontFamily={'DM Serif Display, serif'}
              fontSize={26}
              fill={EARTH}
              y={25}
            />
            <Txt
              text={'Speak naturally. Empathetic active listening\nwith real-time grounding support.'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              lineHeight={22}
              textAlign={'center'}
              fill={MUTED_EARTH}
              y={85}
            />
          </Rect>

          {/* Pathway B: Standardized Clinical Check-In */}
          <Rect
            ref={manualCard}
            x={240}
            y={10}
            width={420}
            height={360}
            radius={26}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            shadowColor={'rgba(47, 48, 43, 0.08)'}
            shadowBlur={35}
            shadowOffsetY={14}
            opacity={0}
            scale={0.88}
          >
            <Circle
              size={64}
              fill={SAGE_TINT}
              stroke={DEEP_SAGE}
              lineWidth={1.5}
              y={-75}
            >
              <Txt text={'📋'} fontSize={24} y={-1} />
            </Circle>
            <Txt
              text={'STRUCTURED PATHWAY'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={DEEP_SAGE}
              y={-15}
            />
            <Txt
              text={'Clinical Check-In'}
              fontFamily={'DM Serif Display, serif'}
              fontSize={26}
              fill={EARTH}
              y={25}
            />
            <Txt
              text={'Self-paced psychometric battery:\nPSS-10, PHQ-9, and GAD-7.'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              lineHeight={22}
              textAlign={'center'}
              fill={MUTED_EARTH}
              y={85}
            />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 5: CLINICAL SCREENING IN ACTION (00:19 – 00:27)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot5Group} y={2050} opacity={0}>
          <Rect
            ref={questionnaireCard}
            width={860}
            height={500}
            radius={28}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            shadowColor={'rgba(47, 48, 43, 0.08)'}
            shadowBlur={45}
            shadowOffsetY={18}
          >
            {/* Header / Step Tracker */}
            <Txt
              text={'QUESTION 3 OF 10 • PSS-10'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={MUTED_EARTH}
              x={-270}
              y={-185}
            />
            {/* Progress Bar Container */}
            <Rect x={260} y={-185} width={180} height={8} radius={4} fill={SAND}>
              <Rect x={-45} width={90} height={8} radius={4} fill={DEEP_SAGE} />
            </Rect>

            {/* Prompt */}
            <Txt
              text={'In the last month, how often have you felt nervous\nand stressed by academic demands?'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={28}
              fontWeight={400}
              lineHeight={40}
              fill={EARTH}
              x={-50}
              y={-95}
            />

            {/* Option 1 */}
            <Rect ref={qOpt1} x={0} y={0} width={740} height={54} radius={14} fill={CREAM} stroke={BEIGE} lineWidth={1}>
              <Circle size={18} stroke={BEIGE} lineWidth={2} fill={null} x={-325} />
              <Txt text={'1 • Sometimes (Manageable with breaks)'} fontFamily={'Manrope, sans-serif'} fontSize={15} fontWeight={500} fill={MUTED_EARTH} x={-120} />
            </Rect>

            {/* Option 2 (Target Selection) */}
            <Rect ref={qOpt2} x={0} y={68} width={740} height={54} radius={14} fill={CREAM} stroke={BEIGE} lineWidth={1}>
              <Circle ref={qOpt2Radio} size={18} stroke={BEIGE} lineWidth={2} fill={null} x={-325}>
                <Circle ref={qOpt2Dot} size={10} fill={DEEP_SAGE} opacity={0} scale={0} />
              </Circle>
              <Txt ref={qOpt2Text} text={'2 • Fairly Often (Affecting focus & sleep)'} fontFamily={'Manrope, sans-serif'} fontSize={15} fontWeight={500} fill={MUTED_EARTH} x={-115} />
            </Rect>

            {/* Option 3 */}
            <Rect ref={qOpt3} x={0} y={136} width={740} height={54} radius={14} fill={CREAM} stroke={BEIGE} lineWidth={1}>
              <Circle size={18} stroke={BEIGE} lineWidth={2} fill={null} x={-325} />
              <Txt text={'3 • Very Often (Continuous severe pressure)'} fontFamily={'Manrope, sans-serif'} fontSize={15} fontWeight={500} fill={MUTED_EARTH} x={-105} />
            </Rect>

            {/* Simulated Tactile Cursor */}
            <Circle
              ref={qCursor}
              size={22}
              fill={'rgba(124, 119, 95, 0.4)'}
              stroke={SURFACE_WHITE}
              lineWidth={2}
              x={220}
              y={180}
              opacity={0}
            />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 6: TREESHAP EXPLAINABILITY & WATERFALL (00:27 – 00:34)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot6Group} y={2750} opacity={0}>
          {/* Summary Card Left */}
          <Rect
            ref={shapCardLeft}
            x={-280}
            y={0}
            width={340}
            height={460}
            radius={24}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            shadowColor={'rgba(47, 48, 43, 0.06)'}
            shadowBlur={35}
            shadowOffsetY={14}
          >
            <Txt text={'CALIBRATED SCREENING'} fontFamily={'Manrope, sans-serif'} fontSize={11} fontWeight={700} letterSpacing={2} fill={MUTED_EARTH} y={-170} />
            <Txt text={'Estimated Distress'} fontFamily={'DM Serif Display, serif'} fontSize={24} fill={EARTH} y={-135} />

            <Rect y={-75} width={180} height={36} radius={18} fill={'rgba(224, 159, 62, 0.15)'} stroke={'rgba(224, 159, 62, 0.4)'} lineWidth={1}>
              <Txt text={'MODERATE RISK'} fontFamily={'Manrope, sans-serif'} fontSize={12} fontWeight={800} letterSpacing={1.5} fill={MARIGOLD} />
            </Rect>

            <Txt text={'0.518'} fontFamily={'Manrope, sans-serif'} fontSize={64} fontWeight={800} letterSpacing={-2} fill={EARTH} y={10} />

            <Txt text={'5-Fold GroupKFold\nROC-AUC: 0.8328 (GAD-7)\nROC-AUC: 0.8145 (PHQ-9)'} fontFamily={'JetBrains Mono, monospace'} fontSize={12} lineHeight={20} textAlign={'center'} fill={MUTED_EARTH} y={130} />
          </Rect>

          {/* TreeSHAP Waterfall Card Right */}
          <Rect
            ref={shapCardRight}
            x={180}
            y={0}
            width={560}
            height={460}
            radius={24}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            shadowColor={'rgba(47, 48, 43, 0.06)'}
            shadowBlur={35}
            shadowOffsetY={14}
          >
            <Txt text={'EXPLAINABLE AI • TREESHAP ATTRIBUTIONS'} fontFamily={'Manrope, sans-serif'} fontSize={11} fontWeight={700} letterSpacing={2} fill={MUTED_EARTH} x={-80} y={-170} />
            <Txt text={'Why Did the Model Estimate This?'} fontFamily={'DM Serif Display, serif'} fontSize={24} fill={EARTH} x={-85} y={-135} />

            <Line points={[[-230, -95], [230, -95]]} stroke={BEIGE} lineWidth={1} />

            {/* Feature 1: Academic Stress */}
            <Txt text={'Perceived Stress (PSS-10 Item 3)'} fontFamily={'Manrope, sans-serif'} fontSize={14} fontWeight={600} fill={EARTH} x={-90} y={-50} />
            <Rect ref={shapBar1} x={-50} y={-20} width={0} height={18} radius={9} fill={TERRACOTTA} />
            <Txt ref={shapVal1} text={'+0.182'} fontFamily={'JetBrains Mono, monospace'} fontSize={12} fontWeight={700} fill={TERRACOTTA} x={140} y={-20} opacity={0} />

            {/* Feature 2: Difficulties Piling Up */}
            <Txt text={'Difficulties Piling Up (PSS Item 10)'} fontFamily={'Manrope, sans-serif'} fontSize={14} fontWeight={600} fill={EARTH} x={-80} y={25} />
            <Rect ref={shapBar2} x={-75} y={55} width={0} height={18} radius={9} fill={MARIGOLD} />
            <Txt ref={shapVal2} text={'+0.141'} fontFamily={'JetBrains Mono, monospace'} fontSize={12} fontWeight={700} fill={MARIGOLD} x={100} y={55} opacity={0} />

            {/* Feature 3: Protective Resource */}
            <Txt text={'Protective Coping Resource (PSS Item 4)'} fontFamily={'Manrope, sans-serif'} fontSize={14} fontWeight={600} fill={EARTH} x={-60} y={100} />
            <Rect ref={shapBar3} x={-100} y={130} width={0} height={18} radius={9} fill={OLIVE} />
            <Txt ref={shapVal3} text={'-0.095'} fontFamily={'JetBrains Mono, monospace'} fontSize={12} fontWeight={700} fill={OLIVE} x={50} y={130} opacity={0} />

            <Txt text={'Transparent statistical attributions. Strictly non-causal.'} fontFamily={'Manrope, sans-serif'} fontSize={11} fontWeight={600} fill={MUTED_EARTH} y={185} />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 7: INSTITUTIONAL GOVERNANCE & PRIVACY (00:34 – 00:39)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot7Group} y={3450} opacity={0}>
          <Rect
            ref={governanceCard}
            width={860}
            height={460}
            radius={28}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            shadowColor={'rgba(47, 48, 43, 0.08)'}
            shadowBlur={40}
            shadowOffsetY={16}
          >
            <Circle
              ref={shieldIcon}
              size={64}
              fill={SAGE_TINT}
              stroke={DEEP_SAGE}
              lineWidth={1.5}
              y={-130}
            >
              <Txt text={'🔒'} fontSize={24} y={-1} />
            </Circle>

            <Txt
              text={'EPIDEMIOLOGICAL GOVERNANCE & PRIVACY GUARD'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={12}
              fontWeight={800}
              letterSpacing={3}
              fill={DEEP_SAGE}
              y={-75}
            />

            <Txt
              text={'Minimum-Group-Size Suppression (k ≥ 5)'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={34}
              fontWeight={400}
              fill={EARTH}
              y={-25}
            />

            <Txt
              text={'Campus cohort metrics suppress any institutional cluster under 5 students.\nZero individual deanonymization. Fully audited cryptographic immutability.'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={17}
              lineHeight={26}
              textAlign={'center'}
              fill={MUTED_EARTH}
              y={45}
            />

            <Rect
              ref={suppressionPill}
              y={130}
              width={420}
              height={48}
              radius={24}
              fill={CREAM}
              stroke={BEIGE}
              lineWidth={1}
            >
              <Txt
                text={'Cohort < 5  ➔  "< 5 (Suppressed)"'}
                fontFamily={'JetBrains Mono, monospace'}
                fontSize={15}
                fontWeight={700}
                fill={EARTH}
              />
            </Rect>
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 8: BRAND CLOSE & CALL TO ACTION (00:39 – 00:45)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot8Group} y={4150} opacity={0}>
          <Img
            ref={finalLogo}
            src={'/nivara-logo.svg'}
            width={160}
            y={-145}
            scale={0.7}
            opacity={0}
          />

          <Txt
            ref={finalTitle}
            text={'Nivara'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={84}
            fontWeight={400}
            letterSpacing={-1.5}
            fill={EARTH}
            y={-15}
            opacity={0}
          />

          <Txt
            ref={finalTagline}
            text={'A quieter first step toward student well-being.'}
            fontFamily={'Manrope, sans-serif'}
            fontSize={24}
            fontWeight={500}
            fill={MUTED_EARTH}
            y={58}
            opacity={0}
          />

          <Rect
            ref={finalCta}
            y={150}
            width={280}
            height={62}
            radius={31}
            fill={DEEP_SAGE}
            shadowColor={'rgba(124, 119, 95, 0.35)'}
            shadowBlur={28}
            shadowOffsetY={10}
            scale={0.8}
            opacity={0}
          >
            <Txt
              text={'Discover Nivara'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={18}
              fontWeight={700}
              fill={IVORY}
              x={-15}
            />
            <Txt
              ref={finalArrow}
              text={'→'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={22}
              fontWeight={700}
              fill={IVORY}
              x={75}
            />
          </Rect>
        </Node>

      </Node>
    </Rect>
  );

  // ════════════════════════════════════════════════════════════════════
  // 45.0-SECOND CINEMATIC MASTER CHOREOGRAPHY
  // ════════════════════════════════════════════════════════════════════

  // [00:00 – 00:03] SHOT 1: The Hook
  yield* all(
    hookLine1().opacity(1, 0.9),
    hookLine1().y(-50, 0.9, easeOutBack),
  );
  yield* all(
    hookLine2().opacity(1, 0.9),
    hookLine2().y(45, 0.9, easeOutBack),
  );
  yield* waitFor(1.5);

  // [00:03 – 00:08] SHOT 2: The Tension Build (Fragments appear)
  yield* all(
    hookLine1().opacity(0, 0.5),
    hookLine2().opacity(0, 0.5),
    shot2Group().opacity(1, 0.3),
  );
  yield* all(
    cardFragment1().opacity(1, 0.5),
    cardFragment1().scale(1.0, 0.5, easeOutBack),
  );
  yield* all(
    cardFragment2().opacity(1, 0.5),
    cardFragment2().scale(1.0, 0.5, easeOutBack),
  );
  yield* all(
    cardFragment3().opacity(1, 0.5),
    cardFragment3().scale(1.0, 0.5, easeOutBack),
  );
  yield* waitFor(1.8);

  // [00:08 – 00:12] SHOT 3: Signature Reveal (Darkness warms into Ivory Sanctuary)
  yield* all(
    cardFragment1().scale(0.3, 0.6, easeInOutCubic),
    cardFragment2().scale(0.3, 0.6, easeInOutCubic),
    cardFragment3().scale(0.3, 0.6, easeInOutCubic),
    cardFragment1().opacity(0, 0.5),
    cardFragment2().opacity(0, 0.5),
    cardFragment3().opacity(0, 0.5),
    camera().y(-650, 1.2, easeInOutCubic),
    stageBg().fill(IVORY, 1.2),
    ambientOrb1().opacity(1, 1.5),
    ambientOrb2().opacity(1, 1.5),
    shot3Group().opacity(1, 0.8),
    convergenceRing().opacity(1, 0.6),
    convergenceRing().scale(1.6, 0.8, easeOutExpo),
  );
  yield* all(
    botanicalLogoShot3().opacity(1, 0.6),
    botanicalLogoShot3().scale(1.0, 0.6, easeOutBack),
    revealWordmark().opacity(1, 0.6),
    revealWordmark().y(70, 0.6, easeOutExpo),
  );
  yield* waitFor(1.5);

  // [00:12 – 00:19] SHOT 4: Dual Screening Entry Points
  yield* all(
    shot3Group().opacity(0, 0.5),
    camera().y(-1350, 1.2, easeInOutCubic),
    shot4Group().opacity(1, 0.8),
    shot4Heading().opacity(1, 0.6),
  );
  yield* all(
    voiceCard().opacity(1, 0.7),
    voiceCard().scale(1.0, 0.7, easeOutBack),
    manualCard().opacity(1, 0.7),
    manualCard().scale(1.0, 0.7, easeOutBack),
    voicePulse().scale(1.15, 1.2, easeInOutCubic),
  );
  yield* waitFor(2.8);

  // [00:19 – 00:27] SHOT 5: Clinical Screening In Action
  yield* all(
    shot4Group().opacity(0, 0.5),
    camera().y(-2050, 1.2, easeInOutCubic),
    shot5Group().opacity(1, 0.9),
  );
  yield* all(
    qCursor().opacity(1, 0.5),
    qCursor().x(310, 1.3, easeInOutCubic),
    qCursor().y(70, 1.3, easeInOutCubic),
  );
  // Tactile Selection Feedback
  yield* all(
    qCursor().scale(0.8, 0.15),
    qOpt2().fill(SAGE_TINT, 0.2),
    qOpt2().stroke(DEEP_SAGE, 0.2),
    qOpt2Radio().stroke(DEEP_SAGE, 0.2),
    qOpt2Dot().opacity(1, 0.2),
    qOpt2Dot().scale(1.0, 0.2, easeOutBack),
    qOpt2Text().fill(EARTH, 0.2),
    qOpt2Text().fontWeight(700, 0.2),
  );
  yield* qCursor().scale(1.0, 0.2);
  yield* waitFor(3.0);

  // [00:27 – 00:34] SHOT 6: TreeSHAP Explainability & Waterfall
  yield* all(
    qCursor().opacity(0, 0.3),
    shot5Group().opacity(0, 0.5),
    camera().y(-2750, 1.2, easeInOutCubic),
    shot6Group().opacity(1, 0.9),
  );
  shapBar1().x(-50);
  shapBar2().x(-75);
  shapBar3().x(-100);
  yield* all(
    shapBar1().width(280, 0.8, easeOutExpo),
    shapVal1().opacity(1, 0.6),
    shapVal1().x(110, 0.8, easeOutExpo),
  );
  yield* all(
    shapBar2().width(230, 0.8, easeOutExpo),
    shapVal2().opacity(1, 0.6),
    shapVal2().x(60, 0.8, easeOutExpo),
  );
  yield* all(
    shapBar3().width(180, 0.8, easeOutExpo),
    shapVal3().opacity(1, 0.6),
    shapVal3().x(10, 0.8, easeOutExpo),
  );
  yield* waitFor(2.8);

  // [00:34 – 00:39] SHOT 7: Institutional Governance (Privacy Guard k >= 5)
  yield* all(
    shot6Group().opacity(0, 0.5),
    camera().y(-3450, 1.2, easeInOutCubic),
    shot7Group().opacity(1, 0.9),
  );
  yield* all(
    shieldIcon().scale(1.15, 0.8, easeOutBack),
    suppressionPill().scale(1.04, 0.8, easeInOutCubic),
  );
  yield* waitFor(2.5);

  // [00:39 – 00:45] SHOT 8: Brand Signature & Final CTA
  yield* all(
    shot7Group().opacity(0, 0.5),
    camera().y(-4150, 1.2, easeInOutCubic),
    shot8Group().opacity(1, 0.9),
    ambientOrb1().scale(1.5, 2.0, easeInOutCubic),
  );
  yield* all(
    finalLogo().opacity(1, 0.7),
    finalLogo().scale(1.0, 0.7, easeOutBack),
  );
  yield* all(
    finalTitle().opacity(1, 0.7),
    finalTitle().y(-15, 0.7, easeOutExpo),
  );
  yield* all(
    finalTagline().opacity(1, 0.6),
    finalTagline().y(58, 0.6, easeOutExpo),
  );
  yield* all(
    finalCta().opacity(1, 0.6),
    finalCta().scale(1.0, 0.6, easeOutBack),
    finalArrow().x(85, 0.8, easeInOutCubic),
  );
  yield* waitFor(3.0);
});
