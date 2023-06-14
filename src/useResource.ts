import { Message, ExitMessage } from 'posipaki';
import { xfetch, FetchState, FetchArgs, FetchMessage } from 'posipaki/dist/xfetch.js';
import { useProcess } from './useProcess.js';

type Props = {
  url: URL,
  id: string,
  assumeLoading?: boolean,
  lazy?: boolean,
};

type Result<T> = {
  isLoading: boolean,
  items?: T,
};

export function useResource<DataType>({ url, id, lazy = false, assumeLoading = true } : Props) : Result<DataType> {
  const { pstate } = useProcess<FetchArgs<DataType>, FetchState<DataType>, FetchMessage<DataType>, FetchMessage<DataType>>(xfetch, id, { url }, lazy);

  if (!pstate) {
    return { isLoading: assumeLoading && !lazy };
  }
  if (!pstate.data) {
    return { isLoading: pstate.code === 'loading' };
  }

  return { items: pstate.data, isLoading: pstate.code === 'loading' };
}
