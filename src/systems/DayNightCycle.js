import * as THREE from 'three';

export class DayNightCycle {
  constructor(scene) {
    this.scene = scene;
    this.timeOfDay = 0.35; // 0.0 to 1.0 (0.0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset)
    this.speed = 0.005; // speed of day progression
    this.isPaused = false;

    // Lights
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 600;
    const shadowD = 120;
    this.sunLight.shadow.camera.left = -shadowD;
    this.sunLight.shadow.camera.right = shadowD;
    this.sunLight.shadow.camera.top = shadowD;
    this.sunLight.shadow.camera.bottom = -shadowD;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Moon light
    this.moonLight = new THREE.DirectionalLight(0x7dd3fc, 0.3);
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);

    // Dynamic night objects list (street lamps, window emissive materials, etc.)
    this.nightLights = [];

    // Jungle fireflies particle system
    this.initFireflies();

    // Scene Fog
    this.scene.fog = new THREE.FogExp2(0xd6e4ff, 0.0018);

    this.updateLights(0, new THREE.Vector3(0, 0, 0));
  }

  registerNightLight(lightOrMaterial) {
    this.nightLights.push(lightOrMaterial);
  }

  initFireflies() {
    const fireflyCount = 300;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);
    const phases = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      // Scatter in the forest/jungle area (x: -500 to -40, z: -500 to 300)
      positions[i * 3 + 0] = -500 + Math.random() * 460;
      positions[i * 3 + 1] = 1.5 + Math.random() * 4.5;
      positions[i * 3 + 2] = -500 + Math.random() * 800;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: 1.8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    this.fireflies = new THREE.Points(geom, mat);
    this.fireflyPhases = phases;
    this.scene.add(this.fireflies);
  }

  setTime(t) {
    this.timeOfDay = ((t % 1) + 1) % 1;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  getTimeFormatted() {
    const totalMinutes = Math.floor(this.timeOfDay * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const pad = (n) => (n < 10 ? '0' + n : n);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${pad(displayHours)}:${pad(minutes)} ${ampm}`;
  }

  update(delta, targetPos) {
    if (!this.isPaused) {
      this.timeOfDay = (this.timeOfDay + delta * this.speed) % 1.0;
    }

    this.updateLights(delta, targetPos);
    this.updateFireflies(delta);
  }

  updateLights(delta, targetPos) {
    // Sun angle: 0.25 is dawn, 0.5 is zenith, 0.75 is dusk, 0.0/1.0 is midnight
    const angle = (this.timeOfDay - 0.25) * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    const sunCos = Math.cos(angle);

    const sunOrbitDist = 280;
    const focus = targetPos || new THREE.Vector3(0, 0, 0);

    // Sun position
    this.sunLight.position.set(
      focus.x + sunCos * sunOrbitDist,
      focus.y + Math.max(-20, sunHeight * sunOrbitDist),
      focus.z + 90
    );
    this.sunLight.target.position.copy(focus);
    this.sunLight.target.updateMatrixWorld();

    // Moon position
    this.moonLight.position.set(
      focus.x - sunCos * sunOrbitDist,
      focus.y + Math.max(-20, -sunHeight * sunOrbitDist),
      focus.z - 90
    );
    this.moonLight.target.position.copy(focus);
    this.moonLight.target.updateMatrixWorld();

    // Colors and intensities depending on sun height
    const isDay = sunHeight > 0.05;
    const isDuskDawn = Math.abs(sunHeight) <= 0.25;
    const isNight = sunHeight < -0.05;

    let skyColor, groundColor, sunIntensity, sunColor;

    if (isDay && !isDuskDawn) {
      // High Day
      skyColor = new THREE.Color(0xd0e8ff);
      groundColor = new THREE.Color(0x384a2d);
      sunColor = new THREE.Color(0xfff6e5);
      sunIntensity = 1.35;
    } else if (isDuskDawn) {
      // Golden Hour / Sunrise / Sunset
      const sunsetMix = Math.max(0, 1 - Math.abs(sunHeight) * 4);
      skyColor = new THREE.Color(0xfbbf24).lerp(new THREE.Color(0xf43f5e), sunsetMix * 0.7);
      groundColor = new THREE.Color(0x2d1a20);
      sunColor = new THREE.Color(0xfdba74);
      sunIntensity = 0.9;
    } else {
      // Night
      skyColor = new THREE.Color(0x0f172a);
      groundColor = new THREE.Color(0x020617);
      sunColor = new THREE.Color(0x1e293b);
      sunIntensity = 0.0;
    }

    this.hemiLight.color.lerp(skyColor, 0.1);
    this.hemiLight.groundColor.lerp(groundColor, 0.1);
    this.hemiLight.intensity = isNight ? 0.25 : (isDuskDawn ? 0.6 : 0.85);

    this.sunLight.color.lerp(sunColor, 0.1);
    this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, Math.max(0, sunIntensity), 0.1);
    this.moonLight.intensity = THREE.MathUtils.lerp(this.moonLight.intensity, isNight ? 0.45 : 0.0, 0.1);

    if (this.scene.fog) {
      this.scene.fog.color.lerp(skyColor, 0.1);
    }
    this.scene.background = skyColor;

    // Toggle city lights, street lamps, interior lights
    const nightFactor = THREE.MathUtils.clamp((0.1 - sunHeight) * 3, 0, 1);
    for (let i = 0; i < this.nightLights.length; i++) {
      const item = this.nightLights[i];
      if (item.isLight) {
        item.intensity = item.userData.baseIntensity * nightFactor;
      } else if (item.isMaterial) {
        if (item.emissive) {
          item.emissiveIntensity = (item.userData.baseEmissive || 1.0) * nightFactor;
        }
      }
    }

    // Fireflies visibility
    if (this.fireflies) {
      this.fireflies.material.opacity = nightFactor * 0.85;
    }
  }

  updateFireflies(delta) {
    if (!this.fireflies || this.fireflies.material.opacity <= 0.01) return;
    const positions = this.fireflies.geometry.attributes.position.array;
    const time = performance.now() * 0.0015;

    for (let i = 0; i < this.fireflyPhases.length; i++) {
      const phase = this.fireflyPhases[i];
      positions[i * 3 + 1] += Math.sin(time + phase) * 0.012;
      positions[i * 3 + 0] += Math.cos(time * 0.7 + phase) * 0.015;
    }
    this.fireflies.geometry.attributes.position.needsUpdate = true;
  }
}

