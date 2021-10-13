import { IOnnxModel } from "../onnx/onnx-model";
import { Yolo } from "../onnx/yolo/yolo";

/** 
 * Loads a video from url
 */
export class VideoLoader {
    video: HTMLVideoElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    model: IOnnxModel;

    constructor(video:HTMLVideoElement, canvas:HTMLCanvasElement) {
        // this.video = document.createElement('video');
        this.video = video
        // this.video.src = url;
        // this.canvas = document.createElement('canvas');
        this.canvas = canvas;
        this.canvas.width = 416;
        this.canvas.height = 416;
        this.ctx = this.canvas.getContext("2d");
        this.model = new Yolo();
    }

    async processFrames(fps: number) {
        this.video.currentTime = 0;
        
        this.video.onseeked = async () => {
            if (!this.ctx) {
                return;
            }
            
            const canvasHeight = this.ctx.canvas.height;
            const canvasWidth = this.ctx.canvas.width;

            let height = this.video.videoHeight;
            let width = this.video.videoWidth;

            if (height > canvasHeight) {
                let multiplier = (canvasHeight / height);
                height *= multiplier;
                width *= multiplier;
            }
            
            if (width > canvasWidth) {
                let multiplier = (canvasWidth / width);
                height *= multiplier;
                width *= multiplier;
            }

            const offset_x = (canvasWidth - width) / 2;
            const offset_y = (canvasHeight - height) / 2;

            this.ctx.clearRect(0,0,canvasWidth, canvasHeight);
            this.ctx.drawImage(this.video, offset_x, offset_y, width, height);
            let imgData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            let bboxes = await this.model.run(imgData);
            bboxes.forEach((bbox: any) => {         
                if (this.ctx == null) return;
                // label
                this.ctx.font = "10px Arial"                
                this.ctx.fillStyle = "red";
                this.ctx.fillText(bbox.className, bbox.left, bbox.top + 10);
                
                // bbox
                this.ctx.beginPath();                
                this.ctx.lineWidth = 4;
                this.ctx.strokeStyle = "red";
                this.ctx.rect(bbox.left, bbox.top, (bbox.right-bbox.left), (bbox.bottom - bbox.top));
                this.ctx.stroke();
            })
        }

    }

    cloneVideo(){
        this.video.ontimeupdate = () => {
            this.ctx?.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);      
        }
    }
}
