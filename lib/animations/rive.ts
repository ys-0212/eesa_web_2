// Lazy Rive runtime loader. Uses the same runtime as the reference (@rive-app/canvas 2.38.5)
// but serves the WASM from /public instead of unpkg.

import type { Rive as RiveInstance } from '@rive-app/canvas';

type RiveModule = typeof import('@rive-app/canvas');

let modulePromise: Promise<RiveModule> | null = null;

export function loadRive(wasmUrl: string) {
  if (!modulePromise) {
    modulePromise = import('@rive-app/canvas').then((mod) => {
      mod.RuntimeLoader.setWasmUrl(wasmUrl);
      return mod;
    });
  }
  return modulePromise;
}

/** Rive's canvas renderer needs WebGL for image meshes; the reference skips Rive without it. */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl || typeof gl.getExtension !== 'function') return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export type { RiveInstance };
