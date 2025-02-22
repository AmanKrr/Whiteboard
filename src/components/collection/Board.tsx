'use client';
import useToolSelection from '@/hooks/useToolSelection';
import LeftToolbar from './leftToolbar';
import ShapesToolbar from './shapeToolbar';
import React, { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogOverlay, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Users, User } from 'lucide-react';
import { motion } from 'motion/react';

const InfiniteStage = dynamic(() => import('../stage/infiniteStage'), { ssr: false, loading: () => <p style={{ color: 'black' }}>Loading</p> });
const PublicInfiniteStage = dynamic(() => import('../stage/public'), { ssr: false, loading: () => <p style={{ color: 'black' }}>Loading</p> });

type Board = 'personal' | 'public' | 'private' | '';

function Board() {
  const [selectedBoard, setSelectedBoard] = useState<Board>('');
  const [isPrivateModalOpen, setPrivateModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const { isDraggable, selectedTool, handleOnToolSelection } = useToolSelection();

  const handleSelect = useCallback((type: Board) => {
    if (type === 'private') {
      setPrivateModalOpen(true);
    } else {
      setSelectedBoard(type);
      setPrivateModalOpen(false);
    }
  }, []);

  const boardOptions = useMemo(
    () => [
      { type: 'personal', label: 'Personal Board', icon: <User size={30} /> },
      { type: 'public', label: 'Public Board', icon: <Users size={30} /> },
      { type: 'private', label: 'Private Board', icon: <Lock size={30} /> }
    ],
    []
  );

  return (
    <>
      {selectedBoard == '' ? (
        <>
          <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6'>
            <h1 className='mb-6 text-3xl font-bold text-white md:text-4xl'>Choose Your Board</h1>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {boardOptions.map(({ type, label, icon }) => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-opacity-80 p-6 text-lg font-semibold text-white shadow-lg transition-all ${
                    selectedBoard === type ? 'bg-green-500' : 'bg-white/10'
                  } hover:bg-white/20`}
                  onClick={() => handleSelect(type as Board)}
                >
                  {icon}
                  <span className='mt-2'>{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className='relative h-screen w-full overflow-hidden bg-gray-100'>
          <LeftToolbar onClick={handleOnToolSelection} selectedTool={selectedTool} />
          {['rectangle', 'circle', 'arrow', 'shapes'].includes(selectedTool) && <ShapesToolbar onClick={handleOnToolSelection} selectedTool={selectedTool} />}
          {selectedBoard == 'public' ? (
            <PublicInfiniteStage isDraggable={isDraggable} selectedTool={selectedTool} onTextNodeCreation={() => handleOnToolSelection(null, 'select')} />
          ) : (
            <InfiniteStage isDraggable={isDraggable} selectedTool={selectedTool} onTextNodeCreation={() => handleOnToolSelection(null, 'select')} />
          )}
        </div>
      )}
      {/* Private Board Modal */}
      <Dialog open={isPrivateModalOpen} onOpenChange={setPrivateModalOpen}>
        <DialogOverlay className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <DialogContent className='flex w-96 flex-col items-center rounded-xl bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-xl font-bold'>Enter Username</h2>
            <Input type='text' placeholder='Your username' value={username} onChange={e => setUsername(e.target.value)} className='mb-4 w-full rounded-md border px-4 py-2' />
            <Button onClick={() => setPrivateModalOpen(false)} className='w-full rounded-md bg-indigo-500 py-2 text-white hover:bg-indigo-600'>
              OK
            </Button>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </>
  );
}

export default React.memo(Board);
