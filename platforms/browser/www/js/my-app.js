if ((window.location.href.indexOf("mtcap") == -1)
  && (window.location.href.indexOf("proeste") == -1)
  && (window.location.href.indexOf("maracap") == -1)
  && (window.location.href.indexOf("supercap") == -1)
  && (window.location.href.indexOf("cajucap") == -1)
  && (window.location.href.indexOf("amapacap") == -1)
  && (window.location.href.indexOf("localhost:") == -1)
  && (window.location.href.indexOf("192.") == -1)) {

  //********************************************************************************** */
  //** COMANDO PARA "OUVIR" QUANDO O DISPOSITIVO ESTÁ PRONTO (COM CORDOVA)**************/
  //document.addEventListener("deviceready", onDeviceReady.bind(this), false);
  //********************************************************************************** */
  document.addEventListener("deviceready", onDeviceReady.bind(this), false);
}

else {
  //********************************************************************************** */
  //** COMANDO PARA "OUVIR" QUANDO O DISPOSITIVO ESTÁ PRONTO (SEM CORDOVA)**************/
  //document.addEventListener("DOMContentLoaded", onDeviceReady.bind(this), false);
  //********************************************************************************** */
  document.addEventListener("DOMContentLoaded", onDeviceReady.bind(this), false);
  // VARIÁVEL DE DISPOSITIVO QUANDO ESTIVER RODANDO DA WEBAPP/HEROKU
  var device = {
    model: "Desktop",
    platform: "WEBAPP", // se WEBAPP status conexao = online
    uuid: 'WEBAPP-' + Date.now(),
    version: '1.0.0',
    manufacturer: "",
    isVirtual: "false",
    serial: "111.111.111",
  }
  // VARIÁVEL DE CONEXAO QUANDO ESTIVER RODANDO DA WEBAPP/HEROKU
  var Connection = {
    UNKNOWN: 'Unknown',
    ETHERNET: 'Ethernet',
    WIFI: 'WiFi',
    CELL_2G: '2G',
    CELL_3G: '3G',
    CELL_4G: '4G',
    CELL: 'Cell generic',
    NONE: 'no internet'
  }

}

//*************** Variáveis APP  //***************/
let codigo_crip = "";
let EFI_PayeeCode = "1e154ffe3333e28a4763edaadf9bb689"; // Codigo Gerencianet/EFI
let EFI_Sandbox = true; // HOMOLOGAÇÂO = TRUE // PRODUCAO = FALSE

var servidor = "https://ipa2.newmaracap.com.br/";

var emailSuporte = "atendimento@maracap.com.br";
var NomeEmpresa = "MARACAP";
var website = 'https://www.maracap.com.br/';
var chaveAPP = "Ch@ve67";
var versao = "1.0.67";
var appID = "br.com.maracap.novoapp";
var versaoAPP = "APP-ver-" + versao; // repetir a versao em copyright_versaoAPP
var copyright_versaoAPP = "Versão: " + versao; // Essa mostra no aplicativo tela Welcome e Login
var copyright_desenvolvidoPor = "@oficialmaracap";
var copyright_site = "https://maracap.com.br/";
var pgtmp = ""; // n lembro p que serve
var locUsu = "ok"// utilizada para saber o local do usuário conforme o IP
var testeUsu = "00"// cpf utilizado identificar o usuário de teste
var OneSignalIos = 's'; // habilitar OneSignal para IoS
var keyOneSignalIos = "55563b6e-13e1-401a-9887-0b7f411813ee"; // Chave do Onesignal para IoS
var OneSignalAndroid = 's';// habilitar OneSignal para Android
var keyOneSignalAndroid = "55563b6e-13e1-401a-9887-0b7f411813ee";// Chave do Onesignal para Anrdoid
var OneSignalAtivo = 's'; // Resumo se estive ativo no Ios ou Android
var UserOneSignal = {};
var UserOneSignalTAGS = {};
var nomeProduto = "Bilhete"; // Bilhete ou Título
var modeloApp = 1; // em processo de desativacao - seria p ter 2 modelos de app. 
var logoffOnErro = "n"; // Vem do servidor  junto com o AJAX /JSON/  [n=> Não, s => SIm, sm => Sim com mensagem]
var corStatusBar = "#23458b"; // Padrao dentro do APP
var corStatusBarCadastro = "#23458b"; // Tela de cadastro que é azul

let textoDadoAppJS = "";// Armazena os dados do JSON em variável javascript para ser usada em qualquer lugar do código
var habilitarPopupCapitalizadora = "s";
// Variávels JS utilizadas em codigo JS
// por ser assyncrono o comando getJSON nao foi possível carregar o valor pela funcao getDadoApp
var nomeCapitalizadora = "BRCAP";
var dialogMsgContribuicao = "ATENÇÃO: Visite o site https://maracap.com.br/regulamentos/ e veja os procedimentos ali descritos.";
var textoPopUpCapitalizadora = "A Maracap atualizou sua política de uso e proteção de dados.<br><br>Li e estou de acordo. <a href='https://maracap.com.br/regulamentos/' </a>";

