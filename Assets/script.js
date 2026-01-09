// =====================
// VARIÁVEIS GLOBAIS
// =====================
let servicosSelecionados = [];
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

// =====================
// MENU HAMBURGER
// =====================
document.getElementById('hamburgerBtn').addEventListener('click', function() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebarMenu.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
});

document.getElementById('sidebarOverlay').addEventListener('click', function() {
    document.getElementById('sidebarMenu').classList.remove('active');
    this.classList.remove('active');
});

// Fechar menu ao clicar em um link
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function() {
        document.getElementById('sidebarMenu').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
    });
});

// =====================
// NOTIFICAÇÃO DE CONTATOS
// =====================
document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('notificationContact').classList.add('show');
    });
});

document.getElementById('closeNotification').addEventListener('click', function() {
    document.getElementById('notificationContact').classList.remove('show');
});

// =====================
// NAVEGAÇÃO ENTRE SEÇÕES
// =====================
function mostrarSecao(secaoId) {
    // Esconder todas as seções
    document.getElementById('inicial').classList.remove('active');
    document.getElementById('agende').classList.remove('active');
    document.getElementById('horarios').classList.remove('active');
    const resumoEl = document.getElementById('resumo');
    const confirmacaoEl = document.getElementById('confirmacao');
    const authEl = document.getElementById('auth');
    if (resumoEl) resumoEl.classList.remove('active');
    if (confirmacaoEl) confirmacaoEl.classList.remove('active');
    if (authEl) authEl.classList.remove('active');
    
    // Mostrar a seção desejada
    document.getElementById(secaoId).classList.add('active');
    
    // Liberar scroll quando estiver em agendamento, horários, resumo, confirmação, perfil ou auth
    if (secaoId === 'agende' || secaoId === 'horarios' || secaoId === 'resumo' || secaoId === 'confirmacao' || secaoId === 'perfil' || secaoId === 'auth') {
        document.body.style.overflow = 'auto';
        if (secaoId === 'agende') {
            servicosSelecionados = [];
            atualizarListaServicos();
            document.querySelectorAll('.btn-selecionar').forEach(btn => {
                btn.classList.remove('selecionado');
            });
        }
    } else {
        document.body.style.overflow = 'hidden';
    }
}

// Botões de navegação do header
document.querySelectorAll('.nav-links a').forEach((link, index) => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        if (index === 0) mostrarSecao('inicial');
        else if (index === 1) mostrarSecao('agende');
        else if (index === 2) mostrarSecao('horarios');
    });
});

// Botão agende corte
document.querySelector('.btn-agende-corte').addEventListener('click', function(e) {
    e.preventDefault();
    mostrarSecao('agende');
});

// Botões de Login e Cadastro do Header
document.querySelector('.btn-cadastro').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('cadastroForm').style.display = 'block';
    mostrarSecao('auth');
});

