import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profissional {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    nome?: string;

    @Column()
    email?: string;

    @Column()
    senha?: string;

    @Column({ nullable: true })
    foto?: string;
}
