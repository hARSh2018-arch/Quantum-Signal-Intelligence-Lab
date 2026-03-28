import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function IQVisualizer({ iData, qData }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const width = mountRef.current.clientWidth;
    const height = 260;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const points = [];
    for (let index = 0; index < iData.length; index += Math.max(1, Math.floor(iData.length / 120))) {
      points.push(iData[index] * 2.4, qData[index] * 2.4, Math.sin(index * 0.1) * 0.3);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

    const material = new THREE.PointsMaterial({
      color: 0x7cf7d4,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });

    const constellation = new THREE.Points(geometry, material);
    scene.add(constellation);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.02, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x73a5ff, transparent: true, opacity: 0.25 }),
    );
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    camera.position.z = 6.2;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      constellation.rotation.y += 0.004;
      ring.rotation.z += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const nextWidth = mountRef.current.clientWidth;
      renderer.setSize(nextWidth, height);
      camera.aspect = nextWidth / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
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