document.querySelector('.btn-login').addEventListener('click', function() {
    document.getElementById('cadastroForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    mostrarSecao('auth');
});

// Botões de Login e Cadastro do Sidebar
document.querySelectorAll('.btn-sidebar-cadastro, .btn-sidebar-login').forEach((btn, index) => {
    btn.addEventListener('click', function() {
        // Fechar menu
        document.getElementById('sidebarMenu').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
        
        if (index === 0) {
            // Cadastro
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('cadastroForm').style.display = 'block';
        } else {
            // Login
            document.getElementById('cadastroForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        }
        mostrarSecao('auth');
    });
});

// =====================
// AGENDAMENTO - SERVIÇOS
// =====================
document.querySelectorAll('.btn-selecionar').forEach(btn => {
    btn.addEventListener('click', function() {
        const servico = this.getAttribute('data-servico');
        
        if (servicosSelecionados.includes(servico)) {
            servicosSelecionados = servicosSelecionados.filter(s => s !== servico);
            this.classList.remove('selecionado');
        } else {
            servicosSelecionados.push(servico);
            this.classList.add('selecionado');
        }
        
        atualizarListaServicos();
    });
});

// Confirmar agendamento
document.getElementById('btnConfirmarAgendamento').addEventListener('click', function() {
    if (servicosSelecionados.length > 0) {
        mostrarSecao('horarios');
    } else {
        alert('Por favor, selecione pelo menos um serviço!');
    }
});

// =====================
// FUNÇÕES AUXILIARES
// =====================
function atualizarListaServicos() {
    const lista = document.getElementById('lista-servicos');
    lista.innerHTML = '';
    
    if (servicosSelecionados.length === 0) {
        lista.innerHTML = '<li>Nenhum serviço selecionado</li>';
    } else {
        servicosSelecionados.forEach(servico => {
            const li = document.createElement('li');
            li.textContent = '✓ ' + servico;
            lista.appendChild(li);
        });
    }
}

// =====================
// AGENDAMENTO - HORÁRIOS
// =====================
let dataSelecionada = null;
let horarioSelecionado = null;

// Configurações de horário
const HORARIO_INICIO = 8; // 8:00 AM
const HORARIO_FIM = 19; // 7:00 PM
const INTERVALO_MINUTOS = 30;

function gerarDatasDisponiveis() {
    const datasGrid = document.getElementById('datasGrid');
    datasGrid.innerHTML = '';
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const nomesM = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    let datasGeradas = 0;
    let dataAtual = new Date(hoje);
    
    // Gerar próximas 2 semanas (apenas segunda a sábado)
    while (datasGeradas < 14) {
        const diaSemana = dataAtual.getDay();
        
        // Pular domingo (0)
        if (diaSemana !== 0) {
            const dataCard = document.createElement('div');
            dataCard.className = 'data-card';
            
            const dia = dataAtual.getDate();
            const mes = dataAtual.getMonth();
            const ano = dataAtual.getFullYear();
            
            const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;
            
            dataCard.innerHTML = `
                <div class="dia-semana">${nomesDias[diaSemana]}</div>
                <div class="data-completa">${dia} de ${nomesM[mes]}</div>
            `;
            
            dataCard.addEventListener('click', function() {
                selecionarData(this, dataFormatada, dataAtual);
            });
            
            datasGrid.appendChild(dataCard);
            datasGeradas++;
        }
        
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
}

function selecionarData(element, dataFormatada, dataObj) {
    // Remover seleção anterior
    document.querySelectorAll('.data-card').forEach(card => {
        card.classList.remove('selecionada');
    });
    
    // Adicionar seleção nova
    element.classList.add('selecionada');
    dataSelecionada = dataFormatada;
    
    // Gerar e mostrar horários
    gerarHorariosDisponiveis(dataFormatada);
}

function gerarHorariosDisponiveis(data) {
    const horariosGrid = document.getElementById('horariosGrid');
    horariosGrid.innerHTML = '';
    
    // Calcular duração baseado nos serviços selecionados
    const duracaoMinutos = servicosSelecionados.length * 30 || 30;
    document.getElementById('duracaoTotal').textContent = duracaoMinutos;
    document.getElementById('dataSelecionadaInfo').textContent = `Data: ${data}`;
    
    // Mostrar container de horários
    document.getElementById('datasGrid').style.display = 'none';
    document.getElementById('horariosContainer').style.display = 'block';
    
    // Gerar horários em intervalos de 30 minutos
    for (let hora = HORARIO_INICIO; hora < HORARIO_FIM; hora++) {
        // Pular intervalo de almoço (12:00 às 13:00)
        if (hora >= 12 && hora < 13) {
            continue;
        }
        
        for (let minuto = 0; minuto < 60; minuto += INTERVALO_MINUTOS) {
            // Verificar se há tempo suficiente para o agendamento
            const minutosRestantes = (HORARIO_FIM - hora) * 60 - minuto;
            
            if (minutosRestantes >= duracaoMinutos) {
                const horarioFormatado = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
                
                const btnHorario = document.createElement('button');
                btnHorario.className = 'horario-btn';
                btnHorario.textContent = horarioFormatado;
                btnHorario.addEventListener('click', function() {
                    selecionarHorario(this, horarioFormatado);
                });
                
                horariosGrid.appendChild(btnHorario);
            }
        }
    }
}

function selecionarHorario(element, horario) {
    // Remover seleção anterior
    document.querySelectorAll('.horario-btn').forEach(btn => {
        btn.classList.remove('selecionado');
    });
    
    // Adicionar seleção nova
    element.classList.add('selecionado');
    horarioSelecionado = horario;
}

// Botão voltar às datas
document.addEventListener('DOMContentLoaded', function() {
    const btnVoltar = document.getElementById('btnVoltarDatas');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            dataSelecionada = null;
            horarioSelecionado = null;
            document.getElementById('datasGrid').style.display = 'grid';
            document.getElementById('horariosContainer').style.display = 'none';
            document.querySelectorAll('.data-card').forEach(card => {
                card.classList.remove('selecionada');
            });
        });
    }

    // Botão finalizar horário
    const btnFinalizar = document.getElementById('btnFinalizarHorario');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function() {
            if (!dataSelecionada || !horarioSelecionado) {
                alert('Por favor, selecione uma data e um horário!');
                return;
            }
            mostrarResumo();
        });
    }

    // Botão voltar dos horários
    const btnVoltarHorarios = document.getElementById('btnVoltarHorarios');
    if (btnVoltarHorarios) {
        btnVoltarHorarios.addEventListener('click', function() {
            mostrarSecao('horarios');
        });
    }

    // Botão confirmar resumo
    const btnConfirmarResumo = document.getElementById('btnConfirmarResumo');
    if (btnConfirmarResumo) {
        btnConfirmarResumo.addEventListener('click', function() {
            mostrarConfirmacao();
        });
    }

    // Botão salvar em conta
    const btnSalvarConta = document.getElementById('btnSalvarConta');
    if (btnSalvarConta) {
        btnSalvarConta.addEventListener('click', function() {
            if (usuarioLogado) {
                alert('Agendamento salvo em sua conta!');
            } else {
                mostrarSecao('auth');
            }
        });
    }
});

