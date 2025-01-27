const drawingTools: DrawingTools[] = [
  {
    id: 1,
    label: 'Pan',
    tooltip: 'Pan',
    isSeparator: false,
    icon: '/assets/pan.svg',
    type: 'pan'
  },
  {
    id: 2,
    label: 'Select',
    tooltip: 'Select',
    isSeparator: false,
    icon: '/assets/select.svg',
    type: 'select'
  },
  {
    id: 3,
    label: 'Pencil',
    tooltip: 'Pencil',
    isSeparator: false,
    icon: '/assets/pencil.svg',
    type: 'pencil'
  },
  // {
  //   id: 1,
  //   label: 'Pen',
  //   tooltip: 'Pen',
  //   isSeparator: false,
  //   icon: '/assets/pencil.svg'
  // },
  {
    id: 5,
    label: 'Eraser',
    tooltip: 'Eraser',
    isSeparator: false,
    icon: '/assets/eraser.svg',
    type: 'eraser'
  },
  {
    id: 6,
    label: 'Shapes',
    tooltip: 'Shapes',
    isSeparator: false,
    icon: '/assets/shapes.svg',
    type: 'shapes'
  },
  {
    id: 7,
    label: 'Text',
    tooltip: 'Text',
    isSeparator: false,
    icon: '/assets/text.svg',
    type: 'text'
  },
  {
    id: 8,
    label: 'Image',
    tooltip: 'Image',
    isSeparator: true,
    icon: '/assets/image.svg',
    type: 'image'
  },
  {
    id: 9,
    label: 'Comment',
    tooltip: 'Comment',
    isSeparator: false,
    icon: '/assets/comment.svg',
    type: 'comment'
  }
];

const drawingShapeTools: DrawingTools[] = [
  {
    id: 10,
    label: 'Rectangle',
    tooltip: 'Rectangle',
    isSeparator: false,
    icon: '/assets/rectangle.svg',
    type: 'rectangle'
  },
  {
    id: 11,
    label: 'Circle',
    tooltip: 'Circle',
    isSeparator: false,
    icon: '/assets/circle.svg',
    type: 'circle'
  },
  {
    id: 12,
    label: 'Arrow',
    tooltip: 'Arrow',
    isSeparator: false,
    icon: '/assets/arrow-up.svg',
    type: 'arrow'
  }
];

export { drawingTools, drawingShapeTools };
