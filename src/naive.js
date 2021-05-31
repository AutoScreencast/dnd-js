// eslint-disable-next-line
import React, { useState, useCallback, memo } from 'react';
import { useDrag, useDrop } from 'react-dnd'
import update from 'immutability-helper'


export const ItemTypes = {
  BOX: 'box',
}

const boxStyle = {
  position: 'absolute',
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  cursor: 'move',
}

const containerStyles = {
  width: 300,
  height: 300,
  border: '1px solid black',
  position: 'relative',
}

const Box = ({
  id,
  left,
  top,
  hideSourceOnDrag,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: { id, left, top },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  )

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />
  }
  return (
    <div ref={drag} style={{ ...boxStyle, left, top }}>
      {children}
    </div>
  )
}

const Container = ({ hideSourceOnDrag }) => {
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
    [boxes, setBoxes],
  )

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop(item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset()
        const left = Math.round(item.left + delta.x)
        const top = Math.round(item.top + delta.y)
        moveBox(item.id, left, top)
        return undefined
      },
    }),
    [moveBox],
  )

  return (
    <div ref={drop} style={containerStyles}>
      {Object.keys(boxes).map((key) => {
        const { left, top, title } = boxes[key]
        return (
          <Box
            key={key}
            id={key}
            left={left}
            top={top}
            hideSourceOnDrag={hideSourceOnDrag}
          >
            {title}
          </Box>
        )
      })}
    </div>
  )
}


export const Example = () => {
  const [hideSourceOnDrag, setHideSourceOnDrag] = useState(true)
  const toggle = useCallback(
    () => setHideSourceOnDrag(!hideSourceOnDrag),
    [hideSourceOnDrag]
  )

  return (
    <div>
      <Container hideSourceOnDrag={hideSourceOnDrag} />
      <p>
        <label htmlFor="hideSourceOnDrag">
          <input
            id="hideSourceOnDrag"
            type="checkbox"
            role="checkbox"
            checked={hideSourceOnDrag}
            onChange={toggle}
          />
          <small>Hide the source item while dragging</small>
        </label>
      </p>
    </div>
  )
}


// export const Example = memo(function Example() {
//   return (
//     <div>
//       <div style={{ overflow: 'hidden', clear: 'both' }}>
//         <Dustbin />
//       </div>
//       <div style={{ overflow: 'hidden', clear: 'both' }}>
//         <Box name="Glass" />
//         <Box name="Banana" />
//         <Box name="Paper" />
//       </div>
//     </div>
//   )
// })