// =====================
// RESUMO E CONFIRMAÇÃO
// =====================
function mostrarResumo() {
    const duracaoMinutos = servicosSelecionados.length * 30 || 30;
    
    document.getElementById('resumoData').textContent = dataSelecionada;
    document.getElementById('resumoHorario').textContent = horarioSelecionado;
    document.getElementById('resumoDuracao').textContent = duracaoMinutos;
    
    const resumoServicos = document.getElementById('resumoServicos');
    resumoServicos.innerHTML = '';
    servicosSelecionados.forEach(servico => {
        const li = document.createElement('li');
        li.textContent = servico;
        resumoServicos.appendChild(li);
    });
    
    mostrarSecao('resumo');
}

function mostrarConfirmacao() {
    const duracaoMinutos = servicosSelecionados.length * 30 || 30;
    
    document.getElementById('confirmacaoData').textContent = dataSelecionada;
    document.getElementById('confirmacaoHorario').textContent = horarioSelecionado;
    document.getElementById('confirmacaoDuracao').textContent = duracaoMinutos;
    
    const confirmacaoServicos = document.getElementById('confirmacaoServicos');
    confirmacaoServicos.innerHTML = '';
    servicosSelecionados.forEach(servico => {
        const li = document.createElement('li');
        li.textContent = servico;
        confirmacaoServicos.appendChild(li);
    });
    
    // Salvar agendamento se usuário estiver logado
    if (usuarioLogado) {
        salvarAgendamento();
    }
    
    mostrarSecao('confirmacao');
}
// =====================
// PERFIL DO CLIENTE
// =====================
function atualizarVisibilidadePerfil() {
    const authButtons = document.querySelector('.auth-buttons');
    const perfilCliente = document.getElementById('perfilCliente');
    
    if (usuarioLogado) {
        if (authButtons) authButtons.style.display = 'none';
        if (perfilCliente) {
            perfilCliente.style.display = 'flex';
            document.getElementById('nomeUsuarioPerfil').textContent = usuarioLogado.nome;
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (perfilCliente) perfilCliente.style.display = 'none';
    }
}

function carregarAgendamentosUsuario() {
    const container = document.getElementById('agendamentosContainer');
    if (!container) return;
    
    const agendamentosUsuario = agendamentos.filter(ag => ag.usuarioId === usuarioLogado.id);
    
    container.innerHTML = '';
    
    if (agendamentosUsuario.length === 0) {
        container.innerHTML = `
            <div class="agendamentos-vazio">
                <i class="fas fa-calendar-plus"></i>
                <p>Você ainda não tem agendamentos!</p>
            </div>
        `;
        return;
    }
    
    agendamentosUsuario.forEach(ag => {
        const dataAgendamento = new Date(ag.data);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const finalizado = dataAgendamento < hoje;
        const statusClass = finalizado ? 'finalizado' : 'pendente';
        const statusText = finalizado ? 'Finalizado' : 'Pendente';
        
        const servicosHtml = ag.servicos.map(s => `<li>${s}</li>`).join('');
        
        const cardHtml = `
            <div class="agendamento-card ${statusClass}">
                <span class="agendamento-status ${statusClass}">${statusText}</span>
                <div class="agendamento-card-item">
                    <strong>Data:</strong> ${ag.data}
                </div>
                <div class="agendamento-card-item">
                    <strong>Horário:</strong> ${ag.horario}
                </div>
                <div class="agendamento-card-item">
                    <strong>Duração:</strong> ${ag.duracao} minutos
                </div>
                <div class="agendamento-servicos">
                    <strong>Serviços:</strong>
                    <ul>${servicosHtml}</ul>
                </div>
            </div>
        `;
        
        container.innerHTML += cardHtml;
    });
}

function abrirPerfil() {
    if (!usuarioLogado) return;
    
    document.getElementById('perfilNome').textContent = usuarioLogado.nome;
    document.getElementById('perfilEmail').textContent = usuarioLogado.email;
    document.getElementById('perfilTelefone').textContent = usuarioLogado.telefone;
    
    carregarAgendamentosUsuario();
    mostrarSecao('perfil');
}

function salvarAgendamento() {
    if (!usuarioLogado) return;
    
    const novoAgendamento = {
        id: Date.now(),
        usuarioId: usuarioLogado.id,
        data: dataSelecionada,
        horario: horarioSelecionado,
        duracao: servicosSelecionados.length * 30 || 30,
        servicos: servicosSelecionados,
        dataCriacao: new Date().toISOString()
    };
    
    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

// =====================
// INICIALIZAÇÃO
// =====================
// =====================
// AUTENTICAÇÃO - LOGIN E CADASTRO
// =====================
function atualizarBotaoSalvarConta() {
    const btnSalvarConta = document.getElementById('btnSalvarConta');
    if (btnSalvarConta) {
        if (usuarioLogado) {
            btnSalvarConta.style.display = 'none';
        } else {
            btnSalvarConta.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Botão de Perfil
    const btnPerfil = document.getElementById('btnPerfil');
    const btnFecharPerfil = document.getElementById('btnFecharPerfil');
    const btnLogout = document.getElementById('btnLogout');
    
    if (btnPerfil) {
        btnPerfil.addEventListener('click', function() {
            abrirPerfil();
        });
    }
    
    if (btnFecharPerfil) {
        btnFecharPerfil.addEventListener('click', function() {
            mostrarSecao('inicial');
            // rolar ao topo para garantir visual correto
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0,0); }
        });
    }
    
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (confirm('Deseja sair da sua conta?')) {
                usuarioLogado = null;
                localStorage.removeItem('usuarioLogado');
                atualizarVisibilidadePerfil();
                mostrarSecao('inicial');
                // Reiniciar a página para limpar estados
                setTimeout(() => location.reload(), 250);
            }
        });
    }
    
    // Alternar entre login e cadastro
    const switchToCadastro = document.getElementById('switchToCadastro');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('loginForm');
    const cadastroForm = document.getElementById('cadastroForm');

    if (switchToCadastro) {
        switchToCadastro.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            cadastroForm.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            cadastroForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Formulário de Login
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginSenha').value;
            
            // Verificar se usuário existe
            const usuario = usuarios.find(u => u.email === email && u.senha === senha);
            
            if (usuario) {
                usuarioLogado = usuario;
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
                alert(`Bem-vindo, ${usuario.nome}!`);
                
                // Atualizar visibilidade do perfil
                atualizarVisibilidadePerfil();
                
                // Voltar para a confirmação
                mostrarSecao('confirmacao');
                atualizarBotaoSalvarConta();
                
                // Limpar formulário
                formLogin.reset();
            } else {
                alert('Email ou senha incorretos!');
            }
        });
    }

    // Formulário de Cadastro
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('cadastroNome').value;
            const telefone = document.getElementById('cadastroTelefone').value;
            const email = document.getElementById('cadastroEmail').value;
            const senha = document.getElementById('cadastroSenha').value;
            const confirmSenha = document.getElementById('cadastroConfirmSenha').value;
            
            // Validações
            if (senha !== confirmSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (usuarios.some(u => u.email === email)) {
                alert('Este email já está cadastrado!');
                return;
            }
            
            // Criar novo usuário
            const novoUsuario = {
                id: Date.now(),
                nome: nome,
                telefone: telefone,
                email: email,
                senha: senha
            };
            
            usuarios.push(novoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Fazer login automático
            usuarioLogado = novoUsuario;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            
            alert(`Cadastro realizado com sucesso! Bem-vindo, ${nome}!`);
            
            // Voltar para a confirmação
            mostrarSecao('confirmacao');
            atualizarBotaoSalvarConta();
            
            // Limpar formulário
            formCadastro.reset();
        });
    }

    // Atualizar visibilidade do botão ao carregar
    atualizarBotaoSalvarConta();
});

window.addEventListener('load', function() {
    mostrarSecao('inicial');
    gerarDatasDisponiveis();
    atualizarBotaoSalvarConta();
    atualizarVisibilidadePerfil();
    carregarAgendamentosUsuario();
});