if (sessionStorage.getItem('id_indicacao')) {
  var id_indicacao = sessionStorage.getItem('id_indicacao');
  localStorage.setItem("id_indicacao", id_indicacao);
}
else {
  var id_indicacao = "0";
}

let carrinhoObject = {};
let carrinhoCC = {};
let tipoCofre = "2"; //0 sem cofre //1 token, 2 completo
// Dados Tipo de pagamento
let habilitarBoleto = "s"; // MARACAP nao tem Boleto
let pgb = "2"; // boleto
let pgc = "2"; // credito
let pgp = "2"; // pix
//*************** Incioo APP  //***************/
//*************** Segurança CRIPTO //***************/
let msg_usuSegCripto = "Tente novamente";
let bloqSegCripto = "n";

var app = new Framework7({
  // App root element
  root: "#app",
  //theme: "ios",
  theme: "md",
  // App Name
  name: NomeEmpresa,
  version: versao,
  // App id
  id: appID,
  // Add default routes
  iosTranslucentBars: false,
  iosTranslucentModals: false,
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  // Valor padrão de botoes Dialog
  dialog: {
    buttonOk: "OK",
    buttonCancel: "Cancelar",
    preloaderTitle: 'Carregando...',
    progressTitle: 'Carregando...'
  },
  view: {
    preloadPreviousPage: false,
  },
  picker: {
    rotateEffect: true,
    openIn: 'sheet', // força sempre abrir no modo sheet. assim no WEBAPP nao dá erro
  },
  popup: {
    on: {
      open: function (item) {
        var itemText = item.$el['0'].outerHTML;
        var inicioIframe = itemText.indexOf("photo-browser-popup");
        // corrige a larguda do popup quando webapp
        if ((device.platform == 'WEBAPP') && ($("#body").width() >= 630)) {
          $("body").get(0).style.setProperty("--f7-popup-tablet-width", $("#app").width() + "px");
          if (inicioIframe > 0) { // photo-browser-popup
            $("body").get(0).style.setProperty("--f7-popup-tablet-height", $("#app").height() + "px");
          }
        }
      }
    }
  },
  routes: [
    {  // INDEX => OK
      // UNICA ROTA COM JS neste arquivo
      // como o app já possui um arquivo INDEX, nao criei outro para n confundir
      path: "/index/", // INDEX
      url: "index.html",
      options: { history: false }, // se a página deve ser salva no histórico do roteador
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      beforeLeave: function (routeTo, routeFrom, resolve, reject) {
        resolve();
        /*
        setTimeout(function () {
          resolve();
        }, 300);
        */
      },
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          var nome = app.views.main.router.url.toLowerCase();
          var view = app.views.current;

          if (device.platform == 'WEBAPP') {
            var tempo = 30;
          }
          else {
            var tempo = 300;
          }
          $("#index").addClass("bg-welcome-mod1");
          $("#index").addClass("bg-welcomeV1");
          // Define o zoom correto para melhor visualização do aplicativo
          setAcessibilidadeZoom();
          // Verifica Bot e atualiza UUID de Webapp
          testeBot();
          // codMilliSeconds
          var ktmp = Date.now();
          // Configurações caso esteja sendo executada na web
          runWebApp();
          //Verifica se o aplicativo está sendo atualizado com a nova criptografia mensal
          if (bloqSegCripto == 's') {
            app.dialog.alert(msg_usuSegCripto, null, function () {
              logoff();
            });
          }
          else {
            // Fecha os popup/dialog/smartSelect/actions abertos
            // se estiver aguardando codigo para troca de senha, nao fecha
            if (!localStorage.getItem("ValidarCodRecSenha")) {
              app.popup.close();
              app.dialog.close();
              app.smartSelect.close();
              app.actions.close();
            }
            // Limpa as variáveis ao carregar o webapp, para nao logar automaticamente no browser
            if (device.platform == 'WEBAPP') {
              localStorage.clear();
            }

            // Adiciona Variáveis e configurações personalizadas
            localStorage.setItem("device", JSON.stringify(device));
            if (localStorage.getItem("PrimAcesso")) { var PrimAcesso = localStorage.getItem("PrimAcesso"); } else { var PrimAcesso = ""; }
            if (localStorage.getItem("jwt")) { var jwt = localStorage.getItem("jwt"); } else { var jwt = ""; }
            if (localStorage.getItem("user_login")) { var user_login = localStorage.getItem("user_login"); } else { var user_login = ""; }

            // desabilitar plugin de conectividade em caso de LOCALHOST/dev
            if (window.location.host.substring(0, 10) == 'localhost:') {
              statusConexao = "localhost";
              localStorage.setItem("conexao", "online");
            }
            else {
              if (device.platform == 'WEBAPP') {
                localStorage.setItem("conexao", "online");
              }
              else {
                alteraStatusBar();
                var statusConexao = verificaConexao();
              }
            }
            waitForLoadVariable('codigo_crip', function () {
              // do something here now that someVariable is defined
              setTimeout(function () {
                if ((statusConexao == "no internet") || (statusConexao == "Unknown")) {
                  //SEM INTERNET, direciona para página offline
                  app.views.main.router.navigate("/offline/", { transition: 'f7-dive' });
                } else {

                  // Se possui a variável JWT armazenada, verifica se ainda é válida
                  if ((jwt != "") && (jwt != null)) {
                    // Cliente já efetuou login anteriormente, verifica se o Token JWT é válido
                    var dataC = {
                      user_login: user_login
                    };
                    var dataD = {
                      ktmp: ktmp,
                      device: localStorage.getItem("device"),
                    };
                    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
                    var dataD = JSON.stringify(dataD);
                    app.request({
                      url: servidor + "/api_public/login/login_jwt.php",
                      beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer " + jwt);
                        request.setRequestHeader("chaveapp", chaveAPP);
                        request.setRequestHeader("versaoapp", versaoAPP);
                      },
                      //async: false,
                      method: "POST",
                      dataType: "json",
                      data: {
                        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
                        c: dataC,
                        d: dataD
                      },
                      success: function (resposta) {
                        var resp = descriptDadosRecebido(resposta, ktmp);
                        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
                        if (respMerge.status == 'ok') {
                          // lista cartões do cofre
                          // as variáveis já foram carregadas aqui, 
                          // mas se o usuario abrir e fechar o app terá a lista atualizada, 
                          // caso nao atualize ao concluir a compra
                          //getnet_cofre_updUsuario();
                          armazenaLocalStorageFromAPI(respMerge, 'S', '');
                          app.views.main.router.navigate("/home/");
                        }
                        else {
                          logoff();
                        }
                      },
                      error: function (erro) {
                        //console.log(erro);
                        ErroAjax('error', 'conexao/servidor');
                        logoff();
                        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor (Cod_010), tente novamente!');
                      },
                    });
                  }
                  else {
                    var dataC = {};
                    var dataD = {
                      ktmp: ktmp,
                      device: localStorage.getItem("device")
                    };
                    var dataC = criptoDadosEnviado(dataC, ktmp);
                    var dataD = JSON.stringify(dataD);
                    app.request({
                      url: servidor + '/api_public/welcome/welcome.php',
                      beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer WelcomeApp");
                        request.setRequestHeader("chaveapp", chaveAPP);
                        request.setRequestHeader("versaoapp", versaoAPP);
                      },
                      async: false,
                      method: 'POST',
                      dataType: 'json',
                      data: {
                        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
                        c: dataC,
                        d: dataD
                      },
                      success: function (resposta) {
                        var resp = descriptDadosRecebido(resposta, ktmp);
                        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
                        if ((respMerge.status) && (respMerge.status == "ok")) {
                          armazenaLocalStorageFromAPI(respMerge, 'S');
                          // adicionado timeout pois o comando direto estava intermitente
                          setTimeout(function () {
                            app.views.main.router.navigate("/welcome/");
                          }, 30);

                          return true;
                        }
                        else {
                          ErroAjax(respMerge, respMerge.msg_usu);
                          return false;
                        }
                      },
                      error: function (erro) {
                        //console.log(erro);
                        ErroAjax('error', 'conexao/servidor', 's');
                        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente!', 's');
                      },
                      complete: function () { }
                    });
                  }
                }
              }, tempo);
            });
          }
        },
      }
    },
    { // OFFLINE  => OK
      path: "/offline/",
      url: "./pages/offline/offline.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-flip' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          // Altera/Formata cores do StatusBar
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          // Altera/Formata cores do StatusBar
          alteraStatusBar();
          $.getScript("./pages/offline/offline.js");
        }
      }
    },
    { // CADASTRO P1 => OK
      path: "/cadastro_p1/:vt", // validaTelefone
      url: "./pages/cadastro/cad_p1/cad_p1.html",
      options: { history: false }, // se a página deve ser salva no histórico do roteador
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso

      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-flip' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/cadastro/cad_p1/cad_p1.js");
        }
      }
    },
    { // CADASTRO P2 => OK
      path: "/cadastro_p2/",
      url: "./pages/cadastro/cad_p2/cad_p2.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-flip' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/cadastro/cad_p2/cad_p2.js");
        }
      }
    },
    { // CADASTRO P3 => OK
      path: "/cadastro_p3/",
      url: "./pages/cadastro/cad_p3/cad_p3.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-flip' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
          // Oculta campo de senha conforme o dispositivo
          // no mozila a maneira de ocultar e mostrar a senha é diferente
          if (device.platform == 'WEBAPP') {
            $("#li_cad_pass_app").hide();
            $("#li_cad_pass_web").show();
          }
          else {
            $("#li_cad_pass_web").hide();
            $("#li_cad_pass_app").show();
          }
        },
        pageInit: function (event, page) {
          $.getScript("./pages/cadastro/cad_p3/cad_p3.js");
        }
      }
    },
    { // LOGIN => OK
      path: "/login/",
      url: "./pages/login/login.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-flip' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          // Altera/Formata cores do StatusBar
          alteraStatusBar();
          // Oculta campo de senha conforme o dispositivo
          // no mozila a maneira de ocultar e mostrar a senha é diferente
          if (device.platform == 'WEBAPP') {
            $("#li_pass_app").hide();
            $("#li_pass_web").show();
          }
          else {
            $("#li_pass_web").hide();
            $("#li_pass_app").show();
          }

        },
        pageInit: function (event, page) {
          $.getScript("./pages/login/login.js");
        }
      }
    },
    { // HOME  (TAB) => OK
      path: "/home/",
      url: "./pages/home/home.html",
      options: { animate: true },
      options: { clearPreviousHistory: true },
      options: { reloadAll: true }, // atualiza e limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push      
      beforeEnter: function (routeTo, routeFrom, resolve, reject) {
        // Adicionar nesta macro as informações do historico de compras
        getDadosAtualizados(localStorage.getItem('user_login'), 'S');
        app.dialog.close();
        carrinhoObject = verificaCarrinhoObject();
        resolve();
      },
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          // Altera/Formata cores do StatusBar
          alteraStatusBar();
          //getDadosAtualizados(localStorage.getItem('user_login'), 'S', 'S');

          HomeMostrarCardCompras();

          // Badge - Sinalização de Compra e de itens no rcarrinho
          badgeCompraSemana('home-badge-qtd-comprada'); // cada pagina tem um id
          badgeCarrinhoEmAberto('home-badge-qtd-carrinho');// cada pagina tem um id

          app.dialog.close();
        },
        pageInit: function (event, page) {
          alteraStatusBar();
          runWebApp();
          if (app.views.main.router.url == '/home/') {
            app.dialog.preloader();
          }
          $.getScript("./pages/home/home.js");
        },
        pageAfterIn: function (event, page) {
          // Apos carregar a página, corrigir o LABEL do relogio conforme sistema
          if (app.device.ios) {
            //if (app.width > 480) {
            if ($("#app").width() > 480) {
              $("#relogio").hide();
              $("#div_compre_agora").css("margin-top", "40px");
            }
          }
          //if (app.width > 480) {
          if ($("#app").width() > 480) {
            $(".badge-toolbar").each(function (index) {
              $(this).removeClass('badge-toolbar');
              $(this).addClass('badge-toolbar-Tablet');
            });
          }
          // Se for ipad, esconder o relógio
          if (app.device.ipad) {
            $("#relogio").hide();
            $("#WWAPP_relogio").hide();
            $("#div_compre_agora").css("margin-top", "40px");
            $("#div_compre_agora").css("margin-top", "40px");
            $("#div_carrinho_compras").css("margin-top", "40px");
          }
          HomeMostrarCardCompras();
          // Badge - Sinalização de Compra e de itens no rcarrinho
          badgeCompraSemana('home-badge-qtd-comprada'); // cada pagina tem um id
          badgeCarrinhoEmAberto('home-badge-qtd-carrinho');// cada pagina tem um id

          app.preloader.hide();
          app.dialog.close();

          var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
          if (dadosUsuario) {
            // Cria popUp da Capitalizadora obrigatório na Home
            if (dadosUsuario.aceitecapitalizadora == "NOK") {
              criarPopupCapitalizadora();
            }
            // Cria popUp na Home
            if (localStorage.getItem("popUp")) {
              //Apaga pois ele irá aparecer somente ao efetuar login
              var popUp = JSON.parse(localStorage.getItem("popUp"));
              if ((popUp.status != "OK")) {
                criarPopupDinamicoHOME(popUp.popup_titulo, popUp.popup_formname, popUp.popup_html, popUp.botao_rodape, popUp.botao_cab);
              }
            }

            if (localStorage.getItem("WWAPP_comprar")) {
              var qtdTitulos = localStorage.getItem("WWAPP_comprar");
              var tipoTitulos = "aleatorio";
              localStorage.removeItem("WWAPP_comprar");
              setTimeout(function () {
                app.views.main.router.navigate('/carrinho/' + qtdTitulos + '/' + tipoTitulos);
              }, 1500);
            } else {
              setTimeout(function () {
                var nome = app.views.main.router.url;
                var view = app.views.current;
                app.preloader.hide();
                app.dialog.close();
              }, 3500);
            }
          }
          else {
            logoff();
          }
          atualizaDadosOneSignal();

          ocultarConformeLocal('div_compre_agora');
          ocultarConformeLocal('div_carrinho_compras');
          ocultarConformeLocal('HOME_block-boleto');
          ocultarConformeLocal('btn_comprar_p1');
          ocultarConformeLocal('btn_comprar_p2');
          ocultarConformeLocal('btn_comprar_p3');

        }
      }
    },
    { // Ganhadores (TAB) (Resultados Anteriores) => OK
      path: "/resultadosanteriores/",
      url: "./pages/resultadosanteriores/resultadosanteriores.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-fade' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          runWebApp();
          $.getScript("./pages/resultadosanteriores/resultadosanteriores.js");
        }
      }
    },
    { // MEUS TITULOS (TAB) => OK*****
      path: "/meustitulos/",
      url: "./pages/meustitulos/meustitulos.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-fade' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageBeforeIn: function (event, page) {
          // Adicionar nesta macro as informações do historico de compras
          getDadosAtualizados(localStorage.getItem('user_login'), 'N');
          app.dialog.close();
        },
        pageInit: function (event, page) {
          runWebApp();
          $.getScript("./pages/meustitulos/meustitulos.js");
        },
        pageBeforeOut: function (event, page) {
          localStorage.removeItem("TMPsorteiosAnteriores");
          localStorage.removeItem("TMPnumerosSorteados", '');
        },
      }
    },
    { // INFORMACOES (TAB) => OK
      path: "/informacoes/",
      url: "./pages/informacoes/informacoes.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-fade' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          runWebApp();
          $.getScript("./pages/informacoes/informacoes.js");
          app.preloader.hide();
          app.dialog.close();
        },
        pageAfterIn: function (event, page) {
          ocultarConformeLocal('li_ComprarSaldo');
          app.preloader.hide();
          app.dialog.close();
          setTimeout(function () {
            app.preloader.hide();
            app.dialog.close();
          }, 3500);
        }
      },
    },
    { // SORTEIOS  => OK
      path: "/sorteios/",
      url: "./pages/sorteios/sorteios.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { transition: 'f7-fade' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/sorteios/sorteios.js");
        },
        pageBeforeOut: function (event, page) {
          localStorage.removeItem("DataInicial");
          localStorage.removeItem("DataFinal", '');
          localStorage.removeItem("qtdSorteiosTMP", '');
        },
      }
    },
    { // INSTITUICOES => OK
      path: "/instituicoes/",
      url: "./pages/instituicoes/instituicoes.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/instituicoes/instituicoes.js");
        },
      }
    },
    { // PERFIL => OK
      path: "/perfil/",
      url: "./pages/perfil/perfil.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/perfil/perfil.js");
        },
        pageAfterIn: function (event, page) {
          var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
          setTimeout(function () {
            app.dialog.close();
            app.preloader.hide();
            if ((dadosUsuario.user_email == "") || (dadosUsuario.user_email == "null") || (dadosUsuario.user_email == null)) {
              app.dialog.alert('Favor atualizar seu cadastro, pois o seu email não está cadastrado', null);
            }
          }, 2000);/**ADD260322 */
        }
      },
    },
    { // CIDADES ATENDIDAS => OK
      path: "/cidadesatendidas/",
      url: "./pages/cidadesatendidas/cidadesatendidas.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          app.dialog.preloader();
          $.getScript("./pages/cidadesatendidas/cidadesatendidas.js");
        },
        pageAfterIn: function (event, page) {
          app.dialog.preloader('Carregando...');
          setTimeout(function () {
            app.dialog.close();
            app.preloader.hide();
          }, 1500);/**ADD260322 */
        }
      }
    },
    { // REGULAMENTO => OK
      path: "/regulamento/",
      url: "./pages/regulamento/regulamento.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/regulamento/regulamento.js");
        },
        pageAfterIn: function (event, page) {
          // Apos carregar a página, corrigir o LABEL do relogio conforme sistema
          //if (app.width > 500) {
          if ($("#app").width() > 500) {
            $("iframe").each(function (index) {
              IPAD_width = ($("#app").width() * 0.9);
              //IPAD_width = (app.width * 0.9);
              IPAD_height = (IPAD_width / 1.7778);
              $(this).attr('width', IPAD_width);
              $(this).attr('height', IPAD_height);
            });
          }
        },
        pageBeforeOut: function (event, page) {
          // parar o video do youtube
          $("iframe").each(function () {
            var src = $(this).attr('src');
            $(this).attr('src', src);
          });
        }
      }
    },
    { // SOBRE NOS // quem somos => OK
      path: "/quemsomos/",
      url: "./pages/quemsomos/quemsomos.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/quemsomos/quemsomos.js");
        },
        pageAfterIn: function (event, page) {
          // Apos carregar a página, corrigir o LABEL do relogio conforme sistema
          //if (app.width > 500) {
          if ($("#app").width() > 500) {
            $("iframe").each(function (index) {
              //IPAD_width = (app.width * 0.9);
              IPAD_width = ($("#app").width() * 0.9);
              IPAD_height = (IPAD_width / 1.7778);
              $(this).attr('width', IPAD_width);
              $(this).attr('height', IPAD_height);
            });
          }
        },
        pageBeforeOut: function (event, page) {
          // parar o video do youtube
          $("iframe").each(function () {
            var src = $(this).attr('src');
            $(this).attr('src', src);
          });
        }
      }
    },
    { // EXTRATO => OK
      path: "/extrato/",
      url: "./pages/extrato/extrato.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          app.dialog.preloader();
          $.getScript("./pages/extrato/extrato.js");
        },
        pageAfterIn: function (event, page) {
          app.preloader.hide();
          app.dialog.close();
        }
      }
    },
    { // Como Funciona => OK
      path: "/comofunciona/",
      url: "./pages/comofunciona/comofunciona.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/comofunciona/comofunciona.js");
        },
        pageAfterIn: function (event, page) {
          // Apos carregar a página, corrigir o LABEL do relogio conforme sistema
          //if (app.width > 500) {
          if ($("#app").width() > 500) {
            $("iframe").each(function (index) {
              IPAD_width = ($("#app").width() * 0.9);
              //IPAD_width = (app.width * 0.9);
              IPAD_height = (IPAD_width / 1.7778);
              $(this).attr('width', IPAD_width);
              $(this).attr('height', IPAD_height);
            });
          }
        },
        pageBeforeOut: function (event, page) {
          // parar o video do youtube
          $("iframe").each(function () {
            var src = $(this).attr('src');
            $(this).attr('src', src);
          });
        }
      }
    },
    { // Welcome => OK
      path: "/welcome/",
      url: "./pages/welcome/welcome.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-cover-v' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          alteraStatusBar();
          runWebApp();
          $.getScript("./pages/welcome/welcome.js");
        },
        pageAfterIn: function (event, page) {
          // Apos carregar a página, corrigir o LABEL do relogio conforme sistema
          if (app.device.ios) {
            //if (app.width > 480) {
            if ($("#app").width() > 480) {
              $("#relogio").hide();
              $("#div_compre_agora").css("margin-top", "40px");
            }
          }
          // Se for ipad, esconder o relógio
          if (app.device.ipad) {
            $("#relogio").hide();
            $("#WWAPP_relogio").hide();
            $("#div_compre_agora").css("margin-top", "40px");
            $("#div_carrinho_compras").css("margin-top", "40px");
          }
        },
        pageBeforeOut: function (e, page) {
          // destroy o captcha para gerar um novo caso o usuário volte para a tela inicial
          $("#id_actions_Captcha").remove();
        },
      }
    },
    { // Sorteio Ao Vivo => OK
      path: "/sorteioaovivo/",
      url: "./pages/sorteioaovivo/sorteioaovivo.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/sorteioaovivo/sorteioaovivo.js");
        },
        pageAfterIn: function (event, page) {
          // Apos carregar a página, corrigir o LABEL do relogio conforme sistema
          //if (app.width > 500) {
          if ($("#app").width() > 500) {
            $("iframe").each(function (index) {
              IPAD_width = ($("#app").width() * 0.9);
              //IPAD_width = (app.width * 0.9);
              IPAD_height = (IPAD_width / 1.7778);
              $(this).attr('width', IPAD_width);
              $(this).attr('height', IPAD_height);
            });
          }
        },
        pageBeforeOut: function (event, page) {
          // parar o video do youtube
          $("iframe").each(function () {
            var src = $(this).attr('src');
            $(this).attr('src', src);
          });
        }
      }
    },
    { // CARRINHO => OK
      path: "/carrinho/:qtdTitulos/:tipoTitulos",
      url: "./pages/carrinho/carrinho.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      beforeEnter: function (routeTo, routeFrom, resolve, reject) {
        // Adicionar nesta macro as informações do historico de compras
        getDadosAtualizados(localStorage.getItem('user_login'), 'S');
        listaCofreCartao();
        app.dialog.close();
        carrinhoObject = verificaCarrinhoObject();
        resolve();
      },
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageBeforeIn: function (event, page) {
          // Adicionar nesta macro as informações do historico de compras
          //getDadosAtualizados(localStorage.getItem('user_login'), 'S');
          //app.dialog.close();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/carrinho/carrinho.js");
        },
        pageAfterIn: function (e, page) {
          SorteioDisponivel();
        },
        pageBeforeOut: function (event, page) {
          localStorage.removeItem("list_c");
          localStorage.removeItem("qtdcofre");
        },
      }
    },
    { // SELECIONA CAP MULTI=> OK
      path: "/selecionarcap/:sorteio",
      url: "./pages/selecionarcap/multi/selecionarcap.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      beforeEnter: function (routeTo, routeFrom, resolve, reject) {
        // Adicionar nesta macro as informações do historico de compras
        getDadosAtualizados(localStorage.getItem('user_login'), 'S');
        app.dialog.close();
        resolve();
      },
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageBeforeIn: function (event, page) {
          //console.log('pageBeforeIn');
        },
        pageInit: function (event, page) {
          $.getScript("./pages/selecionarcap/multi/selecionarcap.js");
        },
        pageAfterIn: function (e, page) {
          SorteioDisponivel();
        },
      }
    },
    { //Comprar Saldo => OK
      path: "/comprarsaldo/",
      url: "./pages/comprarsaldo/comprarsaldo.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { reloadAll: true }, // carrega a nova página e remove todas as páginas anteriores do histórico e do DOM // limpa a opççao do botao voltar no Android
      options: { reloadCurrent: true }, // atualiza pagina - substitui a página atual pela nova da rota, sem animação neste caso
      options: { ignoreCache: true }, // Ignora o cache pagina
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          $.getScript("./pages/comprarsaldo/comprarsaldo.js");
        }
      }
    },
    { // Acompanhar Sorteio => OK
      path: "/acompanharsorteio/",
      url: "./pages/acompanharsorteio/acompanharsorteio.html",
      options: { animate: true }, // se a página deve ser animada ou não 
      options: { clearPreviousHistory: true }, // o histórico das páginas anteriores será limpo após recarregar/navegar para a rota especificada
      options: { iosSwipeBack: false }, // desabilita iosSwipeBack
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      on: {
        pageMounted: function (e, page) {
          escreveDadosApp(page.name);
          alteraStatusBar();
        },
        pageInit: function (event, page) {
          app.dialog.preloader();
          $.getScript("./pages/acompanharsorteio/acompanharsorteio.js");
        },
        pageAfterIn: function (e, page) {
          // funções após carregamento da página
          $.getScript("./pages/acompanharsorteio/acompanharsorteio_afterin.js");
          app.preloader.hide();
          app.dialog.close();
        },
      }
    },
    { // OPCOES DE ROTA
      path: "/opcoes/",
      url: "/pages/home/home.html",
      options: { clearPreviousHistory: true },
      options: { animate: true },
      options: { transition: 'f7-circle' }, //f7-circle // f7-cover // f7-cover-v // f7-dive  // f7-fade // f7-flip // f7-parallax // f7-push
      options: { reloadAll: true }, // atualiza e limpa a opççao do botao voltar no Android
      beforeEnter: function (routeTo, routeFrom, resolve, reject) {
        console.log('beforeEnter');
        console.log(routeTo);
        console.log(routeFrom);
        console.log(resolve);
        console.log(reject);
        /* some condition to check user is logged in */
        /* 
        if (a==a) {
           //resolve();
        } else {
           // don't allow to visit this page for unauthenticated users
           //reject();
        }
         */
      },
      beforeLeave: function (routeTo, routeFrom, resolve, reject) {
        console.log('beforeLeave');
        console.log(routeTo);
        console.log(routeFrom);
        console.log(resolve);
        console.log(reject);
        /* user didn't save edited form */
        /*
        if (a==a) {
          app.dialog.confirm(
            'Are you sure you want to leave this page without saving data?',
            function () {
              // proceed navigation
              //resolve();
            },
            function () {
              // stay on page
              //reject();
            }
          )
        } else {
          //resolve();
        }
        */
      },
      on: {
        pageMounted: function (e, page) {
          //console.log('1 page mounted');
        },
        pageInit: function (e, page) {
          //console.log("2 pageInit");
        },
        pageBeforeIn: function (e, page) {
          //console.log('3 page before in');
        },
        pageAfterIn: function (e, page) {
          //console.log('4 page after in');
        },
        pageBeforeOut: function (e, page) {
          // console.log('page before out');
        },
        pageAfterOut: function (e, page) {
          // console.log('page after out');
        },
        pageBeforeUnmount: function (e, page) {
          //console.log('page before unmount');
        },
        pageBeforeRemove: function (e, page) {
          // console.log('page before remove');
        },
      }
      //	asyncComponent: () => import('../pages/pagina2/pagina2.js'),
    },
  ],
});


