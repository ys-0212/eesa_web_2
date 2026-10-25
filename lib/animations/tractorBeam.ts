// UFO tractor-beam effect for the logo river (behaviour measured from the reference, SPEC §5):
// logos whose centre is within BEAM_WIDTH of the beam centre are lifted up to MAX_LIFT px with a
// frame-rate independent lerp, rock while lifted, and ease back down with easeOutCubic.

const BEAM_WIDTH = 90;
const MAX_LIFT = 90;
const BEAM_OFFSET_X = -15;
const DESCENT_DURATION = 1200;
const ASCEND_LERP_BASE = 0.09;
const TARGET_FRAME_MS = 1000 / 60;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function startTractorBeam(container: HTMLElement, ufo: HTMLElement, items: HTMLElement[]) {
  let visible = false;
  let raf = 0;
  let prevTs = 0;
  let lastVisibleTs = 0;
  const rendered = new Map<HTMLElement, number>();
  const descent = new Map<HTMLElement, { start: number; t0: number }>();

  const frame = (ts: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible) {
      if (prevTs !== 0) lastVisibleTs = ts;
      prevTs = 0;
      return;
    }
    // Shift in-flight descents forward by the time spent off-screen.
    if (lastVisibleTs && prevTs === 0) {
      const paused = ts - lastVisibleTs;
      if (paused > 16) descent.forEach((d) => (d.t0 += paused));
    }
    lastVisibleTs = ts;
    const dt = prevTs ? (ts - prevTs) / TARGET_FRAME_MS : 1;
    prevTs = ts;

    const ufoRect = ufo.getBoundingClientRect();
    const beamX = ufoRect.left + BEAM_OFFSET_X + ufoRect.width / 2;

    // Duplicate (overflow) copies share a target keyed by data-uid.
    const target = new Map<string, number>();
    for (const el of items) {
      const uid = el.dataset.uid!;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - beamX);
      const lift = d < BEAM_WIDTH ? (1 - d / BEAM_WIDTH) * MAX_LIFT : 0;
      if (lift > (target.get(uid) ?? 0)) target.set(uid, lift);
      else if (!target.has(uid)) target.set(uid, 0);
    }

    for (const el of items) {
      const goal = target.get(el.dataset.uid!) ?? 0;
      const lifting = goal > 0;
      const prev = rendered.get(el) ?? 0;
      let next: number;
      if (lifting) {
        next = prev + (goal - prev) * (1 - Math.pow(1 - ASCEND_LERP_BASE, dt));
        if (Math.abs(next - goal) < 0.3) next = goal;
        descent.delete(el);
      } else if (prev > 0.1) {
        if (!descent.has(el)) descent.set(el, { start: prev, t0: ts });
        const d = descent.get(el)!;
        const t = Math.min((ts - d.t0) / DESCENT_DURATION, 1);
        next = d.start * (1 - easeOutCubic(t));
        if (t >= 1) { next = 0; descent.delete(el); }
      } else {
        next = 0;
        descent.delete(el);
      }
      rendered.set(el, next);
      el.style.setProperty('--lift-amount', `${next}px`);

      const was = el.classList.contains('lifting');
      if (lifting && !was) {
        const content = el.querySelector<HTMLElement>('.logo-content');
        if (content) content.style.transform = '';
        el.classList.add('lifting');
      } else if (!lifting && was) {
        // Freeze the current rock angle, then let the CSS transition settle it back to 0.
        const content = el.querySelector<HTMLElement>('.logo-content');
        const current = content ? getComputedStyle(content).transform : '';
        el.classList.remove('lifting');
        if (content) {
          content.style.transform = current;
          requestAnimationFrame(() => { content.style.transform = 'rotate(0deg)'; });
        }
      }
    }
  };

  const io = new IntersectionObserver((entries) => entries.forEach((e) => (visible = e.isIntersecting)), { threshold: 0.25 });
  io.observe(container);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}
