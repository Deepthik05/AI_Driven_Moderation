import sharp from 'sharp';
import fs from 'fs';

// Load JSON (Replace with actual JSON file if needed)
const jsonData = {
  "sensitive_regions": [
    {
      "type": "blood",
      "coordinates": { "x": 200, "y": 200, "width": 200, "height": 300 },
      "description": "Blood splatters on clothing and ground"
    },
    {
      "type": "violence",
      "coordinates": { "x": 250, "y": 250, "width": 150, "height": 250 },
      "description": "Character covered in blood, holding a weapon"
    }
  ]
};

async function blurSensitiveRegions(inputPath, outputPath, sensitiveRegions, blurAmount = 100, scale = 1.5) {
    // Get image dimensions
    const { width: imgWidth, height: imgHeight } = await sharp(inputPath).metadata();

    let image = sharp(inputPath);

    // Process each region with scaling
    const overlays = await Promise.all(sensitiveRegions.map(async (region) => {
        let { x, y, width, height } = region.coordinates;

        // Scale coordinates
        let scaledX = Math.round(x * scale);
        let scaledY = Math.round(y * scale);
        let scaledWidth = Math.round(width * scale);
        let scaledHeight = Math.round(height * scale);

        // Ensure values stay within image bounds
        scaledX = Math.max(0, Math.min(scaledX, imgWidth - 1));
        scaledY = Math.max(0, Math.min(scaledY, imgHeight - 1));
        scaledWidth = Math.max(1, Math.min(scaledWidth, imgWidth - scaledX));
        scaledHeight = Math.max(1, Math.min(scaledHeight, imgHeight - scaledY));

        try {
            // Extract and blur the specific region
            const blurredRegion = await image.clone()
                .extract({ left: scaledX, top: scaledY, width: scaledWidth, height: scaledHeight })
                .blur(blurAmount)
                .toBuffer();

            return { input: blurredRegion, left: scaledX, top: scaledY };
        } catch (error) {
            console.error(`Error processing region: ${JSON.stringify(region.coordinates)}`, error);
            return null;
        }
    }));

    // Remove null values in case of errors
    const validOverlays = overlays.filter(overlay => overlay !== null);

    if (validOverlays.length > 0) {
        await image.composite(validOverlays).toFile(outputPath);
        console.log("Blurred sensitive regions saved to:", outputPath);
    } else {
        console.error("No valid regions to process. Check image dimensions and JSON input.");
    }
}


export default blurSensitiveRegions;
