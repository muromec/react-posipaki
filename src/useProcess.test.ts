import React, { useRef } from 'react';
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Message } from 'posipaki';
import { useProcess } from '../src/index';

const h = React.createElement;

describe('useProcess', () => {
  type SimpleState = {
    count: number,
  };

  function* p1() {
    const state = {count: 1};
    yield state;
    while(state.count < 3) {
      let msg: Message = yield null;
      state.count += 1;
    }
  }

  function expectState(state: string) {
    expect(screen.getByTestId('state').innerHTML).toBe(state);
  }

  function returnState<S extends SimpleState>(pstate: S | null) {
    return h('span', {key: 's', 'data-testid': "state"}, ['S', pstate?.count || 'none']);
  }

  function Component1() {
    const { pstate, send } = useProcess<null, SimpleState, Message>(p1, 'p1', null);
    const text = useRef<HTMLInputElement | null>(null);
    function onClick() {
      send({ type: 'INCREMENT' });
    }
    return [
      h('input', {key: 'i', ref: text}),
      h('button', {key: 'b', onClick, 'role': 'button'}),
      returnState(pstate),
    ]
  }

  it('should render initial component state', () => {
    render(h(Component1));
    expectState('S1');
  });

  it('should increment counter when button is clicked, until it hits 3', async () => {
    render(h(Component1));
    await userEvent.click(screen.getByRole('button'))
    expectState('S2');

    await userEvent.click(screen.getByRole('button'))
    expectState('S3');

    // nope
    await userEvent.click(screen.getByRole('button'))
    expectState('S3');
  });

});

