import { changeWidth } from './changeWidth';
import { Control } from './Control';
import { scaleCursorStyleHandler, scalingEqually } from './scale';
import { rotationStyleHandler, rotationWithSnapping } from './rotate';
import {
  scaleOrSkewActionName,
  scaleSkewCursorStyleHandler, scalingYOrSkewingX
} from './scaleSkew';
import {
  renderCircleControl,
} from './controlRendering';
import { degreesToRadians } from '../util/misc/radiansDegreesConversion';

export function renderCustomControl(ctx: any, left: any, top: any, fabricObject: any) {
  let styleOverride1 = {
    cornerSize: 10,
    cornerStrokeColor: '#b3cdfd',
    cornerColor: '#b3cdfd',
    lineWidth: 2
  };
  renderCircleControl.call(
    fabricObject,
    ctx,
    left,
    top,
    styleOverride1,
    fabricObject
  );
}

function renderIcon(ctx: any, left: any, top: any, styleOverride: any, fabricObject: any) {
  const svgRotateIcon = encodeURIComponent(`
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_d)">
    <circle cx="9" cy="9" r="5" fill="white"/>
    <circle cx="9" cy="9" r="4.75" stroke="black" stroke-opacity="0.3" stroke-width="0.5"/>
  </g>
    <path d="M10.8047 11.1242L9.49934 11.1242L9.49934 9.81885" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.94856 6.72607L8.25391 6.72607L8.25391 8.03142" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.69517 6.92267C10.007 7.03301 10.2858 7.22054 10.5055 7.46776C10.7252 7.71497 10.8787 8.01382 10.9517 8.33642C11.0247 8.65902 11.0148 8.99485 10.9229 9.31258C10.831 9.63031 10.6601 9.91958 10.4262 10.1534L9.49701 11.0421M8.25792 6.72607L7.30937 7.73554C7.07543 7.96936 6.90454 8.25863 6.81264 8.57636C6.72073 8.89408 6.71081 9.22992 6.78381 9.55251C6.8568 9.87511 7.01032 10.174 7.23005 10.4212C7.44978 10.6684 7.72855 10.8559 8.04036 10.9663" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
  <filter id="filter0_d" x="0" y="0" width="18" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
    <feOffset/>
    <feGaussianBlur stdDeviation="2"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.137674 0 0 0 0 0.190937 0 0 0 0 0.270833 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
  </filter>
  </defs>
</svg>
`)
  const rotateIcon = `data:image/svg+xml;utf8,${svgRotateIcon}`
  const imgIcon = document.createElement('img');
  imgIcon.src = rotateIcon;
  var size = 38;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(degreesToRadians(fabricObject.angle));
  ctx.drawImage(imgIcon, -size / 2, -size / 2, size, size);
  ctx.restore();
};

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
  mr: new Control({
    x: 0.5,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    actionHandler: changeWidth,
    render: renderCustomControl,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
  }),
  ml: new Control({
    x: -0.5,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    actionHandler: changeWidth,
    render: renderCustomControl,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',

  }),
  mb: new Control({
    x: 0,
    y: 0.5,
    offsetX: 0,
    offsetY: 0,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    render: renderCustomControl,
    getActionName: scaleOrSkewActionName,
  }),


  mtr: new Control({
    x: 0,
    y: -0.5,
    actionHandler: rotationWithSnapping,
    cursorStyleHandler: rotationStyleHandler,
    offsetY: -40,
    withConnection: true,
    actionName: 'rotate',
    render: renderIcon,

  }),
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
  // ml: new Control({
  //   x: -0.5,
  //   y: 0,
  //   actionHandler: changeWidth,
  //   cursorStyleHandler: scaleSkewCursorStyleHandler,
  //   actionName: 'resizing',
  // }),
});

export const createTextboxDefaultControls = () => ({
  //...createObjectDefaultControls(),
  ...createObjectDefaultControls(),
});
export const createRectNotesDefaultControls = () => ({
  ...createObjectDefaultNoRotateControls(),
  //...createResizeControls(),
});
export const createShapeNotesDefaultControls = () => ({
  ...createObjectDefaultNoRotateControls(),
  ...createResizeControls(),
});
export const createPathDefaultControls = () => ({
  ...createObjectDefaultNoRotateControls(),
});
export const createImageDefaultControls = () => ({
  ...createObjectDefaultControls(),
});
export const createFileDefaultControls = () => ({
  ...createObjectDefaultControls(),
});
