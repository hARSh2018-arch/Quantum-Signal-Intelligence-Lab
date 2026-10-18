import { useEffect, useRef } from "react";
import * as THREE from "three";

function averageMagnitude(values) {
  if (!values.length) return 0;
  let total = 0;
  for (let index = 0; index < values.length; index += 1) {
    total += Math.abs(values[index]);
  }
  return total / values.length;
}

export default function IQVisualizer({ iData, qData }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const width = mountRef.current.clientWidth;
    const height = 260;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const points = [];
    const step = Math.max(1, Math.floor(iData.length / 120));
    for (let index = 0; index < iData.length; index += step) {
      points.push(iData[index] * 2.4, qData[index] * 2.4, Math.sin(index * 0.12) * 0.35);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

    const signalEnergy = Math.min(1.8, averageMagnitude(iData) + averageMagnitude(qData));

    const material = new THREE.PointsMaterial({
      color: 0x7cf7d4,
      size: 0.08 + signalEnergy * 0.035,
      transparent: true,
      opacity: Math.min(0.98, 0.72 + signalEnergy * 0.14),
    });

    const constellation = new THREE.Points(geometry, material);
    constellation.rotation.y = 0.45;
    constellation.rotation.x = 0.18;
    scene.add(constellation);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.02, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x73a5ff, transparent: true, opacity: 0.28 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = 0.25;
    scene.add(ring);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.35, 96),
      new THREE.MeshBasicMaterial({
        color: 0xf9c74f,
        transparent: true,
        opacity: 0.1 + signalEnergy * 0.06,
      }),
    );
    halo.rotation.x = Math.PI / 2;
    scene.add(halo);

    camera.position.z = 6.2;

    let frameId;
    const rotationBoost = 0.0025 + signalEnergy * 0.0035;
    const pulseStrength = 0.025 + signalEnergy * 0.035;

    const animate = (time) => {
      frameId = window.requestAnimationFrame(animate);
      const pulse = 1 + Math.sin(time * 0.0035) * pulseStrength;
      constellation.rotation.y += rotationBoost;
      constellation.rotation.x = 0.18 + Math.sin(time * 0.0016) * 0.1;
      constellation.scale.setScalar(pulse);
      ring.rotation.z += rotationBoost * 0.9;
      halo.rotation.z -= rotationBoost * 0.5;
      halo.material.opacity = 0.08 + (Math.sin(time * 0.0028) + 1) * 0.05 + signalEnergy * 0.04;
      renderer.render(scene, camera);
    };

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      const nextWidth = mountRef.current.clientWidth;
      renderer.setSize(nextWidth, height);
      camera.aspect = nextWidth / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      halo.geometry.dispose();
      halo.material.dispose();
      renderer.dispose();
    };
  }, [iData, qData]);

  return (
    <div className="glass-panel rounded-3xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">IQ Constellation</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Three.js</span>
      </div>
      <div ref={mountRef} className="h-[260px] w-full overflow-hidden rounded-2xl bg-slate-950/40" />
    </div>
  );
}
