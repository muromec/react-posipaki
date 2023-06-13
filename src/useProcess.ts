import { useState, useEffect, useRef } from 'react';
import { spawn, Process, Message, ProcessFn } from 'pspki';
import { useProcReg } from './registry.js';

export function useProcess<ArgsType, StateType>(procFn : ProcessFn<ArgsType, StateType>, procName: string, procArgs: ArgsType, lazy? : boolean) {
  const procReg = useProcReg();
  const cachedProc: Process<ArgsType, StateType> = (procReg[procName] as Process<ArgsType, StateType>);
  const cachedState = cachedProc ? cachedProc.state : null;

  const [ pstate, setPstate ] = useState<StateType | null>(cachedState);
  const refArgs = useRef(procArgs);
  const refProc = useRef<Process<ArgsType, StateType> | null>(cachedProc || null);

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

    let spawnProc: Process<ArgsType, StateType> | null = null;
    if (!cachedProc && !lazy) {
      spawnProc = spawn<ArgsType, StateType>(procFn, procName)(refArgs.current);
    };
    const proc = cachedProc || spawnProc;
    const un = proc && proc.subscribe(update);

    if (proc) {
      procReg[procName] = proc as Process<unknown, unknown>;
      refProc.current = proc;
    }

    return () => {
      if (un) {
        un();
      }
      if (!proc) {
        return;
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

