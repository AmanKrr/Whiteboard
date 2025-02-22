import { User } from '@/hooks/useWebsockets';
import React, { useState, useRef } from 'react';
import { MdMoreHoriz } from 'react-icons/md';

// Define a set of color pairs for backgrounds and rings
const colorPairs = [
  { bg: 'bg-red-500', ring: 'ring-red-300' },
  { bg: 'bg-blue-500', ring: 'ring-blue-300' },
  { bg: 'bg-green-500', ring: 'ring-green-300' },
  { bg: 'bg-pink-500', ring: 'ring-pink-300' },
  { bg: 'bg-yellow-500', ring: 'ring-yellow-300' },
  { bg: 'bg-purple-500', ring: 'ring-purple-300' }
];

// Simple random color generator
function getRandomColorPair() {
  const index = Math.floor(Math.random() * colorPairs.length);
  return colorPairs[index];
}

const OnlineUsers: React.FC<{ users: User }> = ({ users }) => {
  const [expanded, setExpanded] = useState(false);

  // Ref to store each user’s color so it remains stable across renders
  const userColorRef = useRef<Record<string, { bg: string; ring: string }>>({});

  // Function to retrieve or assign a color for a given user ID
  function getUserColor(userId: string) {
    if (!userColorRef.current[userId]) {
      userColorRef.current[userId] = getRandomColorPair();
    }
    return userColorRef.current[userId];
  }

  if (!users || !users.activeUsers) return null;

  // Show up to 3 users in the collapsed state
  const displayedUsers = users.activeUsers.slice(0, 3);

  const handleToggle = () => setExpanded(!expanded);

  return (
    <div className='fixed right-4 top-4 z-50'>
      {/* Parent container: relative, with a fixed width (w-66). */}
      <div className='w-66 relative'>
        {/* Collapsed row container */}
        <div className='rounded-xl border border-white/20 bg-gray-200/70 p-3 shadow-sm backdrop-blur'>
          <div className='flex items-center space-x-2'>
            {displayedUsers.map(userId => {
              const color = getUserColor(userId);
              return (
                <div key={userId} className={`flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-offset-1 ${color.bg} ${color.ring}`}>
                  <span className='font-bold uppercase text-white'>{userId.charAt(0)}</span>
                </div>
              );
            })}

            {users.activeUsers.length > 3 && (
              <button onClick={handleToggle} className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white ring-2 ring-gray-300 hover:bg-gray-500'>
                <MdMoreHoriz size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Expanded panel (scrollable) */}
        {expanded && users.activeUsers.length > 3 && (
          <div className='w-66 relative left-0 top-5 max-h-48 overflow-y-auto rounded-xl border border-white/20 bg-gray-200/70 p-3 shadow-xl backdrop-blur'>
            <div className='flex flex-col space-y-3'>
              {users.activeUsers.map(userId => {
                const color = getUserColor(userId);
                return (
                  <div key={userId} className='flex items-center space-x-3'>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-1 ${color.bg} ${color.ring}`}>
                      <span className='font-bold uppercase text-white'>{userId.charAt(0)}</span>
                    </div>
                    {/* Example substring of the user ID */}
                    <span className='text-sm text-gray-800'>{userId.substring(1, 4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
