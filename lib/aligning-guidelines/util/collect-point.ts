import type { FabricObject, Point } from 'fabric';
import type { AligningGuidelines } from '..';
import type { LineProps } from '../typedefs';
import { getDistanceList } from './basic';

type CollectPointProps = {
  target: FabricObject;
  /** Operation points of the target element: top-left, bottom-left, top-right, bottom-right */
  point: Point;
  /** Position using diagonal points when resizing/scaling. */
  diagonalPoint: Point;
  /** Set of points to consider for alignment: [tl, tr, br, bl, center] */
  list: Point[];
  /** Change the zoom or change the size, determine by whether e.transform.action starts with the string "scale" */
  isScale: boolean;
  /** Whether to change uniformly is determined by canvas.uniformScaling and canvas.uniScaleKey. */
  isUniform: boolean;
  /** When holding the centerKey (default is altKey), the shape will scale based on the center point, with the reference point being the center. */
  isCenter: boolean;
  /** tl、tr、br、bl、mt、mr、mb、ml */
  corner: string;
};

export function collectVerticalPoint(
  this: AligningGuidelines,
  props: CollectPointProps,
): LineProps[] {
  const {
    target,
    isScale,
    isUniform,
    corner,
    point,
    diagonalPoint,
    list,
    isCenter,
  } = props;
  const { dis, arr } = getDistanceList(point, list, 'x');
  const margin = this.margin / this.canvas.getZoom();
  if (dis > margin) return [];
  
  let v = arr[arr.length - 1].x - point.x;
  const dirX = corner.includes('l') ? -1 : 1;
  const dirY = corner.includes('t') ? -1 : 1;
  const angle = (target.angle || 0) * Math.PI / 180;
  
  const { width, height, scaleX, scaleY } = target;
  const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
  const scaleWidth = scaleX * width + dStrokeWidth;
  const scaleHeight = scaleY * height + dStrokeWidth;

  const isTextbox = target.type === 'textbox';
  const isSideHandle = corner === 'ml' || corner === 'mr';

  let sx = 0;
  let sy = 0;
  let modifyScaleX = false;
  let modifyScaleY = false;

  if (isUniform || isTextbox) {
    const denominator = (dirX * scaleWidth * Math.cos(angle)) - (corner.includes('m') ? 0 : (dirY * scaleHeight * Math.sin(angle)));
    if (Math.abs(denominator) < 0.0001) return [];
    sx = 1 + v / denominator;
    sy = sx;
    modifyScaleX = true;
    modifyScaleY = true;
  } else {
    // Non-uniform: Use the dominant trigonometric axis for adjusting global X
    if (Math.abs(Math.cos(angle)) >= Math.abs(Math.sin(angle))) {
      if (corner === 'mt' || corner === 'mb') return []; // side handles orthogonal
      const denominator = dirX * scaleWidth * Math.cos(angle);
      if (Math.abs(denominator) < 0.0001) return [];
      sx = 1 + v / denominator;
      modifyScaleX = true;
    } else {
      if (corner === 'ml' || corner === 'mr') return []; // side handles orthogonal
      const denominator = -dirY * scaleHeight * Math.sin(angle);
      if (Math.abs(denominator) < 0.0001) return [];
      sy = 1 + v / denominator;
      modifyScaleY = true;
    }
  }

  if ((modifyScaleX && sx <= 0) || (modifyScaleY && sy <= 0)) return [];

  const isImageCropping = target.type === 'image' && isSideHandle && typeof (target as any).__applyCropSnap === 'function';
  if (isImageCropping) {
    (target as any).__applyCropSnap(corner, modifyScaleX ? sx : sy, (props as any).transform);
    target.setCoords();
    return arr.map((t) => ({ origin: point, target: { x: t.x, y: t.y, isArtboard: (t as any).isArtboard, isCenter: (t as any).isCenter } as any }));
  }

  if (isScale && !isSideHandle) {
    if (modifyScaleX) target.set('scaleX', scaleX * sx);
    if (modifyScaleY) target.set('scaleY', scaleY * sy);
  } else {
    if (modifyScaleX) target.set('width', width * sx);
    if (modifyScaleY) target.set('height', height * sy);
  }

  if (isCenter) {
    target.setRelativeXY(diagonalPoint, 'center', 'center');
  } else {
    const originArr = this.contraryOriginMap;
    target.setRelativeXY(diagonalPoint, ...originArr[corner]);
  }
  target.setCoords();
  return arr.map((t) => ({ origin: point, target: { x: t.x, y: t.y, isArtboard: (t as any).isArtboard, isCenter: (t as any).isCenter } as any }));
}

