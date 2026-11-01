import {makeProject} from '@motion-canvas/core';
import scene from './scenes/teaser_v2?scene';
import './global.css';

// Audio track master from src/audio/
import soundtrack from './audio/master_soundtrack.mp3';

export default makeProject({
  scenes: [scene],
  audio: soundtrack,
});
