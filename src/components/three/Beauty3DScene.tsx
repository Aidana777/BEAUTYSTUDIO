import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ModelSilhouette } from '../../types/shop';

export type SceneMode = 'hero' | 'promo' | 'product';

export interface Beauty3DSceneProps {
  mode: SceneMode;
  silhouette?: ModelSilhouette;
  primaryColor?: string;
  accentColor?: string;
  labelBrand?: string;
  labelTitle?: string;
  fallbackImage: string;
  fallbackAlt: string;
  interactiveControls?: boolean;
  heroComposition?: 'ritual' | 'fragrance' | 'makeup';
  exploded?: boolean;
  className?: string;
}

const _targetVec = new THREE.Vector3();

function detectSoftwareWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return { supported: false, isSoftwareGl: true };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
}

function createLabelTexture(brand: string, title: string, accentHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FCF9F4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = 'rgba(28, 26, 29, 0.14)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    ctx.fillStyle = '#1C1A1D';
    ctx.textAlign = 'center';
    ctx.font = '600 32px Georgia, serif';
    ctx.fillText(brand.toUpperCase(), canvas.width / 2, 124);

    ctx.fillStyle = accentHex;
    ctx.fillRect(canvas.width / 2 - 48, 152, 96, 2);

    ctx.fillStyle = '#3B3539';
    ctx.font = '500 26px sans-serif';
    const shortTitle = title.length > 22 ? title.slice(0, 22) + '…' : title;
    ctx.fillText(shortTitle, canvas.width / 2, 212);

    ctx.fillStyle = '#756B72';
    ctx.font = '400 18px sans-serif';
    ctx.fillText('BEAUTY STUDIO ATELIER', canvas.width / 2, 295);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTravertineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ECE4D8';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 65; i++) {
      const y = (i * 8) % 512;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(205, 192, 174, 0.28)' : 'rgba(255, 252, 247, 0.25)';
      ctx.fillRect(0, y, 512, 2 + (i % 3));
    }
    for (let i = 0; i < 400; i++) {
      const x = (i * 73) % 512;
      const y = (i * 137) % 512;
      ctx.fillStyle = 'rgba(155, 140, 122, 0.12)';
      ctx.fillRect(x, y, 3, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(34, 24, 28, 0.34)');
    grad.addColorStop(0.55, 'rgba(34, 24, 28, 0.12)');
    grad.addColorStop(1, 'rgba(34, 24, 28, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeGlassMaterial(colorHex: string, isSoftwareGl: boolean, frosted = false): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: frosted ? 0.28 : 0.06,
    metalness: 0.02,
    transmission: isSoftwareGl ? 0 : frosted ? 0.65 : 0.9,
    transparent: true,
    opacity: isSoftwareGl ? (frosted ? 0.72 : 0.45) : 1,
    ior: 1.52,
    thickness: 0.65,
    clearcoat: 1.0,
    clearcoatRoughness: frosted ? 0.22 : 0.05,
    depthWrite: !isSoftwareGl ? true : false,
  });
}

function makeGoldMaterial(hex = '#D4AF6A'): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex),
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.4,
    anisotropy: 0.65,
  });
}

