import React from 'react';
import { EventData } from 'web3-eth-contract';
import { EthKeyValue } from '../EthKeyValue';

interface Props {
  item: EventData;
}

export function TradingHistoryItem({ item }: Props) {
  return (
    <div className="py-1">
      {item.event === 'Trade' && <TradeEvent item={item} />}
      {item.event === 'CloseWithSwap' && <CloseWithSwapEvent item={item} />}
    </div>
  );
}

function TradeEvent({ item }: Props) {
  return (
    <div className="row history-item buy align-items-center">
      <div className="col-2">
        <strong>Open</strong>
      </div>
      <div className="col-2">
        <EthKeyValue label="Position" value={item.returnValues.positionSize} />
      </div>
      <div className="col-2">
        <EthKeyValue label="Price" value={item.returnValues.entryPrice} />
      </div>
      <div className="col-2">
        <EthKeyValue label="Leverage" value={item.returnValues.entryLeverage} />
      </div>
      <div className="col-2">
        <EthKeyValue label="Interest" value={item.returnValues.interestRate} />
      </div>
    </div>
  );
}

function CloseWithSwapEvent({ item }: Props) {
  return (
    <>
      <div className="row history-item sell align-items-center">
        <div className="col-2">
          <strong>Withdraw</strong>
        </div>
        <div className="col-2">
          <EthKeyValue
            label="Position"
            value={item.returnValues.positionCloseSize}
          />
        </div>
        <div className="col-2">
          <EthKeyValue label="Price" value={item.returnValues.exitPrice} />
        </div>
        <div className="col-2">
          <EthKeyValue
            label="Leverage"
            value={item.returnValues.currentLeverage}
          />
        </div>
      </div>
    </>
  );
}