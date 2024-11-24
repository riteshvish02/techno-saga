import './style.css'
import * as THREE from 'three'
// import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
let isInitialLoad = true; // Initially set to true since the first load happens
let isCarChanged = false; 
function inet(){
    gsap.registerPlugin(ScrollTrigger);
    const locoScroll = new LocomotiveScroll({
      el: document.querySelector("#main"),
      smooth: true
    });
    locoScroll.on("scroll", ScrollTrigger.update);
    
    ScrollTrigger.scrollerProxy("#main", {
      scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
      }, 
        getBoundingClientRect() {
        return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
      },
      pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
    });
    
    }
    
    inet();
    const totalItems = 28;
let loadingBarElement = document.querySelector("#progress")
let loadingBarElementh2 = document.querySelector("#dib h2")
    const loadingManager = new THREE.LoadingManager(
       // Loaded
    () =>
      {
          // Wait a little
          if (isCarChanged) {
            // Hide the car loading progress bar after the model is changed
            document.querySelector(".carload").style.display = "none";
            isCarChanged = false; // Reset the flag after the car change
        }

        // If it's the initial load, we hide the main loader and show the content
        if (isInitialLoad) {
            setTimeout(() => {
                console.log('Initial load complete');
                // Hide initial loader
                var tl1 = gsap.timeline();
                tl1.to('#loading #elem', {
                    clipPath: `polygon(0 0, 0% 0, 0% 100%, 0% 100%)`,
                    duration: 1.2,
                    ease: "power4.out",
                }, "var")
                .to('#loading', { display: 'none', delay: 0.2 }, "var2")
                .to('#selector,#nav', { display: 'flex', delay: 0.5 }, "var2");
                // Hide the main loader once the page is ready
            }, 1000);
            isInitialLoad = false; // Set it to false after the initial load is complete
        }
      },
  
      // Progress
      (itemUrl, itemsLoaded, itemsTotal) =>
      {
        const progressRatio = itemsLoaded / itemsTotal;
        const progressPercentage = (progressRatio * 100).toFixed();
        loadingBarElement.style.width = `${progressPercentage}%`;
        loadingBarElementh2.textContent = `${progressPercentage}%`;

        if (isCarChanged) {
            // Show the car loader while loading a new model
            document.querySelector(".carload").style.display = "flex";
        }

      }
  )
// Texture loading
const textureLoader = new THREE.TextureLoader(loadingManager);
const floorterrain = textureLoader.load('/textures/terrain-normal.jpg');
const floorrough = textureLoader.load('/textures/terrain-roughness.jpg');
const cubetexture = new THREE.CubeTextureLoader(loadingManager);
const env = cubetexture.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg',
]);

// GLTF and DRACO loading
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('/draco/');
dracoLoader.setDecoderConfig({ type: 'wasm', url: '/draco/draco_decoder.wasm' });
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

// Base settings
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 70;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true,});
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
// env.encoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true;
renderer.toneMappingExposure = 3    
renderer.setClearColor('#111')

const fog = new THREE.Fog('#111',50,130)
scene.fog = fog

// const gui = new dat.GUI({ width: 400, height: 400, scale: 2 });
// const Debugobj = { intensity: 1 };
// gui.add(Debugobj, 'intensity').max(10).min(1).step(1).name('intensityEnvMap').onChange(updateMaterial);
// gui.add(renderer, 'toneMapping', {
//     No: THREE.NoToneMapping,
//     Linaer: THREE.LinearToneMapping,
//     Reinhard: THREE.ReinhardToneMapping,
//     cineon: THREE.CineonToneMapping,
//     ACESFilmicg: THREE.ACESFilmicToneMapping,
// });

// Lighting
const directionlight = new THREE.DirectionalLight('#ffffff',15)
directionlight.position.set(-5.763,90,-2.25)
scene.add(directionlight)

directionlight.castShadow = true;
directionlight.shadow.mapSize.width = 2048; // Adjust as necessary
directionlight.shadow.mapSize.height = 2048;

