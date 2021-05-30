import React, { memo } from 'react';
import ReactDOM from 'react-dom';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider, useDrag, useDrop } from 'react-dnd'

/**
 * Drag the boxes below and drop them into the dustbin. 
 * 
 * Note that it has a neutral, an active and a hovered state. 
 * The dragged item itself changes opacity while dragged.
 */

/**
 * An item is a plain JavaScript object describing what's being dragged.
 * A type is a string uniquely identifying a whole class of items in your application.
 * The types let you specify which drag sources and drop targets are compatible.
 */
const ItemTypes = {
  BOX: 'box',
}

const dustbinStyle = {
  height: '12rem',
  width: '12rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  color: 'white',
  padding: '1rem',
  textAlign: 'center',
  fontSize: '1rem',
  lineHeight: 'normal',
  float: 'left',
}

const boxStyle = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left',
}

/**
 * Monitors
 * React DnD exposes state to your components via a few tiny wrappers over the internal state storage called the monitors.
 * The monitors let you update the props of your components in response to the drag and drop state changes.
 */

/**
 * Collecting Functions
 * For each component that needs to track the drag and drop state,
 *   you can define a collecting function that retrieves the relevant bits of it from the monitors. 
 * React DnD then takes care of timely calling your collecting function and merging its return value into your components' props.
 */

/**
 * useDrop()
 * The useDrop hook provides a way for you to wire in your component into the DnD system as a drop target.
 * By passing in a specification into the useDrophook, you can specify including what types of data items the drop-target will accept,
 *   what props to collect, and more. 
 * 
 * This function returns an array containing a ref to attach to the Drop Target node, and the collected props.
 */
const Dustbin = () => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BOX,
    drop: () => ({ name: 'Dustbin' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const isActive = canDrop && isOver
  let backgroundColor = '#222'
  if (isActive) {
    backgroundColor = 'darkgreen'
  } else if (canDrop) {
    backgroundColor = 'darkkhaki'
  }

  return (
    <div ref={drop} role={'Dustbin'} style={{ ...dustbinStyle, backgroundColor }}>
      {isActive ? 'Release to drop' : 'Drag a box here'}
    </div>
  )
}

/**
 * useDrag()
 * The useDrag hook provides a way to wire your component into the DnD system as a drag source.
 * By passing in a specification into useDrag, you declaratively describe the typeof draggable being generated,
 *   the itemobject representing the drag source, what props to collect, and more. 
 * 
 * The useDraghooks returns a few key items: a set of collected props, 
 *   and refs that may be attached to drag source and drag preview elements.
 */

const Box = ({ name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOX,
    item: { name },
    end: (item, monitor) => {
      console.log("item", item)
      console.log("monitor", monitor)
      const dropResult = monitor.getDropResult()
      console.log("dropResult", dropResult)
      if (item && dropResult) {
        //alert(`You dropped ${item.name} into ${dropResult.name}!`)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }))

  const opacity = isDragging ? 0.4 : 1
  return (
    <div
      ref={drag}
      role="Box"
      style={{ ...boxStyle, opacity }}
      data-testid={`box-${name}`}
    >
      {name}
    </div>
  )
}

const Container = memo(function Container() {
  return (
    <div>
      <div style={{ overflow: 'hidden', clear: 'both' }}>
        <Dustbin />
      </div>
      <div style={{ overflow: 'hidden', clear: 'both' }}>
        <Box name="Glass" />
        <Box name="Banana" />
        <Box name="Paper" />
      </div>
    </div>
  )
})

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Container />
      </DndProvider>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
