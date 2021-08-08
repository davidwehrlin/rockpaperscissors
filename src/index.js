import React from 'react';
import ReactDOM from 'react-dom';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
//might need to enable hardware acceleration on chrome

class App extends React.Component {

  async makePrediction() {
    const model = await handpose.load();
    const predictions = await model.estimateHands(document.querySelector("#image"));

    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.font = "20px Arial";
    var img = document.getElementById("image");
    ctx.drawImage(img, 0, 0);
    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;
  
        // Log hand keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];
          console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
          ctx.fillText(i.toString(), x, y);
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  }

  render() {
    this.makePrediction();
    return (
      <div className="wrapper">
        <img id="image" src="hand.jpg" alt="Hand"></img>
        <canvas id="myCanvas" width="800" height="800"></canvas>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);