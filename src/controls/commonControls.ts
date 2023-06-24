import { changeWidth } from './changeWidth';
import { Control } from './Control';
import { scaleCursorStyleHandler, scalingEqually } from './scale';
import {
  scaleOrSkewActionName,
  scaleSkewCursorStyleHandler, scalingYOrSkewingX
} from './scaleSkew';


// use this function if you want to generate new controls for every instance
export const createObjectDefaultControls = () => ({

  tl: new Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  // mtr: new Control({
  //   x: 0,
  //   y: -0.5,
  //   actionHandler: rotationWithSnapping,
  //   cursorStyleHandler: rotationStyleHandler,
  //   offsetY: -40,
  //   withConnection: true,
  //   actionName: 'rotate',
  // }),
});

export const createObjectDefaultNoRotateControls = () => ({
  tl: new Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

});
export const createObjectImageControls = () => ({
  tl: new Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

});
export const createObjectFileControls = () => ({
  tl: new Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),
  br: new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

});
export const createObjectArrowControls = () => ({
  tl: new Control({
    x: -0.5,
    y: -0.5,
    cursorStyle: 'crosshair',
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),
  br: new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
  }),

});
export const createResizeControls = () => ({
  mr: new Control({
    x: 0.5,
    y: 0,
    offsetX: 20,
    offsetY: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
  }),
  ml: new Control({
    x: -0.5,
    y: 0,
    offsetX: -20,
    offsetY: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
  }),
  mb: new Control({
    x: 0,
    y: 0.5,
    offsetX: 0,
    offsetY: 20,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  }),

  mt: new Control({
    x: 0,
    y: -0.5,
    offsetX: 0,
    offsetY: -20,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  }),
});

export const createResizeControlsForText = () => ({
  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
  }),
  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
  }),
});
export const createTextboxDefaultControls = () => ({
  //...createObjectDefaultControls(),
  ...createResizeControlsForText(),
});
export const createRectNotesDefaultControls = () => ({
  ...createObjectDefaultNoRotateControls(),
  ...createResizeControls(),
});
export const createShapeNotesDefaultControls = () => ({
  ...createObjectDefaultNoRotateControls(),
  ...createResizeControls(),
});
export const createPathDefaultControls = () => ({
  ...createObjectDefaultNoRotateControls(),
});
export const createImageDefaultControls = () => ({
  ...createObjectImageControls(),
});
export const createFileDefaultControls = () => ({
  ...createObjectFileControls(),
});
