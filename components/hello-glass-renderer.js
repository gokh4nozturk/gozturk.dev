// WebGL "Liquid Glass" renderer for the handwritten hellos.
//
// Per frame, the pen's progress is drawn as a plain alpha mask on a 2D canvas.
// When the mask changes it is blurred on the GPU (two separable passes at half
// resolution) into a height map (R) and a shadow map (G). A single fragment
// pass then shades the glass from those textures: shadow and caustic, a clear
// body, a flowing refracted liquid, edge darkening, chromatic fringes, an inner
// rim and two specular lights. Everything after the mask runs on the GPU, so a
// frame costs about the same whether the word is short or long.

import { HELLO_VIEWBOX_HEIGHT, strokeLength } from "@components/apple-hello";

const STROKE_WIDTH = 26; // viewBox units
const HEIGHT_SIGMA = 4; // viewBox units, rounds the tube
const SHADOW_SIGMA = 9; // viewBox units
const SURFACE_SCALE = 8.75; // bevel steepness, per viewBox unit
const KEY_LIGHT_ELEVATION = (38 * Math.PI) / 180;
const BACK_LIGHT_ELEVATION = (30 * Math.PI) / 180;

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// Separable gaussian with two sigmas at once: R = height, G = shadow.
const BLUR_SHADER = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uStep;
uniform vec2 uSigma;
uniform float uFromMask;
void main() {
  vec2 sum = vec2(0.0);
  vec2 weights = vec2(0.0);
  for (int i = -24; i <= 24; i++) {
    float x = float(i);
    vec2 w = exp(-0.5 * x * x / (uSigma * uSigma));
    vec4 texel = texture2D(uSource, vUv + uStep * x);
    sum += mix(texel.rg, vec2(texel.a), uFromMask) * w;
    weights += w;
  }
  gl_FragColor = vec4(sum / weights, 0.0, 1.0);
}`;

const GLASS_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uMask;
uniform sampler2D uBlur;
uniform vec2 uUnit;
uniform vec2 uOrigin;
uniform vec2 uBlurTexel;
uniform float uNormalScale;
uniform vec3 uKeyLight;
uniform vec3 uBackLight;
uniform vec2 uLiquidShift;
uniform float uTime;
uniform vec4 uBody;
uniform vec4 uEdge;
uniform vec4 uRim;
uniform vec4 uShadow;
uniform vec4 uCaustic;
uniform float uLiquidAlpha;
uniform float uOpacity;

void over(inout vec4 dst, vec3 color, float alpha) {
  dst.rgb = color * alpha + dst.rgb * (1.0 - alpha);
  dst.a = alpha + dst.a * (1.0 - alpha);
}

float mask(vec2 uv) {
  return texture2D(uMask, uv).a;
}

// Pastel iridescence drifting slowly across the word.
vec3 liquid(vec2 p) {
  float w = p.x * 0.0022 + p.y * 0.0012
    + 0.3 * sin(p.y * 0.008 + p.x * 0.003 + uTime * 0.5)
    + 0.2 * sin(p.x * 0.006 - uTime * 0.35)
    + uTime * 0.04;
  vec3 c = 0.5 + 0.5 * cos(6.2831853 * (w + vec3(0.0, 0.33, 0.67)));
  return mix(c, vec3(1.0), 0.5);
}

float specular(vec3 n, vec3 light, float strength, float shininess) {
  return clamp(strength * pow(max(dot(n, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), shininess), 0.0, 1.0);
}

void main() {
  float a = mask(vUv);
  float h = texture2D(uBlur, vUv).r;
  vec4 color = vec4(0.0);

  // Contact shadow (12 units below) and the light the glass focuses into it.
  float shadow = texture2D(uBlur, vUv + vec2(0.0, 12.0) * uUnit).g;
  over(color, uShadow.rgb, uShadow.a * shadow);
  float caustic = texture2D(uBlur, vUv + vec2(0.0, 9.0) * uUnit).r * (1.0 - a);
  over(color, uCaustic.rgb, uCaustic.a * caustic);

  if (a > 0.0) {
    float hx = texture2D(uBlur, vUv + vec2(uBlurTexel.x, 0.0)).r - texture2D(uBlur, vUv - vec2(uBlurTexel.x, 0.0)).r;
    float hy = texture2D(uBlur, vUv + vec2(0.0, uBlurTexel.y)).r - texture2D(uBlur, vUv - vec2(0.0, uBlurTexel.y)).r;
    vec3 n = normalize(vec3(-hx * uNormalScale, -hy * uNormalScale, 1.0));

    over(color, uBody.rgb, uBody.a * a);

    // Liquid seen through the tube, bent along its surface normal.
    vec2 p = (vUv - uOrigin) / uUnit + n.xy * 30.0 + uLiquidShift;
    over(color, liquid(p), uLiquidAlpha * a);

    // Light bends away near the edges, so they read darker.
    over(color, uEdge.rgb, uEdge.a * a * (1.0 - h));

    // Chromatic fringes: cool on the top-left edge, warm on the bottom-right.
    float cool = a * (1.0 - mask(vUv - vec2(3.0, -3.0) * uUnit));
    over(color, vec3(0.431, 0.784, 1.0), 0.45 * cool);
    float warm = a * (1.0 - mask(vUv + vec2(3.0, -3.0) * uUnit));
    over(color, vec3(1.0, 0.588, 0.824), 0.4 * warm);

    // Thin inner rim reflection along the whole outline.
    float rim = clamp(1.0 - abs(h - 0.7) * 6.5, 0.0, 1.0);
    over(color, uRim.rgb, uRim.a * rim * a);

    over(color, vec3(1.0), specular(n, uBackLight, 0.8, 18.0) * a);
    over(color, vec3(1.0), specular(n, uKeyLight, 1.7, 45.0) * a);
  }

  gl_FragColor = color * uOpacity;
}`;

