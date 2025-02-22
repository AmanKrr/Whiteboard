function Cursor({ cursors, userId }: { cursors: { [x: string]: { userId: string; x: number; y: number } }; userId: string }) {
  return (
    <>
      {Object.values(cursors)
        .filter(cursor => cursor.userId !== userId) // only render remote cursors
        .map(cursor => {
          return (
            <div
              key={cursor.userId}
              className='pointer-events-none absolute'
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'transparent'
              }}
            >
              <div className='relative'>
                {/* Cursor Icon */}
                {/* <div className='h-6 w-6 rounded-full bg-blue-500 opacity-75'></div> */}

                <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 48 48'>
                  <path
                    fill='#FFF'
                    stroke='#000'
                    strokeWidth='2'
                    d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'
                  ></path>
                </svg>
                {/* User ID */}
                {/* <span className='pointer-events-none absolute left-4 top-4 -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 text-xs text-white'>{cursor.id.charAt(0)}</span> */}
              </div>
            </div>
          );
        })}
    </>
  );
}

export default Cursor;
