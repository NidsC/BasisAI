import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Float, Text, Html } from '@react-three/drei';
import { useState, useRef } from 'react';
import * as THREE from 'three';

function Digester({ position, dimensions, data, isSelected, onClick }) {
  const meshRef = useRef();
  const { radius, height } = dimensions;

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 1.1, height, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#00ff88' : '#4a9eff'}
          metalness={0.4}
          roughness={0.3}
          emissive={isSelected ? '#00ff88' : '#4a9eff'}
          emissiveIntensity={isSelected ? 0.4 : 0.2}
        />
      </mesh>
      <mesh position={[0, height + 0.3, 0]}>
        <coneGeometry args={[radius * 0.3, 0.6, 16]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.3} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[radius * 0.7, height * 0.3, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
      </mesh>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <Text
          position={[0, height + 1.2, 0]}
          fontSize={0.3}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          {data.name.replace('Anaerobic ', '')}
        </Text>
      </Float>
    </group>
  );
}

function GasStorage({ position, dimensions, data, isSelected, onClick }) {
  const { radius } = dimensions;

  return (
    <group position={position} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#00ff88' : '#22dd66'}
          metalness={0.3}
          roughness={0.4}
          emissive={isSelected ? '#00ff88' : '#22dd66'}
          emissiveIntensity={isSelected ? 0.4 : 0.25}
        />
      </mesh>
      <mesh position={[0, -radius - 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 1, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.2} />
      </mesh>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <Text
          position={[0, radius + 0.8, 0]}
          fontSize={0.3}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          Gas Storage
        </Text>
      </Float>
    </group>
  );
}

function CHPUnit({ position, dimensions, data, isSelected, onClick }) {
  const { width, height, depth } = dimensions;

  return (
    <group position={position} onClick={onClick}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isSelected ? '#00ff88' : '#ff8844'}
          metalness={0.4}
          roughness={0.3}
          emissive={isSelected ? '#00ff88' : '#ff8844'}
          emissiveIntensity={isSelected ? 0.4 : 0.25}
        />
      </mesh>
      <mesh position={[width * 0.3, height + 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#777" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[-width * 0.3, height * 0.5, depth * 0.6]}>
        <boxGeometry args={[0.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <Text
          position={[0, height + 1, 0]}
          fontSize={0.25}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          {data.name}
        </Text>
      </Float>
    </group>
  );
}

function Upgrader({ position, dimensions, data, isSelected, onClick }) {
  const { width, height, depth } = dimensions;

  return (
    <group position={position} onClick={onClick}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isSelected ? '#00ff88' : '#aa66ff'}
          metalness={0.4}
          roughness={0.3}
          emissive={isSelected ? '#00ff88' : '#aa66ff'}
          emissiveIntensity={isSelected ? 0.4 : 0.25}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-width * 0.3 + i * width * 0.3, height + 0.3, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
          <meshStandardMaterial color="#bbb" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <Text
          position={[0, height + 1, 0]}
          fontSize={0.25}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          Membrane Upgrader
        </Text>
      </Float>
    </group>
  );
}

function HeatExchanger({ position, dimensions, data, isSelected, onClick }) {
  const { width, height, depth } = dimensions;

  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]} onClick={onClick}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[width / 2, width / 2, depth, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color={isSelected ? '#00ff88' : '#ff6666'}
          metalness={0.4}
          roughness={0.3}
          emissive={isSelected ? '#00ff88' : '#ff6666'}
          emissiveIntensity={isSelected ? 0.4 : 0.25}
        />
      </mesh>
      <mesh position={[0, height / 2, depth / 2 + 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2 - 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#4444ff" emissive="#4444ff" emissiveIntensity={0.3} />
      </mesh>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <Text
          position={[0, height + 0.8, 0]}
          fontSize={0.22}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, -Math.PI / 4, 0]}
        >
          Heat Exchanger
        </Text>
      </Float>
    </group>
  );
}

function DigestateTank({ position, dimensions, data, isSelected, onClick }) {
  const { radius, height } = dimensions;

  return (
    <group position={position} onClick={onClick}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#00ff88' : '#ddaa55'}
          metalness={0.4}
          roughness={0.4}
          emissive={isSelected ? '#00ff88' : '#ddaa55'}
          emissiveIntensity={isSelected ? 0.4 : 0.2}
        />
      </mesh>
      <mesh position={[0, height + 0.1, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius * 1.05, 0.2, 32]} />
        <meshStandardMaterial color="#999" metalness={0.5} roughness={0.3} />
      </mesh>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <Text
          position={[0, height + 0.8, 0]}
          fontSize={0.25}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
        >
          Digestate Storage
        </Text>
      </Float>
    </group>
  );
}

function Pipes({ equipment }) {
  const digesters = equipment.filter((e) => e.type === 'digester');
  const storage = equipment.find((e) => e.type === 'storage');
  const chps = equipment.filter((e) => e.type === 'chp');
  const upgrader = equipment.find((e) => e.type === 'upgrader');

  const pipes = [];

  digesters.forEach((digester, i) => {
    if (storage) {
      pipes.push({
        key: `digester-storage-${i}`,
        points: [
          new THREE.Vector3(digester.position[0] + 2, 3, digester.position[2]),
          new THREE.Vector3(storage.position[0] - 2, 2, storage.position[2]),
        ],
        color: '#00ff88',
      });
    }
  });

  if (storage && chps.length > 0) {
    chps.forEach((chp, i) => {
      pipes.push({
        key: `storage-chp-${i}`,
        points: [
          new THREE.Vector3(storage.position[0] + 2, 2, storage.position[2]),
          new THREE.Vector3(chp.position[0] - 1, 1, chp.position[2]),
        ],
        color: '#ff8800',
      });
    });
  }

  if (storage && upgrader) {
    pipes.push({
      key: 'storage-upgrader',
      points: [
        new THREE.Vector3(storage.position[0], 0, storage.position[2] + 2),
        new THREE.Vector3(upgrader.position[0], 1, upgrader.position[2] - 1),
      ],
      color: '#8b5cf6',
    });
  }

  return (
    <>
      {pipes.map((pipe) => {
        const curve = new THREE.CatmullRomCurve3(pipe.points);
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={pipe.key} geometry={geometry}>
            <lineBasicMaterial color={pipe.color} linewidth={2} />
          </line>
        );
      })}
    </>
  );
}

