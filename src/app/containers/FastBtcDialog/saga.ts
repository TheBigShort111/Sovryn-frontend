import { eventChannel } from 'redux-saga';
import { take, call, put, takeLatest, fork, select } from 'redux-saga/effects';
import io from 'socket.io-client';
import { actions } from './slice';
import { currentChainId, fastBtcApis } from 'utils/classifiers';
import { selectWalletProvider } from '../WalletProvider/selectors';

function createSocketConnection() {
  const { origin, pathname } = new URL(fastBtcApis[currentChainId]);
  const socket = io(`${origin}/`, {
    reconnectionDelayMax: 10000,
    path: pathname && pathname !== '/' ? pathname : '',
  });
  return new Promise(resolve => {
    socket.on('connect', () => {
      resolve(socket);
    });
  });
}

function createWebSocketChannel(socket) {
  return eventChannel(emit => {
    socket.emit('txAmount', limits => emit(actions.changeAmountInfo(limits)));

    socket.on('txAmount', limits => emit(actions.changeAmountInfo(limits)));
    socket.on('depositTx', tx => emit(actions.changeDepositTx(tx)));
    socket.on('transferTx', tx => emit(actions.changeTransferTx(tx)));
    return () => {
      socket.off('txAmount');
      socket.off('depositTx');
      socket.off('transferTx');
      socket.disconnect();
    };
  });
}

const getBtcAddressRequest = (socket, address) =>
  new Promise(resolve => {
    socket.emit('getDepositAddress', address, (err, res) => {
      resolve({ err, res });
    });
  });

function* generateDepositAddress(socket) {
  while (true) {
    yield take(actions.generateDepositAddress.type);
    const { address } = yield select(selectWalletProvider);
    const { res, err } = yield call(getBtcAddressRequest, socket, address);
    if (res && res.btcadr) {
      yield put(actions.generateDepositAddressSuccess(res));
    } else {
      yield put(actions.generateDepositAddressFailed(err));
    }
  }
}

function* watchSocketChannel() {
  const socket = yield call(createSocketConnection);
  yield fork(generateDepositAddress, socket);

  const blockChannel = yield call(createWebSocketChannel, socket);
  try {
    yield put(actions.ready());
    while (true) {
      const event = yield take(blockChannel);
      yield put(event);
    }
  } finally {
    blockChannel.close();
  }
}

export function* fastBtcDialogSaga() {
  yield takeLatest(actions.init.type, watchSocketChannel);
}