const EASINGS = {
  // motion's "easeInOut", cubic-bezier(0.42, 0, 0.58, 1)
  easeInOut: (t) => {
    let u = t;
    for (let i = 0; i < 6; i++) {
      const x = 3 * u * (1 - u) * (1 - u) * 0.42 + 3 * u * u * (1 - u) * 0.58 + u * u * u - t;
      const dx =
        3 * (1 - u) * (1 - u) * 0.42 + 6 * u * (1 - u) * (0.58 - 0.42) + 3 * u * u * (1 - 0.58);
      if (Math.abs(dx) < 1e-6) break;
      u = Math.min(1, Math.max(0, u - x / dx));
    }
    return 3 * u * u * (1 - u) + u * u * u;
  },
  linear: (t) => t,
};

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed");
  }
  return shader;
}

function program(gl, fragmentSource) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.bindAttribLocation(p, 0, "aPosition");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "Program link failed");
  }
  const uniforms = {};
  const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const { name } = gl.getActiveUniform(p, i);
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { program: p, uniforms };
}

function texture(gl) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function lightVector(azimuthDegrees, elevation) {
  // Azimuth is measured in screen space (y down); GL space has y up.
  const azimuth = (azimuthDegrees * Math.PI) / 180;
  return [
    Math.cos(azimuth) * Math.cos(elevation),
    -Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
  ];
}

