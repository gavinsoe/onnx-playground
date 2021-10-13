import { InferenceSession, Tensor } from "onnxruntime-web";
import { IOnnxModel } from "../onnx-model";

const ndarray = require("ndarray");
const ops = require("ndarray-ops");
const ort = require('onnxruntime-web');

type PreprocessOut = Tensor;

export class MaskRCNN implements IOnnxModel {
    session: InferenceSession;

    constructor() {
        const model = require('./model/mask_rcnn_R_50_FPN_1x.onnx');
        this.session = ort.InferenceSession.create(model.default);
    }

    preprocess(imageData: ImageData): PreprocessOut {
        /***
         * The images have to be loaded in to a range of [0, 255], resized, converted to 
         * BGR and then normalized using mean = [102.9801, 115.9465, 122.7717]. The 
         * transformation should preferably happen at preprocessing.
         * This model can take images of different sizes as input. However, to achieve 
         * best performance, it is recommended to resize the image such that both height
         * and width are within the range of [800, 1333], and then pad the image with zeros 
         * such that both height and width are divisible by 32.
         */
        const { data, width, height } = imageData;

        // skipping resize for now
        const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
        const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [width, height, 3])

        // RGB -> BGR
        ops.assign(dataProcessedTensor.pick(null,null,0), dataTensor.pick(null,null,2))
        ops.assign(dataProcessedTensor.pick(null,null,1), dataTensor.pick(null,null,1))
        ops.assign(dataProcessedTensor.pick(null,null,2), dataTensor.pick(null,null,0))
        
        const tensor = new ort.Tensor('float32', dataProcessedTensor.data, [width, height, 3]);        
        
        return tensor;
    }

    async run(img: ImageData) {
        let tensor = this.preprocess(img);
        const feeds = { a: tensor}

        const session = await this.session;
        const results = await session.run(feeds);
        
        console.log(results);
        // temporary
        return img;
    }

    // postprocess(tensor: Tensor): ImageData {

    // }
}