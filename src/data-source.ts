import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "senacrs",
    database: "clinica-agendamentos",
    entities: [__dirname + "/entity/*.{ts,js}"],
    logging: true,
    synchronize: true,
})