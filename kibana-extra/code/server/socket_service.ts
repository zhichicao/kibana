/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Socket } from 'socket.io';

import { CloneProgress, RepositoryUri, SocketKind } from '../model';
import { Log } from './log';

export class SocketService {
  private sockets: Map<SocketKind, Socket>;

  constructor(private readonly log: Log) {
    this.sockets = new Map<SocketKind, Socket>();
  }

  public registerSocket(kind: SocketKind, s: Socket) {
    this.log.info(`Register socket for ${kind}`);
    this.sockets.set(kind, s);
  }

  public unregisterSocket(kind: SocketKind) {
    this.log.info(`Unregister socket for ${kind}`);
    this.sockets.delete(kind);
  }

  public broadcastCloneProgress(
    repoUri: RepositoryUri,
    progress: number,
    cloneProgress?: CloneProgress
  ) {
    this.broadcastProgress(SocketKind.CLONE_PROGRESS, repoUri, progress, { cloneProgress });
  }

  public broadcastIndexProgress(repoUri: RepositoryUri, progress: number) {
    this.broadcastProgress(SocketKind.INDEX_PROGRESS, repoUri, progress, {});
  }

  public broadcastDeleteProgress(repoUri: RepositoryUri, progress: number) {
    this.broadcastProgress(SocketKind.DELETE_PROGRESS, repoUri, progress, {});
  }

  private broadcastProgress(
    kind: SocketKind,
    repoUri: RepositoryUri,
    progress: number,
    options: any
  ) {
    const s = this.sockets.get(kind);
    if (!s) {
      return;
    }
    s.emit(kind, {
      ...options,
      repoUri,
      progress,
    });
  }
}