function buildPlinth(radius = 1.65, height = 0.18, travertineTex: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const baseGeo = new THREE.CylinderGeometry(radius, radius * 1.03, height, 64);
  const rimGeo = new THREE.TorusGeometry(radius * 0.985, 0.018, 12, 64);
  const stoneMat = new THREE.MeshStandardMaterial({
    map: travertineTex,
    roughness: 0.82,
    metalness: 0.02,
  });
  const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
  baseMesh.position.y = height / 2;
  baseMesh.receiveShadow = true;
  baseMesh.castShadow = true;

  const rimMesh = new THREE.Mesh(rimGeo, stoneMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = height - 0.008;

  group.add(baseMesh, rimMesh);
  return group;
}

function buildSerumBottle(
  colorHex: string,
  accentHex: string,
  brand: string,
  title: string,
  isSoftwareGl: boolean,
): THREE.Group {
  const group = new THREE.Group();
  group.userData.parts = [];

  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.46, 0),
    new THREE.Vector2(0.5, 0.06),
    new THREE.Vector2(0.5, 1.05),
    new THREE.Vector2(0.45, 1.22),
    new THREE.Vector2(0.24, 1.34),
    new THREE.Vector2(0.24, 1.52),
    new THREE.Vector2(0, 1.52),
  ];
  const bodyGeo = new THREE.LatheGeometry(profile, 48);
  const glassMat = makeGlassMaterial(colorHex, isSoftwareGl, true);
  const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
  bodyMesh.castShadow = true;
  bodyMesh.renderOrder = 2;

  const innerGeo = new THREE.CylinderGeometry(0.41, 0.41, 0.98, 36);
  const innerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex).offsetHSL(0, 0.08, -0.05),
    roughness: 0.35,
    metalness: 0.05,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  innerMesh.position.y = 0.57;

  const labelTex = createLabelTexture(brand, title, accentHex);
  const labelGeo = new THREE.CylinderGeometry(0.506, 0.506, 0.68, 40, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.55,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.62;
  labelMesh.renderOrder = 3;

  const collarGeo = new THREE.CylinderGeometry(0.27, 0.28, 0.24, 40);
  const goldMat = makeGoldMaterial(accentHex);
  const collarMesh = new THREE.Mesh(collarGeo, goldMat);
  collarMesh.position.y = 1.48;
  collarMesh.castShadow = true;
  collarMesh.userData.explodeOffset = 0.42;

  const bulbGeo = new THREE.CapsuleGeometry(0.145, 0.24, 12, 32);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F5EAE8'),
    roughness: 0.72,
    metalness: 0.02,
  });
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
  bulbMesh.position.y = 1.76;
  bulbMesh.castShadow = true;
  bulbMesh.userData.explodeOffset = 0.65;

  const pipetteGeo = new THREE.CylinderGeometry(0.032, 0.022, 1.05, 16);
  const pipetteMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
  });
  const pipetteMesh = new THREE.Mesh(pipetteGeo, pipetteMat);
  pipetteMesh.position.y = 0.85;
  pipetteMesh.userData.explodeOffset = 0.55;

  group.add(innerMesh, bodyMesh, labelMesh, collarMesh, bulbMesh, pipetteMesh);
  group.userData.parts = [collarMesh, bulbMesh, pipetteMesh];
  return group;
}

function buildCreamJar(colorHex: string, accentHex: string, brand: string, title: string, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  const jarProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.56, 0),
    new THREE.Vector2(0.62, 0.07),
    new THREE.Vector2(0.62, 0.66),
    new THREE.Vector2(0.56, 0.72),
    new THREE.Vector2(0, 0.72),
  ];
  const jarGeo = new THREE.LatheGeometry(jarProfile, 48);
  const jarMat = makeGlassMaterial(colorHex, isSoftwareGl, true);
  const jarMesh = new THREE.Mesh(jarGeo, jarMat);
  jarMesh.castShadow = true;
  jarMesh.renderOrder = 2;

  const creamCoreGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.56, 36);
  const creamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FBF3EE'),
    roughness: 0.45,
    metalness: 0.02,
  });
  const creamCore = new THREE.Mesh(creamCoreGeo, creamMat);
  creamCore.position.y = 0.34;

  const swirlGeo = new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const swirl = new THREE.Mesh(swirlGeo, creamMat);
  swirl.position.y = 0.52;
  swirl.scale.set(1.2, 0.45, 1.2);

  const labelTex = createLabelTexture(brand, title, accentHex);
  const labelGeo = new THREE.CylinderGeometry(0.625, 0.625, 0.38, 40, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.36;
  labelMesh.renderOrder = 3;

  const lidGeo = new THREE.CylinderGeometry(0.635, 0.635, 0.24, 48);
  const goldMat = makeGoldMaterial(accentHex);
  const lidMesh = new THREE.Mesh(lidGeo, goldMat);
  lidMesh.position.y = 0.81;
  lidMesh.castShadow = true;
  lidMesh.userData.explodeOffset = 0.52;

  const lidBevelGeo = new THREE.TorusGeometry(0.615, 0.02, 12, 48);
  const lidBevel = new THREE.Mesh(lidBevelGeo, goldMat);
  lidBevel.rotation.x = Math.PI / 2;
  lidBevel.position.y = 0.92;
  lidBevel.userData.explodeOffset = 0.52;

  group.add(creamCore, swirl, jarMesh, labelMesh, lidMesh, lidBevel);
  group.userData.parts = [lidMesh, lidBevel];
  return group;
}

