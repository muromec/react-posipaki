import { useState, useEffect, useRef } from 'react';
import { spawn, Process, Message, ExitMessage, ProcessFn } from 'posipaki';
import { defer } from 'posipaki/dist/util.js';
import { useProcReg } from './registry';

type Send<M> = (msg: M) => void;
type Res<S, M> = {
  pstate: S | null,
  send: Send<M>,
}

export function useProcess<ArgsType, StateType, InMessage extends Message, OutMessage extends (Message | ExitMessage) = ExitMessage>(procFn : ProcessFn<ArgsType, StateType, InMessage, OutMessage>, procName: string, procArgs: ArgsType, lazy? : boolean) : Res<StateType, InMessage> {
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
      setPstate({...proc.state as StateType});
    }

    return () => {
      if (un) {
        un();
      }
      if (!proc) {
        return;
      }
      defer(() => {
        if (!proc.isListenedTo) {
          proc.send({type: 'STOP'} as InMessage);
          delete procReg[procName];
        }
      });
    };
  }, [procFn, procName, refArgs, procReg]);
  return { pstate, send };
}

