'use client';
import Board from '../../components/collection/Board';

export default function Sketch() {
  // in future going to all the user deatils and passing down to the
  // client side component
  return (
    <main className='container-board relative h-screen w-full'>
      <Board />
    </main>
  );
}
