import React from 'react';
import ReactDOM from 'react-dom';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import { createTexture } from '@tensorflow/tfjs-backend-webgl/dist/webgl_util';
//might need to enable hardware acceleration on chrome

class App extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

    this.state = {
      gesture: "",
      width: 0,
      height: 0,
      ctx: undefined
    }
    this.distanceTwoPoint = this.distanceTwoPoint.bind(this);
    this.calculateAngle = this.calculateAngle.bind(this);
    this.makePrediction = this.makePrediction.bind(this);
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this.setState({ ctx: canvas.getContext('2d') });
  }

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

  async makePrediction(event) {
    // Read file from input
    // estimateHandPose based on HTMLImageElement
    // Determine if image is rock paper scissors
    if (event.target.files.length == 0) {
      console.log("No files were uploaded");
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0])
    
    var img = new Image();
    reader.onload = function (e) {
      img.src = e.target.result
    }
    
    const middleFinger = [[9,10,11], [9,11,12]];
    const ringFinger = [[13,14,15],[13,15,16]];
    const model = await handpose.load();
    const predictions = await model.estimateHands(img);
    this.setState({ width: img.width, height: img.height })
    this.state.ctx.drawImage(img, 0, 0);
    

    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;
        var middleFingerAngle = 
          this.calculateAngle(middleFinger[0], keypoints) +
          this.calculateAngle(middleFinger[1], keypoints);

        var ringFingerAngle = 
          this.calculateAngle(ringFinger[0], keypoints) +
          this.calculateAngle(ringFinger[1], keypoints);

        var gesture = "";
        if ((middleFingerAngle < Math.PI / 3) 
          && (ringFingerAngle < Math.PI / 3)) {
          gesture = "Paper";
        } else if ((middleFingerAngle < Math.PI / 3) 
        && (ringFingerAngle > Math.PI / 3)) {
          gesture = "Scissors";
        } else {
          gesture = "Rock"
        }
        this.setState({ gesture})
      }
    }
  }

  render() {
    return (
      <div className="wrapper">
        <input type="file" 
          onChange={this.makePrediction} 
          accept="image/*" />
        <canvas ref={this.canvasRef} 
          width={this.state.width}
          height={this.state.height} />
        {this.state.gesture}
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);