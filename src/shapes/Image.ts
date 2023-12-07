// @ts-nocheck
import { getDocument, getEnv } from '../env';
import type { BaseFilter } from '../filters/BaseFilter';
import { getFilterBackend } from '../filters/FilterBackend';
import { SHARED_ATTRIBUTES } from '../parser/attributes';
import { parseAttributes } from '../parser/parseAttributes';
import { TClassProperties, TSize } from '../typedefs';
import { uid } from '../util/internals/uid';
import { createCanvasElement } from '../util/misc/dom';
import { findScaleToCover, findScaleToFit } from '../util/misc/findScaleTo';
import {
  enlivenObjectEnlivables,
  enlivenObjects,
  loadImage,
  LoadImageOptions,
} from '../util/misc/objectEnlive';
import { parsePreserveAspectRatioAttribute } from '../util/misc/svgParsing';
import { classRegistry } from '../ClassRegistry';
import { FabricObject, cacheProperties } from './Object/FabricObject';
import type {
  FabricObjectProps,
  SerializedObjectProps,
  TProps,
} from './Object/types';
import type { ObjectEvents } from '../EventTypeDefs';
import { WebGLFilterBackend } from '../filters/WebGLFilterBackend';
import { createFileDefaultControls } from '../controls/commonControls';
// @todo Would be nice to have filtering code not imported directly.

export type ImageSource =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement;

interface UniqueImageProps {
  srcFromAttribute: boolean;
  minimumScaleTrigger: number;
  cropX: number;
  cropY: number;
  imageSmoothing: boolean;
  crossOrigin: string | null;
  filters: BaseFilter[];
  resizeFilter?: BaseFilter;
}

export const imageDefaultValues: Partial<UniqueImageProps> &
  Partial<FabricObjectProps> = {
  strokeWidth: 0,
  srcFromAttribute: false,
  minimumScaleTrigger: 0.5,
  cropX: 0,
  cropY: 0,
  imageSmoothing: true,
  crossOrigin: 'anonymous',
  originX: 'center',
  originY: 'center',
};

export interface SerializedImageProps extends SerializedObjectProps {
  src: string;
  crossOrigin: string | null;
  filters: any[];
  resizeFilter?: any;
  cropX: number;
  cropY: number;
}

export interface ImageProps extends FabricObjectProps, UniqueImageProps { }

const IMAGE_PROPS = ['cropX', 'cropY'] as const;

/**
 * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#images}
 */
export class Image<
  Props extends TProps<ImageProps> = Partial<ImageProps>,
  SProps extends SerializedImageProps = SerializedImageProps,
  EventSpec extends ObjectEvents = ObjectEvents
