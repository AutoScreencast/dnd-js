// eslint-disable-next-line
import React, { useState, useCallback, useEffect, memo } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import update from 'immutability-helper'


export const ItemTypes = {
  BOX: 'box',
}

const boxStyles = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  cursor: 'move',
}

const previewStyles = {
  display: 'inline-block',
  transform: 'rotate(-7deg)',
  WebkitTransform: 'rotate(-7deg)',
}

const containerStyles = {
  width: 300,
  height: 300,
  border: '1px solid black',
  position: 'relative',
}

const layerStyles = {
  backgroundColor: 'rgba(100,100,100,0.2)',
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

function doSnapToGrid(x, y) {
  const snappedX = Math.round(x / 32) * 32
  const snappedY = Math.round(y / 32) * 32
  return [snappedX, snappedY]
}

// Box

const Box = memo(function Box({ title, yellow, preview }) {
  const backgroundColor = yellow ? 'yellow' : 'white'
  return (
    <div
      style={{ ...boxStyles, backgroundColor }}
      role={preview ? 'BoxPreview' : 'Box'}
    >
      {title}
    </div>
  )
})

// Draggable Box

function getStyles(left, top, isDragging) {
  const transform = `translate3d(${left}px, ${top}px, 0)`
  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    // IE fallback: hide the real node using CSS when dragging because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0 : 1,
    height: isDragging ? 0 : '',
  }
}

const DraggableBox= memo(function DraggableBox(props) {
  const { id, title, left, top } = props
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: { id, left, top, title },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top, title],
  )

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  return (
    <div
      ref={drag}
      style={getStyles(left, top, isDragging)}
      role="DraggableBox"
    >
      <Box title={title} />
    </div>
  )
})

// Box Drag Preview

export const BoxDragPreview = memo(
  function BoxDragPreview({ title }) {
    const [tickTock, setTickTock] = useState(false)

    useEffect(
      function subscribeToIntervalTick() {
        const interval = setInterval(() => setTickTock(!tickTock), 500)
        return () => clearInterval(interval)
      },
      [tickTock],
    )

    return (
      <div style={previewStyles}>
        <Box title={title} yellow={tickTock} preview />
      </div>
    )
  },
)

// Container

const Container = ({ snapToGrid }) => {
  const [boxes, setBoxes] = useState({
    a: { top: 20, left: 80, title: 'Drag me around' },
    b: { top: 180, left: 20, title: 'Drag me too' },
  })

  const moveBox = useCallback(
    (id, left, top) => {
      setBoxes(
        update(boxes, {
          [id]: {
            $merge: { left, top },
          },
        }),
      )
    },
    [boxes],
  )

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop(item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset()

        let left = Math.round(item.left + delta.x)
        let top = Math.round(item.top + delta.y)
        if (snapToGrid) {
          ;[left, top] = doSnapToGrid(left, top)
        }

        moveBox(item.id, left, top)
        return undefined
      },
    }),
    [moveBox],
  )

  return (
    <div ref={drop} style={containerStyles}>
      {Object.keys(boxes).map((key) => (
        <DraggableBox key={key} id={key} {...boxes[key]} />
      ))}
    </div>
  )
}

// Custom Drag Layer

function getItemStyles(initialOffset, currentOffset, isSnapToGrid) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  let { x, y } = currentOffset

  if (isSnapToGrid) {
    x -= initialOffset.x
    y -= initialOffset.y
    ;[x, y] = doSnapToGrid(x, y)
    x += initialOffset.x
    y += initialOffset.y
  }

  const transform = `translate(${x}px, ${y}px)`
  return {
    transform,
    WebkitTransform: transform,
  }
}

const CustomDragLayer = (props) => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  function renderItem() {
    switch (itemType) {
      case ItemTypes.BOX:
        return <BoxDragPreview title={item.title} />
      default:
        return null
    }
  }

  if (!isDragging) {
    return null
  }
  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(initialOffset, currentOffset, props.snapToGrid)}
      >
        {renderItem()}
      </div>
    </div>
  )
}


// Example

export const Example = () => {
  const [snapToGridAfterDrop, setSnapToGridAfterDrop] = useState(false)
  const [snapToGridWhileDragging, setSnapToGridWhileDragging] = useState(false)

  const handleSnapToGridAfterDropChange = useCallback(() => {
    setSnapToGridAfterDrop(!snapToGridAfterDrop)
  }, [snapToGridAfterDrop])

  const handleSnapToGridWhileDraggingChange = useCallback(() => {
    setSnapToGridWhileDragging(!snapToGridWhileDragging)
  }, [snapToGridWhileDragging])

  return (
    <div>
      <Container snapToGrid={snapToGridAfterDrop} />
      <CustomDragLayer snapToGrid={snapToGridWhileDragging} />
      <p>
        <label htmlFor="snapToGridWhileDragging">
          <input
            id="snapToGridWhileDragging"
            type="checkbox"
            checked={snapToGridWhileDragging}
            onChange={handleSnapToGridWhileDraggingChange}
          />
          <small>Snap to grid while dragging</small>
        </label>
        <br />
        <label htmlFor="snapToGridAfterDrop">
          <input
            id="snapToGridAfterDrop"
            type="checkbox"
            checked={snapToGridAfterDrop}
            onChange={handleSnapToGridAfterDropChange}
          />
          <small>Snap to grid after drop</small>
        </label>
      </p>
    </div>
  )
}