var $$ = Dom7;



function getDeepLink(dados) {
  if (dados.params) {
    if (dados.params.a) {
      localStorage.setItem("id_indicacao", dados.params.a);
      id_indicacao = dados.params.a;
    }
  }
}

//QUANDO O DISPOSITIVO ESTIVER PRONTO
function onDeviceReady() {
  if ((app) && (device)) {
    device.f7d = app.device;
  }
  // Verifica se for APP ou Webapp para definir a cor da barra de status
  if (device.platform != "WEBAPP") {
    // Barra de Status do aplicativo - > Define a cor de background
    var coresCaps = {};
    coresCaps['SUPERCAP'] = "#0a3875";
    coresCaps['PROESTE'] = "#28a745";
    coresCaps['MTCAP'] = "#003666";
    coresCaps['MARACAP'] = "#DD9C14";
    coresCaps['AMAPACAP'] = "#ffce26";
    StatusBar.backgroundColorByHexString(coresCaps[NomeEmpresa]);
    // Barra de Status do aplicativo - > Define a cor de dos texto(hora, wifi etc)
    //StatusBar.styleDefault();
    StatusBar.styleLightContent();

    // Obtém as informações do deeplink
    universalLinks.subscribe('openApp', getDeepLink);
  }

  // Observa alterações de redimensionamento no aplicativo
  const resizeObserver = new ResizeObserver(entries =>
    runWebApp()
  );
  // start observing a DOM node
  resizeObserver.observe(document.body);

  // Se no PC redimenensionar
  $(window).on('resize', function () {
    var win = $(this); //this = window
    if (device.platform == 'WEBAPP') {
      runWebApp();
    }
  });
  //Carrega JSON com os valores de cada página
  loadJson();

  //DISPOSITIVO PRONTO INICIALIZAR POR ESSA ROTA
  var mainView = app.views.create(".view-main", { url: '/index/' });

  //COMANDO PARA "OUVIR" O BOTAO VOLTAR NATIVO DO ANDROID 	
  document.addEventListener("backbutton", onBackKeyDown, false);
  //FUNCÃO QUANDO CLICAR NO BOTAO VOLTAR NATIVO

  //****************************************** */
  //COMANDO PARA "OUVIR" QUANDO FICAR OFFLINE
  document.addEventListener("offline", onOffline, false);

  //COMANDO PARA "OUVIR" QUANDO FICAR ONLINE
  document.addEventListener("online", onOnline, false);

  // 
  if (device.platform != "WEBAPP") {
    //COMANDO PARA "OUVIR" O ONESIGNAL
    document.addEventListener('deviceready', OneSignalInit, false);
  }
}