function Scene({ equipment, selectedEquipment, onSelectEquipment }) {
  const renderEquipment = (item) => {
    const isSelected = selectedEquipment?.id === item.id;
    const handleClick = (e) => {
      e.stopPropagation();
      onSelectEquipment(item);
    };

    switch (item.type) {
      case 'digester':
        return (
          <Digester
            key={item.id}
            position={item.position}
            dimensions={item.dimensions}
            data={item}
            isSelected={isSelected}
            onClick={handleClick}
          />
        );
      case 'storage':
        return (
          <GasStorage
            key={item.id}
            position={item.position}
            dimensions={item.dimensions}
            data={item}
            isSelected={isSelected}
            onClick={handleClick}
          />
        );
      case 'chp':
        return (
          <CHPUnit
            key={item.id}
            position={item.position}
            dimensions={item.dimensions}
            data={item}
            isSelected={isSelected}
            onClick={handleClick}
          />
        );
      case 'upgrader':
        return (
          <Upgrader
            key={item.id}
            position={item.position}
            dimensions={item.dimensions}
            data={item}
            isSelected={isSelected}
            onClick={handleClick}
          />
        );
      case 'heatExchanger':
        return (
          <HeatExchanger
            key={item.id}
            position={item.position}
            dimensions={item.dimensions}
            data={item}
            isSelected={isSelected}
            onClick={handleClick}
          />
        );
      case 'tank':
        return (
          <DigestateTank
            key={item.id}
            position={item.position}
            dimensions={item.dimensions}
            data={item}
            isSelected={isSelected}
            onClick={handleClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 15, -10]} intensity={0.5} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={0.4} color="#ffffff" />

      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#cccccc"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#ffffff"
        fadeDistance={80}
        position={[0, -0.01, 0]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1a1a24" />
      </mesh>

      {equipment.map(renderEquipment)}
      <Pipes equipment={equipment} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export default function PlantViewport({ plantData, selectedEquipment, onSelectEquipment }) {
  if (!plantData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f] flex items-center justify-center border border-[#2a2a38]">
            <svg
              className="w-12 h-12 text-[#00d4ff] opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <p className="text-[#6b7280] text-lg">Enter parameters and generate a design</p>
          <p className="text-[#4b5563] text-sm mt-2">3D plant visualization will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [20, 15, 25], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #0a0a0f 0%, #12121a 100%)' }}
      >
        <Scene
          equipment={plantData.equipment}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={onSelectEquipment}
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-4 py-2 text-xs text-[#6b7280]">
        <span className="text-[#00d4ff]">Click</span> equipment for details •{' '}
        <span className="text-[#00d4ff]">Drag</span> to rotate •{' '}
        <span className="text-[#00d4ff]">Scroll</span> to zoom
      </div>
    </div>
  );
}
