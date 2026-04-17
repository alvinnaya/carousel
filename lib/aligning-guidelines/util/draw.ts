import { Point } from 'fabric';
import type { AligningGuidelines } from '..';

export function drawLine(
  this: AligningGuidelines,
  origin: Point,
  target: Point,
) {
  const ctx = this.canvas.getTopContext();
  const viewportTransform = this.canvas.viewportTransform;
  const zoom = this.canvas.getZoom();
  ctx.save();
  ctx.transform(...viewportTransform);
  ctx.lineWidth = this.width / zoom;
  if (this.lineDash) ctx.setLineDash(this.lineDash);
  ctx.strokeStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  if (this.lineDash) ctx.setLineDash([]);

  this.drawX(origin, -1);
  this.drawX(target, 1);
  ctx.restore();
}

export function drawX(this: AligningGuidelines, point: Point, _: number) {
  const ctx = this.canvas.getTopContext();
  const zoom = this.canvas.getZoom();
  const size = this.xSize / zoom;
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.beginPath();
  ctx.moveTo(-size, -size);
  ctx.lineTo(size, size);
  ctx.moveTo(size, -size);
  ctx.lineTo(-size, size);
  ctx.stroke();
  ctx.restore();
}
function drawPoint(this: AligningGuidelines, arr: Point[]) {
  const ctx = this.canvas.getTopContext();
  const viewportTransform = this.canvas.viewportTransform;
  const zoom = this.canvas.getZoom();
  ctx.save();
  ctx.transform(...viewportTransform);
  ctx.lineWidth = this.width / zoom;
  ctx.strokeStyle = this.color;
  for (const item of arr) this.drawX(item, 0);
  ctx.restore();
}

export function drawPointList(this: AligningGuidelines) {
  const list = [];
  if (!this.closeVLine) {
    for (const v of this.verticalLines) list.push(JSON.parse(v));
  }
  if (!this.closeHLine) {
    for (const h of this.horizontalLines) list.push(JSON.parse(h));
  }
  const arr = list.map((item) => item.target);
  drawPoint.call(this, arr);
}

function drawDistanceText(this: AligningGuidelines, x: number, y: number, text: number) {
  const ctx = this.canvas.getTopContext();
  const zoom = this.canvas.getZoom();
  const viewportTransform = this.canvas.viewportTransform;
  
  ctx.save();
  ctx.transform(...viewportTransform);
  
  const fontSize = 10 / zoom;
  ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
  
  const textStr = `${text}`;
  const metrics = ctx.measureText(textStr);
  
  const paddingX = 4 / zoom;
  const paddingY = 2 / zoom;
  const width = metrics.width + paddingX * 2;
  const height = fontSize + paddingY * 2;
  
  const bgX = x - width / 2;
  const bgY = y - height / 2;
  
  ctx.fillStyle = this.color;
  
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bgX, bgY, width, height, 4 / zoom);
  } else {
    ctx.rect(bgX, bgY, width, height);
  }
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(textStr, x, y + (0.5 / zoom));
  
  ctx.restore();
}

export function drawVerticalLine(this: AligningGuidelines) {
  if (this.closeVLine) return;

  let lineWithMaxDist: { origin: any; target: any; dist: number } | null = null;
  let maxDist = -1;

  for (const v of this.verticalLines) {
    const { origin, target } = JSON.parse(v);
    if ((target as any).isArtboard && (target as any).isCenter) {
      const o1 = new Point(target.x, -99999);
      const o2 = new Point(target.x, 99999);
      this.drawLine(o1, o2);
    } else {
      const o = new Point(target.x, origin.y);
      this.drawLine(o, target);
      const dist = Math.round(Math.abs(target.y - origin.y));
      if (dist > 0 && !(target as any).isArtboard) {
        if (dist > maxDist) {
          maxDist = dist;
          lineWithMaxDist = { origin, target, dist };
        }
      }
    }
  }

  if (lineWithMaxDist) {
    drawDistanceText.call(this, lineWithMaxDist.target.x, (lineWithMaxDist.origin.y + lineWithMaxDist.target.y) / 2, lineWithMaxDist.dist);
  }
}

export function drawHorizontalLine(this: AligningGuidelines) {
  if (this.closeHLine) return;

  let lineWithMaxDist: { origin: any; target: any; dist: number } | null = null;
  let maxDist = -1;

  for (const h of this.horizontalLines) {
    const { origin, target } = JSON.parse(h);
    if ((target as any).isArtboard && (target as any).isCenter) {
      const o1 = new Point(-99999, target.y);
      const o2 = new Point(99999, target.y);
      this.drawLine(o1, o2);
    } else {
      const o = new Point(origin.x, target.y);
      this.drawLine(o, target);
      const dist = Math.round(Math.abs(target.x - origin.x));
      if (dist > 0 && !(target as any).isArtboard) {
        if (dist > maxDist) {
          maxDist = dist;
          lineWithMaxDist = { origin, target, dist };
        }
      }
    }
  }

  if (lineWithMaxDist) {
    drawDistanceText.call(this, (lineWithMaxDist.origin.x + lineWithMaxDist.target.x) / 2, lineWithMaxDist.target.y, lineWithMaxDist.dist);
  }
}