directionlight.shadow.camera.left = -50;
directionlight.shadow.camera.right = 50;
directionlight.shadow.camera.top = 50;
directionlight.shadow.camera.bottom = -50;
directionlight.shadow.camera.near = 0.5;
directionlight.shadow.camera.far = 500;
const DirectionalLightHelper = new THREE.DirectionalLightHelper(directionlight,0.2)
// scene.add(DirectionalLightHelper)
// gui.add(directionlight,'intensity').min(0).max(25).step(0.001).name('lightIntensity')
// gui.add(directionlight.position,'x').min(-50).max(50).step(0.001).name('lightX')
// gui.add(directionlight.position,'y').min(-50).max(50).step(0.001).name('lightY')
// gui.add(directionlight.position,'z').min(-50).max(50).step(0.001).name('lightZ')
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
// gui.add(ambientLight, 'intensity').min(0).max(10).step(0.001)
scene.add(ambientLight)


// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ 
        color: '#111',
        normalMap:floorterrain,
        roughnessMap:floorrough,
        roughness: 0.8, // Lower value makes it shinier
        metalness: 1, // Higher value gives a metallic look
     })
)
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array,2)
)
floorrough.repeat.set(2,2)
floorterrain.repeat.set(5,5)
floor.receiveShadow = true; 

floorterrain.wrapS = THREE.RepeatWrapping
floorrough.wrapT = THREE.RepeatWrapping

floor.rotation.x = - Math.PI * 0.5
floor.position.y = -12.5
scene.add(floor)



const models = {
    carModel1: '/models/boxter.glb',  // Update with your model paths
    carModel2: '/models/carrera.glb',
    carModel3: '/models/cayman.glb',
    carModel4: '/models/gt3.glb',
    carModel5: '/models/scene.glb',
    carModel6:'/models/spyder.glb'
};

let model = null;
// Load model
let carPaintMesh = null;
function loadModel(modelPath, scale) {
    isCarChanged = true;

    // Show the car loader while loading the new model
    document.querySelector(".carload").style.display = "flex";
    gltfLoader.load(modelPath, (gltf) => {
        // Remove previous model if any
        if (model) {
            scene.remove(model);
        }

        model = gltf.scene;
        model.scale.set(25, 25, 25);
        model.position.set(0, 0, 0);
        scene.add(model);
        
        adjustModelForScreen();
        updateMaterial();
        var tl4 = gsap.timeline()
        tl4
        .to("#navcenter img:nth-child(1),#navcenter img:nth-child(7)",{
            transform: "translateY(0)",
            duration:1,
            ease: "power1.out",
          },"var2")
          .to("#navcenter img:nth-child(2),#navcenter img:nth-child(6)",{
            transform: "translateY(0)",
            delay:0.2,
            duration:1,
            ease: "power1.out",
          },"var2")
          .to("#navcenter img:nth-child(3),#navcenter img:nth-child(5)",{
            transform: "translateY(0)",
            delay:0.3,
            duration:1,
            ease: "power1.out",
          },"var2")
          .to("#navcenter img:nth-child(4)",{
            transform: "translateY(0)",
            delay:0.4,
            duration:1,
            ease: "power1.out",
          },"var2")
        // Optional: You can add any other functionality here like animations or light updates
    });
}
loadModel(models.carModel1, 25);

document.querySelectorAll('button[data-model]').forEach(button => {
    button.addEventListener('click', () => {
        const modelKey = button.getAttribute('data-model');
        const scale = button.getAttribute('data-scale') || 1;  // Default scale to 1 if not provided
        loadModel(models[modelKey], scale);
    });
});
function adjustModelForScreen() {
  if (model) {
      const aspectRatio = window.matchMedia("(max-width: 768px)").matches
      if (aspectRatio) { // Portrait mode
          model.scale.set(13, 13, 13)
          model.position.set(0, -4, 0)
      } else { // Landscape mode
          model.scale.set(25, 25, 25)
          model.position.set(0, 0, 0);
      }
  } 
}


// Update material
function updateMaterial() {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = env;
            // child.material.envMapIntensity = Debugobj.intensity;
            child.castShadow = true;
            child.receiveShadow = true;
        }
        // if (child.isMesh && child.material.name === 'EXT_Carpaint.004') {
        //     carPaintMesh = child;
        //     carPaintMesh.material.color.set('white');
        // }
        
       
        
       
    }); 
}

const controls = new OrbitControls(camera, canvas)

// // Restrict vertical rotation (phi) to limit top and bottom views
controls.minPolarAngle = Math.PI / 2.6; // 45 degrees
controls.maxPolarAngle = Math.PI / 2.6;
controls.enableZoom = false;
// Optionally, set damping factor for smoothness
controls.dampingFactor = 0.25; 
controls.enableDamping = true
// function changeCarPaintColor(color) {
//     if (carPaintMesh) {
//         carPaintMesh.material.color.set(color);
//     }
// }

