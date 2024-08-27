// utils/preloadImages.js
const imageUrls = [
    "./../../../public/assets/inventory/background-inventory.png",
];

export function preloadImages() {
    const promises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = reject;
        });
    });

    return Promise.all(promises);
}
