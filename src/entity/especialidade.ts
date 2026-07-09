import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Especialidade {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nome?: string;
}
