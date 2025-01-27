import Image from 'next/image';

function ToolbarButtons({ item, selectedTool, onClick }: { item: DrawingTools; selectedTool: ToolType; onClick: (e: any, toolType: ToolType) => void }) {
  return (
    <div key={item.id} className='group relative'>
      <button
        id={`tool-${item.id}`}
        onClick={e => onClick(e, item['type'])}
        className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200 ease-in-out ${
          selectedTool === item['type'] || ((selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'arrow') && item['type'] === 'shapes')
            ? 'scale-105 bg-white/20 shadow-md' // Active effect
            : 'hover:bg-white/30'
        } `}
      >
        <Image className='h-6 w-6 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-8 lg:w-8' src={item.icon} alt={item.label} width={20} height={20} />
      </button>
      <span className='absolute left-full ml-2 whitespace-nowrap rounded bg-gray-900/90 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100'>
        {item.tooltip}
      </span>
    </div>
  );
}

export default ToolbarButtons;