const clock = new THREE.Clock();
// Animate
function animate() {

  controls.update();
  const elapsedTime = clock.getElapsedTime();
  if(model){
    floor.rotation.z = elapsedTime * 0.2
    model.rotation.y = elapsedTime * 0.2
  }
   // Look at the center where the car is
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    adjustModelForScreen()
});

// const colors = ['#FFCC00', '#CC0033', 'black', '#A4C4B8', '#00194B', '#333333','red'];
// let currentColorIndex = 0;

// function autoChangeColor() {
//     if (carPaintMesh) {
//         currentColorIndex = (currentColorIndex + 1) % colors.length;
//         carPaintMesh.material.color.set(colors[currentColorIndex]);      
//     }
// }

// setInterval(autoChangeColor, 10000);

// Color change buttons
// document.querySelectorAll('button[data-color]').forEach(button => {
//     button.addEventListener('click', () => {
//         changeCarPaintColor(button.getAttribute('data-color'));
//         clearInterval(autoChangeColor);
//     });
// });



// openNav();

function informations(){
    const leftBox1 = document.getElementById('infoone');
const leftBox2 = document.getElementById('infothree');
const rightBox1 = document.getElementById('infotwo');
const rightBox2 = document.getElementById('infofour');
const leftBox3 = document.getElementById('infofive');
const leftButton1 = document.getElementById('select3');
const leftButton2 = document.getElementById('select2');
const rightButton1 = document.getElementById('select1');
const rightButton2 = document.getElementById('select4');
const leftButton3 = document.getElementById('select5');

let left1Toggled = false;
let left2Toggled = false;
let right1Toggled = false;
let right2Toggled = false;
let left3Toggled = false; // Toggle state for the fifth div

function closeAllDivs() {
  gsap.to(leftBox1, { transform: 'translateX(-100%)', duration: 1, ease: "expo.out", });
  gsap.to(leftBox2, { transform: 'translateX(-100%)', duration: 1, ease: "expo.out", });
  gsap.to(rightBox1, { transform: 'translateX(100%)', duration: 1, ease: "expo.out", });
  gsap.to(rightBox2, { transform: 'translateX(100%)', duration: 1, ease: "expo.out", });
  gsap.to(leftBox3, { transform: 'translateX(-100%)', duration: 1, ease: "expo.out", }); // Close the fifth div

  left1Toggled = false;
  left2Toggled = false;
  right1Toggled = false;
  right2Toggled = false;
  left3Toggled = false; // Reset the toggle state for the fifth div
}

function toggleBox(box, toggled, direction, toggleStateSetter) {
  gsap.to(box, { transform: toggled ? 'translateX(0%)' : `translateX(${direction})`, duration: 1, ease: "expo.out", });
  if (toggled) {
    setTimeout(() => {
      gsap.to(box, { transform: `translateX(${direction})`, duration: 1, ease: "expo.out", });
      toggleStateSetter(false);
    }, 10000);
  }
}

leftButton1.addEventListener('click', () => {
  const wasToggled = left1Toggled;
  closeAllDivs();
  left1Toggled = !wasToggled;
  toggleBox(leftBox1, left1Toggled, '-100%', (state) => left1Toggled = state);
});

leftButton2.addEventListener('click', () => {
  const wasToggled = left2Toggled;
  closeAllDivs();
  left2Toggled = !wasToggled;
  toggleBox(leftBox2, left2Toggled, '-100%', (state) => left2Toggled = state);
});

rightButton1.addEventListener('click', () => {
  const wasToggled = right1Toggled;
  closeAllDivs();
  right1Toggled = !wasToggled;
  toggleBox(rightBox1, right1Toggled, '100%', (state) => right1Toggled = state);
});

rightButton2.addEventListener('click', () => {
  const wasToggled = right2Toggled;
  closeAllDivs();
  right2Toggled = !wasToggled;
  toggleBox(rightBox2, right2Toggled, '100%', (state) => right2Toggled = state);
});

leftButton3.addEventListener('click', () => {
  const wasToggled = left3Toggled;
  closeAllDivs();
  left3Toggled = !wasToggled;
  toggleBox(leftBox3, left3Toggled, '-100%', (state) => left3Toggled = state);
});


}
informations()

