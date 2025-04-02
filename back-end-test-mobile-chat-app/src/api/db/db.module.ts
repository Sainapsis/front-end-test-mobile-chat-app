import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplicaSetInitializerService } from './db.service';


@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/chatApp')
    ],
    controllers: [],
    providers: [
        //ReplicaSetInitializerService
    ],
    exports: [
        //ReplicaSetInitializerService
    ],
})
export class DBModule { }