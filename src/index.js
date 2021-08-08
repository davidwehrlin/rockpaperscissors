import React from 'react';
import ReactDOM from 'react-dom';
import handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

//might need to enable hardware acceleration on chrome

class App extends React.Component {

  async makePrediction() {
    const model = await handpose.load();
    const predictions = await model.estimateHands(document.querySelector("#image"));

    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;
  
        // Log hand keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];
          console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
        }
      }
    }
  }

  render() {
    this.makePrediction();
    return (
      <div>
        Hello World!
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);