>
  extends FabricObject<Props, SProps, EventSpec>
  implements ImageProps {
  /**
   * When calling {@link Image.getSrc}, return value from element src with `element.getAttribute('src')`.
   * This allows for relative urls as image src.
   * @since 2.7.0
   * @type Boolean
   * @default false
   */
  declare srcFromAttribute: boolean;

  /**
   * private
   * contains last value of scaleX to detect
   * if the Image got resized after the last Render
   * @type Number
   */
  protected _lastScaleX = 1;

  /**
   * private
   * contains last value of scaleY to detect
   * if the Image got resized after the last Render
   * @type Number
   */
  protected _lastScaleY = 1;

  /**
   * private
   * contains last value of scaling applied by the apply filter chain
   * @type Number
   */
  protected _filterScalingX = 1;

  /**
   * private
   * contains last value of scaling applied by the apply filter chain
   * @type Number
   */
  protected _filterScalingY = 1;

  /**
   * minimum scale factor under which any resizeFilter is triggered to resize the image
   * 0 will disable the automatic resize. 1 will trigger automatically always.
   * number bigger than 1 are not implemented yet.
   * @type Number
   */
  declare minimumScaleTrigger: number;

  /**
   * key used to retrieve the texture representing this image
   * @since 2.0.0
   * @type String
   * @default
   */
  declare cacheKey: string;

  /**
   * Image crop in pixels from original image size.
   * @since 2.0.0
   * @type Number
   * @default
   */
  declare cropX: number;

  /**
   * Image crop in pixels from original image size.
   * @since 2.0.0
   * @type Number
   * @default
   */
  declare cropY: number;

  /**
   * Indicates whether this canvas will use image smoothing when painting this image.
   * Also influence if the cacheCanvas for this image uses imageSmoothing
   * @since 4.0.0-beta.11
   * @type Boolean
   * @default
   */
  declare imageSmoothing: boolean;

  declare preserveAspectRatio: string;

  protected declare src: string;

  declare filters: BaseFilter[];

  declare resizeFilter: BaseFilter;

  /*  cusotm function */
  declare obj_type: string;

  declare locked: boolean;

  declare whiteboardId: string;

  declare userId: string;

  declare timestamp: Date;

  declare verticalAlign: string;

  declare zIndex: number;

  declare lines: object[];

  declare relationship: object[];

  declare _id: string;

  declare oWidth: number;

  declare oHeight: number;

  declare strokeWidth: number;

  public extendPropeties = ['obj_type', 'whiteboardId', 'userId', 'timestamp', 'zIndex', 'locked', 'verticalAlign', 'line', 'relationship', '_id', 'oWidth', 'oHeight', 'strokeWidth'];

  protected declare _element: ImageSource;
  protected declare _originalElement: ImageSource;
  protected declare _filteredEl: ImageSource;

  static cacheProperties = [...cacheProperties, ...IMAGE_PROPS];

  static ownDefaults: Record<string, any> = imageDefaultValues;

  static getDefaults() {
    return {
      ...super.getDefaults(),
      controls: createFileDefaultControls(),
      ...Image.ownDefaults,
    };
  }
  /**
   * Constructor
   * Image can be initialized with any canvas drawable or a string.
   * The string should be a url and will be loaded as an image.
   * Canvas and Image element work out of the box, while videos require extra code to work.
   * Please check video element events for seeking.
   * @param {ImageSource | string} element Image element
   * @param {Object} [options] Options object
   */
  constructor(elementId: string, options: Props);
  constructor(element: ImageSource, options: Props);
  constructor(arg0: ImageSource | string, options: Props = {} as Props) {
    super({ filters: [], ...options });
    this.cacheKey = `texture${uid()}`;
    this.setElement(
      typeof arg0 === 'string'
        ? (getDocument().getElementById(arg0) as ImageSource)
        : arg0,
      options
    );

  }

  /**
   * Returns image element which this instance if based on
   */
  getElement() {
    return this._element;
  }

  /**
   * Sets image element for this instance to a specified one.
   * If filters defined they are applied to new image.
   * You might need to call `canvas.renderAll` and `object.setCoords` after replacing, to render new image and update controls area.
   * @param {HTMLImageElement} element
   * @param {Partial<TSize>} [size] Options object
   */
  setElement(element: ImageSource, size: Partial<TSize> = {}) {
    this.removeTexture(this.cacheKey);
    this.removeTexture(`${this.cacheKey}_filtered`);
    this._element = element;
    this._originalElement = element;
    this._setWidthHeight(size);
    element.classList.add(Image.CSS_CANVAS);
    if (this.filters.length !== 0) {
      this.applyFilters();
    }
    // resizeFilters work on the already filtered copy.
    // we need to apply resizeFilters AFTER normal filters.
    // applyResizeFilters is run more often than normal filters
    // and is triggered by user interactions rather than dev code
    if (this.resizeFilter) {
      this.applyResizeFilters();
    }
  }

  /**
   * Delete a single texture if in webgl mode
   */
  removeTexture(key: string) {
    const backend = getFilterBackend(false);
    if (backend instanceof WebGLFilterBackend) {
      backend.evictCachesForKey(key);
    }
  }

  /**
   * Delete textures, reference to elements and eventually JSDOM cleanup
   */
  dispose() {
    super.dispose();
    this.removeTexture(this.cacheKey);
    this.removeTexture(`${this.cacheKey}_filtered`);
    this._cacheContext = null;
    ['_originalElement', '_element', '_filteredEl', '_cacheCanvas'].forEach(
      (elementKey) => {
        getEnv().dispose(this[elementKey as keyof this] as Element);
        // @ts-expect-error disposing
        this[elementKey] = undefined;
      }
    );
  }

  /**
   * Get the crossOrigin value (of the corresponding image element)
   */
  getCrossOrigin(): string | null {
    return (
      this._originalElement &&
      ((this._originalElement as any).crossOrigin || null)
    );
  }

  /**
   * Returns original size of an image
   */
  getOriginalSize() {
    const element = this.getElement() as any;
    if (!element) {
      return {
        width: 0,
        height: 0,
      };
    }
    return {
      width: element.naturalWidth || element.width,
      height: element.naturalHeight || element.height,
    };
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _stroke(ctx: CanvasRenderingContext2D) {
    if (!this.stroke || this.strokeWidth === 0) {
      return;
    }
    const w = this.width / 2,
      h = this.height / 2;
    ctx.beginPath();
    ctx.moveTo(-w, -h);
    ctx.lineTo(w, -h);
    ctx.lineTo(w, h);
    ctx.lineTo(-w, h);
    ctx.lineTo(-w, -h);
    ctx.closePath();
  }

  /**
   * Returns object representation of an instance
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} Object representation of an instance
   */
  toObject<
    T extends Omit<Props & TClassProperties<this>, keyof SProps>,
    K extends keyof T = never
  >(propertiesToInclude: K[] = []): Pick<T, K> & SProps {
    const filters: Record<string, any>[] = [];
    this.filters.forEach((filterObj) => {
      filterObj && filters.push(filterObj.toObject());
    });
    return {
      ...super.toObject([...IMAGE_PROPS, ...this.extendPropeties, ...propertiesToInclude]),
      src: this.getSrc(),
      crossOrigin: this.getCrossOrigin(),
      filters,
      ...(this.resizeFilter
        ? { resizeFilter: this.resizeFilter.toObject() }
        : {}),
    };
  }

  getObject() {
    const object = {};
    const keys = [
      '_id',
      'angle',
      'backgroundColor',
      'fill',
      'width',
      'height',
      'left',
      'locked',
      'lockScalingX',
      'lockScalingY',
      'lockMovementX',
      'lockMovementY',
      'lockScalingFlip',
      'obj_type',
      'originX',
      'originY',
      'scaleX',
      'scaleY',
      'selectable',
      'top',
      'userNo',
      'userId',
      'whiteboardId',
      'zIndex',
      'version',
      'isPanel',
      'panelObj',
      'relationship',
      'flipX',
      'flipY',
      'stroke',
      'strokeWidth',
      'lines',
      'src',
      'name',
      'progressBar',
      'isUploading',
      'initedProgressBar',
      'hoverCursor',
      'lockUniScaling',
      'cornerStyle',
      'lightbox',
      'cropSelectionRect',
      'url',
    ];
    keys.forEach((key) => {
      object[key] = this[key];
    });
    return object;
  }

  /* custom function */
  getWidgetMenuList() {
    if (this.locked) {
      return ['objectLock'];
    }
    return ['more', 'objectLock', 'crop', 'delete', 'aiassist'];
  }
  getWidgetMenuLength() {
    if (this.locked) return 30;
    return 80;
  }
  getContextMenuList() {
    let menuList;
    if (this.locked) {
      menuList = [
        'Open image',
        'Export board',
        'Exporting selected area',
        'Create Share Back',
        'Bring forward',
        'Bring to front',
        'Send backward',
        'Send to back',
        'Copy as image'
      ];
    } else {
      menuList = [
        'Open image',
        'Export board',
        'Exporting selected area',
        'Create Share Back',
        'Bring forward',
        'Bring to front',
        'Send backward',
        'Send to back',
        'Duplicate',
        'Copy',
        'Copy as image',
        'Paste',
        'Cut',
        'Delete'
      ];
    }
    menuList.push('Select All');
    if (this.locked) {
      menuList.push('Unlock');
    } else {
      menuList.push('Lock');
    }

    // if (this.isPanel && !this.locked) {
    //   menuList.push('Switch to non-panel');
    // } else {
    //   menuList.push('Switch to panel');
    // }

    return menuList;
  }
  setLockedShadow(locked) {
    if (locked) {
      this.shadow = new fabric.Shadow({
        blur: 2,
        offsetX: 0,
        offsetY: 0,
        color: 'rgba(0, 0, 0, 0.5)'
      });
    } else {
      this.shadow = new fabric.Shadow({
        blur: 8,
        offsetX: 0,
        offsetY: 4,
        color: 'rgba(0,0,0,0.04)'
      });
    }
  }
  /**
   * Returns true if an image has crop applied, inspecting values of cropX,cropY,width,height.
   * @return {Boolean}
   */
  hasCrop() {
    return (
      !!this.cropX ||
      !!this.cropY ||
      this.width < this._element.width ||
      this.height < this._element.height
    );
  }

  /**
   * Returns svg representation of an instance
   * @return {string[]} an array of strings with the specific svg representation
   * of the instance
   */
  _toSVG() {
    const imageMarkup = [],
      element = this._element,
      x = -this.width / 2,
      y = -this.height / 2;
    let svgString = [],
      strokeSvg,
      clipPath = '',
      imageRendering = '';
    if (!element) {
      return [];
    }
    if (this.hasCrop()) {
      const clipPathId = uid();
      svgString.push(
        '<clipPath id="imageCrop_' + clipPathId + '">\n',
        '\t<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        this.width +
        '" height="' +
        this.height +
        '" />\n',
        '</clipPath>\n'
      );
      clipPath = ' clip-path="url(#imageCrop_' + clipPathId + ')" ';
    }
    if (!this.imageSmoothing) {
      imageRendering = '" image-rendering="optimizeSpeed';
    }
    imageMarkup.push(
      '\t<image ',
      'COMMON_PARTS',
      'xlink:href="',
      this.getSvgSrc(true),
      '" x="',
      x - this.cropX,
      '" y="',
      y - this.cropY,
      // we're essentially moving origin of transformation from top/left corner to the center of the shape
      // by wrapping it in container <g> element with actual transformation, then offsetting object to the top/left
      // so that object's center aligns with container's left/top
      '" width="',
      element.width || element.naturalWidth,
      '" height="',
      element.height || element.naturalHeight,
      imageRendering,
      '"',
      clipPath,
      '></image>\n'
    );

    if (this.stroke || this.strokeDashArray) {
      const origFill = this.fill;
      this.fill = null;
      strokeSvg = [
        '\t<rect ',
        'x="',
        x,
        '" y="',
        y,
        '" width="',
        this.width,
        '" height="',
        this.height,
        '" style="',
        this.getSvgStyles(),
        '"/>\n',
      ];
      this.fill = origFill;
    }
    if (this.paintFirst !== 'fill') {
      svgString = svgString.concat(strokeSvg, imageMarkup);
    } else {
      svgString = svgString.concat(imageMarkup, strokeSvg);
    }
    return svgString;
  }

  /**
   * Returns source of an image
   * @param {Boolean} filtered indicates if the src is needed for svg
   * @return {String} Source of an image
   */
  getSrc(filtered?: boolean): string {
    const element = filtered ? this._element : this._originalElement;
    if (element) {
      if (element.toDataURL) {
        return element.toDataURL();
      }

      if (this.srcFromAttribute) {
        return element.getAttribute('src');
      } else {
        return element.src;
      }
    } else {
      return this.src || '';
    }
  }

  /**
   * Alias for getSrc
   * @param filtered
   * @deprecated
   */
  getSvgSrc(filtered?: boolean) {
    return this.getSrc(filtered);
  }

  /**
   * Loads and sets source of an image\
   * **IMPORTANT**: It is recommended to abort loading tasks before calling this method to prevent race conditions and unnecessary networking
   * @param {String} src Source string (URL)
   * @param {LoadImageOptions} [options] Options object
   */
  setSrc(src: string, { crossOrigin, signal }: LoadImageOptions = {}) {
    return loadImage(src, { crossOrigin: 'annonymous', signal }).then((img) => {
      typeof crossOrigin !== 'undefined' && this.set({ crossOrigin: 'annonymous' });
      this.setElement(img);
    });
  }

  /**
   * Returns string representation of an instance
   * @return {String} String representation of an instance
   */
  toString() {
    return `#<Image: { src: "${this.getSrc()}" }>`;
  }

  applyResizeFilters() {
    const filter = this.resizeFilter,
      minimumScale = this.minimumScaleTrigger,
      objectScale = this.getTotalObjectScaling(),
      scaleX = objectScale.x,
      scaleY = objectScale.y,
      elementToFilter = this._filteredEl || this._originalElement;
    if (this.group) {
      this.set('dirty', true);
    }
    if (!filter || (scaleX > minimumScale && scaleY > minimumScale)) {
      this._element = elementToFilter;
      this._filterScalingX = 1;
      this._filterScalingY = 1;
      this._lastScaleX = scaleX;
      this._lastScaleY = scaleY;
      return;
    }
    const canvasEl = createCanvasElement(),
      sourceWidth = elementToFilter.width,
      sourceHeight = elementToFilter.height;
    canvasEl.width = sourceWidth;
    canvasEl.height = sourceHeight;
    this._element = canvasEl;
    this._lastScaleX = filter.scaleX = scaleX;
    this._lastScaleY = filter.scaleY = scaleY;
    getFilterBackend().applyFilters(
      [filter],
      elementToFilter,
      sourceWidth,
      sourceHeight,
      this._element
    );
    this._filterScalingX = canvasEl.width / this._originalElement.width;
    this._filterScalingY = canvasEl.height / this._originalElement.height;
  }

  /**
   * Applies filters assigned to this image (from "filters" array) or from filter param
   * @method applyFilters
   * @param {Array} filters to be applied
   * @param {Boolean} forResizing specify if the filter operation is a resize operation
   */
  applyFilters(filters: BaseFilter[] = this.filters || []) {
    filters = filters.filter((filter) => filter && !filter.isNeutralState());
    this.set('dirty', true);

    // needs to clear out or WEBGL will not resize correctly
    this.removeTexture(`${this.cacheKey}_filtered`);

    if (filters.length === 0) {
      this._element = this._originalElement;
      this._filteredEl = null;
      this._filterScalingX = 1;
      this._filterScalingY = 1;
      return;
    }

    const imgElement = this._originalElement,
      sourceWidth = imgElement.naturalWidth || imgElement.width,
      sourceHeight = imgElement.naturalHeight || imgElement.height;

    if (this._element === this._originalElement) {
      // if the element is the same we need to create a new element
      const canvasEl = createCanvasElement();
      canvasEl.width = sourceWidth;
      canvasEl.height = sourceHeight;
      this._element = canvasEl;
      this._filteredEl = canvasEl;
    } else {
      // clear the existing element to get new filter data
      // also dereference the eventual resized _element
      this._element = this._filteredEl;
      this._filteredEl
        .getContext('2d')
        .clearRect(0, 0, sourceWidth, sourceHeight);
      // we also need to resize again at next renderAll, so remove saved _lastScaleX/Y
      this._lastScaleX = 1;
      this._lastScaleY = 1;
    }
    getFilterBackend().applyFilters(
      filters,
      this._originalElement,
      sourceWidth,
      sourceHeight,
      this._element
    );
    if (
      this._originalElement.width !== this._element.width ||
      this._originalElement.height !== this._element.height
    ) {
      this._filterScalingX = this._element.width / this._originalElement.width;
      this._filterScalingY =
        this._element.height / this._originalElement.height;
    }
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render(ctx: CanvasRenderingContext2D) {
    ctx.imageSmoothingEnabled = this.imageSmoothing;
    if (this.isMoving !== true && this.resizeFilter && this._needsResize()) {
      this.applyResizeFilters();
    }
    this._stroke(ctx);
    this._renderPaintInOrder(ctx);
    //this.resizeImageAccordingToZoomAndOnScreen();
  }

  /**
   * Paint the cached copy of the object on the target context.
   * it will set the imageSmoothing for the draw operation
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  drawCacheOnCanvas(ctx: CanvasRenderingContext2D) {
    ctx.imageSmoothingEnabled = this.imageSmoothing;
    super.drawCacheOnCanvas(ctx);
  }

  /**
   * Decide if the object should cache or not. Create its own cache level
   * needsItsOwnCache should be used when the object drawing method requires
   * a cache step. None of the fabric classes requires it.
   * Generally you do not cache objects in groups because the group outside is cached.
   * This is the special image version where we would like to avoid caching where possible.
   * Essentially images do not benefit from caching. They may require caching, and in that
   * case we do it. Also caching an image usually ends in a loss of details.
   * A full performance audit should be done.
   * @return {Boolean}
   */
  shouldCache() {
    return this.needsItsOwnCache();
  }

  _renderFill(ctx: CanvasRenderingContext2D) {
    const elementToDraw = this._element;
    if (!elementToDraw) {
      return;
    }
    const scaleX = this._filterScalingX,
      scaleY = this._filterScalingY,
      w = this.width,
      h = this.height,
      // crop values cannot be lesser than 0.
      cropX = Math.max(this.cropX, 0),
      cropY = Math.max(this.cropY, 0),
      elWidth = elementToDraw.naturalWidth || elementToDraw.width,
      elHeight = elementToDraw.naturalHeight || elementToDraw.height,
      sX = cropX * scaleX,
      sY = cropY * scaleY,
      // the width height cannot exceed element width/height, starting from the crop offset.
      sW = Math.min(w * scaleX, elWidth - sX),
      sH = Math.min(h * scaleY, elHeight - sY),
      x = -w / 2,
      y = -h / 2,
      maxDestW = Math.min(w, elWidth / scaleX - cropX),
      maxDestH = Math.min(h, elHeight / scaleY - cropY);

    elementToDraw &&
      ctx.drawImage(elementToDraw, sX, sY, sW, sH, x, y, maxDestW, maxDestH);
  }

  /**
   * needed to check if image needs resize
   * @private
   */
  _needsResize() {
    const scale = this.getTotalObjectScaling();
    return scale.x !== this._lastScaleX || scale.y !== this._lastScaleY;
  }

  /**
   * @private
   * @deprecated unused
   */
  _resetWidthHeight() {
    this.set(this.getOriginalSize());
  }

  /**
   * @private
   * Set the width and the height of the image object, using the element or the
   * options.
   */
  _setWidthHeight({ width, height }: Partial<TSize> = {}) {
    const size = this.getOriginalSize();
    this.width = width || size.width;
    this.height = height || size.height;
  }

  /**
   * Calculate offset for center and scale factor for the image in order to respect
   * the preserveAspectRatio attribute
   * @private
   */
  parsePreserveAspectRatioAttribute() {
    const pAR = parsePreserveAspectRatioAttribute(
      this.preserveAspectRatio || ''
    ),
      pWidth = this.width,
      pHeight = this.height,
      parsedAttributes = { width: pWidth, height: pHeight };
    let rWidth = this._element.width,
      rHeight = this._element.height,
      scaleX = 1,
      scaleY = 1,
      offsetLeft = 0,
      offsetTop = 0,
      cropX = 0,
      cropY = 0,
      offset;

    if (pAR && (pAR.alignX !== 'none' || pAR.alignY !== 'none')) {
      if (pAR.meetOrSlice === 'meet') {
        scaleX = scaleY = findScaleToFit(this._element, parsedAttributes);
        offset = (pWidth - rWidth * scaleX) / 2;
        if (pAR.alignX === 'Min') {
          offsetLeft = -offset;
        }
        if (pAR.alignX === 'Max') {
          offsetLeft = offset;
        }
        offset = (pHeight - rHeight * scaleY) / 2;
        if (pAR.alignY === 'Min') {
          offsetTop = -offset;
        }
        if (pAR.alignY === 'Max') {
          offsetTop = offset;
        }
      }
      if (pAR.meetOrSlice === 'slice') {
        scaleX = scaleY = findScaleToCover(this._element, parsedAttributes);
        offset = rWidth - pWidth / scaleX;
        if (pAR.alignX === 'Mid') {
          cropX = offset / 2;
        }
        if (pAR.alignX === 'Max') {
          cropX = offset;
        }
        offset = rHeight - pHeight / scaleY;
        if (pAR.alignY === 'Mid') {
          cropY = offset / 2;
        }
        if (pAR.alignY === 'Max') {
          cropY = offset;
        }
        rWidth = pWidth / scaleX;
        rHeight = pHeight / scaleY;
      }
    } else {
      scaleX = pWidth / rWidth;
      scaleY = pHeight / rHeight;
    }
    return {
      width: rWidth,
      height: rHeight,
      scaleX,
      scaleY,
      offsetLeft,
      offsetTop,
      cropX,
      cropY,
    };
  }

  /**
   * Default CSS class name for canvas
   * @static
   * @type String
   * @default
   */
  static CSS_CANVAS = 'canvas-img';

  /**
   * List of attribute names to account for when parsing SVG element (used by {@link Image.fromElement})
   * @static
   * @see {@link http://www.w3.org/TR/SVG/struct.html#ImageElement}
   */
  static ATTRIBUTE_NAMES = [
    ...SHARED_ATTRIBUTES,
    'x',
    'y',
    'width',
    'height',
    'preserveAspectRatio',
    'xlink:href',
    'crossOrigin',
    'image-rendering',
  ];

  /**
   * Creates an instance of Image from its object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {object} [options] Options object
   * @param {AbortSignal} [options.signal] handle aborting, see https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal
   * @returns {Promise<Image>}
   */
  static fromObject<T extends TProps<SerializedImageProps>>(
    { filters: f, resizeFilter: rf, src, crossOrigin, ...object }: T,
    options: { signal: AbortSignal }
  ) {
    return Promise.all([
      loadImage(src, { ...options, crossOrigin: 'annonymous' }),
      f && enlivenObjects(f, options),
      // TODO: redundant - handled by enlivenObjectEnlivables
      rf && enlivenObjects([rf], options),
      enlivenObjectEnlivables(object, options),
    ]).then(([el, filters = [], [resizeFilter] = [], hydratedProps = {}]) => {
      return new this(el, {
        ...object,
        src,
        crossOrigin,
        filters,
        resizeFilter,
        ...hydratedProps,
      });
    });
  }

  /**
   * Creates an instance of Image from an URL string
   * @static
   * @param {String} url URL to create an image from
   * @param {LoadImageOptions} [options] Options object
   * @returns {Promise<Image>}
   */
  static fromURL<T extends TProps<SerializedImageProps>>(fileOptions: T & LoadImageOptions = {}
  ): Promise<Image> {
    return new Promise(async (resolve, reject) => {
      const url = fileOptions.previewImage ? fileOptions.previewImage : this.getFileIconURL(fileOptions.name);
      try {
        const loadedImg = await loadImage(url, fileOptions && fileOptions.crossOrigin);
        resolve(new Image(loadedImg, fileOptions));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns {@link Image} instance from an SVG element
   * @static
   * @param {SVGElement} element Element to parse
   * @param {Object} [options] Options object
   * @param {AbortSignal} [options.signal] handle aborting, see https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal
   * @param {Function} callback Callback to execute when Image object is created
   */
  static fromElement(
    element: SVGElement,
    callback: (image: Image) => any,
    options: { signal?: AbortSignal } = {}
  ) {
    const parsedAttributes = parseAttributes(element, this.ATTRIBUTE_NAMES);
    this.fromURL(parsedAttributes['xlink:href'], {
      ...options,
      ...parsedAttributes,
    }).then(callback);
  }

  initDoubleClickSimulation() {
    this.__lastClickTime = +new Date();
    this.on('mousedown', this.onMouseDown.bind(this));
  }

  onMouseDown(options) {
    this.__newClickTime = +new Date();
    if (this.__newClickTime - this.__lastClickTime < 500) {
      this.fire('dblclick', options);
      this._stopEvent(options.e);
    }

    this.__lastClickTime = this.__newClickTime;
  }

  _stopEvent(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }

  resizeImageAccordingToZoomAndOnScreen() {
    const zoom = this.canvas.getZoom();
    const realWidth = this.scaleX * this.width;

    const originalWidth = this.oWidth;
    const originalHeight = this.oHeight;
    let originalSrc = "";
    if (!this.src || this.src.indexOf('base64') !== -1) return;
    if (
      zoom >= 0.4 ||
      realWidth > getWindow().innerWidth * 0.4
    ) {
      if (this.src.includes('oss-')) {
        originalSrc =
          this.src.indexOf('?') === -1 ? this.src : this.src.split('?')[0];

      } else {
        originalSrc = this.src.replace('smallPic/', 'bigPic/');
      }
    }
    else {
      originalSrc = this.src.replace('bigPic/', 'smallPic/');
    }
    this.compressSize = 1000;
    const targetSrc = originalSrc;
    this.setSrc(
      targetSrc,
      () => {
        this.src = targetSrc;
        this.dirty = true;
        if (this.canvas) {
          this.canvas.renderAll();
        }

      },
      { crossOrigin: 'anonymous', ...this.toObject() }
    );

  }

  cloneWidget() {
    return this.getObject();
  }
  startCrop() {
    if (this.cropSelectionRect) {
      this.cancelCrop();
    }
    this.addSelectionRect();
  }
  cancelCrop() {
    return;
  }
  addSelectionRect() {
    return;
  }
  crop() { }
  cropObjectMovingHandler() { }
  cropObjectScalingHandler() { }
}

classRegistry.setClass(Image);
classRegistry.setSVGClass(Image);