export function collectHorizontalPoint(
  this: AligningGuidelines,
  props: CollectPointProps,
): LineProps[] {
  const {
    target,
    isScale,
    isUniform,
    corner,
    point,
    diagonalPoint,
    list,
    isCenter,
  } = props;
  const { dis, arr } = getDistanceList(point, list, 'y');
  const margin = this.margin / this.canvas.getZoom();
  if (dis > margin) return [];
  
  let v = arr[arr.length - 1].y - point.y;
  const dirX = corner.includes('l') ? -1 : 1;
  const dirY = corner.includes('t') ? -1 : 1;
  const angle = (target.angle || 0) * Math.PI / 180;

  const { width, height, scaleX, scaleY } = target;
  const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
  const scaleWidth = scaleX * width + dStrokeWidth;
  const scaleHeight = scaleY * height + dStrokeWidth;

  const isTextbox = target.type === 'textbox';
  const isSideHandle = corner === 'mt' || corner === 'mb';

  let sx = 0;
  let sy = 0;
  let modifyScaleX = false;
  let modifyScaleY = false;

  if (isUniform || isTextbox) {
    const denominator = (corner.includes('m') ? 0 : (dirX * scaleWidth * Math.sin(angle))) + (dirY * scaleHeight * Math.cos(angle));
    if (Math.abs(denominator) < 0.0001) return [];
    sy = 1 + v / denominator;
    sx = sy;
    modifyScaleX = true;
    modifyScaleY = true;
  } else {
    if (Math.abs(Math.cos(angle)) >= Math.abs(Math.sin(angle))) {
      if (corner === 'ml' || corner === 'mr') return [];
      const denominator = dirY * scaleHeight * Math.cos(angle);
      if (Math.abs(denominator) < 0.0001) return [];
      sy = 1 + v / denominator;
      modifyScaleY = true;
    } else {
      if (corner === 'mt' || corner === 'mb') return [];
      const denominator = dirX * scaleWidth * Math.sin(angle);
      if (Math.abs(denominator) < 0.0001) return [];
      sx = 1 + v / denominator;
      modifyScaleX = true;
    }
  }

  if ((modifyScaleX && sx <= 0) || (modifyScaleY && sy <= 0)) return [];

  const isImageCropping = target.type === 'image' && isSideHandle && typeof (target as any).__applyCropSnap === 'function';
  if (isImageCropping) {
    (target as any).__applyCropSnap(corner, modifyScaleY ? sy : sx, (props as any).transform);
    target.setCoords();
    return arr.map((t) => ({ origin: point, target: { x: t.x, y: t.y, isArtboard: (t as any).isArtboard, isCenter: (t as any).isCenter } as any }));
  }

  if (isScale && !isSideHandle) {
    if (modifyScaleX) target.set('scaleX', scaleX * sx);
    if (modifyScaleY) target.set('scaleY', scaleY * sy);
  } else {
    if (modifyScaleX) target.set('width', width * sx);
    if (modifyScaleY) target.set('height', height * sy);
  }

  if (isCenter) {
    target.setRelativeXY(diagonalPoint, 'center', 'center');
  } else {
    const originArr = this.contraryOriginMap;
    target.setRelativeXY(diagonalPoint, ...originArr[corner]);
  }
  target.setCoords();
  return arr.map((t) => ({ origin: point, target: { x: t.x, y: t.y, isArtboard: (t as any).isArtboard, isCenter: (t as any).isCenter } as any }));
}
