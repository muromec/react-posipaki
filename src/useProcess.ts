import { useState, useEffect, useRef } from 'react';
import { spawn, Process, Message, ProcessFn } from 'pspki';
import { useProcReg } from './registry.js';

export function useProcess<ArgsType, StateType>(procFn : ProcessFn<ArgsType, StateType>, procName: string, procArgs: ArgsType) {
  const [ pstate, setPstate ] = useState<StateType | null>(null);
  const refArgs = useRef(procArgs);
  const refProc = useRef<Process<ArgsType, StateType> | null>(null);
  const procReg = useProcReg();

  function send(msg: Message) {
    if(!refProc.current) {
      throw new Error('Nowhere to send');
    }
    refProc.current.send(msg);
  }

  useEffect(() => {
    function update() {
      setPstate({...proc.state as StateType});
    }

    let proc: Process<ArgsType, StateType> = (procReg[procName] as Process<ArgsType, StateType>) || spawn<ArgsType, StateType>(procFn, procName)(refArgs.current);
    let un = proc.subscribe(update);
    procReg[procName] = proc as Process<unknown, unknown>;

    refProc.current = proc;
    return () => {
      if (un) {
        un();
      }
      requestIdleCallback(() => {
        if (!proc.isListenedTo) {
          proc.send({type: 'STOP'});
          delete procReg[procName];
        }
      });
    };
  }, [procFn, procName, refArgs, procReg]);
  return { pstate, send };
}

