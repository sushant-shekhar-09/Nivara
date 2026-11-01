import {defineConfig} from 'vite';
import motionCanvasPkg from '@motion-canvas/vite-plugin';

const motionCanvas = motionCanvasPkg.default || motionCanvasPkg;

export default defineConfig({
  plugins: [motionCanvas()],
  server: {
    fs: {
      allow: [
        // Allow serving files from the project root
        '.',
        // Allow serving files from the junctioned node_modules / launch-teaser
        'D:/Open Source Exploration/launch-teaser',
      ],
    },
  },
});
