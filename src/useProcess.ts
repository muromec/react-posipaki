import { useState, useEffect, useRef } from 'react';
import { spawn, Process, Message, ExitMessage, ProcessFn } from 'posipaki';
import { useProcReg } from './registry.js';

export function useProcess<ArgsType, StateType, InMessage extends Message, OutMessage extends (Message | ExitMessage)>(procFn : ProcessFn<ArgsType, StateType, InMessage, OutMessage>, procName: string, procArgs: ArgsType, lazy? : boolean) {
  const procReg = useProcReg();
  const cachedProc: Process<ArgsType, StateType, InMessage, OutMessage> | null = (procReg[procName] as unknown) as (Process<ArgsType, StateType, InMessage, OutMessage>);
  const cachedState = cachedProc ? cachedProc.state : null;

  const [ pstate, setPstate ] = useState<StateType | null>(cachedState);
  const refArgs = useRef(procArgs);
  const refProc = useRef<Process<ArgsType, StateType, InMessage, OutMessage> | null>(cachedProc || null);

  function send(msg: InMessage) {
    if(!refProc.current) {
      throw new Error('Nowhere to send');
    }
    refProc.current.send(msg);
  }

  useEffect(() => {
    function update() {
      setPstate({...proc.state as StateType});
    }

    let spawnProc: Process<ArgsType, StateType, InMessage, OutMessage> | null = null;
    const registeredProc: Process<ArgsType, StateType, InMessage, OutMessage> = (procReg[procName] as unknown) as Process<ArgsType, StateType, InMessage, OutMessage>;
    if (!registeredProc && !lazy) {
      spawnProc = spawn<ArgsType, StateType, InMessage, OutMessage>(procFn, procName)(refArgs.current);
    };

    const proc = registeredProc || spawnProc;
    const un = proc && proc.subscribe(update);

    if (proc) {
      procReg[procName] = (proc as unknown) as Process<unknown, unknown, Message, ExitMessage>;
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
          proc.send({type: 'STOP'} as InMessage);
          delete procReg[procName];
        }
      });
    };
  }, [procFn, procName, refArgs, procReg]);
  return { pstate, send };
}

