import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  createSignal,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
  easeInCubic,
  waitFor,
  Vector2,
} from '@motion-canvas/core';
import {Circle, Img, Line, Node, Rect, Txt} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  // ─── AUTHENTIC NIVARA JAPANDI COLOR SYSTEM ─────────────────────────
  const OBSIDIAN = '#12110F';       // Atmospheric opening dark canvas
  const CARD_DARK = '#1C1B17';      // Elevated dark tension card
  const BORDER_DARK = '#333028';    // Border for dark cards
  const IVORY = '#FBF9F4';          // Brand primary sanctuary canvas
  const CREAM = '#F5F1E9';          // Soft surface tone
  const SURFACE_WHITE = '#FFFFFF';  // Crisp elevated product card
  const SAND = '#ECE7DD';           // Sunken subtle surface
  const BEIGE = '#DAD4C8';          // Card borders & dividers
  const EARTH = '#2F302B';          // Deep primary ink text
  const MUTED_EARTH = '#6F6D63';    // Subtitles & metadata
  const SAGE_PRIMARY = '#7C775F';   // Primary botanical sage
  const SAGE_TINT = '#EAE8DE';      // Sage surface tint
  const SAGE_GLOW = '#A9AB87';      // Glowing sage accent
  const GOLD_ACCENT = '#F6CA83';    // Golden accent ember
  const TERRACOTTA = '#CE6F37';     // Elevated risk / stress attribution
  const CRISIS_RED = '#C44B34';     // Emergency gateway highlight
  const SUCCESS_GREEN = '#4B7B5B';  // Protective factor & security badge

  // ─── STAGE NODES & CONTINUOUS CAMERA RIG ───────────────────────────
  const stageBg = createRef<Rect>();
  const lightExpansion = createRef<Circle>();
  const camera = createRef<Node>();

  // ─── SHOT 1 & 2: THE HOOK & THE TENSION (00:00 – 00:07) ────────────
  const hookGroup = createRef<Node>();
  const acousticEmber = createRef<Circle>();
  const hookLine1 = createRef<Txt>();
  const hookLine2 = createRef<Txt>();

  const shot2Group = createRef<Node>();
  const tensionCard1 = createRef<Rect>(); // Deadline stress
  const tensionCard2 = createRef<Rect>(); // Unsent draft
  const tensionCard3 = createRef<Rect>(); // Notification pressure

  // ─── SHOT 3: SOUNDWAVE & SIGNATURE REVEAL (00:07 – 00:11.5) ────────
  const waveGroup = createRef<Node>();
  const waveLine1 = createRef<Line>();
  const waveLine2 = createRef<Line>();
  const waveLine3 = createRef<Line>();
  const waveLine4 = createRef<Line>();

  const shot3Group = createRef<Node>();
  const convergenceRing = createRef<Circle>();
  const botanicalLogoShot3 = createRef<Img>();
  const revealWordmark = createRef<Txt>();
  const revealSubtitle = createRef<Txt>();

  // ─── SHOT 4 & 5: DUAL SCREENING & CLINICAL INTERACTION (00:11.5 – 00:25.5)
  const shot45Group = createRef<Node>();
  const sectionHeader4 = createRef<Txt>();
  const sectionSub4 = createRef<Txt>();

  // Mode Card A: Conversational Voice AI
  const voiceModeCard = createRef<Rect>();
  const voiceWaveform = createRef<Node>();
  const voiceWave1 = createRef<Line>();
  const voiceWave2 = createRef<Line>();
  const voiceWave3 = createRef<Line>();
  const voiceMicCircle = createRef<Circle>();
  const voiceStatusText = createRef<Txt>();

  // Mode Card B: Guided Manual Questionnaire
  const manualModeCard = createRef<Rect>();
  const pssProgressBar = createRef<Rect>();
  const pssQuestionText = createRef<Txt>();
  const qOption1 = createRef<Rect>();
  const qOption2 = createRef<Rect>();
  const qOption3 = createRef<Rect>();
  const qOpt3Radio = createRef<Circle>();
  const qOpt3Dot = createRef<Circle>();
  const qOpt3Text = createRef<Txt>();
  const hapticRing = createRef<Circle>();
  const studentCursor = createRef<Circle>();

  // ─── SHOT 6: TREESHAP EXPLAINABILITY WATERFALL (00:25.5 – 00:33.5) ──
  const shot6Group = createRef<Node>();
  const shapHeader = createRef<Txt>();
  const shapSub = createRef<Txt>();
  const shapDashboard = createRef<Rect>();
  const shapSummaryCard = createRef<Rect>();
  const rocAucBadge = createRef<Rect>();

  // SHAP Waterfall Bars
  const shapBar1 = createRef<Rect>();
  const shapBar2 = createRef<Rect>();
  const shapBar3 = createRef<Rect>();
  const shapVal1 = createRef<Txt>();
  const shapVal2 = createRef<Txt>();
  const shapVal3 = createRef<Txt>();

  // ─── SHOT 7: INSTITUTIONAL GOVERNANCE & PRIVACY (00:33.5 – 00:39.5) ─
  const shot7Group = createRef<Node>();
  const govHeader = createRef<Txt>();
  const govCard = createRef<Rect>();
  const shieldIcon = createRef<Circle>();
  const suppressionShield = createRef<Rect>();
  const cohortBar1 = createRef<Rect>();
  const cohortBar2 = createRef<Rect>();
  const cohortBar3 = createRef<Rect>();
  const redactedBadge = createRef<Rect>();

  // ─── SHOT 8: BRAND SIGNATURE CLOSE (00:39.5 – 00:45.0) ─────────────
  const shot8Group = createRef<Node>();
  const finalLogo = createRef<Img>();
  const finalTitle = createRef<Txt>();
  const finalTagline = createRef<Txt>();
  const ctaButton = createRef<Rect>();
  const ctaText = createRef<Txt>();
  const ctaArrow = createRef<Txt>();

  // ─── SCENE GRAPH INITIALIZATION ────────────────────────────────────
  view.add(
    <Rect
      ref={stageBg}
      width={'100%'}
      height={'100%'}
      fill={OBSIDIAN}
    >
      {/* Light expansion circle that converts obsidian to warm ivory */}
      <Circle
        ref={lightExpansion}
        size={0}
        fill={IVORY}
        x={0}
        y={0}
        opacity={0}
      />

      {/* Main Continuous Motion Rig */}
      <Node ref={camera}>

        {/* ════════════════════════════════════════════════════════════
            SHOT 1: THE HOOK (00:00 – 00:03)
            "Some things are hard to put into words."
            ════════════════════════════════════════════════════════════ */}
        <Node ref={hookGroup} y={0}>
          <Circle
            ref={acousticEmber}
            size={12}
            fill={GOLD_ACCENT}
            y={-85}
            scale={0}
            opacity={0}
          />
          <Txt
            ref={hookLine1}
            text={'Some things are'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={78}
            fontWeight={400}
            letterSpacing={-1}
            fill={CREAM}
            y={-10}
            opacity={0}
          />
          <Txt
            ref={hookLine2}
            text={'hard to put into words.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontStyle={'italic'}
            fontSize={78}
            fontWeight={400}
            letterSpacing={-1}
            fill={'#D0CABA'}
            y={78}
            opacity={0}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 2: THE TENSION (00:03 – 00:07)
            Academic fragments appear with deliberate rhythm & depth
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot2Group} y={0}>
          {/* Fragment 1: Midterm deadline */}
          <Rect
            ref={tensionCard1}
            x={-360}
            y={-85}
            width={450}
            height={136}
            radius={18}
            fill={CARD_DARK}
            stroke={BORDER_DARK}
            lineWidth={1.5}
            rotation={-3.5}
            opacity={0}
            scale={0.75}
          >
            <Circle size={10} fill={TERRACOTTA} x={-190} y={-38} />
            <Txt
              text={'MIDTERM EVALUATION • TOMORROW 08:30'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={'#A8A296'}
              x={-30}
              y={-38}
            />
            <Txt
              text={'Credit overload & GPA threshold alert'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={21}
              fill={CREAM}
              x={-30}
              y={10}
            />
          </Rect>

          {/* Fragment 2: Unsent draft */}
          <Rect
            ref={tensionCard2}
            x={300}
            y={35}
            width={490}
            height={144}
            radius={20}
            fill={CARD_DARK}
            stroke={BORDER_DARK}
            lineWidth={1.5}
            rotation={2.8}
            opacity={0}
            scale={0.75}
          >
            <Txt
              text={'UNSENT DRAFT'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2.2}
              fill={CRISIS_RED}
              x={-170}
              y={-40}
            />
            <Txt
              text={'“I don’t know who to talk to without\ncausing unnecessary panic…”'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={17}
              fontStyle={'italic'}
              lineHeight={26}
              fill={'#E8E4D8'}
              x={-20}
              y={12}
            />
          </Rect>

          {/* Fragment 3: Notification overload */}
          <Rect
            ref={tensionCard3}
            x={-50}
            y={180}
            width={440}
            height={64}
            radius={32}
            fill={'rgba(206, 111, 55, 0.16)'}
            stroke={TERRACOTTA}
            lineWidth={1.2}
            rotation={-0.8}
            opacity={0}
            scale={0.75}
          >
            <Circle size={8} fill={GOLD_ACCENT} x={-180} y={0} />
            <Txt
              text={'3 Unread Academic Advisor Notices • Due Today'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={13}
              fontWeight={700}
              letterSpacing={0.5}
              fill={'#FCE095'}
              x={10}
              y={0}
            />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 3A: THE SOUNDWAVE (00:07 – 00:08.8)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={waveGroup} opacity={0}>
          <Line
            ref={waveLine1}
            points={[[-200, 0], [-100, -25], [0, 25], [100, -25], [200, 0]]}
            stroke={SAGE_GLOW}
            lineWidth={3}
            lineCap={'round'}
          />
          <Line
            ref={waveLine2}
            points={[[-160, 0], [-80, 45], [0, -45], [80, 45], [160, 0]]}
            stroke={GOLD_ACCENT}
            lineWidth={2.5}
            lineCap={'round'}
          />
          <Line
            ref={waveLine3}
            points={[[-240, 0], [-120, -55], [0, 55], [120, -55], [240, 0]]}
            stroke={'rgba(236, 231, 221, 0.6)'}
            lineWidth={2}
            lineCap={'round'}
          />
          <Line
            ref={waveLine4}
            points={[[-120, 0], [-60, 20], [0, -20], [60, 20], [120, 0]]}
            stroke={SAGE_PRIMARY}
            lineWidth={2.5}
            lineCap={'round'}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 3B: THE SIGNATURE REVEAL (00:08.8 – 00:11.5)
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot3Group} opacity={0}>
          <Circle
            ref={convergenceRing}
            size={240}
            fill={null}
            stroke={SAGE_PRIMARY}
            lineWidth={1.5}
            scale={0.3}
            opacity={0}
          />
          <Img
            ref={botanicalLogoShot3}
            src={'/nivara-logo.svg'}
            width={180}
            y={-65}
            scale={0.5}
            opacity={0}
          />
          <Txt
            ref={revealWordmark}
            text={'Nivara'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={74}
            fontWeight={400}
            letterSpacing={-1}
            fill={EARTH}
            y={65}
            opacity={0}
          />
          <Txt
            ref={revealSubtitle}
            text={'STUDENT WELL-BEING SANCTUARY'}
            fontFamily={'Manrope, sans-serif'}
            fontSize={12}
            fontWeight={700}
            letterSpacing={3.5}
            fill={SAGE_PRIMARY}
            y={120}
            opacity={0}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 4 & 5: DUAL MODES & CLINICAL INTERACTION (00:11.5 – 00:25.5)
            y coordinate base: 1100
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot45Group} y={1100} opacity={0}>
          <Txt
            ref={sectionHeader4}
            text={'Two ways to begin. Always in control.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={44}
            fontWeight={400}
            letterSpacing={-0.8}
            fill={EARTH}
            y={-280}
            opacity={0}
          />
          <Txt
            ref={sectionSub4}
            text={'Express yourself out loud, or complete a structured clinical questionnaire.'}
            fontFamily={'Manrope, sans-serif'}
            fontSize={16}
            fontWeight={500}
            fill={MUTED_EARTH}
            y={-230}
            opacity={0}
          />

          {/* Mode Card 1: Conversational Voice AI (Left) */}
          <Rect
            ref={voiceModeCard}
            x={-340}
            y={30}
            width={480}
            height={420}
            radius={24}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            opacity={0}
          >
            {/* Top pill badge */}
            <Rect
              x={-150}
              y={-165}
              width={120}
              height={32}
              radius={16}
              fill={SAGE_TINT}
            >
              <Txt
                text={'VOICE AI'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={11}
                fontWeight={700}
                letterSpacing={1.5}
                fill={SAGE_PRIMARY}
              />
            </Rect>

            <Txt
              text={'Conversational Check-in'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={24}
              fill={EARTH}
              x={-70}
              y={-115}
            />
            <Txt
              text={'Speak freely in a confidential conversational space.'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              lineHeight={20}
              fill={MUTED_EARTH}
              x={-35}
              y={-80}
            />

            {/* Pulsating Voice Waveform Visualization */}
            <Node ref={voiceWaveform} y={10}>
              <Line
                ref={voiceWave1}
                points={[[-140, 0], [-70, -30], [0, 30], [70, -30], [140, 0]]}
                stroke={SAGE_PRIMARY}
                lineWidth={3}
                lineCap={'round'}
              />
              <Line
                ref={voiceWave2}
                points={[[-110, 0], [-55, 25], [0, -25], [55, 25], [110, 0]]}
                stroke={GOLD_ACCENT}
                lineWidth={2.5}
                lineCap={'round'}
              />
              <Line
                ref={voiceWave3}
                points={[[-80, 0], [-40, -15], [0, 15], [40, -15], [80, 0]]}
                stroke={SAGE_GLOW}
                lineWidth={2}
                lineCap={'round'}
              />
            </Node>

            {/* Mic button indicator */}
            <Circle
              ref={voiceMicCircle}
              size={56}
              fill={CREAM}
              stroke={BEIGE}
              lineWidth={1.5}
              y={125}
            >
              <Circle size={14} fill={SAGE_PRIMARY} />
            </Circle>
            <Txt
              ref={voiceStatusText}
              text={'Listening with compassionate presence...'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={12}
              fontWeight={600}
              fontStyle={'italic'}
              fill={SAGE_PRIMARY}
              y={172}
            />
          </Rect>

          {/* Mode Card 2: Guided Manual Questionnaire (Right) */}
          <Rect
            ref={manualModeCard}
            x={340}
            y={30}
            width={580}
            height={420}
            radius={24}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            opacity={0}
          >
            {/* Header: PSS-10 Standard */}
            <Txt
              text={'PSS-10 CLINICAL SCREENING'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={SAGE_PRIMARY}
              x={-170}
              y={-170}
            />
            <Txt
              text={'Item 3 of 10'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={12}
              fontWeight={600}
              fill={MUTED_EARTH}
              x={210}
              y={-170}
            />

            {/* Progress track */}
            <Rect
              x={0}
              y={-145}
              width={500}
              height={6}
              radius={3}
              fill={SAND}
            >
              <Rect
                ref={pssProgressBar}
                x={-175}
                width={150}
                height={6}
                radius={3}
                fill={SAGE_PRIMARY}
              />
            </Rect>

            {/* Question body */}
            <Txt
              ref={pssQuestionText}
              text={'“In the last month, how often have you felt difficulties\nwere piling up so high that you could not overcome them?”'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={18}
              lineHeight={26}
              fill={EARTH}
              x={0}
              y={-85}
            />

            {/* Option 1: Sometimes */}
            <Rect
              ref={qOption1}
              y={-15}
              width={500}
              height={48}
              radius={12}
              fill={CREAM}
              stroke={BEIGE}
              lineWidth={1}
            >
              <Circle size={16} fill={null} stroke={BEIGE} lineWidth={1.5} x={-220} />
              <Txt
                text={'Sometimes'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={14}
                fontWeight={500}
                fill={EARTH}
                x={-140}
              />
            </Rect>

            {/* Option 2: Fairly often (Selected during interaction!) */}
            <Rect
              ref={qOption2}
              y={45}
              width={500}
              height={48}
              radius={12}
              fill={CREAM}
              stroke={BEIGE}
              lineWidth={1}
            >
              <Circle size={16} fill={null} stroke={BEIGE} lineWidth={1.5} x={-220} />
              <Txt
                text={'Fairly often'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={14}
                fontWeight={500}
                fill={EARTH}
                x={-145}
              />
            </Rect>

            {/* Option 3: Very often */}
            <Rect
              ref={qOption3}
              y={105}
              width={500}
              height={48}
              radius={12}
              fill={CREAM}
              stroke={BEIGE}
              lineWidth={1}
            >
              <Circle ref={qOpt3Radio} size={16} fill={null} stroke={BEIGE} lineWidth={1.5} x={-220}>
                <Circle ref={qOpt3Dot} size={8} fill={SAGE_PRIMARY} scale={0} />
              </Circle>
              <Txt
                ref={qOpt3Text}
                text={'Very often'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={14}
                fontWeight={500}
                fill={EARTH}
                x={-150}
              />
            </Rect>

            {/* Interactive Student Cursor & Haptic Ripple */}
            <Circle
              ref={studentCursor}
              size={18}
              fill={'rgba(47, 48, 43, 0.85)'}
              x={220}
              y={160}
              opacity={0}
            />
            <Circle
              ref={hapticRing}
              size={0}
              fill={null}
              stroke={SAGE_PRIMARY}
              lineWidth={2}
              x={-220}
              y={45}
              opacity={0}
            />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 6: TREESHAP EXPLAINABILITY WATERFALL (00:25.5 – 00:33.5)
            y coordinate base: 2200
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot6Group} y={2200} opacity={0}>
          <Txt
            ref={shapHeader}
            text={'Explainable Support. Honest Clarity.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={44}
            fontWeight={400}
            letterSpacing={-0.8}
            fill={EARTH}
            y={-280}
            opacity={0}
          />
          <Txt
            ref={shapSub}
            text={'TreeSHAP feature attributions show what shaped the screening result. Non-causal & transparent.'}
            fontFamily={'Manrope, sans-serif'}
            fontSize={16}
            fontWeight={500}
            fill={MUTED_EARTH}
            y={-230}
            opacity={0}
          />

          {/* Main Dashboard Card */}
          <Rect
            ref={shapDashboard}
            width={1060}
            height={420}
            radius={24}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            y={30}
          >
            {/* Top Bar: Classification & Model Performance */}
            <Rect
              x={-340}
              y={-160}
              width={260}
              height={40}
              radius={20}
              fill={'rgba(224, 159, 62, 0.15)'}
              stroke={'#E09F3E'}
              lineWidth={1}
            >
              <Circle size={8} fill={'#E09F3E'} x={-105} />
              <Txt
                text={'Moderate Support Level'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={12}
                fontWeight={700}
                letterSpacing={0.5}
                fill={'#B87820'}
                x={12}
              />
            </Rect>

            {/* ROC-AUC Badge */}
            <Rect
              ref={rocAucBadge}
              x={350}
              y={-160}
              width={240}
              height={40}
              radius={20}
              fill={SAGE_TINT}
            >
              <Txt
                text={'ROC-AUC: 0.8328 • 10-Fold CV'}
                fontFamily={'JetBrains Mono, monospace'}
                fontSize={11}
                fontWeight={600}
                fill={SAGE_PRIMARY}
              />
            </Rect>

            {/* TreeSHAP Feature Attribution Bars */}
            {/* Factor 1: Sleep Disruption */}
            <Txt
              text={'Sleep Disruption & Fatigue'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              fontWeight={600}
              fill={EARTH}
              x={-340}
              y={-80}
            />
            <Rect
              x={-50}
              y={-80}
              width={340}
              height={14}
              radius={7}
              fill={SAND}
            >
              <Rect
                ref={shapBar1}
                x={-170}
                width={0}
                height={14}
                radius={7}
                fill={TERRACOTTA}
              />
            </Rect>
            <Txt
              ref={shapVal1}
              text={'+0.34 SHAP'}
              fontFamily={'JetBrains Mono, monospace'}
              fontSize={13}
              fontWeight={700}
              fill={TERRACOTTA}
              x={220}
              y={-80}
              opacity={0}
            />

            {/* Factor 2: Academic Overload */}
            <Txt
              text={'Academic Pressure & Deadlines'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              fontWeight={600}
              fill={EARTH}
              x={-335}
              y={-20}
            />
            <Rect
              x={-50}
              y={-20}
              width={340}
              height={14}
              radius={7}
              fill={SAND}
            >
              <Rect
                ref={shapBar2}
                x={-170}
                width={0}
                height={14}
                radius={7}
                fill={TERRACOTTA}
              />
            </Rect>
            <Txt
              ref={shapVal2}
              text={'+0.28 SHAP'}
              fontFamily={'JetBrains Mono, monospace'}
              fontSize={13}
              fontWeight={700}
              fill={TERRACOTTA}
              x={220}
              y={-20}
              opacity={0}
            />

            {/* Factor 3: Social Support (Protective Factor) */}
            <Txt
              text={'Social Support & Peer Network'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              fontWeight={600}
              fill={EARTH}
              x={-330}
              y={40}
            />
            <Rect
              x={-50}
              y={40}
              width={340}
              height={14}
              radius={7}
              fill={SAND}
            >
              <Rect
                ref={shapBar3}
                x={-170}
                width={0}
                height={14}
                radius={7}
                fill={SUCCESS_GREEN}
              />
            </Rect>
            <Txt
              ref={shapVal3}
              text={'-0.18 (Protective)'}
              fontFamily={'JetBrains Mono, monospace'}
              fontSize={13}
              fontWeight={700}
              fill={SUCCESS_GREEN}
              x={250}
              y={40}
              opacity={0}
            />

            {/* Non-causal scientific disclaimer */}
            <Rect
              y={140}
              width={960}
              height={50}
              radius={12}
              fill={CREAM}
            >
              <Txt
                text={'DISCLAIMER: Feature attributions indicate model weighting, not medical causality. Early educational screening only.'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={11}
                fontWeight={600}
                letterSpacing={0.5}
                fill={MUTED_EARTH}
              />
            </Rect>
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 7: INSTITUTIONAL GOVERNANCE & PRIVACY (00:33.5 – 00:39.5)
            y coordinate base: 3300
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot7Group} y={3300} opacity={0}>
          <Txt
            ref={govHeader}
            text={'Safe by Design. Privacy Guaranteed.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={44}
            fontWeight={400}
            letterSpacing={-0.8}
            fill={EARTH}
            y={-280}
            opacity={0}
          />

          <Rect
            ref={govCard}
            width={980}
            height={420}
            radius={24}
            fill={SURFACE_WHITE}
            stroke={BEIGE}
            lineWidth={1.5}
            y={30}
          >
            {/* Privacy Shield Badge */}
            <Circle
              ref={shieldIcon}
              size={64}
              fill={SAGE_TINT}
              x={-380}
              y={-130}
            >
              <Circle size={16} fill={SAGE_PRIMARY} />
            </Circle>
            <Txt
              text={'Differential Privacy & Minimum Group Suppression'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={24}
              fill={EARTH}
              x={-50}
              y={-140}
            />
            <Txt
              text={'Cohorts with fewer than 5 students are automatically masked to prevent re-identification.'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={14}
              fill={MUTED_EARTH}
              x={80}
              y={-110}
            />

            {/* Minimum-Group Threshold Rule Box */}
            <Rect
              ref={suppressionShield}
              x={0}
              y={10}
              width={860}
              height={110}
              radius={16}
              fill={CREAM}
              stroke={BEIGE}
              lineWidth={1}
            >
              {/* Cohort A (Normal, n=42) */}
              <Txt
                text={'Computer Science • Year 2 (n=42)'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={13}
                fontWeight={600}
                fill={EARTH}
                x={-240}
                y={-25}
              />
              <Rect x={100} y={-25} width={260} height={12} radius={6} fill={SAGE_PRIMARY} />

              {/* Cohort B (Suppressed, n=3 < 5) */}
              <Txt
                text={'Robotics Lab Minor (n=3)'}
                fontFamily={'Manrope, sans-serif'}
                fontSize={13}
                fontWeight={600}
                fill={CRISIS_RED}
                x={-275}
                y={25}
              />
              <Rect
                ref={redactedBadge}
                x={100}
                y={25}
                width={260}
                height={26}
                radius={13}
                fill={'rgba(196, 75, 52, 0.12)'}
                stroke={CRISIS_RED}
                lineWidth={1}
              >
                <Txt
                  text={'[SUPPRESSED: k < 5 PRIVACY THRESHOLD]'}
                  fontFamily={'JetBrains Mono, monospace'}
                  fontSize={11}
                  fontWeight={700}
                  fill={CRISIS_RED}
                />
              </Rect>
            </Rect>

            {/* Zero-transcript guarantee footer */}
            <Txt
              text={'✓ Zero administrative access to student transcripts • Immediate 988 Crisis Bypass active'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={13}
              fontWeight={700}
              letterSpacing={0.5}
              fill={SUCCESS_GREEN}
              y={140}
            />
          </Rect>
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 8: BRAND SIGNATURE CLOSE (00:39.5 – 00:45.0)
            y coordinate base: 4400
            ════════════════════════════════════════════════════════════ */}
        <Node ref={shot8Group} y={4400} opacity={0}>
          <Img
            ref={finalLogo}
            src={'/nivara-logo.svg'}
            width={200}
            y={-120}
            scale={0.8}
            opacity={0}
          />
          <Txt
            ref={finalTitle}
            text={'Nivara'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={78}
            fontWeight={400}
            letterSpacing={-1.5}
            fill={EARTH}
            y={20}
            opacity={0}
          />
          <Txt
            ref={finalTagline}
            text={'A quieter first step toward student well-being.'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontStyle={'italic'}
            fontSize={28}
            fontWeight={400}
            fill={MUTED_EARTH}
            y={80}
            opacity={0}
          />

          {/* Primary Action Button */}
          <Rect
            ref={ctaButton}
            y={165}
            width={280}
            height={60}
            radius={30}
            fill={EARTH}
            opacity={0}
            scale={0.85}
          >
            <Txt
              ref={ctaText}
              text={'Discover Nivara'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={16}
              fontWeight={700}
              letterSpacing={1}
              fill={IVORY}
              x={-15}
            />
            <Txt
              ref={ctaArrow}
              text={'→'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={18}
              fontWeight={700}
              fill={GOLD_ACCENT}
              x={80}
            />
          </Rect>
        </Node>

      </Node>
    </Rect>
  );

  // ════════════════════════════════════════════════════════════════════
  // MASTER TIMELINE CHOREOGRAPHY (45.00s = 2700 FRAMES @ 60 FPS)
  // ════════════════════════════════════════════════════════════════════

  // ─── SHOT 1: THE HOOK (00:00 – 00:03.2) ────────────────────────────
  yield* all(
    acousticEmber().scale(1.2, 0.6, easeOutBack),
    acousticEmber().opacity(1, 0.4),
    chain(
      waitFor(0.3),
      all(
        hookLine1().opacity(1, 0.9, easeOutCubic),
        hookLine1().y(-22, 1.0, easeOutCubic),
      ),
      waitFor(0.2),
      all(
        hookLine2().opacity(1, 1.0, easeOutCubic),
        hookLine2().y(64, 1.1, easeOutCubic),
      ),
    ),
    camera().scale(1.04, 3.2, easeInOutCubic),
  );

  // ─── SHOT 2: THE TENSION (00:03.2 – 00:07.2) ───────────────────────
  yield* all(
    hookGroup().opacity(0, 0.5, easeInCubic),
    hookGroup().y(-35, 0.6, easeInCubic),
    camera().scale(1.12, 4.0, easeInOutCubic),
    camera().rotation(1.2, 4.0, easeInOutCubic),
    chain(
      all(
        tensionCard1().opacity(1, 0.45, easeOutCubic),
        tensionCard1().scale(1.0, 0.55, easeOutBack),
        tensionCard1().y(-75, 0.55, easeOutCubic),
      ),
      waitFor(0.6),
      all(
        tensionCard2().opacity(1, 0.45, easeOutCubic),
        tensionCard2().scale(1.0, 0.55, easeOutBack),
        tensionCard2().y(25, 0.55, easeOutCubic),
      ),
      waitFor(0.6),
      all(
        tensionCard3().opacity(1, 0.4, easeOutCubic),
        tensionCard3().scale(1.0, 0.5, easeOutBack),
        tensionCard3().y(165, 0.5, easeOutCubic),
      ),
      waitFor(0.7),
    ),
  );

  // ─── SHOT 3: SILENCE DROP & SIGNATURE REVEAL (00:07.2 – 00:11.5) ───
  // Soundtrack drops to silence at 07.4s! Cards implode to soundwave.
  yield* all(
    tensionCard1().scale(0.1, 0.4, easeInCubic),
    tensionCard1().opacity(0, 0.35, easeInCubic),
    tensionCard2().scale(0.1, 0.4, easeInCubic),
    tensionCard2().opacity(0, 0.35, easeInCubic),
    tensionCard3().scale(0.1, 0.4, easeInCubic),
    tensionCard3().opacity(0, 0.35, easeInCubic),
    camera().rotation(0, 0.5, easeOutCubic),
    camera().scale(1.06, 0.8, easeOutCubic),
  );

  yield* all(
    waveGroup().opacity(1, 0.25),
    waveLine1().scale(1.2, 0.8, easeInOutCubic),
    waveLine2().scale(1.3, 0.9, easeInOutCubic),
    waveLine3().scale(1.15, 0.8, easeInOutCubic),
    waveLine4().scale(1.25, 0.85, easeInOutCubic),
  );

  yield* all(
    waveGroup().scale(0.1, 0.3, easeInCubic),
    waveGroup().opacity(0, 0.3, easeInCubic),
    convergenceRing().opacity(1, 0.2),
    convergenceRing().scale(1.1, 0.35, easeOutCubic),
  );

  // Chime hit at 08.8s: Light expands into Ivory, Nivara logo blooms!
  yield* all(
    lightExpansion().opacity(1, 0.25),
    lightExpansion().size(2600, 0.9, easeOutExpo),
    shot3Group().opacity(1, 0.3),
    botanicalLogoShot3().opacity(1, 0.4),
    botanicalLogoShot3().scale(1.0, 0.7, easeOutBack),
    convergenceRing().size(380, 0.7, easeOutExpo),
    convergenceRing().opacity(0, 0.6, easeOutExpo),
    chain(
      waitFor(0.15),
      all(
        revealWordmark().opacity(1, 0.5, easeOutCubic),
        revealWordmark().y(55, 0.55, easeOutCubic),
      ),
      waitFor(0.1),
      all(
        revealSubtitle().opacity(1, 0.45, easeOutCubic),
        revealSubtitle().y(108, 0.5, easeOutCubic),
      ),
    ),
    camera().scale(1.0, 1.0, easeOutCubic),
  );

  // Savor signature reveal until 11.5s
  yield* waitFor(1.7);

  // ─── SHOT 4 & 5: DUAL MODES & CLINICAL INTERACTION (00:11.5 – 00:25.5)
  // Continuous camera pan downwards to the Dual Mode Dashboard
  // 11.5s - 18.0s: "Meet Nivara. A more private way to begin a student well-being check-in."
  yield* all(
    shot3Group().opacity(0, 0.6, easeInCubic),
    camera().y(-1100, 1.4, easeInOutCubic),
    shot45Group().opacity(1, 1.0, easeOutCubic),
    sectionHeader4().opacity(1, 0.8, easeOutCubic),
    sectionSub4().opacity(1, 0.8, easeOutCubic),
    chain(
      waitFor(0.4),
      all(
        voiceModeCard().opacity(1, 0.8, easeOutCubic),
        manualModeCard().opacity(1, 0.8, easeOutCubic),
      ),
    ),
  );

  // Voice Waveform breathing during speech
  yield* all(
    voiceWave1().scale(1.3, 1.6, easeInOutCubic),
    voiceWave2().scale(1.4, 1.4, easeInOutCubic),
    voiceWave3().scale(1.2, 1.5, easeInOutCubic),
    studentCursor().opacity(1, 0.8),
  );
  yield* waitFor(3.5);

  // 18.0s - 25.5s: "Talk it through. Or take it one question at a time."
  // Interactive Questionnaire selection: Cursor moves to Option 2 ("Fairly often")
  yield* all(
    studentCursor().x(120, 1.4, easeInOutCubic),
    studentCursor().y(75, 1.4, easeInOutCubic),
  );

  // Student clicks Option 2! Haptic ripple expands; radio dot fills
  yield* all(
    studentCursor().scale(0.8, 0.15, easeInCubic),
    qOption2().fill(SAGE_TINT, 0.25),
    qOption2().stroke(SAGE_PRIMARY, 0.25),
    hapticRing().opacity(1, 0.1),
    hapticRing().size(60, 0.45, easeOutExpo),
    hapticRing().opacity(0, 0.45, easeOutExpo),
    pssProgressBar().width(250, 0.6, easeOutCubic),
  );
  yield* studentCursor().scale(1.0, 0.3, easeOutCubic);
  yield* waitFor(5.2);

  // ─── SHOT 6: TREESHAP EXPLAINABILITY WATERFALL (00:25.5 – 00:33.5) ──
  // 25.5s - 33.5s: "With honest clarity, so you see what shaped the result."
  yield* all(
    shot45Group().opacity(0, 0.6, easeInCubic),
    camera().y(-2200, 1.4, easeInOutCubic),
    shot6Group().opacity(1, 1.0, easeOutCubic),
    shapHeader().opacity(1, 0.8, easeOutCubic),
    shapSub().opacity(1, 0.8, easeOutCubic),
  );

  // Animate TreeSHAP waterfall bars expanding horizontally
  yield* chain(
    all(
      shapBar1().width(240, 0.7, easeOutExpo),
      shapVal1().opacity(1, 0.5),
    ),
    all(
      shapBar2().width(190, 0.7, easeOutExpo),
      shapVal2().opacity(1, 0.5),
    ),
    all(
      shapBar3().width(130, 0.7, easeOutExpo),
      shapVal3().opacity(1, 0.5),
    ),
  );
  yield* waitFor(5.2);

  // ─── SHOT 7: INSTITUTIONAL GOVERNANCE & PRIVACY (00:33.5 – 00:39.5) ─
  // 33.5s - 39.5s: "Safe by design. Minimum-group thresholds keep student identities protected."
  yield* all(
    shot6Group().opacity(0, 0.6, easeInCubic),
    camera().y(-3300, 1.4, easeInOutCubic),
    shot7Group().opacity(1, 1.0, easeOutCubic),
    govHeader().opacity(1, 0.8, easeOutCubic),
  );

  // Animate Suppression Shield & Privacy Tone
  yield* all(
    suppressionShield().scale(1.02, 0.6, easeOutBack),
    redactedBadge().opacity(1, 0.5),
  );
  yield* waitFor(4.0);

  // ─── SHOT 8: BRAND SIGNATURE CLOSE (00:39.5 – 00:45.0) ─────────────
  // 39.5s - 45.0s: "A quieter first step toward student well-being. Discover Nivara."
  yield* all(
    shot7Group().opacity(0, 0.6, easeInCubic),
    camera().y(-4400, 1.5, easeInOutCubic),
    shot8Group().opacity(1, 1.0, easeOutCubic),
    finalLogo().opacity(1, 0.8, easeOutBack),
    finalLogo().scale(1.0, 0.9, easeOutBack),
    chain(
      waitFor(0.3),
      all(
        finalTitle().opacity(1, 0.8, easeOutCubic),
        finalTitle().y(10, 0.8, easeOutCubic),
      ),
      waitFor(0.2),
      all(
        finalTagline().opacity(1, 0.8, easeOutCubic),
        finalTagline().y(70, 0.8, easeOutCubic),
      ),
      waitFor(0.3),
      all(
        ctaButton().opacity(1, 0.7, easeOutBack),
        ctaButton().scale(1.0, 0.7, easeOutBack),
      ),
    ),
  );

  // Subtle pulsing hover effect on CTA arrow leading to the final reverb tail
  yield* all(
    ctaArrow().x(88, 0.8, easeInOutCubic),
    camera().scale(1.02, 1.2, easeInOutCubic),
  );
  yield* ctaArrow().x(80, 0.8, easeInOutCubic);

  // Hold final brand resolution till 45.00s
  yield* waitFor(1.2);
});
