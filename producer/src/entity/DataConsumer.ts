import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class DataConsumer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({default: 0})
    amount: number;
};