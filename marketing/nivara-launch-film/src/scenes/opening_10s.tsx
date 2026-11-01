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
  // ─── AUTHENTIC BRAND COLOR SYSTEM ──────────────────────────────────
  const OBSIDIAN = '#12110F';       // Deep atmospheric opening canvas
  const CARD_BG = '#1A1916';        // Elevated dark card surface
  const CARD_BORDER = '#2E2B24';    // Subtle card border
  const IVORY = '#FBF9F4';          // Brand primary sanctuary canvas
  const CREAM = '#F5F1E9';          // Soft sanctuary tone
  const EARTH = '#2F302B';          // Deep ink primary text
  const MUTED_EARTH = '#6F6D63';    // Secondary text
  const SAGE_PRIMARY = '#7C775F';   // Primary botanical sage
  const SAGE_GLOW = '#A9AB87';      // Glowing sage accent
  const GOLD_ACCENT = '#F6CA83';    // Golden acoustic ember
  const TERRACOTTA = '#CE6F37';     // Academic stress indicator
  const CRISIS_ACCENT = '#C44B34';  // Unsent message accent

  // ─── STAGE SETUP & CAMERA RIG ──────────────────────────────────────
  const stageBg = createRef<Rect>();
  const lightExpansion = createRef<Circle>();
  const camera = createRef<Node>();

  // Ambient atmospheric glows in dark space
  const ambientGlow = createRef<Circle>();

  // ─── SHOT 1: THE HOOK (00:00 – 00:03) ──────────────────────────────
  const hookGroup = createRef<Node>();
  const acousticEmber = createRef<Circle>();
  const hookLine1 = createRef<Txt>();
  const hookLine2 = createRef<Txt>();

  // ─── SHOT 2: THE TENSION (00:03 – 00:07) ───────────────────────────
  const tensionGroup = createRef<Node>();
  const card1 = createRef<Rect>(); // Deadline alert
  const card2 = createRef<Rect>(); // Unsent draft
  const card3 = createRef<Rect>(); // Academic overload notification

  // ─── SHOT 3: SOUNDWAVE & SIGNATURE REVEAL (00:07 – 00:10) ──────────
  const waveGroup = createRef<Node>();
  const waveLine1 = createRef<Line>();
  const waveLine2 = createRef<Line>();
  const waveLine3 = createRef<Line>();
  const waveLine4 = createRef<Line>();
  const waveLine5 = createRef<Line>();

  const logoGroup = createRef<Node>();
  const convergenceRing = createRef<Circle>();
  const botanicalLogo = createRef<Img>();
  const brandWordmark = createRef<Txt>();
  const brandTagline = createRef<Txt>();

  // ─── CONSTRUCT SCENE GRAPH ─────────────────────────────────────────
  view.add(
    <Rect
      ref={stageBg}
      width={'100%'}
      height={'100%'}
      fill={OBSIDIAN}
    >
      {/* Expanding Light Mask for Ivory Transition at 08.8s */}
      <Circle
        ref={lightExpansion}
        size={0}
        fill={IVORY}
        x={0}
        y={0}
        opacity={0}
      />

      {/* Soft Ambient Background Aura */}
      <Circle
        ref={ambientGlow}
        size={800}
        fill={'rgba(169, 171, 135, 0.08)'}
        x={0}
        y={-40}
        scale={0.8}
        opacity={0}
      />

      {/* Main Camera Rig */}
      <Node ref={camera}>

        {/* ════════════════════════════════════════════════════════════
            SHOT 1: THE HOOK (00:00 – 00:03)
            "Some things are hard to put into words."
            ════════════════════════════════════════════════════════════ */}
        <Node ref={hookGroup} y={0}>
          {/* Subtle acoustic pulse point */}
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
            fontSize={76}
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
            fontSize={76}
            fontWeight={400}
            letterSpacing={-1}
            fill={'#D0CABA'}
            y={76}
            opacity={0}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 2: THE TENSION (00:03 – 00:07)
            Academic fragments appear with deliberate rhythm & depth
            ════════════════════════════════════════════════════════════ */}
        <Node ref={tensionGroup} y={0}>
          {/* Fragment 1: Overdue Assignment Alert (Top Left) */}
          <Rect
            ref={card1}
            x={-350}
            y={-90}
            width={440}
            height={136}
            radius={18}
            fill={CARD_BG}
            stroke={CARD_BORDER}
            lineWidth={1.5}
            rotation={-3.5}
            opacity={0}
            scale={0.75}
          >
            <Circle size={10} fill={TERRACOTTA} x={-185} y={-38} />
            <Txt
              text={'MIDTERM EVALUATION • TOMORROW 08:30'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={11}
              fontWeight={700}
              letterSpacing={2}
              fill={'#A8A296'}
              x={-28}
              y={-38}
            />
            <Txt
              text={'Credit overload & GPA threshold alert'}
              fontFamily={'DM Serif Display, Georgia, serif'}
              fontSize={21}
              fill={CREAM}
              x={-25}
              y={10}
            />
          </Rect>

          {/* Fragment 2: Unsent Message Draft (Bottom Right) */}
          <Rect
            ref={card2}
            x={280}
            y={40}
            width={480}
            height={144}
            radius={20}
            fill={CARD_BG}
            stroke={CARD_BORDER}
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
              fill={CRISIS_ACCENT}
              x={-165}
              y={-40}
            />
            <Txt
              text={'“I don’t know who to talk to without\ncausing unnecessary panic…”'}
              fontFamily={'Manrope, sans-serif'}
              fontSize={17}
              fontStyle={'italic'}
              lineHeight={26}
              fill={'#E8E4D8'}
              x={-15}
              y={12}
            />
          </Rect>

          {/* Fragment 3: Notification Pressure Badge (Center Bottom) */}
          <Rect
            ref={card3}
            x={-60}
            y={180}
            width={430}
            height={62}
            radius={31}
            fill={'rgba(206, 111, 55, 0.16)'}
            stroke={TERRACOTTA}
            lineWidth={1.2}
            rotation={-0.8}
            opacity={0}
            scale={0.75}
          >
            <Circle size={8} fill={GOLD_ACCENT} x={-175} y={0} />
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
            SHOT 3A: THE UNHEARD SIGNAL (00:07 – 00:08.5)
            Kinetic Soundwave lines representing the unspoken voice
            ════════════════════════════════════════════════════════════ */}
        <Node ref={waveGroup} opacity={0}>
          <Line
            ref={waveLine1}
            points={[[-200, 0], [-100, -25], [0, 25], [100, -25], [200, 0]]}
            stroke={SAGE_GLOW}
            lineWidth={3}
            lineCap={'round'}
            opacity={0.9}
          />
          <Line
            ref={waveLine2}
            points={[[-160, 0], [-80, 45], [0, -45], [80, 45], [160, 0]]}
            stroke={GOLD_ACCENT}
            lineWidth={2.5}
            lineCap={'round'}
            opacity={0.8}
          />
          <Line
            ref={waveLine3}
            points={[[-240, 0], [-120, -55], [0, 55], [120, -55], [240, 0]]}
            stroke={'rgba(236, 231, 221, 0.6)'}
            lineWidth={2}
            lineCap={'round'}
            opacity={0.6}
          />
          <Line
            ref={waveLine4}
            points={[[-120, 0], [-60, 20], [0, -20], [60, 20], [120, 0]]}
            stroke={SAGE_PRIMARY}
            lineWidth={2.5}
            lineCap={'round'}
            opacity={0.7}
          />
          <Line
            ref={waveLine5}
            points={[[-280, 0], [-140, 30], [0, -30], [140, 30], [280, 0]]}
            stroke={'rgba(169, 171, 135, 0.4)'}
            lineWidth={1.5}
            lineCap={'round'}
            opacity={0.5}
          />
        </Node>

        {/* ════════════════════════════════════════════════════════════
            SHOT 3B: THE BOTANICAL REVEAL (00:08.8 – 00:10.0)
            Nivara botanical mark blooms with golden harmonic chime
            ════════════════════════════════════════════════════════════ */}
        <Node ref={logoGroup} y={-10} opacity={0}>
          {/* Circular acoustic aura */}
          <Circle
            ref={convergenceRing}
            size={240}
            fill={null}
            stroke={SAGE_PRIMARY}
            lineWidth={1.5}
            scale={0.3}
            opacity={0}
          />
          {/* Authentic botanical SVG emblem */}
          <Img
            ref={botanicalLogo}
            src={'/nivara-logo.svg'}
            width={180}
            y={-65}
            scale={0.5}
            opacity={0}
          />
          {/* Primary brand wordmark */}
          <Txt
            ref={brandWordmark}
            text={'Nivara'}
            fontFamily={'DM Serif Display, Georgia, serif'}
            fontSize={72}
            fontWeight={400}
            letterSpacing={-1}
            fill={EARTH}
            y={65}
            opacity={0}
          />
          {/* Brand subtitle pill */}
          <Txt
            ref={brandTagline}
            text={'STUDENT WELL-BEING SANCTUARY'}
            fontFamily={'Manrope, sans-serif'}
            fontSize={12}
            fontWeight={700}
            letterSpacing={3.5}
            fill={SAGE_PRIMARY}
            y={118}
            opacity={0}
          />
        </Node>

      </Node>
    </Rect>
  );

  // ─── MASTER CHOREOGRAPHY & TIMELINE (10.0 SECONDS = 300 FRAMES) ────

  // ─── 0.0s – 3.2s: THE HOOK ─────────────────────────────────────────
  // Line 1: "Some things are hard to put into words."
  yield* all(
    ambientGlow().opacity(1, 1.2, easeOutCubic),
    ambientGlow().scale(1.1, 3.0, easeInOutCubic),
    // Acoustic pulse point emerges
    chain(
      acousticEmber().scale(1.2, 0.6, easeOutBack),
      acousticEmber().scale(0.9, 0.8, easeInOutCubic),
      acousticEmber().scale(1.1, 0.8, easeInOutCubic),
    ),
    acousticEmber().opacity(1, 0.4),
    // Typography reveals with delicate vertical drift and opacity
    chain(
      waitFor(0.3),
      all(
        hookLine1().opacity(1, 0.9, easeOutCubic),
        hookLine1().y(-22, 1.0, easeOutCubic),
      ),
      waitFor(0.2),
      all(
        hookLine2().opacity(1, 1.0, easeOutCubic),
        hookLine2().y(62, 1.1, easeOutCubic),
      ),
    ),
    // Subtle initial camera drift
    camera().scale(1.04, 3.2, easeInOutCubic),
  );

  // ─── 3.2s – 7.2s: THE TENSION ──────────────────────────────────────
  // The hook lines dissolve upwards; tension cards push in with rapid rhythm
  yield* all(
    // Fade out hook text
    hookGroup().opacity(0, 0.5, easeInCubic),
    hookGroup().y(-35, 0.6, easeInCubic),
    // Camera pushes in deeper to create focused intensity
    camera().scale(1.12, 4.0, easeInOutCubic),
    camera().rotation(1.2, 4.0, easeInOutCubic),
    // Ambient glow dims slightly
    ambientGlow().opacity(0.4, 1.0),
    // Cards enter in rhythmic sequence synced to the music riser
    chain(
      // Fragment 1 (Deadline): 3.4s
      all(
        card1().opacity(1, 0.45, easeOutCubic),
        card1().scale(1.0, 0.55, easeOutBack),
        card1().y(-75, 0.55, easeOutCubic),
      ),
      waitFor(0.6),
      // Fragment 2 (Unsent Message): 4.5s
      all(
        card2().opacity(1, 0.45, easeOutCubic),
        card2().scale(1.0, 0.55, easeOutBack),
        card2().y(25, 0.55, easeOutCubic),
      ),
      waitFor(0.6),
      // Fragment 3 (Overload Badge): 5.6s
      all(
        card3().opacity(1, 0.4, easeOutCubic),
        card3().scale(1.0, 0.5, easeOutBack),
        card3().y(165, 0.5, easeOutCubic),
      ),
      // Suspense hold leading to silence drop
      waitFor(0.7),
    ),
  );

  // ─── 7.2s – 8.7s: THE SILENCE DROP & THE UNHEARD SIGNAL ────────────
  // Exact silence drop at 07.4s!
  // The 3 cards collapse rapidly inward to the center
  yield* all(
    card1().scale(0.1, 0.4, easeInCubic),
    card1().opacity(0, 0.35, easeInCubic),
    card1().x(0, 0.4, easeInCubic),
    card1().y(0, 0.4, easeInCubic),

    card2().scale(0.1, 0.4, easeInCubic),
    card2().opacity(0, 0.35, easeInCubic),
    card2().x(0, 0.4, easeInCubic),
    card2().y(0, 0.4, easeInCubic),

    card3().scale(0.1, 0.4, easeInCubic),
    card3().opacity(0, 0.35, easeInCubic),
    card3().x(0, 0.4, easeInCubic),
    card3().y(0, 0.4, easeInCubic),

    // Camera resets rotation smoothly
    camera().rotation(0, 0.5, easeOutCubic),
    camera().scale(1.06, 0.8, easeOutCubic),
  );

  // Soundwave ripple expands outwards from the collapsed core
  yield* all(
    waveGroup().opacity(1, 0.25),
    waveLine1().scale(1.2, 0.9, easeInOutCubic),
    waveLine2().scale(1.3, 1.0, easeInOutCubic),
    waveLine3().scale(1.15, 0.85, easeInOutCubic),
    waveLine4().scale(1.25, 0.95, easeInOutCubic),
    waveLine5().scale(1.1, 1.05, easeInOutCubic),
  );

  // Wave coils inwards preparing for chime bloom
  yield* all(
    waveGroup().scale(0.1, 0.35, easeInCubic),
    waveGroup().opacity(0, 0.35, easeInCubic),
    convergenceRing().opacity(1, 0.2),
    convergenceRing().scale(1.1, 0.4, easeOutCubic),
  );

  // ─── 8.8s – 10.0s: THE SIGNATURE REVEAL & BLOOM ────────────────────
  // Exact chime at 08.8s!
  // Background expands into warm Ivory; Nivara emblem blooms
  yield* all(
    // Ivory light mask expands across entire 1920x1080 canvas
    lightExpansion().opacity(1, 0.25),
    lightExpansion().size(2600, 0.9, easeOutExpo),

    // Logo group springs into view
    logoGroup().opacity(1, 0.3),
    botanicalLogo().opacity(1, 0.4),
    botanicalLogo().scale(1.0, 0.7, easeOutBack),

    // Convergence ring ripples out and fades
    convergenceRing().size(380, 0.7, easeOutExpo),
    convergenceRing().opacity(0, 0.6, easeOutExpo),

    // Typography reveals with confidence
    chain(
      waitFor(0.15),
      all(
        brandWordmark().opacity(1, 0.5, easeOutCubic),
        brandWordmark().y(55, 0.55, easeOutCubic),
      ),
      waitFor(0.1),
      all(
        brandTagline().opacity(1, 0.45, easeOutCubic),
        brandTagline().y(106, 0.5, easeOutCubic),
      ),
    ),

    // Camera settles into stable hero composition
    camera().scale(1.0, 1.0, easeOutCubic),
  );

  // Hold final resting frame for seamless handoff to product tour
  yield* waitFor(0.2);
});