function OneSignalInit() {
  // Uncomment to set OneSignal device logging to VERBOSE  
  // window.plugins.OneSignal.setLogLevel(6, 0);
  // NOTE: Update the setAppId value below with your OneSignal AppId.

  if (typeof cordova !== 'undefined') {
    if ((OneSignalIos == "s") && (app.device.ios)) {
      OneSignalAndroid = 'n';
      window.plugins.OneSignal.setAppId(keyOneSignalIos); // ios key Onesignal CAP
      OneSignalAtivo = 's';
    }
    else if ((OneSignalAndroid == "s") && (app.device.android)) {
      OneSignalIos = 'n';
      window.plugins.OneSignal.setAppId(keyOneSignalAndroid); // ANDROID key Onesignal CAP
      OneSignalAtivo = 's';
    }
    else {
      window.plugins.OneSignal.disablePush(true);
      OneSignalIos = 'n';
      OneSignalAndroid = 'n';
      OneSignalAtivo = 'n';
    }
  }
  else {
    OneSignalIos = 'n';
    OneSignalAndroid = 'n';
    OneSignalAtivo = 'n';
  }

  if (OneSignalAtivo == 's') {
    // iOS - Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
    window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
      // USUARIO APTO A RECEBER NOTIFICACOES
      //console.log("User accepted notifications: " + accepted);
    });

    // Ao receber a notificação
    window.plugins.OneSignal.setNotificationWillShowInForegroundHandler(function (notificationReceivedEvent) {
      //console.log(notificationReceivedEvent);
      //notificationReceivedEvent.complete(notificationReceivedEvent.notification);
    });
    // CLICOU NA NOTIFICAÇÂO
    window.plugins.OneSignal.setNotificationOpenedHandler(function (jsonData) {
      //console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });


    window.plugins.OneSignal.getDeviceState(function (stateChanges) {
      //console.log('OneSignal getDeviceState: ' + JSON.stringify(stateChanges));
      // 0 - Not Determined
      // 1 - Denied	
      // 2 - Authorized	
      // 3 - Provisional	
      // 4 - Ephemeral	
    });
    /*
    window.plugins.OneSignal.promptLocation();
    window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
      console.log("User accepted notifications: " + accepted);
  });
  
    window.plugins.OneSignal.addPermissionObserver(function (stateChanges) {
      console.log("Notification permission state changed: " + state.hasPrompted);
      console.log("Notification permission status: " + state.status);
      console.log("Push permission state changed: " + JSON.stringify(stateChanges, null, 2));
    });

    window.plugins.OneSignal.setRequiresUserPrivacyConsent(true);
    window.plugins.OneSignal.userProvidedPrivacyConsent((providedConsent) => {
      console.log(providedConsent);
      //if providedConsent == true, it means the SDK has been initialized and can be used
    });
  */
    atualizaDadosOneSignal();
  }
}

