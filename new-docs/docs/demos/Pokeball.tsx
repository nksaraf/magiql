import { tw } from 'twind';
import { animation, css } from 'twind/css';
import React from 'react';

const blink = animation('0.5s alternate infinite', {
  from: {
    background: '#eee',
  },
  to: {
    background: 'red',
  },
});

const shake = animation('1.25s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite', {
  '0': { transform: 'translate(0, 0) rotate(0)' },
  '20%': { transform: 'translate(-10px, 0) rotate(-20deg)' },
  '30%': { transform: 'translate(10px, 0) rotate(20deg)' },
  '50%': { transform: 'translate(-10px, 0) rotate(-10deg)' },
  '60%': { transform: 'translate(10px, 0) rotate(10deg)' },
  '100%': { transform: 'translate(0, 0) rotate(0)' },
});

export function Pokeball() {
  return (
    <div className={tw`p-4`}>
      <div
        className={tw`${css({
          position: 'relative',
          width: '72px',
          height: '72px',
          background: '#fff',
          border: '3px solid #000',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: 'inset -10px 10px 0 10px #ccc',
          '&::before': {
            content: '""',
            position: 'absolute',
            background: '#ee1515',
            width: '100%',
            height: '50%',
          },
          '&::after': {
            top: 'calc(50% - 5px)',
            width: '100%',
            height: '10px',
            background: '#000',
            content: '""',
            position: 'absolute',
          },
        })} ${shake}`}
      >
        <div
          className={tw`${blink} ${css({
            position: 'absolute',
            top: 'calc(50% - 12px)',
            left: 'calc(50% - 12px)',
            width: '12px',
            height: '12px',
            background: '#fff',
            border: '2px solid #7f8c8d',
            borderRadius: '50%',
            zIndex: '10',
            boxShadow: '0 0 0 6px black',
          })}`}
        ></div>
      </div>
    </div>
  );
}
