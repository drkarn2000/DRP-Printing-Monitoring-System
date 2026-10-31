import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any) {
    return { event: 'pong', data: { time: new Date().toISOString() } };
  }

  broadcastTelemetry(machineId: string, telemetry: any) {
    if (this.server) {
      this.server.emit('telemetry:update', { machineId, telemetry, timestamp: new Date().toISOString() });
    }
  }

  broadcastJobProgress(jobId: string, progress: number, produced: number) {
    if (this.server) {
      this.server.emit('job:progress', { jobId, progress, produced });
    }
  }

  broadcastAlert(alert: any) {
    if (this.server) {
      this.server.emit('alert:new', alert);
    }
  }
}
