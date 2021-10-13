import { useEffect, useRef } from 'react';
import './App.css';
import { VideoLoader } from './common/video-loader';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (videoRef.current != null && canvasRef.current != null){
      const videoLoader = new VideoLoader(videoRef.current, canvasRef.current);
      videoLoader.processFrames(60); 
      // videoLoader.cloneVideo();     
    }  
  })

  const video = require('./videos/sample_720p.mp4');
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <video ref={videoRef} src={video.default} controls={true}/>
        </div>
        <div>
          <canvas ref={canvasRef} width="160" height="96"></canvas>          
        </div>
      </header>
    </div>
  );
}

export default App;
