import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Especialidade } from "./especialidade";

@Entity()
export class Servico {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nome?: string;

    @Column("decimal")
    preco?: number;

    @ManyToOne(() => Especialidade)
    especialidade?: Especialidade;
}
