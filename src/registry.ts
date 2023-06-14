import { createContext, useContext } from 'react';
import { Process, Message, ExitMessage } from 'posipaki';

type Reg = {
  [key: string]: Process<unknown, unknown, Message, ExitMessage>;
};

export const ProcessContext = createContext<Reg>({});

export const useProcReg = ()=> useContext(ProcessContext);
