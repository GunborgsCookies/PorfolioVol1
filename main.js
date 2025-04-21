document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 DOM är laddad");

  let scene, camera, renderer, model, pivot;
  let isDarkMode = document.documentElement.classList.contains("dark");
  let isHovering = false;
  let currentMode = isDarkMode ? "dark" : "light";
  let originalProjectText = "";
  let originalProjectHeading = "";
  let glitchCycleRef = null;
  let glitchTitleRef = null;

  const canvas = document.querySelector("#c");
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;

  pivot = new THREE.Group();
  scene.add(pivot);

  const loader = new THREE.GLTFLoader();
  let ambient, light, hemiLight, shadowPlane;

  function setLighting(isDark) {
    if (ambient) scene.remove(ambient);
    if (light) scene.remove(light);
    if (hemiLight) scene.remove(hemiLight);

    const lightColor = 0xffffff;
    const intensity = isDark ? 1 : 1.2;

    ambient = new THREE.AmbientLight(lightColor, intensity * 0.5);
    light = new THREE.DirectionalLight(lightColor, intensity);
    light.position.set(0, 5, 5);
    light.castShadow = false;

    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemiLight.position.set(0, 10, 0);

    scene.add(ambient);
    scene.add(light);
    scene.add(hemiLight);

    document.documentElement.classList.toggle("dark", isDark);
  }

  function loadModel(mode) {
    if (model) pivot.remove(model);
    loader.load(`src/assets/models/${mode}_mode.glb`, (gltf) => {
      model = gltf.scene;
      const isMobile = window.innerWidth < 768;
      const scaleFactor = 0.05;
      model.scale.set(0, 0, 0);
      model.rotation.set(-Math.PI / 2, 0, 2);
      model.position.set(-1.0, isMobile ? -1.5 : -3.0, 0.7);
      pivot.add(model);

      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.material.transparent = true;
          child.material.opacity = 0;
          gsap.to(child.material, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });

      gsap.to(model.position, {
        x: -2.2,
        y: isMobile ? 3.0 : 1.3,
        z: 0.0,
        duration: 0.2,
        ease: "power3.out",
        onComplete: () => {
          gsap.to(model.scale, {
            x: scaleFactor,
            y: scaleFactor,
            z: scaleFactor,
            duration: 1.0,
            ease: "power4.out"
          });
        }
      });

      if (shadowPlane) pivot.remove(shadowPlane);

      const textureLoader = new THREE.TextureLoader();
      const shadowTexture = textureLoader.load("src/assets/images/skugga.png");

      shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.set(-2.1, 0.03, isMobile ? 0.4 : 0.6);
      shadowPlane.renderOrder = -1;
      pivot.add(shadowPlane);
    });
  }

  const toggleButton = document.getElementById("toggleButton");
  const modeIcon = document.getElementById("modeIcon");
  const modeText = document.getElementById("modeText");

  toggleButton?.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    currentMode = isDarkMode ? "dark" : "light";
    setLighting(isDarkMode);
    loadModel(currentMode);

    if (modeIcon && modeText) {
      if (isDarkMode) {
        modeIcon.textContent = "☀️";
        modeText.textContent = "Ljust läge";
      } else {
        modeIcon.textContent = "💀";
        modeText.textContent = "Mörkt läge";
      }
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    loadModel(currentMode);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  let idleTween;
  function startIdle() {
    if (idleTween || isHovering) return;
    idleTween = gsap.to(pivot.rotation, {
      y: 0.05,
      x: -0.01,
      duration: 2,
      yoyo: true,
      repeat: -1
    });
  }

  function stopIdle() {
    if (idleTween) {
      idleTween.kill();
      idleTween = null;
    }
  }

  function lookLeft() {
    stopIdle();
    gsap.to(pivot.rotation, { y: -Math.PI / 12, x: Math.PI / 12, duration: 0.6 });
  }

  function lookRight() {
    stopIdle();
    gsap.to(pivot.rotation, { y: Math.PI / 12, x: Math.PI / 12, duration: 0.6 });
  }

  function lookUpRight() {
    stopIdle();
    gsap.to(pivot.rotation, {
      x: -Math.PI / 12,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  function lookAtToggle() {
    stopIdle();
    gsap.to(pivot.rotation, {
      x: -Math.PI / 12,
      y: Math.PI / 8,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  function lookCenter() {
    stopIdle();
    gsap.to(pivot.rotation, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        if (!isHovering) startIdle();
      }
    });
  }

  window.lookLeft = lookLeft;
  window.lookRight = lookRight;
  window.lookCenter = lookCenter;
  window.lookAtToggle = lookAtToggle;
  window.lookUpRight = lookUpRight;

  setLighting(isDarkMode);
  loadModel(currentMode);
  animate();
  startIdle();

  function setupHover(selector, onEnter, onLeave) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener("mouseenter", () => {
        isHovering = true;
        onEnter();

        const overlay = document.getElementById("hero-overlay");
        if (el.classList.contains("see-portfolio-button") && overlay) {
          gsap.to(overlay, {
            opacity: 1,
            background: "linear-gradient(90deg, rgba(0,200,255,0.6), rgba(255,0,150,0.6))",
            duration: 0.15,
            ease: "power1.out"
          });
        }

        if (el.classList.contains("see-projects-button")) {
          const textCol = document.querySelector("#code-column");
          const pTag = textCol?.querySelector("p");
          const hTag = textCol?.querySelector("h1, h2, h3");

          if (pTag && hTag) {
            originalProjectText = pTag.innerHTML;
            originalProjectHeading = hTag.innerHTML;

            const glitchHTMLs = [
              "<code class='block'>p></code><code class='block'>[...web]</code>",
              "<code class='block'>&lt;/hello&gt;</code><code class='block'>function(){}</code>",
              "<code class='block'>console.log</code><code class='block'>'404'</code>",
              "<code class='block'>{ port }</code><code class='block'>{ folio }</code>"
            ];
            const glitchHeads = ["<h2>Webbutveckling</2h>"];

            let i = 0;
            glitchCycleRef = setInterval(() => {
              pTag.innerHTML = glitchHTMLs[i % glitchHTMLs.length];
              i++;
            }, 100);

            glitchTitleRef = setTimeout(() => {
              hTag.textContent = glitchHeads[Math.floor(Math.random() * glitchHeads.length)];
              hTag.style.fontFamily = 'monospace';
              hTag.style.color = '#ff4d4d';
              hTag.style.fontSize = '1.1rem';
              gsap.fromTo(hTag, { scale: 1 }, { scale: 1.3, yoyo: true, repeat: 1, duration: 0.2 });
            }, 200);
          }
        }
      });

      el.addEventListener("mouseleave", () => {
        isHovering = false;
        onLeave();

        clearInterval(glitchCycleRef);
        clearTimeout(glitchTitleRef);

        const textCol = document.querySelector("#code-column");
        const pTag = textCol?.querySelector("p");
        const hTag = textCol?.querySelector("h1, h2, h3");
        if (pTag && originalProjectText) pTag.innerHTML = originalProjectText;
        if (hTag && originalProjectHeading) {
          hTag.textContent = originalProjectHeading;
          hTag.style.fontFamily = '';
          hTag.style.color = '';
          hTag.style.fontSize = '';
        }

        const overlay = document.getElementById("hero-overlay");
        if (overlay) {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.2,
            ease: "power1.inOut"
          });
        }
      });
    });
  }

  setupHover(".menu-link", lookUpRight, lookCenter);
  setupHover("#toggleButton", lookAtToggle, lookCenter);
  setupHover(".see-portfolio-button", lookLeft, lookCenter);
  setupHover(".see-projects-button", lookRight, lookCenter);
});