function aniInit() {
  const animateChars = (chars, reverse = false) => {
      const staggerOptions = {
          each: .35,
          from: reverse ? "start" : "end",
          ease: "linear",
      };
      gsap.fromTo(chars, {
          fontWeight: 100,
      }, {
          fontWeight: 'bolder',
          duration: 1,
          ease: 'none',
          stagger: staggerOptions,
          scrollTrigger: {
              trigger: chars[0].closest('.marquee-container'),
              start: "50% bottom",
              end: "top top",
              scrub: true,
              scroller: "#main"
          }
      });
  };

  const splitText = new SplitType(".item h1", { types: "chars" });

  const marqueeContainers = document.querySelectorAll(".marquee-container");

  marqueeContainers.forEach((container, index) => {
      let start = "0%";
      let end = "-15%";

      if (index % 2 === 0) {
          start = "0%";
          end = "10%";
      }
      const marquee = container.querySelector(".marquee");
      const words = marquee.querySelectorAll('.item h1');

      gsap.fromTo(marquee, {
          x: start,
      }, {
          x: end,
          scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "150% top",
              scrub: true,
              scroller: "#main"
          }
      });

      words.forEach((word) => {
          const chars = Array.from(word.querySelectorAll(".char"));
          if (chars.length) {
              const reverse = index % 2 !== 0;
              animateChars(chars, reverse);
          }
      });
  });
}

function page2() {
  document.addEventListener("DOMContentLoaded", () => {
      aniInit();
  });
}

page2();





    function canva() {
        const canvas = document.querySelector("#page5>canvas");
        const context = canvas.getContext("2d");
    
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        window.addEventListener("resize", function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        });
    
        function files(index) {
            return `/finalcanva//scene${String(index).padStart(5, '0')}.png`;
        }
    
        const frameCount = 100; // Changed to 100 to match your requirement
    
        const images = [];
        const imageSeq = {
            frame: 0
        };
    
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = files(i);
            img.onload = () => {
                console.log(`Image ${i} loaded successfully.`);
            };
            img.onerror = () => {
                console.error(`Image ${i} failed to load.`);
            };
            images.push(img);
        }
    
        // Ensure the first image is loaded before starting the animation
        images[0].onload = () => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: "#page5",
                    start: "top top",
                    pin: true,
                    scroller: "#main",
                    // markers:true,
                    scrub: 3,
                    end: "500% 0%"
                }
            }).to(imageSeq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                duration: 30,
                onUpdate: render
            });
    
            render(); // Initial render after the first image is loaded
        };
    
        function render() {
            if (images[imageSeq.frame].complete && images[imageSeq.frame].naturalWidth !== 0) {
                scaleImage(images[imageSeq.frame], context);
            } else {
                console.error(`Image ${imageSeq.frame + 1} is broken or not loaded yet.`);
            }
        }
    
        function scaleImage(img, ctx) {
            const canvas = ctx.canvas;
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }
    }
    
    
    
    function page1() {

        var tl = gsap.timeline({
            scrollTrigger: {
                scroller: "#main",
                trigger: '#page1',
                // markers: true,
                start: "top -1%",
                end: "700% top",
                pin: true,
                scrub: 2,
            }
        })
        tl.to('.right-inner', {
            transform: "translateY(-110%)",
            duration: 50,
            delay: 1
        }, 'a')
    
        tl.to('.left-inner', {
            transform: "translateY(-105.5%)",
            duration: 50,
            delay: 1
        }, 'a')
    
    
    }
    
  
    const isMobile = window.innerWidth <= 768;
if(!isMobile) {
    page1()
    canva();

}



function rollingtext(){
    
    let elements = document.querySelectorAll(".rolling-text");
    elements.forEach((element) => {
        let innerText = element.innerText;
        element.innerHTML = "";
        let textContainer= document.createElement("div");
        textContainer.classList.add("block");
        for(let letter of innerText){
            let span = document.createElement("span");
            span. innerText = letter.trim() === "" ? "\xa0": letter;
            span.classList.add("letter");
            textContainer.appendChild(span);
        }
        element.appendChild(textContainer);
        element.appendChild(textContainer.cloneNode(true));
    });
    elements.forEach((element) => {
        element.addEventListener("mouseover", () => {
            element.classList.remove("play");
        });
    });
    }
    
    rollingtext();