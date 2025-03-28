<template>
    <div class="card-container" :class="widthImg">
        <div
            ref="playerCard"
            class="player-card"
            @click="restartLightningEffect"
        >
            <img :src="cardImage" alt="Player Card" class="card-image" />
            <div class="glow"></div>

            <!-- Item Count Badge -->
            <div v-if="itemCount !== null" class="item-count">
                {{ itemCount }}
            </div>
        </div>
        <div ref="lightningContainer" class="lightning-container"></div>
    </div>
</template>

<script>
export default {
    name: "SimpleLightningCard",
    props: {
        widthImg: {
            type: String,
            default: "w-[60px]",
        },
        // Source for the card image
        cardImage: {
            type: String,
            default: "/path/to/default-card.png",
        },
        // Item count to display in the corner
        itemCount: {
            type: Number,
            default: null,
        },
        // Freeze lightning after this many seconds (0 = never freeze)
        freezeAfter: {
            type: Number,
            default: 0,
        },
        // Shaking intensity level: 0 (none) to 5 (maximum)
        shakeLevel: {
            type: Number,
            default: 0,
            validator: (value) => {
                return value >= 0 && value <= 5;
            },
        },
    },
    data() {
        return {
            lightningInterval: null,
            isFrozen: false,
            frozenTimeout: null,
        };
    },
    mounted() {
        // Start lightning effect immediately
        this.startLightningEffect();

        // Set up freeze timeout if specified
        if (this.freezeAfter > 0) {
            this.frozenTimeout = setTimeout(() => {
                this.freezeLightning();
            }, this.freezeAfter * 1000);
        }
    },
    beforeUnmount() {
        // Clear interval and any lingering elements
        if (this.lightningInterval) {
            clearInterval(this.lightningInterval);
        }

        // Clear freeze timeout if it exists
        if (this.frozenTimeout) {
            clearTimeout(this.frozenTimeout);
        }

        // Only clear lightning elements if not frozen
        if (!this.isFrozen) {
            this.clearLightningElements();
        }
    },
    methods: {
        // Clear all lightning elements
        clearLightningElements() {
            if (this.$refs.lightningContainer) {
                const elements =
                    this.$refs.lightningContainer.querySelectorAll(
                        ".lightning"
                    );
                elements.forEach((el) => {
                    if (el.parentNode === this.$refs.lightningContainer) {
                        this.$refs.lightningContainer?.removeChild(el);
                    }
                });
            }

            // Reset card position
            if (this.$refs.playerCard) {
                this.$refs.playerCard.style.transform = "translate(0, 0)";
            }
        },

        // Restart the lightning effect on click
        restartLightningEffect() {
            // Only allow restart if already frozen
            if (!this.isFrozen) return;

            // Clear frozen state
            this.isFrozen = false;

            // Clear any existing lightning elements
            this.clearLightningElements();

            // Start the effect again
            this.startLightningEffect();

            // Set up new freeze timeout
            if (this.freezeAfter > 0) {
                // Clear existing timeout if any
                if (this.frozenTimeout) {
                    clearTimeout(this.frozenTimeout);
                }

                // Set new timeout
                this.frozenTimeout = setTimeout(() => {
                    this.freezeLightning();
                }, this.freezeAfter * 1000);
            }
        },

        // Start the lightning effect
        startLightningEffect() {
            // Create initial burst
            this.createLightningBurst();

            // Set up cycling burst pattern
            this.lightningInterval = setInterval(() => {
                this.createLightningBurst();
            }, 1500); // Cycle every 1.5 seconds
        },

        // Freeze the lightning in place
        freezeLightning() {
            // Set frozen state
            this.isFrozen = true;

            // Stop the interval
            if (this.lightningInterval) {
                clearInterval(this.lightningInterval);
                this.lightningInterval = null;
            }

            // Get all existing lightning elements
            const elements =
                this.$refs.lightningContainer.querySelectorAll(".lightning");

            // Make all visible and permanent
            elements.forEach((el) => {
                // Clear any pending animations/timeouts
                el.style.transition = "none";
                el.style.opacity = "1";
            });

            // Reset card position
            if (this.$refs.playerCard) {
                this.$refs.playerCard.style.transform = "translate(0, 0)";
            }
        },

        // Create a lightning burst
        createLightningBurst() {
            // Don't create new bursts if frozen
            if (this.isFrozen) return;

            // Safety check for refs
            if (!this.$refs.lightningContainer || !this.$refs.playerCard)
                return;

            // Clear existing lightning elements first unless frozen
            if (!this.isFrozen) {
                this.clearLightningElements();
            }

            const colors = ["#7df9ff", "#00ccff", "#0066ff", "#ffffff"];
            let boltCount = 0;
            const maxBolts = 20;
            let shakeTimes = 0;
            const maxShakeTimes = 40;

            // Create shake effect
            const shakeCard = () => {
                // Skip shaking if shake level is 0
                if (this.shakeLevel === 0) {
                    return;
                }

                if (shakeTimes < maxShakeTimes) {
                    // Calculate shake intensity based on shake level (0-5)
                    // At level 5, max shake is 8px, scaling down proportionally
                    const shakeIntensity = (this.shakeLevel / 5) * 8;

                    const xShake = (Math.random() - 0.5) * shakeIntensity;
                    const yShake = (Math.random() - 0.5) * shakeIntensity;

                    this.$refs.playerCard.style.transform = `translate(${xShake}px, ${yShake}px)`;

                    shakeTimes++;

                    // Adjust shake frequency based on level (higher = faster)
                    const shakeDelay =
                        this.shakeLevel === 5 ? 30 : 40 - this.shakeLevel * 2;
                    setTimeout(shakeCard, shakeDelay);
                } else {
                    // Reset position
                    this.$refs.playerCard.style.transform = "translate(0, 0)";
                }
            };

            // Start shaking
            shakeCard();

            // Create main lightning bolts around card
            const createNextBolt = () => {
                if (boltCount < maxBolts) {
                    const color =
                        colors[Math.floor(Math.random() * colors.length)];
                    this.createSurroundingLightning(color);

                    // Add more branches (80% chance)
                    if (Math.random() > 0.2) {
                        const containerWidth =
                            this.$refs.lightningContainer?.offsetWidth;
                        const containerHeight =
                            this.$refs.lightningContainer?.offsetHeight;
                        const startX = Math.random() * containerWidth;
                        const startY = Math.random() * containerHeight;
                        const angle = Math.random() * Math.PI * 2;
                        const length = 30 + Math.random() * 50;

                        this.createBranchLightning(
                            startX,
                            startY,
                            angle,
                            length,
                            color
                        );

                        // Add a second branch sometimes
                        if (Math.random() > 0.5) {
                            setTimeout(() => {
                                const newAngle =
                                    angle + (Math.random() - 0.5) * Math.PI;
                                this.createBranchLightning(
                                    startX,
                                    startY,
                                    newAngle,
                                    length * 0.7,
                                    color
                                );
                            }, 20);
                        }
                    }

                    boltCount++;
                    setTimeout(createNextBolt, 40 + Math.random() * 80);
                }
            };

            createNextBolt();
        },

        // Create surrounding lightning
        createSurroundingLightning(color) {
            const containerWidth = this.$refs.lightningContainer?.offsetWidth;
            const containerHeight = this.$refs.lightningContainer?.offsetHeight;
            const cardWidth = this.$refs.playerCard?.offsetWidth;
            const cardHeight = this.$refs.playerCard?.offsetHeight;

            // Calculate center points (relative to lightning container)
            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;

            // Calculate card boundaries (with padding)
            const padding = 10; // pixels of padding inside the card edge
            const cardLeft = (containerWidth - cardWidth) / 2 + padding;
            const cardRight = (containerWidth + cardWidth) / 2 - padding;
            const cardTop = (containerHeight - cardHeight) / 2 + padding;
            const cardBottom = (containerHeight + cardHeight) / 2 - padding;

            // Create a lightning bolt element
            const bolt = document.createElement("div");
            bolt.className = "lightning";
            this.$refs.lightningContainer.appendChild(bolt);

            // Create SVG for the lightning
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", containerWidth);
            svg.setAttribute("height", containerHeight);

            // Randomly determine starting point around the card edge
            let startX, startY;

            // Pick a random edge: 0=top, 1=right, 2=bottom, 3=left
            const edge = Math.floor(Math.random() * 4);

            if (edge === 0) {
                // Top edge
                startX = cardLeft + Math.random() * (cardRight - cardLeft);
                startY = cardTop;
            } else if (edge === 1) {
                // Right edge
                startX = cardRight;
                startY = cardTop + Math.random() * (cardBottom - cardTop);
            } else if (edge === 2) {
                // Bottom edge
                startX = cardLeft + Math.random() * (cardRight - cardLeft);
                startY = cardBottom;
            } else {
                // Left edge
                startX = cardLeft;
                startY = cardTop + Math.random() * (cardBottom - cardTop);
            }

            // Randomly determine ending point (also on card edge, but not the same edge)
            let endX, endY;
            let endEdge;

            do {
                endEdge = Math.floor(Math.random() * 4);
            } while (endEdge === edge); // Make sure it's not the same edge

            if (endEdge === 0) {
                // Top edge
                endX = cardLeft + Math.random() * (cardRight - cardLeft);
                endY = cardTop;
            } else if (endEdge === 1) {
                // Right edge
                endX = cardRight;
                endY = cardTop + Math.random() * (cardBottom - cardTop);
            } else if (endEdge === 2) {
                // Bottom edge
                endX = cardLeft + Math.random() * (cardRight - cardLeft);
                endY = cardBottom;
            } else {
                // Left edge
                endX = cardLeft;
                endY = cardTop + Math.random() * (cardBottom - cardTop);
            }

            // Create the main path
            const mainPath = document.createElementNS(svgNS, "path");

            // Generate jagged path data for lightning
            let pathData = `M${startX},${startY} `;

            // Number of zigzags in the lightning bolt
            const segments = 8 + Math.floor(Math.random() * 8);

            // Current position
            let currX = startX;
            let currY = startY;

            // Target position
            const targetX = endX;
            const targetY = endY;

            // Generate each segment of the jagged lightning path
            for (let i = 1; i <= segments; i++) {
                // Move towards target with some randomness
                const nextX =
                    currX +
                    (targetX - currX) * (1 / segments) +
                    (Math.random() - 0.5) * 30;
                const nextY =
                    currY +
                    (targetY - currY) * (1 / segments) +
                    (Math.random() - 0.5) * 30;

                pathData += `L${nextX},${nextY} `;

                currX = nextX;
                currY = nextY;
            }

            // Set up multiple layers for depth effect
            // 1. Base glow (wide)
            const baseGlow = document.createElementNS(svgNS, "path");
            baseGlow.setAttribute("d", pathData);
            baseGlow.setAttribute("stroke", "#ffffff");
            baseGlow.setAttribute("stroke-width", "8");
            baseGlow.setAttribute("stroke-opacity", "0.3");
            baseGlow.setAttribute("fill", "none");
            baseGlow.setAttribute("stroke-linecap", "round");
            baseGlow.setAttribute("stroke-linejoin", "round");

            // 2. Medium glow
            const mediumGlow = document.createElementNS(svgNS, "path");
            mediumGlow.setAttribute("d", pathData);
            mediumGlow.setAttribute("stroke", color);
            mediumGlow.setAttribute("stroke-width", "5");
            mediumGlow.setAttribute("stroke-opacity", "0.5");
            mediumGlow.setAttribute("fill", "none");
            mediumGlow.setAttribute("stroke-linecap", "round");
            mediumGlow.setAttribute("stroke-linejoin", "round");

            // 3. Core path
            mainPath.setAttribute("d", pathData);
            mainPath.setAttribute("stroke", "#ffffff");
            mainPath.setAttribute("stroke-width", "2");
            mainPath.setAttribute("fill", "none");
            mainPath.setAttribute("stroke-linecap", "round");
            mainPath.setAttribute("stroke-linejoin", "round");

            // Create filter for the glow effect
            const filterId = `lightning-filter-${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            const filter = document.createElementNS(svgNS, "filter");
            filter.setAttribute("id", filterId);
            filter.setAttribute("x", "-50%");
            filter.setAttribute("y", "-50%");
            filter.setAttribute("width", "200%");
            filter.setAttribute("height", "200%");

            // Add blur effect
            const feGaussianBlur = document.createElementNS(
                svgNS,
                "feGaussianBlur"
            );
            feGaussianBlur.setAttribute("in", "SourceGraphic");
            feGaussianBlur.setAttribute("stdDeviation", "4");
            feGaussianBlur.setAttribute("result", "blur");

            // Add brightness
            const feComponentTransfer = document.createElementNS(
                svgNS,
                "feComponentTransfer"
            );
            feComponentTransfer.setAttribute("in", "blur");
            feComponentTransfer.setAttribute("result", "bright");

            const feFuncR = document.createElementNS(svgNS, "feFuncR");
            feFuncR.setAttribute("type", "linear");
            feFuncR.setAttribute("slope", "1.5");

            const feFuncG = document.createElementNS(svgNS, "feFuncG");
            feFuncG.setAttribute("type", "linear");
            feFuncG.setAttribute("slope", "1.5");

            const feFuncB = document.createElementNS(svgNS, "feFuncB");
            feFuncB.setAttribute("type", "linear");
            feFuncB.setAttribute("slope", "1.5");

            feComponentTransfer.appendChild(feFuncR);
            feComponentTransfer.appendChild(feFuncG);
            feComponentTransfer.appendChild(feFuncB);

            // Composite layers
            const feComposite = document.createElementNS(svgNS, "feComposite");
            feComposite.setAttribute("in", "bright");
            feComposite.setAttribute("in2", "SourceGraphic");
            feComposite.setAttribute("operator", "over");

            // Add all filter elements
            filter.appendChild(feGaussianBlur);
            filter.appendChild(feComponentTransfer);
            filter.appendChild(feComposite);

            // Add filter to defs
            const defs = document.createElementNS(svgNS, "defs");
            defs.appendChild(filter);
            svg.appendChild(defs);

            // Apply filter to all paths
            baseGlow.setAttribute("filter", `url(#${filterId})`);

            // Add paths to SVG in order (back to front)
            svg.appendChild(baseGlow);
            svg.appendChild(mediumGlow);
            svg.appendChild(mainPath);

            bolt.appendChild(svg);

            // Animate the lightning with fade in/out
            bolt.style.opacity = "0";

            // If frozen, make immediately visible and keep it
            if (this.isFrozen) {
                bolt.style.opacity = "1";
                return;
            }

            // Quick fade in
            setTimeout(() => {
                bolt.style.transition = "opacity 0.05s ease-in";
                bolt.style.opacity = "1";

                // Longer fade out (unless frozen)
                if (!this.isFrozen) {
                    setTimeout(() => {
                        bolt.style.transition = "opacity 0.2s ease-out";
                        bolt.style.opacity = "0";
                        setTimeout(() => {
                            if (
                                !this.isFrozen &&
                                bolt.parentNode ===
                                    this.$refs.lightningContainer
                            ) {
                                this.$refs.lightningContainer?.removeChild(bolt);
                            }
                        }, 200);
                    }, 100);
                }
            }, 0);
        },

        // Create branch lightning
        createBranchLightning(startX, startY, angle, length, color) {
            if (!this.$refs.lightningContainer || !this.$refs.playerCard)
                return;

            const bolt = document.createElement("div");
            bolt.className = "lightning";
            this.$refs.lightningContainer.appendChild(bolt);

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute(
                "width",
                this.$refs.lightningContainer?.offsetWidth
            );
            svg.setAttribute(
                "height",
                this.$refs.lightningContainer?.offsetHeight
            );

            // Get card boundaries for containment
            const containerWidth = this.$refs.lightningContainer?.offsetWidth;
            const containerHeight = this.$refs.lightningContainer?.offsetHeight;
            const cardWidth = this.$refs.playerCard?.offsetWidth;
            const cardHeight = this.$refs.playerCard?.offsetHeight;

            // Calculate card boundaries (with padding)
            const padding = 10; // pixels of padding inside the card edge
            const cardLeft = (containerWidth - cardWidth) / 2 + padding;
            const cardRight = (containerWidth + cardWidth) / 2 - padding;
            const cardTop = (containerHeight - cardHeight) / 2 + padding;
            const cardBottom = (containerHeight + cardHeight) / 2 - padding;

            // Generate path data
            let pathData = `M${startX},${startY} `;

            // Current position
            let currX = startX;
            let currY = startY;

            // Number of zigzags
            const segments = 3 + Math.floor(Math.random() * 3);
            const shorterLength = Math.min(length, cardWidth / 4); // Make branches shorter

            for (let i = 1; i <= segments; i++) {
                // Calculate movement direction with randomness
                const angleVariation = ((Math.random() - 0.5) * Math.PI) / 4; // ±45° variation
                const segmentLength = shorterLength / segments;

                // Calculate next position
                let nextX =
                    currX + Math.cos(angle + angleVariation) * segmentLength;
                let nextY =
                    currY + Math.sin(angle + angleVariation) * segmentLength;

                // Constrain to card boundaries
                nextX = Math.max(cardLeft, Math.min(nextX, cardRight));
                nextY = Math.max(cardTop, Math.min(nextY, cardBottom));

                pathData += `L${nextX},${nextY} `;

                currX = nextX;
                currY = nextY;
            }

            // Create filter for glow
            const filterId = `branch-filter-${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            const filter = document.createElementNS(svgNS, "filter");
            filter.setAttribute("id", filterId);
            filter.setAttribute("x", "-50%");
            filter.setAttribute("y", "-50%");
            filter.setAttribute("width", "200%");
            filter.setAttribute("height", "200%");

            const feGaussianBlur = document.createElementNS(
                svgNS,
                "feGaussianBlur"
            );
            feGaussianBlur.setAttribute("in", "SourceGraphic");
            feGaussianBlur.setAttribute("stdDeviation", "2");
            feGaussianBlur.setAttribute("result", "blur");

            filter.appendChild(feGaussianBlur);

            const defs = document.createElementNS(svgNS, "defs");
            defs.appendChild(filter);
            svg.appendChild(defs);

            // Create layers
            // Glow layer
            const glowPath = document.createElementNS(svgNS, "path");
            glowPath.setAttribute("d", pathData);
            glowPath.setAttribute("stroke", color);
            glowPath.setAttribute("stroke-width", "4");
            glowPath.setAttribute("stroke-opacity", "0.4");
            glowPath.setAttribute("fill", "none");
            glowPath.setAttribute("filter", `url(#${filterId})`);
            glowPath.setAttribute("stroke-linecap", "round");
            glowPath.setAttribute("stroke-linejoin", "round");

            // Core layer
            const corePath = document.createElementNS(svgNS, "path");
            corePath.setAttribute("d", pathData);
            corePath.setAttribute("stroke", "#ffffff");
            corePath.setAttribute("stroke-width", "1.5");
            corePath.setAttribute("fill", "none");
            corePath.setAttribute("stroke-linecap", "round");
            corePath.setAttribute("stroke-linejoin", "round");

            svg.appendChild(glowPath);
            svg.appendChild(corePath);
            bolt.appendChild(svg);

            // Animate the branch with quick fade in and slower fade out
            bolt.style.opacity = "0";

            // If frozen, make immediately visible and keep it
            if (this.isFrozen) {
                bolt.style.opacity = "1";
                return;
            }

            // Fade in
            setTimeout(() => {
                bolt.style.transition = "opacity 0.05s ease-in";
                bolt.style.opacity = "1";

                // Fade out (unless frozen)
                if (!this.isFrozen) {
                    setTimeout(() => {
                        bolt.style.transition = "opacity 0.15s ease-out";
                        bolt.style.opacity = "0";
                        setTimeout(() => {
                            if (
                                !this.isFrozen &&
                                bolt.parentNode ===
                                    this.$refs.lightningContainer
                            ) {
                                this.$refs.lightningContainer?.removeChild(bolt);
                            }
                        }, 150);
                    }, 70);
                }
            }, 0);
        },
    },
};
</script>

<style scoped>
.card-container {
    position: relative;
    perspective: 1000px;
}

.player-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    overflow: hidden;
    /* box-shadow: 0 0 20px rgba(255, 255, 255, 0.2); */
    transition: transform 0.05s;
    cursor: pointer;
}

.player-card:hover {
    box-shadow: 0 0 30px rgba(0, 195, 255, 0.8);
}

.card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.lightning-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden; /* Ensure lightning doesn't leak outside */
}

.lightning {
    position: absolute;
    background: transparent;
    opacity: 0;
}

.glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle,
        rgba(184, 230, 255, 0.7) 0%,
        rgba(42, 157, 255, 0) 70%
    );
    opacity: 0;
    mix-blend-mode: screen;
    pointer-events: none;
    border-radius: 15px;
    /* animation: pulse 1.5s infinite alternate; */
    filter: blur(3px);
    /* box-shadow: 0 0 25px rgba(0, 195, 255, 0.8); */
}

.item-count {
    @apply text-[10px] font-extrabold p-[5px] absolute top-0 right-0 text-white bg-black/50 rounded-bl-[10px];
}

@keyframes pulse {
    0% {
        opacity: 0.2;
        box-shadow: 0 0 15px rgba(0, 195, 255, 0.4);
    }
    50% {
        opacity: 0.8;
        box-shadow: 0 0 30px rgba(0, 195, 255, 0.8),
            0 0 50px rgba(42, 157, 255, 0.4);
    }
    100% {
        opacity: 0.4;
        box-shadow: 0 0 20px rgba(0, 195, 255, 0.6);
    }
}

</style>
