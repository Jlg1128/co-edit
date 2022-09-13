import { increment } from '@app/reducers/count';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

export default function Counter() {
  const count = useSelector((state: any) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <div>
      count:
      {count}
      <button onClick={() => dispatch(increment())}>点击</button>
    </div>
  );
}