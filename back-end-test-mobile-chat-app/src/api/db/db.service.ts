import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class ReplicaSetInitializerService implements OnModuleInit {
  private readonly logger = new Logger(ReplicaSetInitializerService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      const admin = this.connection.db.admin();

      await admin.command({ replSetGetStatus: 1 });
      this.logger.log('Replica set ya está inicializado.');
    } catch (error) {
      if (
        error.codeName === 'NotYetInitialized' ||
        error.message.includes('no replset config has been received')
      ) {
        this.logger.log('Inicializando el replica set...');
        try {
          await this.connection.db.admin().command({ replSetInitiate: {} });
          this.logger.log('Replica set succesfully initialized');
        } catch (initError) {
          this.logger.error('Error at replicaset inizialitation:', initError);
        }
      } else {
        this.logger.error('Error getting replicaset status:', error);
      }
    }
  }
}
