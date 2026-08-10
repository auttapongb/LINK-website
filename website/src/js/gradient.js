/*
 * Hand-rolled WebGL gradient field for the hero atmosphere.
 * Written in-house instead of pulling ShaderGradient, whose public API is
 * React-only and would mean adding React to a vanilla site.
 */

const VERTEX_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + 7.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  p *= 1.65;

  float t = u_time * 0.05;
  vec2 drift = (u_pointer - 0.5) * 0.3;

  vec2 q = vec2(fbm(p + drift + t), fbm(p + vec2(3.4, 1.2) - t * 0.8));
  vec2 r = vec2(
    fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.55),
    fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.4)
  );
  float f = clamp(fbm(p + 2.1 * r) * 1.3 - 0.14, 0.0, 1.0);

  vec3 col = mix(u_c0, u_c1, smoothstep(0.12, 0.62, f));
  col = mix(col, u_c2, smoothstep(0.42, 0.92, r.x) * 0.85);
  col = mix(col, u_c3, smoothstep(0.52, 1.0, q.y) * 0.6);

  // Settle back to the page canvas colour at the bottom edge so the hero
  // dissolves into the rest of the document instead of ending on a hard line.
  col = mix(col, u_c0, smoothstep(0.34, 0.0, uv.y));

  gl_FragColor = vec4(col, 1.0);
}
`;

/*
 * Clay pastels. Two cool (canvas, sky) and two warm (coral, mustard), so the
 * field drifts between the mark's blue half and its orange half instead of
 * sitting in one temperature. Kept high in lightness: this is behind a
 * headline, and every stop here has to clear 4.5:1 against the ink brown.
 */
const PALETTE = {
  c0: [0.937, 0.961, 0.976], // canvas    #eff5f9
  c1: [0.682, 0.886, 0.965], // sky       #AEE2F6
  c2: [1.0, 0.863, 0.812], // coral tint  #FFDCCF
  c3: [1.0, 0.933, 0.729], // mustard tint #FFEEBA
};

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initGradient(canvas, { reducedMotion = false } = {}) {
  if (!canvas) return null;

  const gl =
    canvas.getContext("webgl", { antialias: false, alpha: false, depth: false }) ||
    canvas.getContext("experimental-webgl", { antialias: false, alpha: false, depth: false });

  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "u_res");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uPointer = gl.getUniformLocation(program, "u_pointer");
  gl.uniform3fv(gl.getUniformLocation(program, "u_c0"), PALETTE.c0);
  gl.uniform3fv(gl.getUniformLocation(program, "u_c1"), PALETTE.c1);
  gl.uniform3fv(gl.getUniformLocation(program, "u_c2"), PALETTE.c2);
  gl.uniform3fv(gl.getUniformLocation(program, "u_c3"), PALETTE.c3);

  // The field is all low-frequency colour, so rendering at roughly half
  // resolution is visually identical and keeps the fragment cost trivial.
  const RENDER_SCALE = 0.5;
  const MAX_EDGE = 1100;

  const pointer = { x: 0.5, y: 0.5 };
  const eased = { x: 0.5, y: 0.5 };
  let visible = true;
  let frame = 0;
  let start = performance.now();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.min(MAX_EDGE, Math.round(rect.width * RENDER_SCALE)));
    const h = Math.max(1, Math.min(MAX_EDGE, Math.round(rect.height * RENDER_SCALE)));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  function draw(time) {
    gl.uniform1f(uTime, time);
    gl.uniform2f(uPointer, eased.x, eased.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    frame = requestAnimationFrame(loop);
    if (!visible) return;
    eased.x += (pointer.x - eased.x) * 0.045;
    eased.y += (pointer.y - eased.y) * 0.045;
    draw((now - start) / 1000);
  }

  resize();
  canvas.dataset.gradientReady = "true";

  if (reducedMotion) {
    // One static frame: the atmosphere is still there, nothing moves.
    draw(12);
  } else {
    frame = requestAnimationFrame(loop);

    window.addEventListener(
      "pointermove",
      (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width);
        pointer.y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
      },
      { passive: true }
    );

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
        },
        { threshold: 0 }
      );
      io.observe(canvas);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      start = performance.now() - 1000;
    });
  }

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(12);
    });
    ro.observe(canvas);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }

  return {
    destroy() {
      cancelAnimationFrame(frame);
    },
  };
}