function buildFragranceFlacon(colorHex: string, accentHex: string, brand: string, title: string, isSoftwareGl: boolean): THREE.Group {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.62, 0.58, 1.12, 8);
  const crystalMat = makeGlassMaterial('#FFFFFF', isSoftwareGl, false);
  const bodyMesh = new THREE.Mesh(bodyGeo, crystalMat);
  bodyMesh.position.y = 0.6;
  bodyMesh.castShadow = true;
  bodyMesh.renderOrder = 2;

  const liquidGeo = new THREE.CylinderGeometry(0.5, 0.47, 0.84, 8);
  const liquidMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.15,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.position.y = 0.54;

  const tubeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.95, 12);
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
  tubeMesh.position.y = 0.65;

  const neckGeo = new THREE.CylinderGeometry(0.18, 0.21, 0.16, 32);
  const goldMat = makeGoldMaterial(accentHex);
  const neckMesh = new THREE.Mesh(neckGeo, goldMat);
  neckMesh.position.y = 1.24;

  const capGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.46, 32);
  const capMesh = new THREE.Mesh(capGeo, goldMat);
  capMesh.position.y = 1.54;
  capMesh.castShadow = true;
  capMesh.userData.explodeOffset = 0.48;

  const labelTex = createLabelTexture(brand, title, accentHex);
  const labelGeo = new THREE.PlaneGeometry(0.58, 0.42);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.45,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.set(0, 0.62, 0.56);
  labelMesh.renderOrder = 3;

  group.add(liquidMesh, tubeMesh, bodyMesh, labelMesh, neckMesh, capMesh);
  group.userData.parts = [capMesh];
  return group;
}

function buildLipstick(colorHex: string, accentHex: string): THREE.Group {
  const group = new THREE.Group();
  const goldMat = makeGoldMaterial(accentHex);
  const darkGoldMat = makeGoldMaterial('#B79253');

  const baseGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.72, 40);
  const baseMesh = new THREE.Mesh(baseGeo, goldMat);
  baseMesh.position.y = 0.36;
  baseMesh.castShadow = true;

  const ringGeo = new THREE.TorusGeometry(0.282, 0.018, 12, 40);
  const ringMesh = new THREE.Mesh(ringGeo, darkGoldMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.72;

  const sleeveGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.56, 40);
  const sleeveMesh = new THREE.Mesh(sleeveGeo, goldMat);
  sleeveMesh.position.y = 0.98;
  sleeveMesh.castShadow = true;
  sleeveMesh.userData.explodeOffset = 0.22;

  const bulletGeo = new THREE.CylinderGeometry(0.14, 0.19, 0.54, 32);
  const bulletMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.38,
    metalness: 0.02,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
  });
  const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
  bulletMesh.position.y = 1.48;
  bulletMesh.castShadow = true;
  bulletMesh.userData.explodeOffset = 0.45;

  const tipGeo = new THREE.ConeGeometry(0.14, 0.18, 32);
  const tipMesh = new THREE.Mesh(tipGeo, bulletMat);
  tipMesh.position.set(0, 1.82, 0.02);
  tipMesh.rotation.x = 0.28;
  tipMesh.scale.set(1, 1, 0.75);
  tipMesh.userData.explodeOffset = 0.45;

  group.add(baseMesh, ringMesh, sleeveMesh, bulletMesh, tipMesh);
  group.userData.parts = [sleeveMesh, bulletMesh, tipMesh];
  return group;
}

