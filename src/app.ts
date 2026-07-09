import express, { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { LoginService } from './service/login-service';
import { LoginController } from './controller/login-controller';
import { TokenMiddleware } from './middleware/token-middleware';
import { errorMiddleware } from './middleware/error-middleware';

import { Especialidade } from './entity/especialidade';
import { Paciente } from './entity/paciente';
import { Profissional } from './entity/profissional';
import { Servico } from './entity/servico';
import { Agendamento } from './entity/agendamento';

import { EspecialidadeService } from './service/especialidade-service';
import { EspecialidadeController } from './controller/especialidade-controller';
import { especialidadeRotas } from './router/especialidade-router';

import { PacienteService } from './service/paciente-service';
import { PacienteController } from './controller/paciente-controller';
import { pacienteRotas } from './router/paciente-router';

import { ProfissionalService } from './service/profissional-service';
import { ProfissionalController } from './controller/profissional-controller';
import { profissionalRotas } from './router/profissional-router';

import { ServicoService } from './service/servico-service';
import { ServicoController } from './controller/servico-controller';
import { servicoRotas } from './router/servico-router';

import { AgendamentoService } from './service/agendamento-service';
import { AgendamentoController } from './controller/agendamento-controller';
import { agendamentoRotas } from './router/agendamento-router';

const app = express();
const port = 3000;

// CORS — permite o frontend em localhost:5173
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
});

app.use(express.json());

// establish database connection
AppDataSource.initialize().then(async => {

    app.get('/hello', (req: Request, res: Response) => {
        res.json({ message: "Hello World!!" });
    })

    app.use('/uploads', express.static('my-uploads'))

    // Rotas Públicas
    // Login
    const profissionalRepository = AppDataSource.getRepository(Profissional);
    const loginService = new LoginService(profissionalRepository);
    const loginController = new LoginController(loginService);
    app.post('/api/login', loginController.realizaLogin);

    // Criar Profissional (público para permitir o primeiro cadastro)
    const profissionalService = new ProfissionalService(profissionalRepository);
    const profissionalController = new ProfissionalController(profissionalService);
    app.post('/api/profissionais', profissionalController.inserir);


    // Middleware de Autenticação - Todas as rotas abaixo desta linha são protegidas
    const tokenMiddleware = new TokenMiddleware(loginService);
    app.use(tokenMiddleware.verificarAcesso);


    // Rotas Protegidas
    // Profissionais (listar, buscar, atualizar, deletar)
    app.use('/api/profissionais', profissionalRotas(profissionalController));

    // Especialidades
    const especialidadeRepository = AppDataSource.getRepository(Especialidade);
    const especialidadeService = new EspecialidadeService(especialidadeRepository);
    const especialidadeController = new EspecialidadeController(especialidadeService);
    app.use('/api/especialidades', especialidadeRotas(especialidadeController));

    // Pacientes
    const pacienteRepository = AppDataSource.getRepository(Paciente);
    const pacienteService = new PacienteService(pacienteRepository);
    const pacienteController = new PacienteController(pacienteService);
    app.use('/api/pacientes', pacienteRotas(pacienteController));

    // Serviços
    const servicoRepository = AppDataSource.getRepository(Servico);
    const servicoService = new ServicoService(servicoRepository);
    const servicoController = new ServicoController(servicoService);
    app.use('/api/servicos', servicoRotas(servicoController));

    // Agendamentos
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const agendamentoService = new AgendamentoService(agendamentoRepository, pacienteRepository, servicoRepository);
    const agendamentoController = new AgendamentoController(agendamentoService);
    app.use('/api/agendamentos', agendamentoRotas(agendamentoController));


    app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    });

    // Middleware global de tratamento de erros (deve ser o último)
    app.use(errorMiddleware);
});