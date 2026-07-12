// Confete disparado ao concluir uma tarefa.
//
// Desenhado em <canvas> em vez de dezenas de <div>s animadas: são ~34 partículas
// por explosão, e criar/remover isso no DOM a cada clique custa layout caro.
// O canvas é criado sob demanda e removido quando a última partícula morre.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  spin: number;
  color: string;
  life: number;
}

const COLORS = ["#fb2c5a", "#ff8a3d", "#ffd24a", "#12c7a0", "#7c5cff"];
const PARTICLE_COUNT = 34;
const GRAVITY = 0.28;
const DRAG = 0.99;
const FADE = 0.012;

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let isRunning = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureCanvas(): CanvasRenderingContext2D | null {
  if (context && canvas) {
    return context;
  }

  const element = document.createElement("canvas");
  element.setAttribute("aria-hidden", "true");
  element.style.position = "fixed";
  element.style.inset = "0";
  element.style.pointerEvents = "none";
  element.style.zIndex = "60";

  const ratio = window.devicePixelRatio || 1;

  // O buffer é em pixels do dispositivo (nitidez em tela retina)...
  element.width = window.innerWidth * ratio;
  element.height = window.innerHeight * ratio;

  // ...mas o tamanho CSS precisa ser dito na mão. Sem isto o canvas assume o
  // tamanho intrínseco do buffer: num celular (ratio 3) ele fica 3x maior que a
  // tela e o confete é desenhado fora dela. No desktop (ratio 1) os dois valores
  // coincidem, e o bug passa despercebido.
  element.style.width = `${window.innerWidth}px`;
  element.style.height = `${window.innerHeight}px`;

  const ctx = element.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  document.body.appendChild(element);
  canvas = element;
  context = ctx;
  return ctx;
}

function teardown() {
  canvas?.remove();
  canvas = null;
  context = null;
  isRunning = false;
}

function frame() {
  const ctx = context;
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((particle) => particle.life > 0);

  for (const particle of particles) {
    particle.vy += GRAVITY;
    particle.vx *= DRAG;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;
    particle.life -= FADE;

    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      -particle.width / 2,
      -particle.height / 2,
      particle.width,
      particle.height,
    );
    ctx.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(frame);
    return;
  }
  teardown();
}

// `origin` é o retângulo do elemento clicado — o confete sai de onde o dedo bateu.
export function celebrate(origin: DOMRect): void {
  if (prefersReducedMotion()) {
    return;
  }

  const ctx = ensureCanvas();
  if (!ctx) {
    return;
  }

  const x = origin.left + origin.width / 2;
  const y = origin.top + origin.height / 2;

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      // O -3 joga a explosão para cima: confete que só cai parece vazamento.
      vy: Math.sin(angle) * speed - 3,
      width: 5 + Math.random() * 5,
      height: 3 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    });
  }

  if (!isRunning) {
    isRunning = true;
    requestAnimationFrame(frame);
  }
}
