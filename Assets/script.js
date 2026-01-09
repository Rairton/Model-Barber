// =====================
// VARIÁVEIS GLOBAIS
// =====================
let servicosSelecionados = [];
let precosSelecionados = {};
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
let barbeiros = JSON.parse(localStorage.getItem('barbeiros')) || [];
let barbeiroSelecionado = null; // Novo: rastrear barbeiro selecionado

// Dados dos serviços (inicializar se não existir)
let servicos = JSON.parse(localStorage.getItem('servicos')) || [
    { id: 1, nome: 'Corte Clássico', preco: 50 },
    { id: 2, nome: 'Corte Moderno', preco: 60 },
    { id: 3, nome: 'Barba Completa', preco: 35 },
    { id: 4, nome: 'Corte + Barba', preco: 80 },
    { id: 5, nome: 'Tintura de Barba', preco: 45 },
    { id: 6, nome: 'Limpeza Facial', preco: 40 }
];

// Conta especial admin
const ADMIN_EMAIL = 'rairtoncsc@gmail.com';
const ADMIN_SENHA = '230308R@i';

// Funções disponíveis
const FUNCOES_DISPONIVEIS = [
    { id: 'barbeiro', nome: 'Barbeiro' },
    { id: 'aceitar_cancelar', nome: 'Aceitar/Cancelar Agendamentos' },
    { id: 'mudar_precos', nome: 'Mudar Preços' },
    { id: 'add_desconto', nome: 'Adicionar Descontos' },
    { id: 'add_remover_servicos', nome: 'Adicionar/Remover Serviços' },
    { id: 'chefe', nome: 'Chefe (Todas as funções + Gerenciar Barbeiros)' },
    { id: 'staff', nome: 'Staff (Todas as funções + Função Chefe)' }
];

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
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href').substring(1); // Remove o '#'
        mostrarSecao(href);
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
    const barbeiroEl = document.getElementById('barbeiro');
    const selecaoBarbeiroEl = document.getElementById('selecao-barbeiro');
    if (resumoEl) resumoEl.classList.remove('active');
    if (confirmacaoEl) confirmacaoEl.classList.remove('active');
    if (authEl) authEl.classList.remove('active');
    if (barbeiroEl) barbeiroEl.classList.remove('active');
    if (selecaoBarbeiroEl) selecaoBarbeiroEl.classList.remove('active');
    
    // Mostrar a seção desejada
    document.getElementById(secaoId).classList.add('active');
    
    // Liberar scroll quando estiver em agendamento, horários, resumo, confirmação, perfil, inicial, barbeiro, seleção-barbeiro ou auth
    if (secaoId === 'inicial' || secaoId === 'agende' || secaoId === 'horarios' || secaoId === 'resumo' || secaoId === 'confirmacao' || secaoId === 'perfil' || secaoId === 'auth' || secaoId === 'barbeiro' || secaoId === 'selecao-barbeiro') {
        document.body.style.overflow = 'auto';
        if (secaoId === 'agende') {
            servicosSelecionados = [];
            atualizarListaServicos();
            document.querySelectorAll('.btn-selecionar').forEach(btn => {
                btn.classList.remove('selecionado');
            });
        }
        if (secaoId === 'selecao-barbeiro') {
            carregarBarebirosDiponiveis();
            barbeiroSelecionado = null;
            document.getElementById('btnContinuarAgendamento').style.display = 'none';
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

// Listener para botão perfil da sidebar
document.getElementById('btnSidebarPerfil').addEventListener('click', function() {
    abrirPerfil();
    document.getElementById('sidebarMenu').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
});

// Listener para botão barbeiro da sidebar
const btnSidebarBarbeiro = document.getElementById('btnSidebarBarbeiro');
if (btnSidebarBarbeiro) {
    btnSidebarBarbeiro.addEventListener('click', function() {
        abrirGerenciadorBarbeiros();
        document.getElementById('sidebarMenu').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
    });
}

// =====================
// AGENDAMENTO - SELEÇÃO DE BARBEIRO
// =====================
function carregarBarebirosDiponiveis() {
    const container = document.getElementById('listaBarbeirosDisponiveis');
    container.innerHTML = '';
    
    const barberirosPessoal = barbeiros.filter(b => b.email !== ADMIN_EMAIL && b.funcoes.includes('barbeiro'));
    
    barberirosPessoal.forEach(barbeiro => {
        const div = document.createElement('div');
        div.className = 'barbeiro-opcao';
        div.setAttribute('data-barbeiro', barbeiro.id);
        div.innerHTML = `
            <div class="barbeiro-opcao-icon">
                <i class="fas fa-user"></i>
            </div>
            <h3>${barbeiro.nome}</h3>
            <p>Barbeiro</p>
        `;
        
        div.addEventListener('click', function() {
            selecionarBarbeiro(barbeiro.id);
        });
        
        container.appendChild(div);
    });
}

function selecionarBarbeiro(barbeiroId) {
    // Remover seleção anterior
    document.querySelectorAll('.barbeiro-opcao').forEach(opcao => {
        opcao.classList.remove('selecionado');
    });
    
    // Adicionar seleção atual
    const opcaoSelecionada = document.querySelector(`[data-barbeiro="${barbeiroId}"]`);
    if (opcaoSelecionada) {
        opcaoSelecionada.classList.add('selecionado');
    }
    
    barbeiroSelecionado = barbeiroId;
    
    // Mostrar botão de continuar
    document.getElementById('btnContinuarAgendamento').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function() {
    // Botão de continuar agendamento
    const btnContinuarAgendamento = document.getElementById('btnContinuarAgendamento');
    if (btnContinuarAgendamento) {
        btnContinuarAgendamento.addEventListener('click', function() {
            mostrarSecao('agende');
        });
    }
});

// =====================
// AGENDAMENTO - SERVIÇOS
// =====================
function adicionarListenersBotoesSelecionaros() {
    document.querySelectorAll('.btn-selecionar').forEach(btn => {
        btn.addEventListener('click', function() {
            const servico = this.getAttribute('data-servico');
            const preco = parseFloat(this.getAttribute('data-preco'));
            
            if (servicosSelecionados.includes(servico)) {
                servicosSelecionados = servicosSelecionados.filter(s => s !== servico);
                delete precosSelecionados[servico];
                this.classList.remove('selecionado');
            } else {
                servicosSelecionados.push(servico);
                precosSelecionados[servico] = preco;
                this.classList.add('selecionado');
            }
            
            atualizarListaServicos();
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Adicionar listeners iniciais aos botões de serviço
    adicionarListenersBotoesSelecionaros();
    
    // Confirmar agendamento
    const btnConfirmarAgendamento = document.getElementById('btnConfirmarAgendamento');
    if (btnConfirmarAgendamento) {
        btnConfirmarAgendamento.addEventListener('click', function() {
            if (servicosSelecionados.length > 0) {
                mostrarSecao('horarios');
            } else {
                alert('Por favor, selecione pelo menos um serviço!');
            }
        });
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
        let totalPreco = 0;
        servicosSelecionados.forEach(servico => {
            const li = document.createElement('li');
            const preco = precosSelecionados[servico];
            li.textContent = '✓ ' + servico + ' - R$ ' + preco.toFixed(2);
            lista.appendChild(li);
            totalPreco += preco;
        });
        
        // Adicionar total
        const liTotal = document.createElement('li');
        liTotal.style.fontWeight = 'bold';
        liTotal.style.color = '#ffd700';
        liTotal.style.marginTop = '10px';
        liTotal.style.borderTop = '1px solid rgba(255, 215, 0, 0.3)';
        liTotal.style.paddingTop = '10px';
        liTotal.textContent = 'Total: R$ ' + totalPreco.toFixed(2);
        lista.appendChild(liTotal);
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
                
                // Verificar disponibilidade do barbeiro
                let disponivel = true;
                
                if (barbeiroSelecionado !== 'qualquerUm') {
                    // Verificar se o barbeiro selecionado tem conflito
                    disponivel = !agendamentos.some(ag => 
                        ag.barbeiroId === barbeiroSelecionado && 
                        ag.data === data && 
                        ag.horario === horarioFormatado &&
                        ag.status !== 'cancelado'
                    );
                } else {
                    // Se "Qualquer um", verificar se pelo menos um barbeiro está disponível
                    const barberirosPessoal = barbeiros.filter(b => b.email !== ADMIN_EMAIL && b.funcoes.includes('barbeiro'));
                    disponivel = barberirosPessoal.some(barbeiro => 
                        !agendamentos.some(ag => 
                            ag.barbeiroId === barbeiro.id && 
                            ag.data === data && 
                            ag.horario === horarioFormatado &&
                            ag.status !== 'cancelado'
                        )
                    );
                }
                
                const btnHorario = document.createElement('button');
                btnHorario.className = 'horario-btn';
                btnHorario.textContent = horarioFormatado;
                
                if (!disponivel) {
                    btnHorario.disabled = true;
                    btnHorario.style.opacity = '0.5';
                    btnHorario.style.cursor = 'not-allowed';
                } else {
                    btnHorario.addEventListener('click', function() {
                        selecionarHorario(this, horarioFormatado);
                    });
                }
                
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
    
    // Obter nome do barbeiro
    let nomeBarbeiro = 'Qualquer um';
    if (barbeiroSelecionado !== 'qualquerUm') {
        const barbeiro = barbeiros.find(b => b.id === barbeiroSelecionado);
        if (barbeiro) nomeBarbeiro = barbeiro.nome;
    }
    
    document.getElementById('resumoData').textContent = dataSelecionada;
    document.getElementById('resumoHorario').textContent = horarioSelecionado;
    document.getElementById('resumoDuracao').textContent = duracaoMinutos;
    
    // Adicionar barbeiro no resumo
    const resumoBarbeiro = document.getElementById('resumoBarbeiro');
    if (resumoBarbeiro) {
        resumoBarbeiro.textContent = nomeBarbeiro;
    }
    
    const resumoServicos = document.getElementById('resumoServicos');
    resumoServicos.innerHTML = '';
    let totalPreco = 0;
    servicosSelecionados.forEach(servico => {
        const li = document.createElement('li');
        const preco = precosSelecionados[servico];
        li.textContent = servico + ' - R$ ' + preco.toFixed(2);
        resumoServicos.appendChild(li);
        totalPreco += preco;
    });
    
    // Adicionar total no resumo
    const liTotal = document.createElement('li');
    liTotal.style.fontWeight = 'bold';
    liTotal.style.color = '#ffd700';
    liTotal.style.marginTop = '10px';
    liTotal.style.borderTop = '1px solid rgba(255, 215, 0, 0.3)';
    liTotal.style.paddingTop = '10px';
    liTotal.textContent = 'Total: R$ ' + totalPreco.toFixed(2);
    resumoServicos.appendChild(liTotal);
    
    mostrarSecao('resumo');
}

function mostrarConfirmacao() {
    const duracaoMinutos = servicosSelecionados.length * 30 || 30;
    
    // Obter nome do barbeiro
    let nomeBarbeiro = 'Qualquer um';
    if (barbeiroSelecionado !== 'qualquerUm') {
        const barbeiro = barbeiros.find(b => b.id === barbeiroSelecionado);
        if (barbeiro) nomeBarbeiro = barbeiro.nome;
    }
    
    document.getElementById('confirmacaoData').textContent = dataSelecionada;
    document.getElementById('confirmacaoHorario').textContent = horarioSelecionado;
    document.getElementById('confirmacaoDuracao').textContent = duracaoMinutos;
    
    // Adicionar barbeiro na confirmação
    const confirmacaoBarbeiro = document.getElementById('confirmacaoBarbeiro');
    if (confirmacaoBarbeiro) {
        confirmacaoBarbeiro.textContent = nomeBarbeiro;
    }
    
    const confirmacaoServicos = document.getElementById('confirmacaoServicos');
    confirmacaoServicos.innerHTML = '';
    let totalPreco = 0;
    servicosSelecionados.forEach(servico => {
        const li = document.createElement('li');
        const preco = precosSelecionados[servico];
        li.textContent = servico + ' - R$ ' + preco.toFixed(2);
        confirmacaoServicos.appendChild(li);
        totalPreco += preco;
    });
    
    // Adicionar total na confirmação
    const liTotal = document.createElement('li');
    liTotal.style.fontWeight = 'bold';
    liTotal.style.color = '#ffd700';
    liTotal.style.marginTop = '10px';
    liTotal.style.borderTop = '1px solid rgba(255, 215, 0, 0.3)';
    liTotal.style.paddingTop = '10px';
    liTotal.textContent = 'Total: R$ ' + totalPreco.toFixed(2);
    confirmacaoServicos.appendChild(liTotal);
    
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
    const sidebarAuth = document.getElementById('sidebarAuth');
    const sidebarPerfil = document.getElementById('sidebarPerfil');
    const btnBarbeiro = document.getElementById('btnBarbeiro');
    const btnSidebarBarbeiro = document.getElementById('btnSidebarBarbeiro');
    
    if (usuarioLogado) {
        if (authButtons) authButtons.style.display = 'none';
        if (perfilCliente) {
            perfilCliente.style.display = 'flex';
            document.getElementById('nomeUsuarioPerfil').textContent = usuarioLogado.nome;
        }
        // Atualizar sidebar
        if (sidebarAuth) sidebarAuth.style.display = 'none';
        if (sidebarPerfil) {
            sidebarPerfil.style.display = 'flex';
            document.getElementById('nomeUsuarioSidebar').textContent = usuarioLogado.nome;
        }
        
        // Verificar se é barbeiro
        const barbeiroUser = barbeiros.find(b => b.email === usuarioLogado.email);
        const isBarbeiro = barbeiroUser && barbeiroUser.funcoes.includes('barbeiro');
        const isAdmin = usuarioLogado.email === ADMIN_EMAIL;
        
        // Mostrar botão de barbeiro se for admin ou barbeiro
        if (btnBarbeiro) {
            btnBarbeiro.style.display = (isAdmin || isBarbeiro) ? 'flex' : 'none';
        }
        if (btnSidebarBarbeiro) {
            btnSidebarBarbeiro.style.display = (isAdmin || isBarbeiro) ? 'flex' : 'none';
        }
        
        // Atualizar texto do botão se for barbeiro não-admin
        if (!isAdmin && isBarbeiro && btnBarbeiro) {
            btnBarbeiro.innerHTML = '<i class="fas fa-calendar"></i> Meus Agendamentos';
        }
        if (!isAdmin && isBarbeiro && btnSidebarBarbeiro) {
            btnSidebarBarbeiro.innerHTML = '<i class="fas fa-calendar"></i> Meus Agendamentos';
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (perfilCliente) perfilCliente.style.display = 'none';
        // Atualizar sidebar
        if (sidebarAuth) sidebarAuth.style.display = 'flex';
        if (sidebarPerfil) sidebarPerfil.style.display = 'none';
        // Esconder botão de barbeiro
        if (btnBarbeiro) btnBarbeiro.style.display = 'none';
        if (btnSidebarBarbeiro) btnSidebarBarbeiro.style.display = 'none';
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
        
        let statusClass, statusText;
        
        if (ag.status === 'cancelado') {
            statusClass = 'cancelado';
            statusText = `Cancelado${ag.canceladoPor ? ` (${ag.canceladoPor})` : ''}`;
        } else if (dataAgendamento < hoje) {
            statusClass = 'finalizado';
            statusText = 'Finalizado';
        } else {
            statusClass = 'pendente';
            statusText = 'Pendente';
        }
        
        const servicosHtml = ag.servicos.map(s => {
            const preco = ag.precos ? ag.precos[s] : 0;
            return `<li>${s} - R$ ${preco.toFixed(2)}</li>`;
        }).join('');
        
        const totalPrecoHtml = ag.totalPreco ? `<div class="agendamento-total"><strong>Total:</strong> R$ ${ag.totalPreco.toFixed(2)}</div>` : '';
        
        const botaoCancelarHtml = (statusClass === 'pendente') ? `<button class="btn-cancelar-agendamento" data-id="${ag.id}"><i class="fas fa-times"></i> Cancelar</button>` : '';
        
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
                ${totalPrecoHtml}
                <div class="agendamento-acoes">
                    ${botaoCancelarHtml}
                </div>
            </div>
        `;
        
        container.innerHTML += cardHtml;
    });
    
    // Adicionar event listeners aos botões de cancelar
    document.querySelectorAll('.btn-cancelar-agendamento').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = parseInt(this.getAttribute('data-id'));
            cancelarAgendamento(agendamentoId, 'cliente');
        });
    });
}

function abrirPerfil() {
    if (!usuarioLogado) return;
    document.getElementById('perfilNome').textContent = usuarioLogado.nome;
    document.getElementById('perfilEmail').textContent = usuarioLogado.email;
    document.getElementById('perfilTelefone').textContent = usuarioLogado.telefone;
    carregarAgendamentosUsuario();
    document.getElementById('perfil').classList.add('active');
    document.getElementById('perfilOverlay').classList.add('active');
    mostrarSecao('perfil');
}

function cancelarAgendamento(agendamentoId, canceladoPor) {
    const agendamento = agendamentos.find(ag => ag.id === agendamentoId);
    if (!agendamento) return;
    
    if (confirm(`Tem certeza que deseja cancelar este agendamento?\n\nData: ${agendamento.data}\nHorário: ${agendamento.horario}`)) {
        agendamento.status = 'cancelado';
        agendamento.canceladoPor = canceladoPor;
        agendamento.dataCancelamento = new Date().toISOString();
        
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Recarregar a lista de agendamentos
        carregarAgendamentosUsuario();
        
        // Mostrar notificação de sucesso
        const notification = document.createElement('div');
        notification.className = 'notification show';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>Sucesso!</h3>
                <p>Agendamento cancelado com sucesso.</p>
                <button class="btn-close-notification">Fechar</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        notification.querySelector('.btn-close-notification').addEventListener('click', function() {
            notification.remove();
        });
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

function salvarAgendamento() {
    if (!usuarioLogado) return;
    
    let totalPreco = 0;
    servicosSelecionados.forEach(servico => {
        totalPreco += precosSelecionados[servico];
    });
    
    // Se "Qualquer um" foi selecionado, escolher um barbeiro disponível
    let barbeiroFinal = barbeiroSelecionado;
    if (barbeiroSelecionado === 'qualquerUm') {
        barbeiroFinal = encontrarBarbeiroDisponivel(dataSelecionada, horarioSelecionado);
    }
    
    const novoAgendamento = {
        id: Date.now(),
        usuarioId: usuarioLogado.id,
        barbeiroId: barbeiroFinal,
        data: dataSelecionada,
        horario: horarioSelecionado,
        duracao: servicosSelecionados.length * 30 || 30,
        servicos: servicosSelecionados,
        precos: precosSelecionados,
        totalPreco: totalPreco,
        status: 'pendente',
        canceladoPor: null,
        dataCriacao: new Date().toISOString()
    };
    
    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

function encontrarBarbeiroDisponivel(data, horario) {
    const barberirosPessoal = barbeiros.filter(b => b.email !== ADMIN_EMAIL && b.funcoes.includes('barbeiro'));
    
    // Procurar primeiro barbeiro sem conflito
    for (let barbeiro of barberirosPessoal) {
        const temConflito = agendamentos.some(ag => 
            ag.barbeiroId === barbeiro.id && 
            ag.data === data && 
            ag.horario === horario &&
            ag.status !== 'cancelado'
        );
        
        if (!temConflito) {
            return barbeiro.id;
        }
    }
    
    // Se todos tiverem conflito, retornar o primeiro
    return barberirosPessoal[0]?.id || 'qualquerUm';
}

// =====================
// INICIALIZAÇÃO
// =====================
// Inicializar conta admin
function inicializarAdmin() {
    const adminExiste = usuarios.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminExiste) {
        const novoAdmin = {
            id: Date.now(),
            nome: 'Admin Barberia',
            email: ADMIN_EMAIL,
            senha: ADMIN_SENHA,
            telefone: '(XX) XXXXX-XXXX',
            isAdmin: true,
            dataCriacao: new Date().toISOString()
        };
        usuarios.push(novoAdmin);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Criar barbeiro para admin com função staff
        const barbeiroAdmin = {
            id: Date.now(),
            usuarioId: novoAdmin.id,
            email: ADMIN_EMAIL,
            nome: novoAdmin.nome,
            funcoes: ['staff'],
            dataCriacao: new Date().toISOString()
        };
        barbeiros.push(barbeiroAdmin);
        localStorage.setItem('barbeiros', JSON.stringify(barbeiros));
    }
}

inicializarAdmin();

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
            document.getElementById('perfil').classList.remove('active');
            document.getElementById('perfilOverlay').classList.remove('active');
            mostrarSecao('inicial');
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0,0); }
        });
    }
    // Fechar perfil ao clicar no overlay
    const perfilOverlay = document.getElementById('perfilOverlay');
    if (perfilOverlay) {
        perfilOverlay.addEventListener('click', function() {
            document.getElementById('perfil').classList.remove('active');
            perfilOverlay.classList.remove('active');
            mostrarSecao('inicial');
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
    
    // =====================
    // GERENCIAMENTO DE BARBEIROS
    // =====================
    const btnBarbeiro = document.getElementById('btnBarbeiro');
    if (btnBarbeiro) {
        btnBarbeiro.addEventListener('click', function() {
            abrirGerenciadorBarbeiros();
        });
    }
    
    const btnVoltarBarbeiro = document.getElementById('btnVoltarBarbeiro');
    if (btnVoltarBarbeiro) {
        btnVoltarBarbeiro.addEventListener('click', function() {
            mostrarSecao('perfil');
        });
    }
    
    // Menu de abas
    document.querySelectorAll('.menu-barbeiro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const menu = this.getAttribute('data-menu');
            abrirMenuBarbeiro(menu);
        });
    });
    
    // Adicionar barbeiro
    const btnAdicionarBarbeiro = document.getElementById('btnAdicionarBarbeiro');
    if (btnAdicionarBarbeiro) {
        btnAdicionarBarbeiro.addEventListener('click', function() {
            const email = document.getElementById('emailNovoBarbeiro').value.trim();
            const senha = document.getElementById('senhaNovoBarbeiro').value.trim();
            const nome = document.getElementById('nomeBarbeiro').value.trim();
            
            if (!email || !senha || !nome) {
                alert('Por favor, preencha todos os campos!');
                return;
            }
            
            if (!email.includes('@')) {
                alert('Email inválido!');
                return;
            }
            
            adicionarBarbeiro(email, senha, nome);
        });
    }
    
    // Select de barbeiros para gerenciar funções
    const selectBarbeiroFuncoes = document.getElementById('selectBarbeiroFuncoes');
    if (selectBarbeiroFuncoes) {
        selectBarbeiroFuncoes.addEventListener('change', function() {
            if (this.value) {
                carregarFuncoesBarbeiro(parseInt(this.value));
            }
        });
    }
    
    // Adicionar serviço
    const btnAdicionarServico = document.getElementById('btnAdicionarServico');
    if (btnAdicionarServico) {
        btnAdicionarServico.addEventListener('click', function() {
            const nome = document.getElementById('nomeServico').value.trim();
            const preco = parseFloat(document.getElementById('precoServico').value);
            
            if (!nome || isNaN(preco) || preco <= 0) {
                alert('Por favor, preencha todos os campos com valores válidos!');
                return;
            }
            
            adicionarServico(nome, preco);
        });
    }
});

// =====================
// FUNÇÕES DE BARBEIROS
// =====================
function abrirGerenciadorBarbeiros() {
    if (!usuarioLogado) {
        alert('Você precisa estar logado!');
        return;
    }
    
    const barbeiroUser = barbeiros.find(b => b.email === usuarioLogado.email);
    const isBarbeiro = barbeiroUser && barbeiroUser.funcoes.includes('barbeiro');
    const isAdmin = usuarioLogado.email === ADMIN_EMAIL;
    
    if (!isAdmin && !isBarbeiro) {
        alert('Acesso negado!');
        return;
    }
    
    mostrarSecao('barbeiro');
    
    const barbeiroSection = document.getElementById('barbeiro');
    const barbeirSidebar = document.querySelector('.barbeiro-sidebar');
    const barbeirMain = document.querySelector('.barbeiro-main');
    
    // Se for barbeiro não-admin, mostrar apenas agendamentos
    if (!isAdmin && isBarbeiro) {
        if (barbeirSidebar) barbeirSidebar.style.display = 'none';
        if (barbeirMain) {
            // Esconder todos os menus
            document.querySelectorAll('.menu-barbeiro').forEach(m => m.style.display = 'none');
            // Mostrar apenas o menu de agendamentos
            const menuAgendamentos = document.getElementById('menu-agendamentos');
            if (menuAgendamentos) {
                menuAgendamentos.style.display = 'block';
            }
        }
        // Modificar header
        const barbeiroHeader = document.querySelector('.barbeiro-header');
        if (barbeiroHeader) {
            barbeiroHeader.innerHTML = `
                <h1>Meus Agendamentos</h1>
                <button class="btn-voltar-barbeiro" id="btnVoltarBarbeiro">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            `;
            document.getElementById('btnVoltarBarbeiro').addEventListener('click', function() {
                mostrarSecao('perfil');
            });
        }
        
        abrirAbaBarbeiro('pendentes');
        carregarAbasAgendamentos();
    } else {
        // Se for admin, mostrar gerenciamento completo
        if (barbeirSidebar) barbeirSidebar.style.display = 'flex';
        if (barbeirMain) {
            document.querySelectorAll('.menu-barbeiro').forEach(m => m.style.display = 'none');
            document.getElementById('menu-barbeiros').style.display = 'block';
            document.getElementById('menu-barbeiros').classList.add('active');
        }
        
        // Restaurar header original
        const barbeiroHeader = document.querySelector('.barbeiro-header');
        if (barbeiroHeader) {
            barbeiroHeader.innerHTML = `
                <h1>Gerenciamento de Barbeiros</h1>
                <button class="btn-voltar-barbeiro" id="btnVoltarBarbeiro">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            `;
            document.getElementById('btnVoltarBarbeiro').addEventListener('click', function() {
                mostrarSecao('perfil');
            });
        }
        
        carregarListaBarbeiros();
        carregarGerenciadorPrecos();
        carregarListaServicos();
    }
}

function abrirMenuBarbeiro(menu) {
    // Esconde todos os menus
    document.querySelectorAll('.menu-barbeiro').forEach(m => {
        m.classList.remove('active');
        m.style.display = 'none';
    });
    document.querySelectorAll('.menu-barbeiro-btn').forEach(b => b.classList.remove('active'));

    // Mostra apenas o menu selecionado
    const menuEl = document.getElementById(`menu-${menu}`);
    if (menuEl) {
        menuEl.classList.add('active');
        menuEl.style.display = 'block';
    }
    const btnEl = document.querySelector(`[data-menu="${menu}"]`);
    if (btnEl) btnEl.classList.add('active');

    if (menu === 'funcoes') {
        carregarSelectBarbeiros();
    }
}

function carregarListaBarbeiros() {
    const container = document.getElementById('listaBarbeiros');
    container.innerHTML = '';
    
    // Filtrar barbeiros (excluir o admin da lista)
    const barbeirosList = barbeiros.filter(b => b.email !== ADMIN_EMAIL);
    
    if (barbeirosList.length === 0) {
        container.innerHTML = '<p style="color: #999;">Nenhum barbeiro cadastrado ainda.</p>';
        return;
    }
    
    barbeirosList.forEach(barbeiro => {
        const card = document.createElement('div');
        card.className = 'barbeiro-card';
        card.innerHTML = `
            <div class="barbeiro-info">
                <h3>${barbeiro.nome}</h3>
                <p>Email: ${barbeiro.email}</p>
                <p>Funções: ${barbeiro.funcoes.map(f => {
                    const func = FUNCOES_DISPONIVEIS.find(func => func.id === f);
                    return func ? func.nome : f;
                }).join(', ')}</p>
            </div>
            <div class="barbeiro-acoes">
                <button class="btn-action btn-remove" onclick="removerBarbeiro(${barbeiro.id})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Limpar inputs
    document.getElementById('emailNovoBarbeiro').value = '';
    document.getElementById('senhaNovoBarbeiro').value = '';
    document.getElementById('nomeBarbeiro').value = '';
}

function adicionarBarbeiro(email, senha, nome) {
    // Verificar se email já existe
    if (usuarios.find(u => u.email === email)) {
        alert('Este email já está cadastrado!');
        return;
    }
    
    // Criar novo usuário
    const novoUsuario = {
        id: Date.now(),
        nome: nome,
        email: email,
        senha: senha,
        telefone: '',
        dataCriacao: new Date().toISOString()
    };
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Criar novo barbeiro
    const novoBarbeiro = {
        id: Date.now() + 1,
        usuarioId: novoUsuario.id,
        email: email,
        nome: nome,
        funcoes: [],
        dataCriacao: new Date().toISOString()
    };
    barbeiros.push(novoBarbeiro);
    localStorage.setItem('barbeiros', JSON.stringify(barbeiros));
    
    alert(`Barbeiro "${nome}" adicionado com sucesso!`);
    carregarListaBarbeiros();
}

function removerBarbeiro(barbeiroId) {
    const barbeiro = barbeiros.find(b => b.id === barbeiroId);
    if (!barbeiro) return;
    
    if (barbeiro.email === ADMIN_EMAIL) {
        alert('Você não pode remover a conta admin!');
        return;
    }
    
    if (confirm(`Tem certeza que deseja remover o barbeiro "${barbeiro.nome}"?`)) {
        barbeiros = barbeiros.filter(b => b.id !== barbeiroId);
        localStorage.setItem('barbeiros', JSON.stringify(barbeiros));
        carregarListaBarbeiros();
    }
}

function carregarSelectBarbeiros() {
    const select = document.getElementById('selectBarbeiroFuncoes');
    select.innerHTML = '<option value="">Selecione um barbeiro...</option>';
    
    const barbeirosList = barbeiros.filter(b => b.email !== ADMIN_EMAIL);
    
    barbeirosList.forEach(barbeiro => {
        const option = document.createElement('option');
        option.value = barbeiro.id;
        option.textContent = barbeiro.nome;
        select.appendChild(option);
    });
    
    document.getElementById('gerenciadorFuncoes').style.display = barbeirosList.length > 0 ? 'block' : 'none';
}

function carregarFuncoesBarbeiro(barbeiroId) {
    const barbeiro = barbeiros.find(b => b.id === barbeiroId);
    if (!barbeiro) return;
    
    if (barbeiro.email === ADMIN_EMAIL) {
        alert('Você não pode modificar as funções da conta admin!');
        return;
    }
    
    const container = document.getElementById('funcoesBarbeiro');
    container.innerHTML = '';
    
    const funcoesFiltradas = FUNCOES_DISPONIVEIS.filter(f => f.id !== 'staff');
    
    funcoesFiltradas.forEach(funcao => {
        const div = document.createElement('div');
        div.className = 'funcao-item';
        
        const isChecked = barbeiro.funcoes.includes(funcao.id);
        
        div.innerHTML = `
            <input type="checkbox" id="funcao-${funcao.id}" ${isChecked ? 'checked' : ''}>
            <label for="funcao-${funcao.id}">${funcao.nome}</label>
        `;
        
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            atualizarFuncoesBarbeiro(barbeiroId, funcao.id, this.checked);
        });
        
        container.appendChild(div);
    });
}

function atualizarFuncoesBarbeiro(barbeiroId, funcaoId, adicionar) {
    const barbeiro = barbeiros.find(b => b.id === barbeiroId);
    if (!barbeiro) return;
    
    if (adicionar) {
        if (!barbeiro.funcoes.includes(funcaoId)) {
            barbeiro.funcoes.push(funcaoId);
        }
    } else {
        barbeiro.funcoes = barbeiro.funcoes.filter(f => f !== funcaoId);
    }
    
    localStorage.setItem('barbeiros', JSON.stringify(barbeiros));
}

function carregarGerenciadorPrecos() {
    const container = document.getElementById('gerenciadorPrecos');
    container.innerHTML = '';
    
    servicos.forEach(servico => {
        const div = document.createElement('div');
        div.className = 'preco-item';
        div.innerHTML = `
            <label>${servico.nome}</label>
            <input type="number" value="${servico.preco}" step="0.01" id="preco-${servico.id}">
            <button class="btn-action" onclick="salvarPreco(${servico.id})">
                <i class="fas fa-save"></i> Salvar
            </button>
        `;
        container.appendChild(div);
    });
}

function salvarPreco(servicoId) {
    const novoPreco = parseFloat(document.getElementById(`preco-${servicoId}`).value);
    
    if (isNaN(novoPreco) || novoPreco <= 0) {
        alert('Preço inválido!');
        return;
    }
    
    const servico = servicos.find(s => s.id === servicoId);
    if (servico) {
        servico.preco = novoPreco;
        localStorage.setItem('servicos', JSON.stringify(servicos));
        alert('Preço atualizado com sucesso!');
    }
}

function carregarListaServicos() {
    const container = document.getElementById('listaServicos');
    container.innerHTML = '';
    
    servicos.forEach(servico => {
        const card = document.createElement('div');
        card.className = 'servico-card';
        card.innerHTML = `
            <div class="servico-info">
                <h3>${servico.nome}</h3>
                <p>Preço: R$ ${servico.preco.toFixed(2)}</p>
            </div>
            <div class="servico-acoes">
                <button class="btn-action btn-remove" onclick="removerServico(${servico.id})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Limpar inputs
    document.getElementById('nomeServico').value = '';
    document.getElementById('precoServico').value = '';
}

function adicionarServico(nome, preco) {
    // Verificar se serviço já existe
    if (servicos.find(s => s.nome.toLowerCase() === nome.toLowerCase())) {
        alert('Este serviço já existe!');
        return;
    }
    
    const novoServico = {
        id: Math.max(...servicos.map(s => s.id), 0) + 1,
        nome: nome,
        preco: preco
    };
    
    servicos.push(novoServico);
    localStorage.setItem('servicos', JSON.stringify(servicos));
    
    alert(`Serviço "${nome}" adicionado com sucesso!`);
    carregarListaServicos();
    atualizarServicosDisponiveis();
}

function removerServico(servicoId) {
    const servico = servicos.find(s => s.id === servicoId);
    if (!servico) return;
    
    if (confirm(`Tem certeza que deseja remover o serviço "${servico.nome}"?`)) {
        servicos = servicos.filter(s => s.id !== servicoId);
        localStorage.setItem('servicos', JSON.stringify(servicos));
        carregarListaServicos();
        atualizarServicosDisponiveis();
    }
}

function atualizarServicosDisponiveis() {
    // Atualizar os serviços na página de agendamento
    const servicosGrid = document.querySelector('.servicos-grid');
    if (!servicosGrid) return;
    
    servicosGrid.innerHTML = '';
    
    servicos.forEach(servico => {
        const card = document.createElement('div');
        card.className = 'servico-card';
        card.innerHTML = `
            <h3>${servico.nome}</h3>
            <p>Descrição do serviço</p>
            <p class="preco">R$ ${servico.preco.toFixed(2)}</p>
            <button class="btn-selecionar" data-servico="${servico.nome}" data-preco="${servico.preco}">Selecionar</button>
        `;
        servicosGrid.appendChild(card);
    });
    
    // Re-adicionar event listeners aos botões de selecionar
    adicionarListenersBotoesSelecionaros();
}

// =====================
// GERENCIAMENTO DE AGENDAMENTOS DO BARBEIRO
// =====================
function abrirAgendamentosBarbeiro() {
    if (!usuarioLogado || usuarioLogado.email === ADMIN_EMAIL) {
        // Se for admin, mostrar agendamentos gerais
        abrirGerenciadorBarbeiros();
        return;
    }
    
    mostrarSecao('barbeiro');
    carregarAbasAgendamentos();
}

function carregarAbasAgendamentos() {
    const barbeiro = barbeiros.find(b => b.email === usuarioLogado.email);
    if (!barbeiro) return;
    
    carregarAgendamentosPendentes(barbeiro.id);
    carregarAgendamentosAceitos(barbeiro.id);
    carregarAgendamentosHistorico(barbeiro.id);
    
    // Configurar listeners das abas
    document.querySelectorAll('.aba-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const abaAtiva = this.getAttribute('data-aba');
            abrirAbaBarbeiro(abaAtiva);
        });
    });
    
    // Configurar filtro do histórico
    const filtroHistorico = document.getElementById('filtroHistorico');
    if (filtroHistorico) {
        filtroHistorico.addEventListener('change', function() {
            carregarAgendamentosHistorico(barbeiro.id, this.value);
        });
    }
}

function abrirAbaBarbeiro(abaAtiva) {
    // Remover classe active de todos os botões e conteúdos
    document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.remove('active'));
    
    // Adicionar classe active ao botão e conteúdo selecionado
    document.querySelector(`[data-aba="${abaAtiva}"]`).classList.add('active');
    document.getElementById(`aba-${abaAtiva}`).classList.add('active');
}

function carregarAgendamentosPendentes(barbeiroId) {
    const container = document.getElementById('agendamentosPendentesContainer');
    container.innerHTML = '';
    
    const agendamentosPendentes = agendamentos.filter(ag => 
        ag.barbeiroId === barbeiroId && 
        ag.status === 'pendente'
    );
    
    if (agendamentosPendentes.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Nenhum agendamento pendente</p>';
        return;
    }
    
    agendamentosPendentes.forEach(ag => {
        const usuario = usuarios.find(u => u.id === ag.usuarioId);
        const cardHtml = criarCardAgendamentoBarbeiro(ag, usuario, 'pendente');
        container.innerHTML += cardHtml;
    });
    
    // Adicionar event listeners
    document.querySelectorAll('.btn-aceitar').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = parseInt(this.getAttribute('data-id'));
            aceitarAgendamento(agendamentoId);
        });
    });
}

function carregarAgendamentosAceitos(barbeiroId) {
    const container = document.getElementById('agendamentosAceitosContainer');
    container.innerHTML = '';
    
    const agendamentosAceitos = agendamentos.filter(ag => 
        ag.barbeiroId === barbeiroId && 
        ag.status === 'aceito'
    );
    
    if (agendamentosAceitos.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Nenhum agendamento aceito</p>';
        return;
    }
    
    agendamentosAceitos.forEach(ag => {
        const usuario = usuarios.find(u => u.id === ag.usuarioId);
        const cardHtml = criarCardAgendamentoBarbeiro(ag, usuario, 'aceito');
        container.innerHTML += cardHtml;
    });
    
    // Adicionar event listeners
    document.querySelectorAll('.btn-finalizar').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = parseInt(this.getAttribute('data-id'));
            abrirModalFinalizarAgendamento(agendamentoId);
        });
    });
    
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = parseInt(this.getAttribute('data-id'));
            cancelarAgendamento(agendamentoId, 'barbearia');
        });
    });
}

function carregarAgendamentosHistorico(barbeiroId, filtro = '') {
    const container = document.getElementById('agendamentosHistoricoContainer');
    container.innerHTML = '';
    
    let agendamentosHistorico = agendamentos.filter(ag => 
        ag.barbeiroId === barbeiroId && 
        (ag.status === 'finalizado' || ag.status === 'cancelado')
    );
    
    // Aplicar filtro
    if (filtro === 'aceitos') {
        agendamentosHistorico = agendamentosHistorico.filter(ag => ag.status === 'finalizado');
    } else if (filtro === 'cancelados') {
        agendamentosHistorico = agendamentosHistorico.filter(ag => ag.status === 'cancelado');
    }
    
    if (agendamentosHistorico.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Nenhum agendamento no histórico</p>';
        return;
    }
    
    agendamentosHistorico.forEach(ag => {
        const usuario = usuarios.find(u => u.id === ag.usuarioId);
        const cardHtml = criarCardAgendamentoHistorico(ag, usuario);
        container.innerHTML += cardHtml;
    });
}

function criarCardAgendamentoBarbeiro(ag, usuario, tipo) {
    const dataFormatada = new Date(ag.data).toLocaleDateString('pt-BR');
    const servicos = ag.servicos.map(s => `<li>${s} - R$ ${ag.precos[s].toFixed(2)}</li>`).join('');
    
    let acoes = '';
    if (tipo === 'pendente') {
        acoes = `<button class="btn-action btn-aceitar" data-id="${ag.id}">
                    <i class="fas fa-check"></i> Aceitar
                </button>`;
    } else if (tipo === 'aceito') {
        acoes = `<button class="btn-action btn-finalizar" data-id="${ag.id}">
                    <i class="fas fa-check-double"></i> Finalizar
                </button>
                <button class="btn-action btn-cancel" data-id="${ag.id}">
                    <i class="fas fa-times"></i> Cancelar
                </button>`;
    }
    
    return `
        <div class="agendamento-item">
            <div class="agendamento-item-header">
                <span class="agendamento-cliente">${usuario?.nome || 'Cliente Desconhecido'}</span>
                <span class="agendamento-status-badge ${ag.status}">${ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}</span>
            </div>
            <div class="agendamento-detalhes">
                <div class="agendamento-detalhe">
                    <strong>Data:</strong> ${dataFormatada}
                </div>
                <div class="agendamento-detalhe">
                    <strong>Horário:</strong> ${ag.horario}
                </div>
                <div class="agendamento-detalhe">
                    <strong>Duração:</strong> ${ag.duracao} min
                </div>
                <div class="agendamento-detalhe">
                    <strong>Total:</strong> R$ ${ag.totalPreco.toFixed(2)}
                </div>
            </div>
            <ul class="agendamento-servicos-list">
                ${servicos}
            </ul>
            <div class="agendamento-acoes-barbeiro">
                ${acoes}
            </div>
        </div>
    `;
}

function criarCardAgendamentoHistorico(ag, usuario) {
    const dataFormatada = new Date(ag.data).toLocaleDateString('pt-BR');
    const servicos = ag.servicos.map(s => `<li>${s} - R$ ${ag.precos[s].toFixed(2)}</li>`).join('');
    
    let statusInfo = '';
    if (ag.status === 'finalizado') {
        statusInfo = `<div class="agendamento-detalhe">
                        <strong>Realizado por:</strong> ${ag.barbeiroQueFnalizou || 'N/A'}
                    </div>
                    <div class="agendamento-detalhe">
                        <strong>Data Finalização:</strong> ${ag.dataFinalizacao ? new Date(ag.dataFinalizacao).toLocaleDateString('pt-BR') : 'N/A'}
                    </div>`;
    } else if (ag.status === 'cancelado') {
        statusInfo = `<div class="agendamento-detalhe">
                        <strong>Cancelado por:</strong> ${ag.canceladoPor || 'N/A'}
                    </div>
                    <div class="agendamento-detalhe">
                        <strong>Data Cancelamento:</strong> ${ag.dataCancelamento ? new Date(ag.dataCancelamento).toLocaleDateString('pt-BR') : 'N/A'}
                    </div>`;
    }
    
    return `
        <div class="agendamento-item">
            <div class="agendamento-item-header">
                <span class="agendamento-cliente">${usuario?.nome || 'Cliente Desconhecido'}</span>
                <span class="agendamento-status-badge ${ag.status}">${ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}</span>
            </div>
            <div class="agendamento-detalhes">
                <div class="agendamento-detalhe">
                    <strong>Data:</strong> ${dataFormatada}
                </div>
                <div class="agendamento-detalhe">
                    <strong>Horário:</strong> ${ag.horario}
                </div>
                <div class="agendamento-detalhe">
                    <strong>Total:</strong> R$ ${ag.totalPreco.toFixed(2)}
                </div>
                ${statusInfo}
            </div>
            <ul class="agendamento-servicos-list">
                ${servicos}
            </ul>
        </div>
    `;
}

function aceitarAgendamento(agendamentoId) {
    const agendamento = agendamentos.find(ag => ag.id === agendamentoId);
    if (!agendamento) return;
    
    agendamento.status = 'aceito';
    agendamento.dataAceitacao = new Date().toISOString();
    
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    
    // Recarregar abas
    const barbeiro = barbeiros.find(b => b.email === usuarioLogado.email);
    if (barbeiro) {
        carregarAbasAgendamentos();
    }
}

function abrirModalFinalizarAgendamento(agendamentoId) {
    const agendamento = agendamentos.find(ag => ag.id === agendamentoId);
    if (!agendamento) return;
    
    // Carregar lista de barbeiros no select
    const selectBarbeiros = document.getElementById('quemRealizouServico');
    selectBarbeiros.innerHTML = '<option value="">Selecione...</option>';
    
    const barberirosPessoal = barbeiros.filter(b => b.email !== ADMIN_EMAIL && b.funcoes.includes('barbeiro'));
    barberirosPessoal.forEach(barbeiro => {
        const option = document.createElement('option');
        option.value = barbeiro.id;
        option.textContent = barbeiro.nome;
        selectBarbeiros.appendChild(option);
    });
    
    // Abrir modal
    const modal = document.getElementById('modalFinalizarAgendamento');
    modal.classList.add('active');
    
    // Configurar submit do formulário
    const form = document.getElementById('formFinalizarAgendamento');
    form.onsubmit = function(e) {
        e.preventDefault();
        const barbeiroId = parseInt(selectBarbeiros.value);
        const barbeiro = barbeiros.find(b => b.id === barbeiroId);
        
        if (barbeiro) {
            finalizarAgendamento(agendamentoId, barbeiro.nome);
            modal.classList.remove('active');
            form.reset();
        }
    };
}

function finalizarAgendamento(agendamentoId, barbeiroQueFnalizou) {
    const agendamento = agendamentos.find(ag => ag.id === agendamentoId);
    if (!agendamento) return;
    
    agendamento.status = 'finalizado';
    agendamento.barbeiroQueFnalizou = barbeiroQueFnalizou;
    agendamento.dataFinalizacao = new Date().toISOString();
    
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    
    // Recarregar abas
    const barbeiro = barbeiros.find(b => b.email === usuarioLogado.email);
    if (barbeiro) {
        carregarAbasAgendamentos();
    }
    
    // Notificar sucesso
    const notification = document.createElement('div');
    notification.className = 'notification show';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>Sucesso!</h3>
            <p>Agendamento finalizado com sucesso.</p>
            <button class="btn-close-notification">Fechar</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    notification.querySelector('.btn-close-notification').addEventListener('click', function() {
        notification.remove();
    });
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

window.addEventListener('load', function() {
    mostrarSecao('inicial');
    gerarDatasDisponiveis();
    atualizarBotaoSalvarConta();
    atualizarVisibilidadePerfil();
    carregarAgendamentosUsuario();
    
    // Configurar modal de finalização
    const btnCancelarModal = document.getElementById('btnCancelarModalFinalizacao');
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', function() {
            document.getElementById('modalFinalizarAgendamento').classList.remove('active');
        });
    }
});

// Ao mostrar o perfil, ativar overlay
function abrirPerfil() {
    if (!usuarioLogado) return;
    document.getElementById('perfilNome').textContent = usuarioLogado.nome;
    document.getElementById('perfilEmail').textContent = usuarioLogado.email;
    document.getElementById('perfilTelefone').textContent = usuarioLogado.telefone;
    carregarAgendamentosUsuario();
    document.getElementById('perfil').classList.add('active');
    document.getElementById('perfilOverlay').classList.add('active');
    mostrarSecao('perfil');
}

// Ao trocar de seção, garantir que overlay do perfil suma
const oldMostrarSecao = mostrarSecao;
mostrarSecao = function(secaoId) {
    document.getElementById('perfil').classList.remove('active');
    document.getElementById('perfilOverlay').classList.remove('active');
    oldMostrarSecao(secaoId);
};
