import React from 'react';
import ReactDOM from 'react-dom';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
//might need to enable hardware acceleration on chrome

class App extends React.Component {

  distanceTwoPoint(pt1, pt2){
    return Math.sqrt(
      Math.pow(pt1[0] - pt2[0], 2) + 
      Math.pow(pt1[1] - pt2[1], 2)
    )
  }
  calculateAngle(points, landmarks) {
    var pt1 = landmarks[points[0]];
    var pt2 = landmarks[points[1]];
    var pt3 = landmarks[points[2]];
    
    var a = this.distanceTwoPoint(pt1, pt2);
    var b = this.distanceTwoPoint(pt1, pt3);
    var c = this.distanceTwoPoint(pt2, pt3);

    var fraction = (Math.pow(a,2) + Math.pow(b,2) - Math.pow(c,2)) / (2 * a * b)
    return Math.acos(fraction);
  }

  async makePrediction() {
    const middleFinger = [[9,10,11], [9,11,12]];
    const ringFinger = [[13,14,15],[13,15,16]];
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
        var middleFingerAngle = 
        this.calculateAngle(middleFinger[0], keypoints) +
        this.calculateAngle(middleFinger[1], keypoints);

        var ringFingerAngle = 
        this.calculateAngle(ringFinger[0], keypoints) +
        this.calculateAngle(ringFinger[1], keypoints);

        if ((middleFingerAngle < Math.PI / 4) 
          && (ringFingerAngle < Math.PI / 4)) {
          console.log("Paper");
        } else if ((middleFingerAngle < Math.PI / 4) 
        && (ringFingerAngle > Math.PI / 4)) {
          console.log("Scissors");
        } else {
          console.log("Rock")
        }
      }
    }
  }

  render() {
    this.makePrediction();
    return (
      <div className="wrapper">
        <img id="image" src="scissors.jpg" alt="Hand"></img>
        <canvas id="myCanvas" width="800" height="800"></canvas>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);