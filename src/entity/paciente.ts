import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Paciente {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    nome?: string;

    @Column()
    email?: string;

    @Column({ nullable: true })
    telefone?: string;

    @Column({ nullable: true })
    cpf?: string;
}
