import {Tensor} from 'onnxruntime-web';
import { cast } from './yoloPostprocess';
import {NumberDataType, NumberOrBoolType} from './yoloPostprocess';
import {BroadcastUtil} from './yoloPostprocessUtils';

const ndarray = require("ndarray");

export function binaryOp(
  x: Tensor, y: Tensor, opLambda: (e1: number, e2: number) => number, resultType?: NumberOrBoolType): Tensor {
    if (resultType === 'bool') {
      x = cast(x, 'bool');
      y = cast(y, 'bool');
    }
    const result =
        BroadcastUtil.calc(ndarray(x.data as NumberDataType, 
                                   x.dims ? x.dims.slice(0) : [x.data.length]), 
                           ndarray(y.data as NumberDataType, 
                                   y.dims ? y.dims.slice(0) : [y.data.length]), opLambda);
    if (!result) {
      throw new Error('not broadcastable');
    }
    const rType = resultType ? resultType : x.type;  
    const output = new Tensor(rType, result.data, result.shape);
    return output;
}