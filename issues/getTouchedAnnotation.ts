interface TouchPoint {
  x: number;
  y: number;
}

interface Annotation {
  url: string;
  width: number;
  height: number;
  left: number;
  top: number;
}

// How far the touch can be from the annotation
const HIT_SLOP = 50;

/**
 * Retrieve annotation that should receive user's touch
 *
 * Annotation may receive touch if the touch is within the annotation
 * or close enough to annotation. If there are multiple annotations
 * close to each other, the nearest is selected. If there are overlapping
 * annotations and the touch is within the annotations' boundaries,
 * the last annotation is selected.
 */
export default function getTouchedAnnotation(
  point: TouchPoint,
  annotations: Annotation[]
) {
  let nearestDistance: number = Number.MAX_SAFE_INTEGER;
  let match: Annotation | undefined = undefined;

  annotations.forEach((annot) => {
    const left = annot.left;
    const top = annot.top;
    const right = left + annot.width;
    const bottom = top + annot.height;

    const isWithinBounds =
      left <= point.x &&
      right >= point.x &&
      top <= point.y &&
      bottom >= point.y;

    // Exact match
    if (isWithinBounds) {
      nearestDistance = 0;
      match = annot;
      return;
    }

    let distance = Number.MAX_SAFE_INTEGER;
    let deltaX = 0
    let deltaY = 0

    /*
      If point is outside the rectangle, check the eight possible options for where the point resides 
      with respect to the rectangle and calculate the distance to the corresponding edge or corner 
    */
    // Point is located above or below the rectangle. Calculate distance to nearest horizontal edge
    if (left <= point.x && point.x <= right) {
      if (point.y < top) {
        distance = top - point.y
      }
      else {
        distance = point.y - bottom
      }
    }
    // Point is located to the left or right of the rectangle. Calculate distance to nearest vertical edge.
    else if (top <= point.y && point.y <= bottom) {
      if (point.x < left) {
        distance = left - point.x
      }
      else {
        distance = point.x - right
      }
    }
    // Point is located elsewhere. Calculate distance to the nearest corner
    else {
      if (point.x < left && point.y < top) {
        deltaX = left - point.x
        deltaY = top - point.y
      }
      else if (point.x > right && point.y < top) {
        deltaX = point.x - right
        deltaY = top - point.y
      }
      else if (point.x < left && point.y > bottom) {
        deltaX = left - point.x
        deltaY = point.y - bottom
      }
      else if (point.x > right && point.y > bottom) {
        deltaX = point.x - right
        deltaY = point.y - bottom
      }
      distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    }
    
    // Close match
    if (distance < nearestDistance && distance < HIT_SLOP) {
      nearestDistance = distance;
      match = annot;
    }
  });

  return match;
}
