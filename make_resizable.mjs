import {setAttributes} from "./utils.mjs"

export let makeResizable = (svg, draggablePoints, parentSvg) => {
  draggablePoints.forEach((pointCoordinates, index) => {
    let pointSvg = makePointDraggable(pointCoordinates, parentSvg);

    // Set the SVG to update whenever any of its endpoints is updated
    svg.anchorTo([pointSvg], () => {
      setAttributes(svg, {
        [`x${index + 1}`]: pointSvg.get('cx'), [`y${index + 1}`]: pointSvg.get('cy'),
      });
    });
  });
}

function makePointDraggable({x, y}, parentSvg) {
  let pointSvg = createDragHandleAtPoint({x, y}, parentSvg);
  addDragEventListeners(pointSvg);
  return pointSvg;
}

function createDragHandleAtPoint({x, y}, parentSvg) {
  let pointSvg = parentSvg.circle(
    {cx: x, cy: y, r: 2},
    {cursor: 'pointer', fill: parentSvg.styles.stroke, padding: '70px'}
  );
  pointSvg.isDragging = false;
  return pointSvg;
}

function addDragEventListeners(pointSvg) {
  let startDrag = (event, pointSvg) => {
    pointSvg.isDragging = true;
    updatePointPosition(pointSvg, event);
  }
  let continueDrag = (event, pointSvg) => {
    if (pointSvg.isDragging) {
      updatePointPosition(pointSvg, event);
    }
  }
  let endDrag = (event, pointSvg) => {
    pointSvg.isDragging = false;
  }

  pointSvg.$element.addEventListener('pointerdown', (ev) => startDrag(ev, pointSvg));
  // Note: we must add the move listener to the surrounding element to support inertial (delayed) drag
  pointSvg.rootSvg.$element.addEventListener('pointermove', (ev) => continueDrag(ev, pointSvg));
  pointSvg.$element.addEventListener('pointerup', (ev) => endDrag(ev, pointSvg));
  pointSvg.$element.addEventListener('pointercancel', (ev) => endDrag(ev, pointSvg));
}

function updatePointPosition(pointSvg, event) {
  let pointRadius = pointSvg.get('r');
  let domRect = pointSvg.$element.getBoundingClientRect();
  let currentTopLeftPositionInDom = {
    x: domRect.x,
    y: domRect.y,
  };
  let desiredCentrePositionInDom = {x: event.x, y: event.y}
  let currentCentrePositionInGrid = {x: pointSvg.get('cx'), y: pointSvg.get('cy')}
  let currentTopLeftPositionInGrid = {
    x: currentCentrePositionInGrid.x - pointRadius,
    y: currentCentrePositionInGrid.y - pointRadius,
  }
  let offsets = {
    x: currentTopLeftPositionInDom.x - currentTopLeftPositionInGrid.x,
    y: currentTopLeftPositionInDom.y - currentTopLeftPositionInGrid.y,
  }
  pointSvg.updateAndNotify({
    cx: desiredCentrePositionInDom.x - offsets.x,
    cy: desiredCentrePositionInDom.y - offsets.y,
  });
}
