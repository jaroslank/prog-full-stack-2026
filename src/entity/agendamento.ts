import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Paciente } from "./paciente";
import { Servico } from "./servico";

export enum StatusAgendamento {
    AGENDADO = "agendado",
    CANCELADO = "cancelado",
    CONCLUIDO = "concluido"
}

@Entity()
export class Agendamento {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column("timestamp")
    dataHora?: Date;

    @Column({
        type: "enum",
        enum: StatusAgendamento,
        default: StatusAgendamento.AGENDADO
    })
    status?: StatusAgendamento;

    @ManyToOne(() => Paciente)
    paciente?: Paciente;

    @ManyToMany(() => Servico)
    @JoinTable()
    servicos?: Servico[];
}
