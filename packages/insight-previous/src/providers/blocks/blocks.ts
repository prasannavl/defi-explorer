import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiProvider } from '../api/api';
import { CurrencyProvider } from '../currency/currency';


export interface ApiBlock {
  height: number;
  nonce: number;
  bits: number;
  size: number;
  confirmations: number;
  hash: string;
  merkleRoot: string;
  nextBlockHash: string;
  previousBlockHash: string;
  transactionCount: number;
  reward: number;
  minedBy: string;
  version: number;
  time: Date;
  timeNormalized: Date;
  btcTxHash?: string;
}

export interface AppBlock {
  height: number;
  merkleroot: string;
  nonce: number;
  size: number;
  confirmations: number;
  version: number;
  difficulty: number;
  bits: string;
  virtualSize: number;
  hash: string;
  time: number;
  tx: {
    length: number;
  };
  txlength: number;
  previousblockhash: string;
  nextblockhash: string;
  poolInfo: {
    poolName: string;
    url: string;
  };
  reward: number;
  btcTxHash: string;
  isAnchor: boolean;
}

@Injectable()
export class BlocksProvider {
  constructor(
    public httpClient: HttpClient,
    public currency: CurrencyProvider,
    private api: ApiProvider
  ) {}

  public toAppBlock(block: ApiBlock): AppBlock {
    const difficulty: number = 0x1e0fffff / block.bits;
    return {
      height: block.height,
      confirmations: block.confirmations,
      nonce: block.nonce,
      size: block.size,
      virtualSize: block.size,
      merkleroot: block.merkleRoot,
      version: block.version,
      difficulty,
      bits: '0x' + block.bits.toString(16),
      hash: block.hash,
      time: new Date(block.time).getTime() / 1000,
      tx: {
        length: block.transactionCount
      },
      txlength: block.transactionCount,
      previousblockhash: block.previousBlockHash,
      nextblockhash: block.nextBlockHash,
      poolInfo: {
        poolName: block.minedBy,
        url: ''
      },
      reward: block.reward,
      btcTxHash: block.btcTxHash || null,
      isAnchor: !!block.btcTxHash
    };
  }

  public getCurrentHeight(): Observable<ApiBlock> {
    const heightUrl: string = this.api.getUrl() + '/block/tip';
    return this.httpClient.get<ApiBlock>(heightUrl);
  }

  public getBlocks(
    numBlocks: number = 10,
    anchorsOnly: boolean = false
  ): Observable<ApiBlock[]> {
    const url = `${this.api.getUrl()}/block?limit=${numBlocks}&anchorsOnly=${anchorsOnly}`;
    return this.httpClient.get<ApiBlock[]>(url);
  }

  /**
   * example: http://localhost:8100/api/BTC/regtest/block?since=582&limit=100&paging=height&direction=1
   */
  public pageBlocks(
    since: number,
    numBlocks: number = 10,
    anchorsOnly: boolean = false
  ): Observable<ApiBlock[]> {
    const url = `${this.api.getUrl()}/block?since=${since}&limit=${numBlocks}&paging=height&direction=-1&anchorsOnly=${anchorsOnly}`;
    return this.httpClient.get<ApiBlock[]>(url);
  }

  public getBlock(hash: string): Observable<ApiBlock> {
    const url: string = this.api.getUrl() + '/block/' + hash;
    return this.httpClient.get<ApiBlock>(url);
  }

  public getTotalAnchoredBlocks(): Observable<any> {
    const url: string = this.api.getUrl() + '/block/total-anchored-blocks';
    return this.httpClient.get<ApiBlock>(url);
  }
}