function buildLotionPump(colorHex: string, accentHex: string, brand: string, title: string): THREE.Group {
  const group = new THREE.Group();

  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.48, 0),
    new THREE.Vector2(0.52, 0.08),
    new THREE.Vector2(0.52, 1.25),
    new THREE.Vector2(0.38, 1.45),
    new THREE.Vector2(0.2, 1.54),
    new THREE.Vector2(0, 1.54),
  ];
  const bodyGeo = new THREE.LatheGeometry(profile, 48);
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.58,
    metalness: 0.04,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, ceramicMat);
  bodyMesh.castShadow = true;

  const labelTex = createLabelTexture(brand, title, accentHex);
  const labelGeo = new THREE.CylinderGeometry(0.525, 0.525, 0.78, 40, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.68;

  const collarGeo = new THREE.CylinderGeometry(0.23, 0.24, 0.2, 32);
  const goldMat = makeGoldMaterial(accentHex);
  const collarMesh = new THREE.Mesh(collarGeo, goldMat);
  collarMesh.position.y = 1.63;
  collarMesh.userData.explodeOffset = 0.35;

  const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 24);
  const stemMesh = new THREE.Mesh(stemGeo, goldMat);
  stemMesh.position.y = 1.82;
  stemMesh.userData.explodeOffset = 0.45;

  const spoutGeo = new THREE.BoxGeometry(0.14, 0.08, 0.42);
  const spoutMesh = new THREE.Mesh(spoutGeo, goldMat);
  spoutMesh.position.set(0, 1.94, 0.14);
  spoutMesh.userData.explodeOffset = 0.45;

  group.add(bodyMesh, labelMesh, collarMesh, stemMesh, spoutMesh);
  group.userData.parts = [collarMesh, stemMesh, spoutMesh];
  return group;
}