function onBackKeyDown() {
  //VARIAVEL PARA VER EM QUE ROTA ESTAMOS
  var nome = app.views.main.router.url.toLowerCase();
  var view = app.views.current;
  //console.log('Back: nome', nome);
  //console.log('view',view);
  //EXEMPLO DE VOLTAR:	
  if ((nome.substring(0, 11) == '/cadastro_p') || (nome == '/login/') || (nome == '/welcome/')) {
    app.views.main.router.navigate("/index/", { transition: 'f7-flip' });
  }
  else if ((nome == "/home/") || (nome == '/offline/')) {
    //ACONTECE NADA	
  } else if ((nome.substring(0, 15) == "/selecionarcap/") || (nome == '/comprarsaldo/') || (nome.substring(0, 10) == '/carrinho/')) {
    app.views.main.router.navigate("/home/", { transition: 'f7-flip' });
  } else {
    view.router.back({ force: true, reloadAll: true, clearPreviousHistory: true, transition: 'f7-circle' });
    //view.router.back({ force: true });
  }
}

function onOnline() {
  var rota = localStorage.getItem("rotaAtual");
  localStorage.removeItem("rotaAtual");
  localStorage.setItem("conexao", "online");
  if (rota) {
    if (rota == '/carrinho/') {
      app.views.main.router.navigate('/home/', { transition: 'f7-flip' });
    }
    else {
      app.views.main.router.navigate(rota, { transition: 'f7-flip' });
    }
  }
  $("#FaixaOffline").hide();
}

function onOffline() {
  var rota = app.views.main.router.url;
  localStorage.setItem("rotaAtual", rota);
  localStorage.setItem("conexao", "offline");

  //console.log('FUN Offline rotaAtual',rota);
  //console.log('FUN Offline history',app.views[0].history);

  //console.log("offline:" + rota);
  //app.views.main.router.navigate("/offline/");
  app.views.main.router.navigate("/offline/", { transition: 'f7-flip' });
}
