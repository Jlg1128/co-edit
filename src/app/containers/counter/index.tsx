import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

export default function Counter() {
  const count = useSelector((state: any) => state.counter.present.value);
  const countform = useSelector((state: any) => state.form.present.count);
  const dispatch = useDispatch();
  return (
    <div>
      count:
      {count}
      <button onClick={() => dispatch({ type: 'counter/increment' })}>点击</button>
      formCount:
      {countform}
      <button onClick={() => dispatch({ type: 'form/increment' })}>点击formCount</button>
    </div>
  );
}