function buildElixirBottle(
  colorHex: string,
  accentHex: string,
  brand: string,
  title: string,
  isSoftwareGl: boolean,
): THREE.Group {
  const group = new THREE.Group();

  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.38, 0),
    new THREE.Vector2(0.42, 0.06),
    new THREE.Vector2(0.42, 1.24),
    new THREE.Vector2(0.34, 1.44),
    new THREE.Vector2(0.18, 1.56),
    new THREE.Vector2(0.18, 1.72),
    new THREE.Vector2(0, 1.72),
  ];
  const glassGeo = new THREE.LatheGeometry(profile, 48);
  const glassMat = makeGlassMaterial(colorHex, isSoftwareGl, false);
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.castShadow = true;
  glassMesh.renderOrder = 2;

  const coreGeo = new THREE.CylinderGeometry(0.34, 0.34, 1.16, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.22,
    metalness: 0.08,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.y = 0.64;

  const collarGeo = new THREE.CylinderGeometry(0.21, 0.22, 0.2, 32);
  const goldMat = makeGoldMaterial(accentHex);
  const collarMesh = new THREE.Mesh(collarGeo, goldMat);
  collarMesh.position.y = 1.68;
  collarMesh.userData.explodeOffset = 0.4;

  const capGeo = new THREE.CapsuleGeometry(0.12, 0.22, 12, 24);
  const capMesh = new THREE.Mesh(capGeo, goldMat);
  capMesh.position.y = 1.92;
  capMesh.userData.explodeOffset = 0.55;

  const labelTex = createLabelTexture(brand, title, accentHex);
  const labelGeo = new THREE.CylinderGeometry(0.425, 0.425, 0.64, 40, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.45,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.72;
  labelMesh.renderOrder = 3;

  group.add(coreMesh, glassMesh, labelMesh, collarMesh, capMesh);
  group.userData.parts = [collarMesh, capMesh];
  return group;
}

export const Beauty3DScene: React.FC<Beauty3DSceneProps> = ({
  mode,
  silhouette = 'serum',
  primaryColor = '#E8B4BE',
  accentColor = '#D4AF37',
  labelBrand = 'Aura Luxe',
  labelTitle = 'Rose Quartz Serum',
  fallbackImage,
  fallbackAlt,
  interactiveControls = false,
  heroComposition = 'ritual',
  exploded = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const explodedRef = useRef(exploded);
  explodedRef.current = exploded;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { supported, isSoftwareGl } = detectSoftwareWebGL();
    if (!supported) {
      setWebglFailed(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = container.clientWidth || 520;
    let height = container.clientHeight || 420;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = mode === 'hero' ? '#F8EEF0' : mode === 'promo' ? '#F2EFF7' : '#FBF9F6';
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    if (mode === 'hero') {
      camera.position.set(0.2, 2.35, 5.4);
    } else if (mode === 'promo') {
      camera.position.set(0.4, 2.0, 4.4);
    } else {
      camera.position.set(0.2, 1.85, 4.1);
    }

    // 3-point warm/cool studio lighting
    const hemiLight = new THREE.HemisphereLight(0xf6f3ff, 0xe8d9d2, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
    keyLight.position.set(3.5, 5.5, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfcd9e5, 1.15);
    rimLight.position.set(-4, 3.2, -3.5);
    scene.add(rimLight);

    const travertineTex = createTravertineTexture();
    travertineTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.75,
      }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const plinthRadius = mode === 'hero' ? 1.8 : 1.3;
    const plinthHeight = 0.18;
    const plinth = buildPlinth(plinthRadius, plinthHeight, travertineTex);
    stageGroup.add(plinth);

    const animatedObjects: THREE.Group[] = [];
    const partBaselines = new Map<THREE.Object3D, number>();

    const registerExplodable = (grp: THREE.Group) => {
      const parts = (grp.userData.parts as THREE.Object3D[] | undefined) || [];
      parts.forEach((p) => {
        partBaselines.set(p, p.position.y);
      });
    };

    if (mode === 'hero') {
      if (heroComposition === 'ritual') {
        const serum = buildSerumBottle('#E8B4BE', '#D4AF37', 'Aura Luxe', 'Rose Quartz', isSoftwareGl);
        serum.position.set(-0.55, plinthHeight, 0.15);
        serum.scale.setScalar(0.95);

        const cream = buildCreamJar('#F0D5DC', '#C5A059', 'Aura Luxe', 'Ceramide Cream', isSoftwareGl);
        cream.position.set(0.62, plinthHeight, 0.35);
        cream.scale.setScalar(0.86);

        const flacon = buildFragranceFlacon('#F3C7BB', '#D89C82', 'Maison Rosé', 'Rose Crystal', isSoftwareGl);
        flacon.position.set(0.12, plinthHeight, -0.45);
        flacon.scale.setScalar(0.92);

        stageGroup.add(serum, cream, flacon);
        animatedObjects.push(serum, cream, flacon);
      } else if (heroComposition === 'fragrance') {
        const flacon = buildFragranceFlacon('#F3C7BB', '#D89C82', 'Maison Rosé', 'Rose Crystal', isSoftwareGl);
        flacon.position.set(-0.15, plinthHeight, 0.05);
        flacon.scale.setScalar(1.12);

        const elixir = buildElixirBottle('#DFD2EA', '#C5A059', 'Maison Rosé', 'Velvet Iris', isSoftwareGl);
        elixir.position.set(0.82, plinthHeight, -0.2);
        elixir.scale.setScalar(0.82);

        stageGroup.add(flacon, elixir);
        animatedObjects.push(flacon, elixir);
      } else {
        const lip1 = buildLipstick('#C2747D', '#D5B26E');
        lip1.position.set(-0.48, plinthHeight, 0.15);
        lip1.scale.setScalar(0.98);

        const lip2 = buildLipstick('#E05749', '#D5B26E');
        lip2.position.set(0.18, plinthHeight, 0.32);
        lip2.scale.setScalar(0.92);

        const compact = buildCreamJar('#F4EAE3', '#C5A059', 'Velvet Bloom', 'Silk Blush', isSoftwareGl);
        compact.position.set(0.75, plinthHeight, -0.35);
        compact.scale.setScalar(0.8);

        stageGroup.add(lip1, lip2, compact);
        animatedObjects.push(lip1, lip2, compact);
      }
    } else if (mode === 'promo') {
      const serum = buildSerumBottle(primaryColor, accentColor, labelBrand, labelTitle, isSoftwareGl);
      serum.position.set(-0.4, plinthHeight, 0.1);
      serum.scale.setScalar(1.0);

      const jar = buildCreamJar(primaryColor, accentColor, labelBrand, 'Night Comfort', isSoftwareGl);
      jar.position.set(0.55, plinthHeight, 0.2);
      jar.scale.setScalar(0.85);

      registerExplodable(serum);
      registerExplodable(jar);
      stageGroup.add(serum, jar);
      animatedObjects.push(serum, jar);
    } else {
      let model: THREE.Group;
      if (silhouette === 'cream') {
        model = buildCreamJar(primaryColor, accentColor, labelBrand, labelTitle, isSoftwareGl);
        model.scale.setScalar(1.18);
      } else if (silhouette === 'lipstick') {
        model = buildLipstick(primaryColor, accentColor);
        model.scale.setScalar(1.02);
      } else if (silhouette === 'fragrance') {
        model = buildFragranceFlacon(primaryColor, accentColor, labelBrand, labelTitle, isSoftwareGl);
        model.scale.setScalar(1.05);
      } else if (silhouette === 'lotion') {
        model = buildLotionPump(primaryColor, accentColor, labelBrand, labelTitle);
        model.scale.setScalar(0.96);
      } else if (silhouette === 'elixir') {
        model = buildElixirBottle(primaryColor, accentColor, labelBrand, labelTitle, isSoftwareGl);
        model.scale.setScalar(0.95);
      } else {
        model = buildSerumBottle(primaryColor, accentColor, labelBrand, labelTitle, isSoftwareGl);
        model.scale.setScalar(1.04);
      }
      model.position.set(0, plinthHeight, 0);
      registerExplodable(model);
      stageGroup.add(model);
      animatedObjects.push(model);
    }

    let controls: OrbitControls | null = null;
    if (interactiveControls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = 2.6;
      controls.maxDistance = 7.5;
      controls.minPolarAngle = Math.PI * 0.16;
      controls.maxPolarAngle = Math.PI * 0.48;
      controls.target.set(0, 0.95, 0);
      controls.update();
    } else {
      camera.lookAt(0, 0.92, 0);
    }

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (mode !== 'hero' || prefersReducedMotion) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 520;
      height = container.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let explodeProgress = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        if (mode === 'hero') {
          const targetRotY = pointerX * 0.24 + Math.sin(elapsed * 0.45) * 0.16;
          const targetRotX = pointerY * 0.07;
          stageGroup.rotation.y = THREE.MathUtils.damp(stageGroup.rotation.y, targetRotY, 3.5, dt);
          stageGroup.rotation.x = THREE.MathUtils.damp(stageGroup.rotation.x, targetRotX, 3.5, dt);
          animatedObjects.forEach((obj, idx) => {
            obj.position.y = plinthHeight + Math.sin(elapsed * 1.1 + idx * 1.3) * 0.025;
          });
        } else {
          stageGroup.rotation.y += dt * 0.28;
        }
      }

      const targetExplode = explodedRef.current ? 1 : 0;
      explodeProgress = THREE.MathUtils.damp(explodeProgress, targetExplode, 6, dt);
      partBaselines.forEach((baseY, part) => {
        const offset = (part.userData.explodeOffset as number | undefined) ?? 0;
        part.position.y = baseY + offset * explodeProgress;
      });

      if (controls) {
        _targetVec.set(0, 0.95, 0);
        controls.update();
      }

      renderer.render(scene, camera);

      if (prefersReducedMotion && !interactiveControls) {
        return; // Single clean frame when reduced motion is preferred and no OrbitControls
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls?.dispose();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (!m) return;
            const stdMat = m as THREE.MeshStandardMaterial;
            stdMat.map?.dispose();
            m.dispose();
          });
        }
      });
      envTarget.dispose();
      travertineTex.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, [mode, silhouette, primaryColor, accentColor, labelBrand, labelTitle, interactiveControls, heroComposition]);

  if (webglFailed) {
    return (
      <div className={`relative overflow-hidden bg-[#F8EEF0] ${className}`}>
        <img
          src={fallbackImage}
          alt={fallbackAlt}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={mountRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        aria-label={fallbackAlt}
        role="img"
      />
    </div>
  );
};