export class HelloGlassRenderer {
  constructor(canvas) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) throw new Error("WebGL unavailable");

    this.canvas = canvas;
    this.gl = gl;
    this.maskCanvas = document.createElement("canvas");
    this.maskContext = this.maskCanvas.getContext("2d");
    this.blurProgram = program(gl, BLUR_SHADER);
    this.glassProgram = program(gl, GLASS_SHADER);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.maskTexture = texture(gl);
    this.blurTargets = [0, 1].map(() => {
      const t = texture(gl);
      const framebuffer = gl.createFramebuffer();
      return { framebuffer, texture: t };
    });

    this.layout = null;
    this.word = null;
    this.strokes = [];
    this.progressKey = "";
  }

  // margin: CSS px the canvas extends past the box on every side.
  resize(boxWidth, boxHeight, margin, pixelRatio) {
    const width = Math.round((boxWidth + margin * 2) * pixelRatio);
    const height = Math.round((boxHeight + margin * 2) * pixelRatio);
    const { gl } = this;
    this.canvas.width = width;
    this.canvas.height = height;
    this.maskCanvas.width = width;
    this.maskCanvas.height = height;

    const blurWidth = Math.max(1, Math.round(width / 2));
    const blurHeight = Math.max(1, Math.round(height / 2));
    for (const target of this.blurTargets) {
      gl.bindTexture(gl.TEXTURE_2D, target.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        blurWidth,
        blurHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        target.texture,
        0,
      );
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.layout = { blurHeight, blurWidth, boxHeight, boxWidth, height, margin, pixelRatio, width };
    this.fitWord();
  }

  setWord(word) {
    this.word = word;
    this.strokes = word.strokes.map((stroke) => ({
      ...stroke,
      ease: EASINGS[stroke.ease] ?? EASINGS.linear,
      length: strokeLength(stroke.d),
      path: new Path2D(stroke.d),
    }));
    this.fitWord();
  }

  // Scales and centers the word's viewBox in the box ("xMidYMid meet").
  fitWord() {
    if (!this.layout || !this.word) return;
    const { boxHeight, boxWidth, margin, pixelRatio } = this.layout;
    const scale = Math.min(boxWidth / this.word.width, boxHeight / HELLO_VIEWBOX_HEIGHT);
    this.fit = {
      // device px per viewBox unit
      scale: scale * pixelRatio,
      x: (margin + (boxWidth - this.word.width * scale) / 2) * pixelRatio,
      y: (margin + (boxHeight - HELLO_VIEWBOX_HEIGHT * scale) / 2) * pixelRatio,
    };
    this.progressKey = "";
  }

  // Draws the pen up to `time` (seconds) into the mask and re-blurs it if it
  // changed. Returns true once every stroke is complete.
  drawStrokes(time) {
    const progress = this.strokes.map(({ delay, duration, ease }) =>
      ease(Math.min(1, Math.max(0, (time - delay) / duration))),
    );
    const key = progress.map((p) => p.toFixed(4)).join();
    if (key !== this.progressKey) {
      this.progressKey = key;
      const ctx = this.maskContext;
      const { scale, x, y } = this.fit;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      ctx.setTransform(scale, 0, 0, scale, x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = STROKE_WIDTH;
      ctx.strokeStyle = "#000";
      this.strokes.forEach((stroke, i) => {
        const p = progress[i];
        if (p <= 0) return;
        ctx.setLineDash(p >= 1 ? [] : [stroke.length * p, stroke.length * 2]);
        ctx.stroke(stroke.path);
      });
      this.blur();
    }
    return progress.every((p) => p >= 1);
  }

  blur() {
    const { gl, layout } = this;
    const { program: p, uniforms } = this.blurProgram;
    const unitsPerBlurTexel = 2 / this.fit.scale;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.maskCanvas);

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a React hook
    gl.useProgram(p);
    gl.uniform1i(uniforms.uSource, 0);
    gl.uniform2f(
      uniforms.uSigma,
      HEIGHT_SIGMA / unitsPerBlurTexel,
      SHADOW_SIGMA / unitsPerBlurTexel,
    );
    gl.viewport(0, 0, layout.blurWidth, layout.blurHeight);
    gl.disable(gl.BLEND);

    const [horizontal, vertical] = this.blurTargets;
    gl.bindFramebuffer(gl.FRAMEBUFFER, horizontal.framebuffer);
    gl.uniform1f(uniforms.uFromMask, 1);
    gl.uniform2f(uniforms.uStep, 1 / layout.blurWidth, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, vertical.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, horizontal.texture);
    gl.uniform1f(uniforms.uFromMask, 0);
    gl.uniform2f(uniforms.uStep, 0, 1 / layout.blurHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // theme: { body, edge, rim, shadow, caustic, liquid } as [r, g, b, a] (0-1).
  render({ keyAzimuth, liquidShift, opacity, theme, time }) {
    const { gl, layout, fit } = this;
    const { program: p, uniforms } = this.glassProgram;
    const unitX = fit.scale / layout.width;
    const unitY = fit.scale / layout.height;
    const unitsPerBlurTexel = 2 / fit.scale;

    gl.viewport(0, 0, layout.width, layout.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a React hook
    gl.useProgram(p);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
    gl.uniform1i(uniforms.uMask, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.blurTargets[1].texture);
    gl.uniform1i(uniforms.uBlur, 1);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform2f(uniforms.uUnit, unitX, unitY);
    // The viewBox origin (top-left) in GL uv, whose y axis points up.
    gl.uniform2f(uniforms.uOrigin, fit.x / layout.width, 1 - fit.y / layout.height);
    gl.uniform2f(uniforms.uBlurTexel, 1 / layout.blurWidth, 1 / layout.blurHeight);
    gl.uniform1f(uniforms.uNormalScale, SURFACE_SCALE / (2 * unitsPerBlurTexel));
    gl.uniform3fv(uniforms.uKeyLight, lightVector(keyAzimuth, KEY_LIGHT_ELEVATION));
    gl.uniform3fv(uniforms.uBackLight, lightVector(keyAzimuth + 180, BACK_LIGHT_ELEVATION));
    gl.uniform2f(uniforms.uLiquidShift, liquidShift[0], liquidShift[1]);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform4fv(uniforms.uBody, theme.body);
    gl.uniform4fv(uniforms.uEdge, theme.edge);
    gl.uniform4fv(uniforms.uRim, theme.rim);
    gl.uniform4fv(uniforms.uShadow, theme.shadow);
    gl.uniform4fv(uniforms.uCaustic, theme.caustic);
    gl.uniform1f(uniforms.uLiquidAlpha, theme.liquid[3]);
    gl.uniform1f(uniforms.uOpacity, opacity);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
