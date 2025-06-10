//Checking JS
console.log("Good day, Edan. Chill, Give it one more try!");

if (typeof THREE !== 'undefined') {
    console.log("Three.js is loaded!");
} else {
    console.error("Three.js is not loaded.");
}

if (typeof gsap !== "undefined") {
    console.log("GSAP imported");
  } else {
    console.log("GSAP missing");
}

//loader Timeout
window.onload = function() {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1500);
}

//Create scene
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x000000); // 設定黑色背景

//Create camera
const camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.y = 30;
camera.position.z = 280;

//Create renderer
const renderer = new THREE.WebGLRenderer({ alpha:true, preserveDrawingBuffer: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(390, 844);

renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '50%';
renderer.domElement.style.left = '50%';
renderer.domElement.style.transform = 'translate(-50%, -50%)';

document.body.appendChild(renderer.domElement);

//Rive Card back
const cardBack = document.createElement('canvas');
cardBack.width = 490;
cardBack.height = 640;
cardBack.style.visibility = "hidden";
document.body.appendChild(cardBack);

let enableTextureUpdate = false;

new rive.Rive({
    src: "./cardback.riv",
    canvas: cardBack,
    autoplay : true,
    artboard: "cardBack",
    stateMachines: "stateMachineCardBack",
});

//Rive Card front
const cardFront = document.createElement('canvas');
cardFront.width = 490;
cardFront.height = 640;
cardFront.style.visibility = "hidden";
document.body.appendChild(cardFront);

const riveFront = new rive.Rive({
    src: "./cardfront.riv",
    canvas: cardFront,
    autoplay : true,
    artboard: "cardFront",
    stateMachines: "stateMachineCardFront",
    onLoad: () => {
        const inputs = riveFront.stateMachineInputs('stateMachineCardFront');
        riveInputScratchDone = inputs.find(input => input.name === "triggerScratchDone");
    }
});

//Rive Share BTN
const shareBTN = document.createElement('canvas');
shareBTN.width = 500;
shareBTN.height = 200;
shareBTN.style.visibility = "hidden";
document.body.appendChild(shareBTN);

const riveShareBTN = new rive.Rive({
    src: "./sharebtn.riv",
    canvas: shareBTN,
    autoplay : true,
    artboard: "shareBTN",
    stateMachines: "stateMachineShareBTN",
});

//Rive BG initial
const BG = document.createElement('canvas');
BG.width = 400;
BG.height = 800;
BG.style.visibility = "hidden";
document.body.appendChild(BG);

const riveBG = new rive.Rive({
    src: "./bg.riv",
    canvas: BG,
    autoplay: true,
    artboard: "BG",
    stateMachines: "stateMachineBG",
});

//Scratch Source
const scratch = document.createElement('canvas');
scratch.width = 200;
scratch.height = 200;
const scratchCtx = scratch.getContext('2d');
const scratchImg = new Image();
scratchImg.src = "./src/scratch.webp"
scratch.style.visibility = "hidden";
document.body.appendChild(scratch);

scratchImg.onload = function () {
    scratchCtx.drawImage(scratchImg, 0, 0, 200, 200);
};

//Declare plane
const planeGeometry = new THREE.PlaneGeometry(490, 640); //rectangle
const squareGeometry = new THREE.PlaneGeometry(200, 200); //square
const BTNGeomertry = new THREE.PlaneGeometry(240, 96); //BTN
const BGGeomertry = new THREE.PlaneGeometry(400, 800);

//Card back plane
const backTexture = new THREE.CanvasTexture(cardBack);

const backMaterial = new THREE.MeshBasicMaterial({
    map: backTexture,
    side: THREE.DoubleSide,
    transparent: true,
});

const backPlane = new THREE.Mesh(planeGeometry, backMaterial);

//Card front plane
const frontTexture = new THREE.CanvasTexture(cardFront);

const frontMaterial = new THREE.MeshBasicMaterial({
    map: frontTexture,
    side: THREE.DoubleSide,
    transparent: true,
});

const frontPlane = new THREE.Mesh(planeGeometry, frontMaterial);

frontPlane.rotation.y = Math.PI; //fix rot
frontPlane.position.z -= 2; //fix position

//Scratch plane
const scratchTexture = new THREE.CanvasTexture(scratch);

const scratchMaterial = new THREE.MeshBasicMaterial({
    map: scratchTexture,
    side: THREE.DoubleSide,
    transparent: true,
});

const scratchPlane = new THREE.Mesh(squareGeometry, scratchMaterial);

scratchPlane.rotation.y = Math.PI; //fix rot
scratchPlane.position.z -= 3; //fix position

//share BTN plane
const shareBTNTexture = new THREE.CanvasTexture(shareBTN);

const shareBTNMaterial = new THREE.MeshBasicMaterial({
    map: shareBTNTexture,
    side: THREE.DoubleSide,
    transparent: true,
});

const shareBTNPlane = new THREE.Mesh(BTNGeomertry, shareBTNMaterial);

shareBTNPlane.position.z += 500;
shareBTNPlane.position.y -= 220;
shareBTNPlane.scale.x = 0;
shareBTNPlane.scale.y = 0;

//BG plane
const BGTexture = new THREE.CanvasTexture(BG);

const BGMaterial = new THREE.MeshBasicMaterial({
    map: BGTexture,
    side: THREE.DoubleSide,
    transparent: true,
});

const BGPlane = new THREE.Mesh(BGGeomertry, BGMaterial);

BGPlane.position.z -= 500;
BGPlane.position.y = 20;
BGPlane.scale.x = 5.4;
BGPlane.scale.y = 5.4;

//Planegroup
const planeGroup = new THREE.Group();
planeGroup.add(backPlane);
planeGroup.add(frontPlane);
planeGroup.add(scratchPlane);

planeGroup.scale.x = 0.75;
planeGroup.scale.y = 0.75;

//scene.add(planeGroup);
scene.add(shareBTNPlane);

scene.add(BGPlane);

//Loop arrange

scene.position.z = -450; //刮除區跟clone對不上把整坨往後推

const totalCards = 8;
const radius = 450;
const cardGroups = [];

for (let i = 0; i < totalCards; i++) {

    const cardClone = planeGroup.clone(true);

    cardClone.children.forEach(mesh => {
        if (mesh.material) {
            mesh.material = mesh.material.clone();
        }
    }); //獨立每個材質

    const angle = (i / totalCards) * Math.PI * 2;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    cardClone.position.set(x, 0, z);

    scene.add(cardClone);

    cardGroups.push(cardClone); // 存到陣列以備後續操作（如點擊、動畫等）
}

//render
function animate() {
    frontTexture.needsUpdate = true;
    backTexture.needsUpdate = true;
    scratchTexture.needsUpdate = true;
    shareBTNTexture.needsUpdate = true;
    BGTexture.needsUpdate = true;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

function isMobileDevice() {
    return /mobile|android|iphone/i.test(navigator.userAgent.toLowerCase());
}

//RWD
function resizeRenderer() {
    if (isMobileDevice()) {
        document.querySelectorAll('*:not(.loader)').forEach(element => {
            element.style.width = '100vw';
        });

        const width = 390;
        const height = 900;

        renderer.setSize(width, height);
        renderer.domElement.style.width = '${width}px';
        renderer.domElement.style.height = '${height}px';
        camera.aspect = width / height;
    } else {
        const height = window.innerHeight;
    const aspectRatio = 390 / 844; // 原始比例

    const width = height * aspectRatio; // 根據高度計算新寬度

    renderer.setSize(width, height);
    renderer.domElement.style.width = `${width}px`;
    renderer.domElement.style.height = `${height}px`;

    camera.aspect = width / height;
    }
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeRenderer); // 監聽視窗大小變化

resizeRenderer(); // 初始化時執行一次

//interaction

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let clickedPlane = null;

const scaleFactor = 0.95;

let isInteractionDisabled = false;

let isChosen = false; //gate before chosen

let alreadyCleared = false;

let riveInputScratchDone; //寫在const riveFront裡面

//choose
window.addEventListener('pointerup', (event) => {

    if (isDragging) {
        return;
    }

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if(clickedObject instanceof THREE.Mesh) {
            console.log("Intersection detected with", clickedObject);

            clickedPlane = clickedObject.parent;

            if (clickedObject === shareBTNPlane) {
                console.log('Share BTN clicked, skip flipping.');
                return;
            } //預防點擊BTN觸發翻牌

            if (clickedObject === BGPlane) {
                return;
            } //預防點擊BG翻轉

            gsap.to(clickedPlane.rotation, {
                y: Math.PI,
                duration: 1,
                ease: "power2.inOut",
                onComplete: function() {
                    isChosen = true;
                    console.log("Card chosen , scratching is avalible.")
                }
            });

            gsap.to(clickedPlane.scale, {
                x:scaleFactor,
                y:scaleFactor,
                //z:scaleFactor,
            });
        }

        isInteractionDisabled = true;

        hideOtherCards();
    }
});

//scroll

let currentRotation = 0;
let targetRotation = 0;
let lastX = 0;
let isDragging = false;
let draggingLock = true;

const dragThreshold = 15;
const rotationSpeed = Math.PI*2 / totalCards; //card = 8

window.addEventListener('pointerdown', (e) => {
    lastX = e.clientX;
    isDragging = false;
    draggingLock = false;
});

window.addEventListener('pointermove', (e) => {

    if (draggingLock) {
        return;
    }

    if (isInteractionDisabled) {
        return;
    }

    const deltaX = e.clientX - lastX;

    if (Math.abs(deltaX) > dragThreshold) {
        isDragging = true;
        if (deltaX > 0) {
            targetRotation -= rotationSpeed;
        } else {
            targetRotation += rotationSpeed;
        }

        gsap.to({ rotation: currentRotation }, {
            rotation: targetRotation,
            duration: 1,
            ease: "power2.out",
            onUpdate: function () {
                currentRotation = this.targets()[0].rotation;
                updateCardPositions();
            }
        });
        
        lastX = e.clientX;

        scrollComplete();
    }


});

function scrollComplete () {
    draggingLock = true;
}

function updateCardPositions() {
    for (let i = 0; i< cardGroups.length; i++) {
        const angle = (i / totalCards) * Math.PI * 2 + currentRotation;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const card = cardGroups[i];
        card.position.set(x, 0, z);
    }
}

//hide other card
function hideOtherCards() {
    cardGroups.forEach(card => {
        if (card !== clickedPlane) {
            card.children.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.transparent = true; // 確保透明度可以生效
                    gsap.to(mesh.material, {
                        opacity: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            });
        }
    });
}

//scratch

window.addEventListener('pointermove', (event) => {
    if (!isChosen || alreadyCleared) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects([scratchPlane]);

    if (intersects.length > 0) {
        const uv = intersects[0].uv;

        const x = uv.x * scratch.width;
        const y = (1 - uv.y) * scratch.height;

        scratchCtx.globalCompositeOperation = "destination-out";
        scratchCtx.beginPath();
        scratchCtx.arc(x, y, 25, 0, Math.PI * 2);
        scratchCtx.fill();

        console.log("scratching at", x, y);

        //check scratch percent

        const imageData = scratchCtx.getImageData(0, 0, scratch.width, scratch.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }

        const totalPixels = scratch.width * scratch.height;
        const transparencyPercent = transparentPixels / totalPixels;

        console.log("透明面積比例:", Math.round(transparencyPercent * 100) + "%");

        if(transparencyPercent >= 0.95) {
            alreadyCleared = true;

            scratchCtx.clearRect(0, 0, scratch.width, scratch.height);

            console.log("transparency over 80% , all clear");

            riveInputScratchDone.fire();

            gsap.to(clickedPlane.position, {
                y: clickedPlane.position.y + 70,
                duration: 1,
                ease: "power2.out",
            }); //position up after scratch complete

            gsap.to(shareBTNPlane.scale, {
                x: 0.9,
                y: 0.9,
                duration: 1,
                ease: "power2.out",
            });

        }

    }
});

//share BTN function
window.addEventListener('click', async (event) => {

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersctsWithBTN = raycaster.intersectObjects([shareBTNPlane]);

    if (intersctsWithBTN.length > 0) {
        console.log('BTN pressed');
    
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    
        if (isMobile && navigator.share) {
            try {
                await navigator.share({
                    url: window.location.href
                });
                console.log('Successfully shared!');
            } catch (err) {
                console.error('Failed to share:', err);
            }
        } else if (navigator.clipboard) {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                console.log('URL copied to clipboard!');
                alert('URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy URL:', err);
            });
        } else {
            alert('Your browser does not support sharing. Please copy the URL manually.');
        }
    }    
});