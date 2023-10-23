function loadJson() { 
  alteraCssAnimation();
  if (localStorage.getItem("conexao") == 'offline') {
    FaixaConexao();
  }
  else {
    app.request({
      url: servidor + "/api_public/json/",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer novo");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      async: false,
      method: 'POST',
      dataType: 'json',
      success: function (resposta) {
        if (resposta.status == "erro") {
          app.dialog.close();
          app.preloader.hide();
          if (resposta.msg_usu) {
            bloqSegCripto = 's';
            msg_usuSegCripto = resposta.msg_usu;
          }
          else {
            bloqSegCripto = 's';
            msg_usuSegCripto = 'Aguarde...';
          }
          return;
        }
        else {
          codigo_crip = JSON.stringify(resposta);
          var ArrayC = JSON.parse(codigo_crip);
          // Verifica e carrega as opções
          if (ArrayC.o) {
            // Carrega Logoff On error
            if (ArrayC.o['loe']) {
              logoffOnErro = ArrayC.o['loe'];
            }

            //Carrega a forma de pagamento

            if (ArrayC.o['pgb']) { pgb = ArrayC.o['pgb']; }
            if (ArrayC.o['pgc']) { pgc = ArrayC.o['pgc']; }
            if (ArrayC.o['pgp']) { pgp = ArrayC.o['pgp']; }
            if ((pgb == "0") || (pgb == 0)) {
              habilitarBoleto = 'n';
            }
            else {
              habilitarBoleto = 's';
            }
            // Verifica se cordova foi carregado
            if (typeof cordova !== 'undefined') {
              // Verifica OneSignal iOS
              if ((ArrayC.o['os_i']) && (app.device.ios)) {
                OneSignalAndroid = 'n';
                if (ArrayC.o['os_i'].length > 1) {
                  // Nova Chave OneSignal iOS 
                  if (keyOneSignalIos != ArrayC.o['os_i']) {
                    OneSignalIos = 's';
                    keyOneSignalIos = ArrayC.o['os_i'];
                    OneSignalInit();
                  }
                }
                else if (ArrayC.o['os_i'].toLowerCase() == 's') {
                  OneSignalIos = 's';
                }
                else if (ArrayC.o['os_i'].toLowerCase() == 'n') {
                  window.plugins.OneSignal.disablePush(true);
                  OneSignalIos = 'n';
                  OneSignalAndroid = 'n';
                  OneSignalAtivo = 'n';
                }
              }
              else if ((ArrayC.o['os_a']) && (app.device.android)) {
                // Verifica OneSignal android
                OneSignalIos = 'n';
                if (ArrayC.o['os_a'].length > 1) {
                  // Nova Chave OneSignal Android 
                  if (keyOneSignalAndroid != ArrayC.o['os_a']) {
                    OneSignalAndroid = 's';
                    keyOneSignalAndroid = ArrayC.o['os_a'];
                    OneSignalInit();
                  }
                }
                else if (ArrayC.o['os_a'].toLowerCase() == 's') {
                  OneSignalAndroid = 's';
                }
                else if (ArrayC.o['os_a'].toLowerCase() == 'n') {
                  window.plugins.OneSignal.disablePush(true);
                  OneSignalIos = 'n';
                  OneSignalAndroid = 'n';
                  OneSignalAtivo = 'n';
                }
              }
              else {
                //Desabilita OneSignal
                window.plugins.OneSignal.disablePush(true);
                OneSignalIos = 'n';
                OneSignalAndroid = 'n';
                OneSignalAtivo = 'n';
              }
            }
            else {
              //Desabilita OneSignal
              OneSignalIos = 'n';
              OneSignalAndroid = 'n';
              OneSignalAtivo = 'n';
            }
            // Carrega cores do Rainbow
            if (ArrayC.o['coresRainbow']) {
              var coresArray = ArrayC.o['coresRainbow'].split(',');
              if (coresArray.length == 1) {
                alteraCssRanbow(coresArray[0]);
              }
              else if (coresArray.length == 2) {
                alteraCssRanbow(coresArray[0], coresArray[1]);
              }
              else if (coresArray.length == 3) {
                alteraCssRanbow(coresArray[0], coresArray[1], coresArray[2]);
              } else {
                alteraCssRanbow(coresArray[0], coresArray[1], coresArray[2], coresArray[3]);
              }
            }
            delete ArrayC.o;
            codigo_crip = JSON.stringify(ArrayC);
          }
          // Carrega dados de LockUser
          if (ArrayC.loc) {
            if (ArrayC.loc.s) {
              if (ArrayC.loc.s == "1") {
                locUsu = "ok";
              }
              else {
                locUsu = "nok";
              }
            }
            if (ArrayC.loc.ut) {
              if (ArrayC.loc.ut != "") {
                testeUsu = ArrayC.loc.ut;
              }
            }
          }
          //Carrega dados do Json em caso de alteração
          if (ArrayC.json) {
            if (ArrayC.json.s == "1") {
              // carregar arquivo web
              textoDadoAppJS = ArrayC.json.dados;
              if (ArrayC.json.dados) {
                if (ArrayC.json.dados.variaveis) {
                  if (ArrayC.json.dados.variaveis.dialogMsgContribuicao) { dialogMsgContribuicao = ArrayC.json.dados.variaveis.dialogMsgContribuicao; }
                  if (ArrayC.json.dados.variaveis.nomeCapitalizadora) { nomeCapitalizadora = ArrayC.json.dados.variaveis.nomeCapitalizadora; }
                  if (ArrayC.json.dados.variaveis.textoPopUpCapitalizadora) { textoPopUpCapitalizadora = ArrayC.json.dados.variaveis.textoPopUpCapitalizadora; }
                }
              }
            }
            else {
              // carregar arquivo local
              getDadoAppJS('./js/dadosApp/dadosApp_' + NomeEmpresa + '.json');
            }
          }
          else {
            // carregar arquivo local
            getDadoAppJS('./js/dadosApp/dadosApp_' + NomeEmpresa + '.json');
          }
        }
      },
      error: function (erro) {
        //console.log(['erro', erro]);
      },
      complete: function (a) {
        //console.log(['complete', a])
        ;
      }
    });
  }
}

function waitForLoadVariable(variable, callback) {
  if (variable == 'codigo_crip') {
    var interval = setInterval(function () {
      if ((codigo_crip != "") && (codigo_crip != undefined)) {
        clearInterval(interval);
        callback();
      }
    }, 200);
  }
}


function listaCofreCartao() {
  if ((pgc == 1) || (pgc == '1') || (pgc == "")) {
    //GetNet Modelo 1
    // lista cartões do cofre
    getnet_cofre_list();
  }
  else if ((pgc == 2) || (pgc == "2")) {
    //Gerencianet Modelo 1
    gerencianet_cofre_list();
  }
}

function identificaUsuarioRestrito() {
  if (localStorage.getItem("dadosUsuario")) {
    var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    if (dadosUsuario.user_login == testeUsu) {
      locUsu = 'nok';
    }
  }
  if (localStorage.getItem("user_login")) {
    var usu = localStorage.getItem("user_login");
    if (usu == testeUsu) {
      locUsu = 'nok';
    }
  }
}

function limpaIndicacao() {
  localStorage.setItem("id_indicacao", "0");
  sessionStorage.setItem("id_indicacao", "0");
  id_indicacao = "0";
}

function ocultarConformeLocal(objetoID) {
  identificaUsuarioRestrito();
  if (locUsu == 'nok') {
    //console.log('loc usu');
    $('#' + objetoID).hide();
  }
}

function verificaCarrinhoObject() {
  var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
  var carrinhoMulti = JSON.parse(localStorage.getItem("carrinhoMulti"));
  var qtdSorteiosAbertos = 0;
  var qtdSorteiosCarrinho = 0;
  var guid_sorteios = "";
  var nomeSorAberto = "";
  var nomeSorCarrinho = "";
  var valorCarrinho = 0;
  var carrinhoFinal = {};
  var datasSorteiosCombo = "igual";
  var ultimaDataSorteioCombo = "";

  $.each(todosSorteios, function (index, sorteio) {
    if (sorteio.dados) {
      if (sorteio.dados.status_sorteio == "AA") {
        nomeSorAberto = nomeSorAberto + ";" + index;
        qtdSorteiosAbertos = qtdSorteiosAbertos + 1;
        carrinhoFinal[index] = {};
        guid_sorteios = sorteio.dados.guid_sorteios;
        carrinhoFinal[index][guid_sorteios] = {};
        carrinhoFinal[index][guid_sorteios]['dados_sorteio'] = {};
        carrinhoFinal[index][guid_sorteios]['dados_sorteio'] = sorteio.dados;
        carrinhoFinal[index][guid_sorteios]['dados_sorteio']['produto'] = sorteio.prod;
        carrinhoFinal[index][guid_sorteios]['dados_sorteio']['produto'] = sorteio.prod;
      }
    }
  });
  carrinhoFinal['info'] = {};
  carrinhoFinal['info']['qtdSorteiosAbertos'] = qtdSorteiosAbertos;
  carrinhoFinal['info']['valorUnitario'] = "";
  $.each(carrinhoMulti, function (index, sorteio) {
    if (sorteio.dados) {
      if (carrinhoFinal[index]) {
        if (ultimaDataSorteioCombo == "") {
          ultimaDataSorteioCombo = sorteio.dados[0].data_sorteio;
        }
        else {
          if (ultimaDataSorteioCombo != sorteio.dados[0].data_sorteio) {
            datasSorteiosCombo = "dif";
          }
        }
        nomeSorCarrinho = nomeSorCarrinho + ";" + index + ":" + sorteio.qtd;
        if (carrinhoFinal[index][sorteio.dados[0].guid_sorteios]) {
          qtdSorteiosCarrinho = qtdSorteiosCarrinho + 1;
          guid_sorteios = sorteio.dados[0].guid_sorteios;
          carrinhoFinal[index][guid_sorteios]['carrinho'] = {};
          carrinhoFinal[index][guid_sorteios]['carrinho']['dados'] = {};
          carrinhoFinal[index][guid_sorteios]['carrinho']['dados'] = sorteio.dados;
          carrinhoFinal[index][guid_sorteios]['carrinho']['itens'] = {};
          carrinhoFinal[index][guid_sorteios]['carrinho']['itens'] = sorteio.itens;
          carrinhoFinal[index][guid_sorteios]['carrinho']['qtdItensSorteioCarrinho'] = sorteio.qtd;
          valorCarrinho = valorCarrinho + (parseInt(sorteio.qtd) * carrinhoFinal[index][guid_sorteios]['dados_sorteio']['valor_venda']);
          // Só mantém o valor unitário se tiver um sorteio apenas no carrinho, caso contrário fica em branco
          if (carrinhoFinal['info']['valorUnitario'] == "") {
            carrinhoFinal['info']['valorUnitario'] = carrinhoFinal[index][guid_sorteios]['dados_sorteio']['valor_venda'];
          }
          else {
            carrinhoFinal['info']['valorUnitario'] = "";
          }
        }
      }
    }
  });
  carrinhoFinal['info']['totalTitulosCarrinho'] = carrinhoMulti['totalCarrinho'];
  carrinhoFinal['info']['valorCarrinho'] = valorCarrinho;
  carrinhoFinal['info']['qtdSorteiosCarrinho'] = qtdSorteiosCarrinho;
  carrinhoFinal['info']['nomeSorAberto'] = nomeSorAberto.substring(1);
  carrinhoFinal['info']['nomeSorCarrinho'] = nomeSorCarrinho.substring(1);
  carrinhoFinal['info']['datasSorteiosCombo'] = datasSorteiosCombo;

  return carrinhoFinal;
}

function alteraCssAnimation() {
  if (app.device.ios) {
    var r = document.querySelector(':root');
    r.style.setProperty('--animation', ' ');
  }
};

function atualizaDadosOneSignal() {
  if (device.platform != "WEBAPP") {

    if (OneSignalAtivo == 's') {
      // ID OneSignal DO DISPOSITIVO
      window.plugins.OneSignal.getDeviceState(function (stateChanges) {
        // get id do usuário
        UserOneSignal = stateChanges;
      });

      window.plugins.OneSignal.getTags(function (valor) {
        UserOneSignalTAGS = JSON.stringify(valor);
      });
    }

  }
}

function setAcessibilidadeZoom() {
  // Define o zoom correto para melhor visualização do aplicativo
  if (window.cordova) {
    if (cordova) {
      if ((cordova.platformId.toLowerCase() == "android") || (cordova.platformId.toLowerCase() == "ios")) {
        MobileAccessibility.getTextZoom(getTextZoomCallback);
      }
    }
  }
  else {
    // sem cordova
  }

  function setTextZoomCallback(textZoom) {
    //console.log('SET NEW zoom = ' + textZoom + '%')
  }

  function getTextZoomCallback(textZoom) {
    //console.log('Current text zoom = ' + textZoom + '%')
    if (textZoom >= 100) {
      MobileAccessibility.setTextZoom(100, setTextZoomCallback);
    }
    else if (textZoom > 84) {
      MobileAccessibility.setTextZoom(90, setTextZoomCallback);
    }
    else {
      MobileAccessibility.setTextZoom(80, setTextZoomCallback);
    }
  }

}

function alteraCssRanbow(cor_Rainbow_1 = null, cor_Rainbow_2 = null, cor_Rainbow_3 = null, cor_Rainbow_4 = null) {
  // Get the root element
  var r = document.querySelector(':root');

  if (cor_Rainbow_1 !== null) {
    if (cor_Rainbow_1.substring(0, 1) != "#") { cor_Rainbow_1 = "#" + cor_Rainbow_1; }
    r.style.setProperty('--cor_Rainbow_1', cor_Rainbow_1);
  }
  if (cor_Rainbow_2 !== null) {
    if (cor_Rainbow_2.substring(0, 1) != "#") { cor_Rainbow_2 = "#" + cor_Rainbow_2; }
    r.style.setProperty('--cor_Rainbow_2', cor_Rainbow_2);
  }
  if (cor_Rainbow_3 !== null) {
    if (cor_Rainbow_3.substring(0, 1) != "#") { cor_Rainbow_3 = "#" + cor_Rainbow_3; }
    r.style.setProperty('--cor_Rainbow_3', cor_Rainbow_3);
  }
  if (cor_Rainbow_4 !== null) {
    if (cor_Rainbow_4.substring(0, 1) != "#") { cor_Rainbow_4 = "#" + cor_Rainbow_4; }
    r.style.setProperty('--cor_Rainbow_4', cor_Rainbow_4);
  }
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function allStorage() {
  var archive = {},
    keys = Object.keys(localStorage),
    i = 0, key;
  for (; key = keys[i]; i++) {
    if (key in archive == false) { archive[key] = {}; }
    archive[key] = localStorage.getItem(key);
  }
  return archive;
}

function HomeMostrarCardCompras() {
  if (locUsu == 'ok') {
    if (localStorage.getItem("dadosUsuario") &&
      (localStorage.getItem("todosSorteios")) &&
      (localStorage.getItem("carrinhoMulti"))) {
      var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
      var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
      var carrinhoMulti = JSON.parse(localStorage.getItem("carrinhoMulti"));
      var valorCarrinho = 0;
      var qtdCarrinho = 0;
      var valorSorteio = 0;
      var qtdSorteio = 0;

      if (carrinhoMulti) {
        $.each(carrinhoMulti, function (nomeSorteio, dadosSorteio) {

          if ((typeof (dadosSorteio) == "object") && (nomeSorteio != 'totalCarrinho')) {
            var novoNomeSorteio = nomeSorteio.replace('ev', "sorteios");
            var qtdSorteio = 0;
            var valorSorteio = 0;

            if ((todosSorteios[novoNomeSorteio]['dados']) && (todosSorteios[novoNomeSorteio]['dados']['valor_venda'])) {
              qtdSorteio = dadosSorteio.qtd;
              valorSorteio = converterParaMoeda(todosSorteios[novoNomeSorteio]['dados']['valor_venda'], 'numeroUS', 'US');
              qtdCarrinho = parseInt(qtdCarrinho) + parseInt(qtdSorteio);
              valorCarrinho = parseFloat(valorCarrinho) + (parseInt(qtdSorteio) * parseFloat(valorSorteio));
            }
          }
        });
        if (qtdCarrinho > 0) {
          if (qtdCarrinho == 1) {
            $('#span_qtd_titulos_carrinho').text("1 " + nomeProduto.toLocaleLowerCase());
          }
          else {
            $('#span_qtd_titulos_carrinho').text(qtdCarrinho + " " + nomeProduto.toLocaleLowerCase() + "s");
          }
          $("#carrinho_valor").html("Valor a pagar: " + converterParaMoeda(parseFloat(valorCarrinho), 'texto'));
          if (localStorage.getItem("SorteioBloqueado") == "true") {
            $("#div_compre_agora").hide();
            $("#div_carrinho_compras").hide();
          }
          else {
            $("#div_carrinho_compras").show();
            $("#div_compre_agora").hide();
          }
        }
        else {
          $("#div_carrinho_compras").hide();
        }
      }
    }
    else {
      $("#div_compre_agora").hide();
      $("#div_carrinho_compras").hide();
    }

  }
}

// Telefone de contato Whatsapp
function corrigeTelWhatsapp(tel) {
  if (tel.tel_contato) {
    var telSuporte = tel.tel_contato.replace(/[-+_ *]/g, "");
    if ((telSuporte.substring(0, 2) != '55') && (telSuporte.length == 11)) {
      telSuporte = "55" + telSuporte;
    }
    localStorage.setItem("telSuporte", telSuporte);
  }
  if (tel.tel_mkt) {
    var tel_mkt = tel.tel_mkt.replace(/[-+_ *]/g, "");
    if ((tel_mkt.substring(0, 2) != '55') && (tel_mkt.length == 11)) {
      tel_mkt = "55" + tel_mkt;
    }
    localStorage.setItem("tel_mkt", tel_mkt);
  }
}

function corrigeBGIndex() {
  var coresCaps = {};
  coresCaps['SUPERCAP'] = "#0a3875";
  coresCaps['PROESTE'] = "#28a745";
  coresCaps['MTCAP'] = "#003666";
  coresCaps['MARACAP'] = "#DD9C14";
  coresCaps['AMAPACAP'] = "#ffce26";
  coresCaps['outras'] = "#171E26";
  var r = document.querySelector(':root');
  if (coresCaps[NomeEmpresa]) {
    r.style.setProperty('--cor_bg_splash_index', coresCaps[NomeEmpresa]);
  }
  else {
    r.style.setProperty('--cor_bg_splash_index', coresCaps['outras']);
  }
  $("#logoInicioV2").show();
}

// verifica se está rodando no APP ou na web
function runWebApp() { /**OK */
  corrigeBGIndex();
  var r = document.querySelector(':root');
  r.style.setProperty('--widthApp', $("#app").width() + "px");


  //console.log("APP:"+ parseInt($("#app").height()), "IMG:"+parseInt($("#web_app_imgcell").height()));
  if (device) {
    if (device.platform == 'WEBAPP') {
      // corrige a largura do statusbarr
      $(".navbar-bg").addClass("navbar-bgWebApp");

      // corrige a altura do app
      var imgCellH = parseInt($("#web_app_imgcell").height());
      var appH = parseInt($("#app").height());
      var bodyW = $("#body").width();
      var appW = $("#app").width();
      var imgCellDisplay = $('#web_app_imgcell').hasClass('imgcell');
      var bodyDisplay = $('#web_app_imgcell').hasClass('body_cap');
      if (appH > imgCellH) {
        // imgCellH = appH;
      }
      //console.log('imgCellDisplay ANTES', imgCellDisplay);
      //console.log('bodyDisplay ANTES', bodyDisplay);

      if (bodyW < 500) {
        // Tela smartphone ou tela pequena
        $("#web_app_imgcell").removeClass('imgcell');
        $("#app").removeClass('iframeApp-menor');
        $("#body").removeClass('body_cap');
        $("#app").removeClass('iframeApp');
        /** Remover classe que abaixa a imagem do statusbar */
        $("#view-main").removeClass('view-mainWebapp');
        // Corrige a posição do botão de menu
        $("[name='menu_btn']").removeClass("menu_btn_webapp");
      }
      else {
        // Tela grande no navegador
        $("#web_app_imgcell").addClass('imgcell');
        $("#body").addClass('body_cap');
        $("#app").addClass('iframeApp');
        /** ADD classe que abaixa a imagem do statusbar */
        $("#view-main").addClass('view-mainWebapp');
        // Corrige a posição do botão de menu
        $("[name='menu_btn']").addClass("menu_btn_webapp");


        //novas
        if (imgCellH < 894) {
          if (bodyW < 500) {
            $("#app").removeAttr("height");
          }
          else {
            $("#app").height(imgCellH + 9);
          }
          $("#app").removeClass('iframeApp-menor');
        }
        else if ((imgCellH > 893) && (imgCellH < 904)) {
          if (bodyW < 500) {
            $("#app").removeAttr("height");
          }
          else {
            $("#app").height(imgCellH + 8);
            $("#app").removeClass('iframeApp-menor');
          }
        }
        else {
          if (bodyW < 500) {
            $("#app").removeAttr("height");
          }
          else {
            $("#app").height(912);
            $("#app").addClass('iframeApp-menor');
          }
        }
        // fim novas

      }
      if (app.device.firefox) {
        //console.log('Firefox');
        $("#app").css("display", "block");
      }
      /*
      console.log('imgCellH', imgCellH);
      console.log('appH', appH);
      console.log('bodyW', bodyW);
      console.log('appW', appW);
      console.log('imgCellDisplay DEPOIS', imgCellDisplay);
      console.log('bodyDisplay DEPOIS', bodyDisplay);
      */


    }
    else {
      //$("#div_index_WEBAPP").hide();
      //$("#div_index_app").show();
      $("#web_app_imgcell").removeClass('imgcell');
      $("#body").removeClass('body_cap');
      $("#app").removeClass('iframeApp');

      /** ADD classe que abaixa a imagem do statusbar */
      $("#view-main").removeClass('view-mainWebapp');
      // Corrige a posição do botão de menu
      $("[name='menu_btn']").removeClass("menu_btn_webapp");
    }
  }
}

// Corrige tamanhdo do iFrame de video
function dimensaoIframeVideo(texto) {

  var inicioIframe = texto.indexOf("<iframe");
  //console.log(inicioIframe);
  if (inicioIframe > 0) {
    var fimIframe = texto.indexOf("</iframe>");
    var textoIframe = texto.substring(inicioIframe, fimIframe) + '</iframe>';
    var inicioSRC = textoIframe.indexOf("src");
    var linkSRC = textoIframe.substring(inicioSRC, textoIframe.length);
    var caracter = linkSRC.substr(4, 1);
    var inicioSRC = linkSRC.indexOf(caracter);
    var linkSRC = linkSRC.substring(inicioSRC + 1, inicioSRC.length);
    var finalSRC = linkSRC.indexOf(caracter);
    var linkSRC = linkSRC.substring(0, finalSRC);

    //var iFrameWidth = (app.width * 0.9);
    var iFrameWidth = ($("#app").width() * 0.9);
    var iFrameHeight = (iFrameWidth / 1.7778);

    var NovoIframe = '<iframe src="' + linkSRC + '" width="' + iFrameWidth + 'px" height="' + iFrameHeight + 'px" allowfullscreen="allowfullscreen"></iframe>';

    var inicioIframe = texto.indexOf("<iframe");
    var fimIframe = texto.indexOf("</iframe>");
    var textoFinal = texto.substring(fimIframe + 9, texto.length); // +9 = </iframe>
    var textoResultado = texto.substring(0, inicioIframe) + NovoIframe + textoFinal;
    return textoResultado;
  }
  else {
    return texto;
  }
}

// Verifica a página para colocar o STATUSBAR nas cores corretas
function alteraStatusBar() {/**OK */
  //StatusBar.show();
  $(".imgStatusBar").addClass('imgStatusBarModel1');

  if (device.platform != "WEBAPP") {
    var rota = app.views.main.router.url;
    /*if ((rota == '/index/') || (rota.substring(0, 11) == '/cadastro_p') || (rota == '/login/')) {*/
    if ((rota.substring(0, 11) == '/cadastro_p') || (rota == '/login/')) {
      // Barra de Status do aplicativo - > Define a cor de background
      StatusBar.backgroundColorByHexString(corStatusBarCadastro);
      // Barra de Status do aplicativo - > Define a cor de dos texto(hora, wifi etc)
      StatusBar.styleLightContent();
    }
    else if (rota == '/index/') {
      var coresCaps = {};
      coresCaps['SUPERCAP'] = "#0a3875";
      coresCaps['PROESTE'] = "#28a745";
      coresCaps['MTCAP'] = "#003666";
      coresCaps['MARACAP'] = "#DD9C14";
      coresCaps['AMAPACAP'] = "#ffce26";
      coresCaps['outras'] = "#171E26";
      StatusBar.backgroundColorByHexString(coresCaps[NomeEmpresa]);
      // Barra de Status do aplicativo - > Define a cor de dos texto(hora, wifi etc)
      //StatusBar.styleDefault();
      StatusBar.styleLightContent();

    }
    else {
      // Barra de Status do aplicativo - > Define a cor de background
      //StatusBar.backgroundColorByHexString("#dadada");
      StatusBar.backgroundColorByHexString(corStatusBar);
      // Barra de Status do aplicativo - > Define a cor de dos texto(hora, wifi etc)
      //StatusBar.styleDefault();
      StatusBar.styleLightContent();
    }
  }
}

// Fecha o diálogo e direciona para o link do parametro
function fechaDialogRedireciona(link) {
  //console.log(link);
  app.dialog.close();
  app.preloader.hide();
  app.views.main.router.navigate(link);
  //app.views.main.router.navigate(link.toLowerCase());
}

// MSG de erro na validação de campos
function ErroValidacao(msg, aguardar = 'N', link = '') {
  app.preloader.hide();
  app.dialog.close();
  if (aguardar == 'S') {
    //app.dialog.alert(msg, '<i class="mdi mdi-alert"></i> ops...!', function () {
    app.dialog.alert(msg, null, function () {
      app.views.main.router.navigate(link);
      //app.views.main.router.navigate(link.toLowerCase());
    });
  }
  else {
    //app.dialog.alert(msg, '<i class="mdi mdi-alert"></i> ops...!');
    app.dialog.alert(msg, null);
  }
}

// MSG de ERRO para retorno AJAX
function ErroAjaxNOVO_TESTE(respostaDecripto, msg = '', fazerLogoff = 'n') {
  if (respostaDecripto.c) {
    var respC = respostaDecripto.c;
  }
  else {
    var respC = respostaDecripto;
  }
  if (respostaDecripto.d) {
    var respD = respostaDecripto.d;
  }
  else {
    var respD = '';
  }

  app.preloader.hide();
  app.dialog.close();
  // Se tiver algum erro no Ajax que seja necessário atualizar o app, atualiza o link
  if (respC.linkAtualizacao) {
    localStorage.setItem("linkAtualizacao", respC.linkAtualizacao);
  }
  if (respD.linkAtualizacao) {
    localStorage.setItem("linkAtualizacao", respD.linkAtualizacao);
  }
  // Realiza Logoff se necessário
  if ((respC.atualizar) && (respC.atualizar == 's')) {
    atualizarapp();
    return;
  }
  if ((respD.atualizar) && (respD.atualizar == 's')) {
    atualizarapp();
    return;
  }
  // Realiza Logoff se necessário
  if ((respC.logoff) && (respC.logoff == 's')) {
    logoff();
    //return;
  }
  else if ((respD.logoff) && (respD.logoff == 's')) {
    logoff();
    //return;
  }
  else if (fazerLogoff == 's') {
    logoff();
    ///return;
  }

  // Direciona se necessário // Item somente Criptografado
  if (respC.navigate) {
    app.views.main.router.navigate('/' + respC.navigate.toLowerCase() + '/');
  }
  // Direciona se necessário // Item somente Criptografado
  if ((respC == 'error') && (msg == 'conexao/servidor')) {
    app.dialog.alert('Falha ao comunicar com o servidor. Verifique sua internet e tente novamente!', null);
  }
  else if (msg != '') { // Mensagem informada ou Ajax ERROR
    app.dialog.alert(msg, null);
  }
  else if (respC.msg_usu) { // Mensagem ao usuário
    app.dialog.alert(respC.msg_usu, null);
  }
  else { // Mensagem padrao
    app.dialog.alert('Por favor, tente novamente', null);
  }
}

// MSG de ERRO para retorno AJAX
function ErroAjax(resposta, msg = '', fazerLogoff = 'n') {

  app.preloader.hide();
  app.dialog.close();
  // Se tiver algum erro no Ajax que seja necessário atualizar o app, atualiza o link
  if (resposta.linkAtualizacao) {
    //console.log('atualizou');
    localStorage.setItem("linkAtualizacao", resposta.linkAtualizacao);
  }
  // Realiza Logoff se necessário
  if ((resposta.atualizar == 's')) {
    //console.log('fazerLogoff:s');
    atualizarapp();
  }
  // Realiza Logoff se necessário
  else if ((resposta.logoff == 's') || (fazerLogoff == 's')) {
    //console.log('fazerLogoff:s');
    logoff();
  }
  // Direciona se necessário
  if (resposta.navigate) {
    app.views.main.router.navigate('/' + resposta.navigate.toLowerCase() + '/');
  }
  if ((resposta == 'error') && (msg == 'conexao/servidor')) {
  console.log(resposta);
    app.dialog.alert('Falha ao comunicar com o servidor. Verifique sua internet e tente novamente!', null);
  }
  else if (msg != '') { // Mensagem informada ou Ajax ERROR
    //console.log('msg:informada');
    //app.dialog.alert(msg, '<i class="mdi mdi-alert"></i> ops...!');
    app.dialog.alert(msg, null, function () {
      //console.log(resposta);
    });
  }
  else if (resposta.msg_usu) { // Mensagem ao usuário
    //console.log('msg:informada 2');
    if ((resposta.atualizar != 's')) {
      //app.dialog.alert(resposta.msg_usu, '<i class="mdi mdi-alert"></i> ops...!');
      app.dialog.alert(resposta.msg_usu, null, function () {
        //console.log(resposta);
      });
    }
  }
  else { // Mensagem padrao

    //console.log('msg:padrao');
    //app.dialog.alert('Por favor, tente novamente', '<i class="mdi mdi-alert"></i> ops...!');
    app.dialog.alert('Por favor, tente novamente', null, function () {
      //console.log(resposta);
    });

  }

}

// Mostrar se já comprou algum título esta semana
function badgeCompraSemana(id) {
  // Mostrar se já comprou algum título esta semana
  // na estrutura de paginas criada, um elemento ID nao pode ser igual da outra
  // quando há transição entre essas 2 paginas.
  // portanto foi criado um id badge para cada pagina
  if (localStorage.getItem("comprasSorteioVigenteMulti")) {
    var compras = JSON.parse(localStorage.getItem("comprasSorteioVigenteMulti"));
    var qtd = compras.qtdTotal;
    if (qtd > 0) {
      $("#" + id).text(qtd);
      $("#" + id).show();
    }
    else {
      $("#" + id).text('');
      $("#" + id).hide();
    }
  }
  else {
    $("#" + id).text('');
    $("#" + id).hide();
  }
}

// Mostrar se ele deixou algum título no carrinho
function badgeCarrinhoEmAberto(id) {

  // na estrutura de paginas criada, um elemento ID nao pode ser igual da outra
  // quando há transição entre essas 2 paginas.
  // portanto foi criado um id badge para cada pagina
  qtdTitulos = 0;
  if (localStorage.getItem("dadosUsuario")) {
    if (localStorage.getItem("carrinhoMulti")) {
      if (localStorage.getItem("carrinhoMulti") != 'undefined') {
        var carrinhoMulti = JSON.parse(localStorage.getItem("carrinhoMulti"));
        var qtdTitulos = parseInt(carrinhoMulti.totalCarrinho);
      }
      if (qtdTitulos > 0) {
        $("#" + id).text(qtdTitulos);
        $("#" + id).show();
      }
      else {
        $("#" + id).text('');
        $("#" + id).hide();
      }
    }
  }
  else {
    $("#" + id).text('');
    $("#" + id).hide();
  }
}

//Calculo de nova data JS
function novaDataJS(dataStr, padrao) {
  //console.log(dataStr.toString());
  if (padrao == 'yyyy-mm-dd hh:mm:ss') {/*correcao */
    var dataCompleta = dataStr.split(' ')[0];
    var horaCompleta = dataStr.split(' ')[1];
    var dia = dataCompleta.split('-')[2];
    var mes = dataCompleta.split('-')[1];
    var ano = dataCompleta.split('-')[0];
    var hora = horaCompleta.split(':')[0];
    var min = horaCompleta.split(':')[1];
    var seg = horaCompleta.split(':')[2];
    return new Date(ano, mes - 1, dia, hora, min, seg);
  }
  else if (padrao == 'yyyy-mm-dd') {/*correcao */
    var dataCompleta = dataStr.split(' ')[0];
    var horaCompleta = dataStr.split(' ')[1];
    var dia = dataCompleta.split('-')[2];
    var mes = dataCompleta.split('-')[1];
    var ano = dataCompleta.split('-')[0];
    var hora = "00";
    var min = "00";
    var seg = "00";
    return new Date(ano, mes - 1, dia, hora, min, seg);
  }


  //var date = new  Date(str.split('/').reverse().join('/'));
  //var newDate = myString.replace(/(\d{4})-(\d{2})-(\d{ 2 }) /, '$3.$2.$1');
}

function dataParaTexto(data, novoFormato) {
  var hora = "";
  var retorno = "";
  var tipoData = "";
  var dia, mes, ano;
  if (data.indexOf(" ") > 0) {
    data = data.split(' ')[0];
    hora = data.split(' ')[1];
  }
  if (data.indexOf("/") > 0) {
    if (data.split('/')[2].length == 4) {
      tipoData = "dd/mm/aaaa";
      dia = data.split('/')[0];
      mes = data.split('/')[1];
      ano = data.split('/')[2];

    }
    else if (data.split('/')[0].length == 4) {
      tipoData = "aaaa/mm/dd";
      dia = data.split('/')[2];
      mes = data.split('/')[1];
      ano = data.split('/')[0];
    }
  }
  else if (data.indexOf("-") > 0) {
    var caracter = "-";
    if (data.split('-')[2].length == 4) {
      tipoData = "dd/mm/aaaa";
      dia = data.split('-')[0];
      mes = data.split('-')[1];
      ano = data.split('-')[2];
    }
    else if (data.split('-')[0].length == 4) {
      tipoData = "aaaa/mm/dd";
      dia = data.split('-')[2];
      mes = data.split('-')[1];
      ano = data.split('-')[0];
    }
  }
  if (novoFormato == "aaaa/mm/dd") {
    retorno = ano + "/" + mes + "/" + dia;
  }
  else if (novoFormato == "dd/mm/aaaa") {
    retorno = dia + "/" + mes + "/" + ano;
  }
  else if (novoFormato == "aaaa-mm-dd") {
    retorno = ano + "-" + mes + "-" + dia;
  }
  else if (novoFormato == "dd-mm-aaaa") {
    retorno = dia + "-" + mes + "-" + ano;
  }
  else if (novoFormato == "dd/mm") {
    retorno = dia + "/" + mes;
  }
  else if (novoFormato == "dd/mm/aa") {
    retorno = dia + "/" + mes + "/" + ano.substr(ano.length - 2);
  }
  if (hora != "") {
    retorno = retorno + " " + hora;
  }
  return retorno;
}

//EFETUA LOGOFF DA APLICAÇÂO
function logoff(fecharDialog = 'n') {
  setTimeout(function () {
    var rota = app.views.main.router.url;
    var cpf = localStorage.getItem("cpf");

    if (localStorage.getItem("telSuporte")) { var telSuporte = localStorage.getItem("telSuporte"); }
    if (localStorage.getItem("tel_mkt")) { var tel_mkt = localStorage.getItem("tel_mkt"); }
    if (localStorage.getItem("linkAtualizacao")) { var linkAtualizacao = localStorage.getItem("linkAtualizacao"); }

    localStorage.clear();

    if (linkAtualizacao) { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
    if (telSuporte) { localStorage.setItem("telSuporte", telSuporte); }
    if (tel_mkt) { localStorage.setItem("tel_mkt", tel_mkt); }

    localStorage.setItem("cpf", cpf);
    localStorage.setItem("user_login", cpf);
    localStorage.setItem("conexao", "online"); // Online, visto que irá voltar ao LOGIN.
    localStorage.setItem("device", JSON.stringify(device));
    localStorage.setItem("PrimAcesso", "Y");

    setTimeout(function () {
      window.location.reload();
      //app.views.main.router.navigate("/index/");
    }, 200);

    if (fecharDialog == 's') {
      setTimeout(function () {
        app.preloader.hide();
        app.dialog.close();
      }, 500);
    }

  }, 500);

}

function atualizarapp() {
  if (device.platform != "WEBAPP") {
    if (localStorage.getItem("linkAtualizacao")) {
      var link = localStorage.getItem("linkAtualizacao");
    }
    else {
      var link = website;
    }
    var cpf = localStorage.getItem("cpf");

    if (localStorage.getItem("telSuporte")) { var telSuporte = localStorage.getItem("telSuporte"); }
    if (localStorage.getItem("tel_mkt")) { var tel_mkt = localStorage.getItem("tel_mkt"); }
    if (localStorage.getItem("linkAtualizacao")) { var linkAtualizacao = localStorage.getItem("linkAtualizacao"); }

    localStorage.clear();

    if (linkAtualizacao) { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
    if (telSuporte) { localStorage.setItem("telSuporte", telSuporte); }
    if (tel_mkt) { localStorage.setItem("tel_mkt", tel_mkt); }

    localStorage.setItem("cpf", cpf);
    localStorage.setItem("user_login", cpf);
    localStorage.setItem("conexao", "online"); // Online, visto que irá voltar ao LOGIN.
    localStorage.setItem("device", JSON.stringify(device));
    localStorage.setItem("PrimAcesso", "Y");
    setTimeout(function () {
      //app.dialog.alert('Seu APP está desatualizado! Clique em OK para atualizar!', 'Atenção', function () {
      app.dialog.alert('Seu APP está desatualizado! Clique em OK para atualizar!', null, function () {
        logoff();
        //window.open('http://onelink.to/tnc7w2', '_system');
        window.open(link, '_system');
      });
    }, 1000);
  }
  else {
    //console.log(device.platform);
    //app.dialog.alert('Aguarde um instante, estamos atualizando este aplicativo!', '<i class="mdi mdi-alert"></i> ops...!');
    app.dialog.alert('Aguarde um instante, estamos atualizando este aplicativo!', null);
  }
}

// CONVERTE O NUMERO/TEXTO PARA MOEDA
function converterParaMoeda(valor, tipoRetorno, formatoOrigem = 'US') {
  if (tipoRetorno == "texto") {
    var novoValor = valor.toLocaleString('pt-BR',
      { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var str = novoValor.toString();
    return str.replace(".", ",");
  }
  else if (tipoRetorno == "numeroStringBR") {
    var novoValor = valor.toLocaleString('pt-BR',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var str = novoValor.toString();
    return str.replace(".", ",");
  }
  else if (tipoRetorno == "numeroBR") {
    var novoValor = valor.toLocaleString('pt-BR',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return parseFloat(novoValor);
  }
  else if (tipoRetorno == "numeroUS") {
    if (typeof (valor) == 'string') {
      if (formatoOrigem == 'US') {
        valor = parseFloat(valor);
      }
      else {
        valor = valor.replace(".", "¬");
        valor = valor.replace(",", ".");
        valor = valor.replace("¬", ",");
        valor = parseFloat(valor);
      }
    }
    var novoValor = parseFloat(valor.toLocaleString('en-IN',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    return novoValor;
  }
  else {
    return false;
  }
}

// VERIFICA SE È UM JSON (pouco usado)
function verificaJSON(str) {
  try {
    var json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}

// VERIFICA CONEXAO
function verificaConexao() {
  var networkState = navigator.connection.type;
  var states = {};
  states[Connection.UNKNOWN] = 'Unknown';
  states[Connection.ETHERNET] = 'Ethernet';
  states[Connection.WIFI] = 'WiFi';
  states[Connection.CELL_2G] = '2G';
  states[Connection.CELL_3G] = '3G';
  states[Connection.CELL_4G] = '4G';
  states[Connection.CELL] = 'Cell generic';
  states[Connection.NONE] = 'no internet';

  if ((states[networkState] == "no internet") || (states[networkState] == "Unknown")) {
    //SEM INTERNET
    localStorage.setItem("conexao", "offline");
  }
  else {
    localStorage.setItem("conexao", "online");
  }
  return states[networkState];
}

// VERIFICA DEVICE/DISPOSITIVO DO USUARIO
function infoDevice() {
  var obj = new Object();
  obj.model = device.model;
  obj.platform = device.platform;
  obj.uuid = device.uuid;
  obj.version = device.version;
  obj.manufacturer = device.manufacturer;
  obj.isVirtual = device.isVirtual;
  obj.serial = device.serial;
  //localStorage.setItem("device", JSON.stringify(obj));
  return JSON.stringify(obj);
}

// SE OFFLINE< APRESENTA UMA FAIXA VERMELHA
function FaixaConexao() {
  var conexao = localStorage.getItem("conexao");
  if (conexao == 'offline') {
    $('#FaixaOffline').show();
  }
  else {
    $('#FaixaOffline').hide();
  }
}

// VALIDACAO DE CAMPO TIPO TELEFONE
function validaPhone(phone) {
  const newPhone = phone.replace(/\D/gim, "");
  const regex = new RegExp('^((1[1-9])|([2-9][0-9]))((3[0-9]{3}[0-9]{4})|(9[0-9]{3}[0-9]{5}))$')
  return regex.test(newPhone);
}

// VALIDACAO DE CAMPO SENHA/SEGURA - nao utilizado nesta versao
function verificaSenhaSegura(user_pass) {
  let regex = /^(?=.*[@!#$%^&*()/\\])(?=.*[0-9])(?=.*[a-zA-Z])[@!#$%^&*()/\\a-zA-Z0-9]{8,30}$/;
  // tem pelo menos um caractere especial, uma letra e um número e 8 digitos
  if (regex.test(user_pass)) {
    // verifica minusculo
    if (user_pass.match(/[a-z]+/)) {
      // verifica maiusculo     
      if (user_pass.match(/[A-Z]+/)) {
        // senha menor que 30 caracteres
        if (user_pass.length < 31) {
          return true
        }
        else {
          return false
        }
      }
      else {
        return false;
      }
    } else {
      return false;
    }
  }
  else {
    return false;
  }
}

// VALIDACAO DE SENHA COM TOAST - nao utilizado nesta versao
function ToastSenha() {
  // Create toast with icon
  var text = 'A senha deve conter no mínimo: </br>8 Dígitos</br>1 Maiúsculo</br>1 Minúsculo</br>1 Caracter Especial';
  var toastIcon = app.toast.create({
    //icon: "<img src='img/logov1.png' style='max-width: 15px;max-height: 15px;'>",
    icon: app.theme === 'ios' ? '<i   style="max-width: 44px;max-height: 44px;"class="f7-icons">star</i>' : '<i   style="max-width: 44px;max-height: 44px;" class="mdi mdi-shield-key"></i>',
    text: text,
    position: 'center',
    closeTimeout: 4000,
  });
  toastIcon.open();
}

// VALIDACAO DE CAMPO TIPO DATA
function validaDataNascimento(valor) {
  var data = valor;
  var dtarray = new Array;
  if (data.indexOf("-") == -1) {
    if (data.indexOf("/") == -1) {
      return false;
    }
    else {
      dtarray = data.split("/");
    }
  }
  else {
    dtarray = data.split("-");
  }
  if (dtarray.length > 1) {
    erro = false;
    var dia = parseInt(dtarray[2]);
    var mes = parseInt(dtarray[1]);
    var ano = parseInt(dtarray[0]);
    // Verifica meses com 31 dias
    if (((mes == 4) || (mes == 6) || (mes == 9) || (mes == 11)) && (dia > 30)) {
      erro = true;
    }
    else if (mes == 2) {
      // Verifica se o ano é bissexto
      if (dia > 29) { erro = true; }
      if ((dia > 28) && ((ano % 4) != 0)) { erro = true; }
    }
    //Verifica se o Ano cadastrado é maior que o ano atual ou menor que 1900
    var hoje = new Date();
    var hojeAno = hoje.getFullYear();
    if ((ano > hojeAno) || (ano < 1900)) { erro = true; }
    if (erro) { return false; }
    else { return true; } // atende aos pre requistos
  }
  else { return false; }
}

// VALIDACAO DE CAMPO TIPO EMAIL
function validaEmail(email) {
  let regex1 = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  let regex2 = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/g;
  let teste1 = regex1.test(email);
  let teste2 = regex2.test(email);

  if ((teste1) || (teste2)) {
    return true;
  }
  else {
    return false;
  }
}

// VALIDACAO DE CAMPO TIPO CPF OU CNPJP
function validaCpfCnpj(val) {
  if (val.length == 14) {
    var cpf = val.trim();

    cpf = cpf.replace(/\./g, '');
    cpf = cpf.replace('-', '');
    cpf = cpf.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cpf.length > i; i++) {
      if (cpf[i - 1] != cpf[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
      v1 += cpf[i] * p;
    }

    v1 = ((v1 * 10) % 11);

    if (v1 == 10) {
      v1 = 0;
    }

    if (v1 != cpf[9]) {
      return false;
    }

    for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
      v2 += cpf[i] * p;
    }

    v2 = ((v2 * 10) % 11);

    if (v2 == 10) {
      v2 = 0;
    }

    if (v2 != cpf[10]) {
      return false;
    } else {
      return true;
    }
  } else if (val.length == 18) {
    var cnpj = val.trim();

    cnpj = cnpj.replace(/\./g, '');
    cnpj = cnpj.replace('-', '');
    cnpj = cnpj.replace('/', '');
    cnpj = cnpj.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cnpj.length > i; i++) {
      if (cnpj[i - 1] != cnpj[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v1 += cnpj[i] * p1;
      } else {
        v1 += cnpj[i] * p2;
      }
    }

    v1 = (v1 % 11);

    if (v1 < 2) {
      v1 = 0;
    } else {
      v1 = (11 - v1);
    }

    if (v1 != cnpj[12]) {
      return false;
    }

    for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v2 += cnpj[i] * p1;
      } else {
        v2 += cnpj[i] * p2;
      }
    }

    v2 = (v2 % 11);

    if (v2 < 2) {
      v2 = 0;
    } else {
      v2 = (11 - v2);
    }

    if (v2 != cnpj[13]) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

// OBTÈM OS DADOS DE USUARIO/SORTEIO/BANNER 
function getDadosAtualizados(user_login, atCarrinho, atBanner = 'N') {
  var ktmp = Date.now();
  if (UserOneSignal) {
    //Arruma o Array Onesignal
    UserOneSignal = corrigeArrayOneSignal(UserOneSignal);
    // Retira o token
    var PushToken = 'null';
    if (UserOneSignal.pushToken) {
      // string longa, reitrada para nao criptografar
      PushToken = UserOneSignal.pushToken;
      delete UserOneSignal.pushToken;
    }
  }
  else {
    UserOneSignal = 'null';
    var tags = "null";
  }
  var dataC = {
    user_login: user_login,
    atualizarCarrinho: atCarrinho,
    atualizarBanner: atBanner,
    os: UserOneSignal
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
    tags: UserOneSignalTAGS,
    pt: PushToken
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);
  app.request({
    url: servidor + '/api_public/informacoes/get_informacoes.php',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
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
      if (respMerge.status == "ok") {
        armazenaLocalStorageFromAPI(respMerge, atBanner);
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor', 's');
    },
    complete: function () { }
  });
}

// Seta as variáveis LOCALSTORAGE vindas das API GET INFORMACOES / LOGIN
function armazenaLocalStorageFromAPI(resposta, atBanner = 'N', variavel = null) {

  if (variavel == 'dados') {
    resposta = resposta.dados;
  }

  if (resposta.dadosUsuario) {
    //console.log('usuario ok');
    localStorage.setItem("dadosUsuario", JSON.stringify(resposta.dadosUsuario));
    identificaUsuarioRestrito();
    if (OneSignalAtivo == 's') {
      if (device.platform != 'WEBAPP') {
        try { // Atualiza Nome e Localidade/Cidade
          var PrimNome = resposta.dadosUsuario.name.split(" ")[0];
          if (!PrimNome) { PrimNome = ''; }
          var localidade = resposta.dadosUsuario.localidade;
          if (!localidade) { localidade = ''; }
          window.plugins.OneSignal.sendTags({ first_name: PrimNome, region: localidade });
        } catch (e) {/*console.log(e);*/ }

        try {// Atualiza o GUID USUARIO/ guid sec user
          var usuGUID = resposta.dadosUsuario.guid_sec_users;
          if (usuGUID) { window.plugins.OneSignal.setExternalUserId(usuGUID); }
        } catch (e) {/*console.log(e);*/ }

        try {// atualiza o telefone não utilizado
          var usuTelefone = resposta.dadosUsuario.telefone;
          // if (usuTelefone) { window.plugins.OneSignal.setSMSNumber("+55" + usuTelefone); }
        } catch (e) {/*console.log(e);*/ }

        try {//Atualiza Email
          var usuEmail = resposta.dadosUsuario.user_email;
          //console.log(usuEmail);
          //if (usuEmail) { window.plugins.OneSignal.setEmail(usuEmail); console.log('EXE usuEmail'); }
        } catch (e) { /*console.log(e);*/ }

      }
    }
  }
  //console.log(resposta);
  if (resposta.o) {
    pgb = (resposta.o.pgb == "") ? pgb : resposta.o.pgb; // boleto
    pgc = (resposta.o.pgc == "") ? pgc : resposta.o.pgc; // credito
    pgp = (resposta.o.pgp == "") ? pgp : resposta.o.pgp; // pix
    //console.log(resposta.o.occ);
    tipoCofre = (resposta.o.occ == "") ? tipoCofre : resposta.o.occ;
  }

  if (resposta.todosSorteios) {
    localStorage.setItem("todosSorteios", JSON.stringify(resposta.todosSorteios));
  }

  if (resposta.comprasSorteioVigenteMulti) {
    localStorage.setItem("comprasSorteioVigenteMulti", JSON.stringify(resposta.comprasSorteioVigenteMulti));
  }

  if (resposta.carrinhoMulti) {
    atualizaCarrinhoMulti(resposta.carrinhoMulti);
  }
  else {
    localStorage.setItem("carrinhoMulti", "");
  }
  /*
  if (resposta.dadosCarrinho) {
    localStorage.setItem("dadosCarrinho", JSON.stringify(resposta.dadosCarrinho));
  }
  else {
    localStorage.setItem("dadosCarrinho", "");
  }
*/
  if (resposta.linkDownloadPdf) {
    localStorage.setItem("linkDownloadPdf", JSON.stringify(resposta.linkDownloadPdf).replace(/["]/g, ""));
  }

  if (resposta.popUp) {
    localStorage.setItem("popUp", JSON.stringify(resposta.popUp));
  }

  if (resposta.cpk) {
    localStorage.setItem("cpk", JSON.stringify(resposta.cpk));
  }

  if (resposta.dadosCapitalizadora) {
    localStorage.setItem("dadosCapitalizadora", JSON.stringify(resposta.dadosCapitalizadora));
  }
  /*
    if (atBanner == 'S') {
      if (!resposta.banners) {
        localStorage.setItem("SorteioBloqueado", 'true');
        localStorage.setItem("banners", '');
      }
      else {
        localStorage.setItem("banners", JSON.stringify(resposta.banners));
        localStorage.setItem("SorteioBloqueado", 'false');
      }
    }
    */
  if (resposta.telSuporte) {
    corrigeTelWhatsapp(resposta.telSuporte);
  }

  if (resposta.linkAtualizacao) {
    localStorage.setItem("linkAtualizacao", resposta.linkAtualizacao);
  }

  if (resposta.labelSorteios) {
    var novoLabelSorteios = resposta.labelSorteios;
    var abrSorteios = [];
    abrSorteios['sorteios'] = 's';
    abrSorteios['sorteios_semanal'] = 'sm';
    abrSorteios['sorteios_extra'] = 'se';

    var tipo_sorteio = [];
    tipo_sorteio['1'] = 'SIMPLES CHANCE ';
    tipo_sorteio['2'] = 'DUPLA CHANCE';
    tipo_sorteio['3'] = 'TRIPLA CHANCE';

    if (resposta.todosSorteios) {
      $.each(resposta.todosSorteios, function (nomeSorteio, dadosSorteio) {
        if ((novoLabelSorteios['label1_' + abrSorteios[nomeSorteio]] == null) || (novoLabelSorteios['label1_' + abrSorteios[nomeSorteio]] == "")) {
          if ((dadosSorteio.dados) && (dadosSorteio.dados.tipo_sorteio)) {
            novoLabelSorteios['label1_' + abrSorteios[nomeSorteio]] = tipo_sorteio[dadosSorteio.dados.tipo_sorteio];
          }
        }
        if ((novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]] == null) || (novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]] == "")) {
          if ((dadosSorteio.dados) && (dadosSorteio.dados.data)) {
            var novaDataArray = dadosSorteio.dados.data.split('-');
            novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]] = "<br>" + novaDataArray[2] + "/" + novaDataArray[1];
          }
        }
        else if ((novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]].substring(0, 4) != "<br>") && (novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]].substring(0, 5) != "<\br>")) {
          novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]] = "<br>" + novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]];
        }
        else {
          //console.log('else');
          //console.log(novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]].substring(0, 4));
          //console.log(novoLabelSorteios['label2_' + abrSorteios[nomeSorteio]].substring(0, 5));
        }
      });
      localStorage.setItem("labelSorteios", JSON.stringify(novoLabelSorteios));
    }
    else {
      localStorage.setItem("labelSorteios", JSON.stringify(resposta.labelSorteios));
    }
  }
  else {
    if (!localStorage.getItem("labelSorteios")) {
      var labelVazio = '{"label1_s":"PRODUTO 1","label2_s":"","label1_sm":"PRODUTO 2","label2_sm":"","label1_se":"PRODUTO 3","label2_se":""}';
      localStorage.setItem("labelSorteios", labelVazio);
    }
  }




  return "fim";
}

function atualizaCarrinhoMulti(carrinho) {
  localStorage.setItem("carrinhoMulti", JSON.stringify(carrinho));
}

// VALIDA SE SORTEIO ESTÀ DIPONÍVEL
function SorteioDisponivel() {
  //console.log('SorteioDisponivel');
  if (localStorage.getItem("todosSorteios")) {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    if ((todosSorteios.totalSorteiosAbertos == 0) || (todosSorteios.totalSorteiosAbertos == '0')) {
      app.dialog.alert('Aguarde o próximo sorteio, logo estará disponível!', null, function () {
        app.views.main.router.navigate("/home/", { transition: 'f7-flip' });
      });
    }
  }
  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
  if (dadosUsuario.cep_ativo != 'S') {
    ErroValidacao('Desculpe, produto ainda não disponível em sua região !', aguardar = 'S', link = '/home/');
  }
}

// RETIRAR CARACTER ESPECIAL
function retirarEspecialChar(texto) {
  /*
    const replaceSpecialChars = (str) => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/([^\w]+|\s+)/g, '-') // Substitui espaço e outros caracteres por hífen
        .replace(/\-\-+/g, '-')	// Substitui multiplos hífens por um único hífen
        .replace(/(^-+|-+$)/, ''); // Remove hífens extras do final ou do inicio da string
    }
    */
  texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos

  /*
   texto = texto.replace(/[&\/\\#,+()$~%.'":*!@_?;-<>{}]/g, '');
   texto = texto.replace('¨', '');
   texto = texto.replace('-', '');
   texto = texto.replace('=', '');
   texto = texto.replace('[', '');
   texto = texto.replace(']', '');
   texto = texto.replace('¬', '');
   texto = texto.replace('|', '');
   texto = texto.replace('`', '');
   texto = texto.replace('´', '');
 
   texto = texto.replace('/', '');
   texto = texto.replace('"', '');
   texto = texto.replace("'", '');
   var naoPode = "@#$_&-+()*:;!?~`|•√π÷×¶∆£¢€¥^°={}\%©®™✓[]<<<«≤‹⟨⟩»≥›´`|¬[]=-¨";
   var qtd = naoPode.length;
   //console.log(qtd);
   while (qtd--) {
     //console.log(naoPode[qtd]);
     texto = texto.replace(naoPode[qtd], '');
   }
   */
  return texto;
}

// Carrinho
function verBandeiraCartaoJS(array) {
  var retornoBandeira = "";
  $.each(array, function (id, classe) {
    if (classe == 'jp-card-elo') { retornoBandeira = "elo"; }
    if (classe == 'jp-card-visa') { retornoBandeira = "visa"; }
    if (classe == 'jp-card-visaelectron') { retornoBandeira = "visa"; }

    if (classe == 'jp-card-mastercard') { retornoBandeira = "mastercard"; }
    if (classe == 'jp-card-maestro') { retornoBandeira = "mastercard"; }

    if (classe == 'jp-card-amex') { retornoBandeira = "amex"; }
    if (classe == 'jp-card-dinersclub') { retornoBandeira = "diners"; }
    if (classe == 'jp-card-hipercard') { retornoBandeira = "hipercard"; }

    if (classe == 'jp-card-dankort') { retornoBandeira = ""; }
    if (classe == 'jp-card-unionpay') { retornoBandeira = ""; }
    if (classe == 'jp-card-troy') { retornoBandeira = ""; }
    if (classe == 'jp-card-jcb') { retornoBandeira = ""; }
    if (classe == 'jp-card-discover') { retornoBandeira = ""; }
  });
  return retornoBandeira;
}

function verBandeiraCartao(number) {
  //console.log('VER BANDEIRA Number', number);
  // visa
  var re = new RegExp("^4");
  if (number.match(re) != null)
    return "Visa";

  // Mastercard 
  // Updated for Mastercard 2017 BINs expansion
  if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number))
    return "Mastercard";

  // AMEX
  re = new RegExp("^3[47]");
  if (number.match(re) != null)
    return "AMEX";

  // Discover
  re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
  if (number.match(re) != null)
    return "Discover";

  // Diners
  re = new RegExp("^36");
  if (number.match(re) != null)
    return "Diners";

  // Diners - Carte Blanche
  re = new RegExp("^30[0-5]");
  if (number.match(re) != null)
    return "Diners - Carte Blanche";

  // JCB
  re = new RegExp("^35(2[89]|[3-8][0-9])");
  if (number.match(re) != null)
    return "JCB";

  // Visa Electron
  re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
  if (number.match(re) != null)
    return "Visa Electron";

  return "Não Localizada";
}

function verBandeiraCartaoGerenciaNet(number) {
  //console.log('verBandeiraCartaoGerenciaNet',number);
  let other = '<svg id="ccicon" class="ccicon" viewBox="0 60 500 400" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path style="fill:#6ABDA0;" d="M476.69,441.379H35.31c-19.5,0-35.31-15.81-35.31-35.31V105.931c0-19.5,15.81-35.31,35.31-35.31   H476.69c19.5,0,35.31,15.81,35.31,35.31v300.138C512,425.569,496.19,441.379,476.69,441.379"></path><polygon style="fill:#488578;" points="0,194.207 512,194.207 512,123.586 0,123.586  "></polygon><polygon style="fill:#F0C419;" points="300.138,388.414 459.034,388.414 459.034,300.138 300.138,300.138  "></polygon><g><path style="fill:#488578;" d="M123.483,264.828H44.141c-4.882,0-8.828-3.946-8.828-8.828s3.946-8.828,8.828-8.828h79.342    c4.882,0,8.828,3.946,8.828,8.828S128.365,264.828,123.483,264.828"></path><path style="fill:#488578;" d="M238.345,264.828h-79.342c-4.882,0-8.828-3.946-8.828-8.828s3.946-8.828,8.828-8.828h79.342    c4.882,0,8.828,3.946,8.828,8.828S243.226,264.828,238.345,264.828"></path>		<path style="fill:#488578;" d="M176.552,300.138H44.138c-4.882,0-8.828-3.946-8.828-8.828s3.946-8.828,8.828-8.828h132.414    c4.882,0,8.828,3.946,8.828,8.828S181.433,300.138,176.552,300.138"></path>		<path style="fill:#488578;" d="M238.345,300.138h-26.483c-4.882,0-8.828-3.946-8.828-8.828s3.946-8.828,8.828-8.828h26.483    c4.882,0,8.828,3.946,8.828,8.828S243.226,300.138,238.345,300.138"></path></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';
  let visa = `<svg id="ccicon" class="ccicon" width="750" height="471" viewBox="0 0 750 471" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="visa" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#0E4595" x="0" y="0" width="750" height="471" rx="40"></rect> <polygon id="Shape" fill="#FFFFFF" points="278.1975 334.2275 311.5585 138.4655 364.9175 138.4655 331.5335 334.2275"></polygon> <path d="M524.3075,142.6875 C513.7355,138.7215 497.1715,134.4655 476.4845,134.4655 C423.7605,134.4655 386.6205,161.0165 386.3045,199.0695 C386.0075,227.1985 412.8185,242.8905 433.0585,252.2545 C453.8275,261.8495 460.8105,267.9695 460.7115,276.5375 C460.5795,289.6595 444.1255,295.6545 428.7885,295.6545 C407.4315,295.6545 396.0855,292.6875 378.5625,285.3785 L371.6865,282.2665 L364.1975,326.0905 C376.6605,331.5545 399.7065,336.2895 423.6355,336.5345 C479.7245,336.5345 516.1365,310.2875 516.5505,269.6525 C516.7515,247.3835 502.5355,230.4355 471.7515,216.4645 C453.1005,207.4085 441.6785,201.3655 441.7995,192.1955 C441.7995,184.0585 451.4675,175.3575 472.3565,175.3575 C489.8055,175.0865 502.4445,178.8915 512.2925,182.8575 L517.0745,185.1165 L524.3075,142.6875" id="path13" fill="#FFFFFF"></path> <path d="M661.6145,138.4655 L620.3835,138.4655 C607.6105,138.4655 598.0525,141.9515 592.4425,154.6995 L513.1975,334.1025 L569.2285,334.1025 C569.2285,334.1025 578.3905,309.9805 580.4625,304.6845 C586.5855,304.6845 641.0165,304.7685 648.7985,304.7685 C650.3945,311.6215 655.2905,334.1025 655.2905,334.1025 L704.8025,334.1025 L661.6145,138.4655 Z M596.1975,264.8725 C600.6105,253.5935 617.4565,210.1495 617.4565,210.1495 C617.1415,210.6705 621.8365,198.8155 624.5315,191.4655 L628.1385,208.3435 C628.1385,208.3435 638.3555,255.0725 640.4905,264.8715 L596.1975,264.8715 L596.1975,264.8725 Z" id="Path" fill="#FFFFFF"></path> <path d="M232.9025,138.4655 L180.6625,271.9605 L175.0965,244.8315 C165.3715,213.5575 135.0715,179.6755 101.1975,162.7125 L148.9645,333.9155 L205.4195,333.8505 L289.4235,138.4655 L232.9025,138.4655" id="path16" fill="#FFFFFF"></path> <path d="M131.9195,138.4655 L45.8785,138.4655 L45.1975,142.5385 C112.1365,158.7425 156.4295,197.9015 174.8155,244.9525 L156.1065,154.9925 C152.8765,142.5965 143.5085,138.8975 131.9195,138.4655" id="path18" fill="#F2AE14"></path> </g> </g></svg>`;
  let mastercard = `<svg id="ccicon" class="ccicon" width="750" height="471" viewBox="0 0 750 471" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="mastercard" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#000000" x="0" y="0" width="750" height="471" rx="40"></rect> <g id="Group" transform="translate(133.000000, 48.000000)"> <path d="M88.13,373.67 L88.13,348.82 C88.13,339.29 82.33,333.08 72.81,333.08 C67.81,333.08 62.46,334.74 58.73,340.08 C55.83,335.52 51.73,333.08 45.48,333.08 C40.7599149,332.876008 36.2525337,335.054575 33.48,338.88 L33.48,333.88 L25.61,333.88 L25.61,373.64 L33.48,373.64 L33.48,350.89 C33.48,343.89 37.62,340.54 43.42,340.54 C49.22,340.54 52.53,344.27 52.53,350.89 L52.53,373.67 L60.4,373.67 L60.4,350.89 C60.4,343.89 64.54,340.54 70.34,340.54 C76.14,340.54 79.45,344.27 79.45,350.89 L79.45,373.67 L88.13,373.67 Z M217.35,334.32 L202.85,334.32 L202.85,322.32 L195,322.32 L195,334.32 L186.72,334.32 L186.72,341.32 L195,341.32 L195,360 C195,369.11 198.31,374.5 208.25,374.5 C212.015784,374.421483 215.705651,373.426077 219,371.6 L216.51,364.6 C214.275685,365.996557 211.684475,366.715565 209.05,366.67 C204.91,366.67 202.84,364.18 202.84,360.04 L202.84,341 L217.34,341 L217.34,334.37 L217.35,334.32 Z M291.07,333.08 C286.709355,332.982846 282.618836,335.185726 280.3,338.88 L280.3,333.88 L272.43,333.88 L272.43,373.64 L280.3,373.64 L280.3,351.31 C280.3,344.68 283.61,340.54 289,340.54 C290.818809,340.613783 292.62352,340.892205 294.38,341.37 L296.87,333.91 C294.971013,333.43126 293.02704,333.153071 291.07,333.08 Z M179.66,337.22 C175.52,334.32 169.72,333.08 163.51,333.08 C153.57,333.08 147.36,337.64 147.36,345.51 C147.36,352.14 151.92,355.86 160.61,357.11 L164.75,357.52 C169.31,358.35 172.21,360.01 172.21,362.08 C172.21,364.98 168.9,367.08 162.68,367.08 C157.930627,367.177716 153.278889,365.724267 149.43,362.94 L145.29,369.15 C151.09,373.29 158.13,374.15 162.29,374.15 C173.89,374.15 180.1,368.77 180.1,361.31 C180.1,354.31 175.1,350.96 166.43,349.71 L162.29,349.3 C158.56,348.89 155.29,347.64 155.29,345.16 C155.29,342.26 158.6,340.16 163.16,340.16 C168.16,340.16 173.1,342.23 175.59,343.47 L179.66,337.22 Z M299.77,353.79 C299.77,365.79 307.64,374.5 320.48,374.5 C326.28,374.5 330.42,373.26 334.56,369.94 L330.42,363.73 C327.488758,366.10388 323.841703,367.41823 320.07,367.46 C313.07,367.46 307.64,362.08 307.64,354.21 C307.64,346.34 313,341 320.07,341 C323.841703,341.04177 327.488758,342.35612 330.42,344.73 L334.56,338.52 C330.42,335.21 326.28,333.96 320.48,333.96 C308.05,333.13 299.77,341.83 299.77,353.84 L299.77,353.79 Z M244.27,333.08 C232.67,333.08 224.8,341.36 224.8,353.79 C224.8,366.22 233.08,374.5 245.09,374.5 C250.932775,374.623408 256.638486,372.722682 261.24,369.12 L257.1,363.32 C253.772132,365.898743 249.708598,367.349004 245.5,367.46 C240.12,367.46 234.32,364.15 233.5,357.11 L262.91,357.11 L262.91,353.8 C262.91,341.37 255.45,333.09 244.27,333.09 L244.27,333.08 Z M243.86,340.54 C249.66,340.54 253.8,344.27 254.21,350.48 L232.68,350.48 C233.92,344.68 237.68,340.54 243.86,340.54 Z M136.59,353.79 L136.59,333.91 L128.72,333.91 L128.72,338.91 C125.82,335.18 121.72,333.11 115.88,333.11 C104.7,333.11 96.41,341.81 96.41,353.82 C96.41,365.83 104.69,374.53 115.88,374.53 C121.68,374.53 125.82,372.46 128.72,368.73 L128.72,373.73 L136.59,373.73 L136.59,353.79 Z M104.7,353.79 C104.7,346.33 109.26,340.54 117.13,340.54 C124.59,340.54 129.13,346.34 129.13,353.79 C129.13,361.66 124.13,367.04 117.13,367.04 C109.26,367.45 104.7,361.24 104.7,353.79 Z M410.78,333.08 C406.419355,332.982846 402.328836,335.185726 400.01,338.88 L400.01,333.88 L392.14,333.88 L392.14,373.64 L400,373.64 L400,351.31 C400,344.68 403.31,340.54 408.7,340.54 C410.518809,340.613783 412.32352,340.892205 414.08,341.37 L416.57,333.91 C414.671013,333.43126 412.72704,333.153071 410.77,333.08 L410.78,333.08 Z M380.13,353.79 L380.13,333.91 L372.26,333.91 L372.26,338.91 C369.36,335.18 365.26,333.11 359.42,333.11 C348.24,333.11 339.95,341.81 339.95,353.82 C339.95,365.83 348.23,374.53 359.42,374.53 C365.22,374.53 369.36,372.46 372.26,368.73 L372.26,373.73 L380.13,373.73 L380.13,353.79 Z M348.24,353.79 C348.24,346.33 352.8,340.54 360.67,340.54 C368.13,340.54 372.67,346.34 372.67,353.79 C372.67,361.66 367.67,367.04 360.67,367.04 C352.8,367.45 348.24,361.24 348.24,353.79 Z M460.07,353.79 L460.07,318.17 L452.2,318.17 L452.2,338.88 C449.3,335.15 445.2,333.08 439.36,333.08 C428.18,333.08 419.89,341.78 419.89,353.79 C419.89,365.8 428.17,374.5 439.36,374.5 C445.16,374.5 449.3,372.43 452.2,368.7 L452.2,373.7 L460.07,373.7 L460.07,353.79 Z M428.18,353.79 C428.18,346.33 432.74,340.54 440.61,340.54 C448.07,340.54 452.61,346.34 452.61,353.79 C452.61,361.66 447.61,367.04 440.61,367.04 C432.73,367.46 428.17,361.25 428.17,353.79 L428.18,353.79 Z" id="Shape" fill="#FFFFFF"></path> <g> <rect id="Rectangle-path" fill="#FF5F00" x="170.55" y="32.39" width="143.72" height="234.42"></rect> <path d="M185.05,149.6 C185.05997,103.912554 205.96046,60.7376085 241.79,32.39 C180.662018,-15.6713968 92.8620037,-8.68523415 40.103462,48.4380037 C-12.6550796,105.561241 -12.6550796,193.638759 40.103462,250.761996 C92.8620037,307.885234 180.662018,314.871397 241.79,266.81 C205.96046,238.462391 185.05997,195.287446 185.05,149.6 Z" id="Shape" fill="#EB001B"></path> <path d="M483.26,149.6 C483.30134,206.646679 450.756789,258.706022 399.455617,283.656273 C348.154445,308.606523 287.109181,302.064451 242.26,266.81 C278.098424,238.46936 299.001593,195.290092 299.001593,149.6 C299.001593,103.909908 278.098424,60.7306402 242.26,32.39 C287.109181,-2.86445052 348.154445,-9.40652324 399.455617,15.5437274 C450.756789,40.493978 483.30134,92.5533211 483.26,149.6 Z" id="Shape" fill="#F79E1B"></path> </g> </g> </g> </g></svg>`;
  let diners = `<svg id="ccicon" class="ccicon" width="750" height="471" viewBox="0 0 750 471" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="diners" fill-rule="nonzero"> <rect id="rectangle" fill="#0079BE" x="0" y="0" width="750" height="471" rx="40"></rect> <path d="M584.933911,237.947339 C584.933911,138.53154 501.952976,69.8140806 411.038924,69.8471464 L332.79674,69.8471464 C240.793699,69.8140806 165.066089,138.552041 165.066089,237.947339 C165.066089,328.877778 240.793699,403.587432 332.79674,403.150963 L411.038924,403.150963 C501.952976,403.586771 584.933911,328.857939 584.933911,237.947339 Z" id="Shape-path" fill="#FFFFFF"></path> <path d="M333.280302,83.9308394 C249.210378,83.9572921 181.085889,152.238282 181.066089,236.510581 C181.085889,320.768331 249.209719,389.042708 333.280302,389.069161 C417.370025,389.042708 485.508375,320.768331 485.520254,236.510581 C485.507715,152.238282 417.370025,83.9572921 333.280302,83.9308394 Z" id="Shape-path" fill="#0079BE"></path> <path d="M237.066089,236.09774 C237.145288,194.917524 262.812421,159.801587 299.006443,145.847134 L299.006443,326.327183 C262.812421,312.380667 237.144628,277.283907 237.066089,236.09774 Z M368.066089,326.372814 L368.066089,145.847134 C404.273312,159.767859 429.980043,194.903637 430.046043,236.103692 C429.980043,277.316312 404.273312,312.425636 368.066089,326.372814 Z" id="Path" fill="#FFFFFF"></path> </g> </g></svg>`;
  let amex = `<svg id="ccicon" class="ccicon" width="750" height="471" viewBox="0 0 750 471" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="amex" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#2557D6" x="0" y="0" width="750" height="471" rx="40"></rect> <path d="M0.002688,221.18508 L36.026849,221.18508 L44.149579,201.67506 L62.334596,201.67506 L70.436042,221.18508 L141.31637,221.18508 L141.31637,206.26909 L147.64322,221.24866 L184.43894,221.24866 L190.76579,206.04654 L190.76579,221.18508 L366.91701,221.18508 L366.83451,189.15941 L370.2427,189.15941 C372.62924,189.24161 373.3263,189.46144 373.3263,193.38516 L373.3263,221.18508 L464.43232,221.18508 L464.43232,213.72973 C471.78082,217.6508 483.21064,221.18508 498.25086,221.18508 L536.57908,221.18508 L544.78163,201.67506 L562.96664,201.67506 L570.98828,221.18508 L644.84844,221.18508 L644.84844,202.65269 L656.0335,221.18508 L715.22061,221.18508 L715.22061,98.67789 L656.64543,98.67789 L656.64543,113.14614 L648.44288,98.67789 L588.33787,98.67789 L588.33787,113.14614 L580.80579,98.67789 L499.61839,98.67789 C486.02818,98.67789 474.08221,100.5669 464.43232,105.83121 L464.43232,98.67789 L408.40596,98.67789 L408.40596,105.83121 C402.26536,100.40529 393.89786,98.67789 384.59383,98.67789 L179.90796,98.67789 L166.17407,130.3194 L152.07037,98.67789 L87.59937,98.67789 L87.59937,113.14614 L80.516924,98.67789 L25.533518,98.67789 L-2.99999999e-06,156.92445 L-2.99999999e-06,221.18508 L0.002597,221.18508 L0.002688,221.18508 Z M227.39957,203.51436 L205.78472,203.51436 L205.70492,134.72064 L175.13228,203.51436 L156.62,203.51436 L125.96754,134.6597 L125.96754,203.51436 L83.084427,203.51436 L74.982981,183.92222 L31.083524,183.92222 L22.8996,203.51436 L4.7e-05,203.51436 L37.756241,115.67692 L69.08183,115.67692 L104.94103,198.84086 L104.94103,115.67692 L139.35289,115.67692 L166.94569,175.26406 L192.29297,115.67692 L227.39657,115.67692 L227.39657,203.51436 L227.39957,203.51436 Z M67.777214,165.69287 L53.346265,130.67606 L38.997794,165.69287 L67.777214,165.69287 Z M313.41947,203.51436 L242.98611,203.51436 L242.98611,115.67692 L313.41947,115.67692 L313.41947,133.96821 L264.07116,133.96821 L264.07116,149.8009 L312.23551,149.8009 L312.23551,167.80606 L264.07116,167.80606 L264.07116,185.34759 L313.41947,185.34759 L313.41947,203.51436 Z M412.67528,139.33321 C412.67528,153.33782 403.28877,160.57326 397.81863,162.74575 C402.43206,164.49434 406.37237,167.58351 408.24808,170.14281 C411.22525,174.51164 411.73875,178.41416 411.73875,186.25897 L411.73875,203.51436 L390.47278,203.51436 L390.39298,192.43732 C390.39298,187.1518 390.90115,179.55074 387.0646,175.32499 C383.98366,172.23581 379.28774,171.56552 371.69714,171.56552 L349.06363,171.56552 L349.06363,203.51436 L327.98125,203.51436 L327.98125,115.67692 L376.47552,115.67692 C387.25084,115.67692 395.18999,115.9604 402.00639,119.88413 C408.67644,123.80786 412.67529,129.53581 412.67529,139.33321 L412.67528,139.33321 Z M386.02277,152.37632 C383.1254,154.12756 379.69859,154.18584 375.59333,154.18584 L349.97998,154.18584 L349.97998,134.67583 L375.94186,134.67583 C379.61611,134.67583 383.44999,134.8401 385.94029,136.26016 C388.67536,137.53981 390.36749,140.26337 390.36749,144.02548 C390.36749,147.86443 388.75784,150.95361 386.02277,152.37632 Z M446.48908,203.51436 L424.97569,203.51436 L424.97569,115.67692 L446.48908,115.67692 L446.48908,203.51436 Z M696.22856,203.51436 L666.35032,203.51436 L626.38585,137.58727 L626.38585,203.51436 L583.44687,203.51436 L575.24166,183.92222 L531.44331,183.92222 L523.48287,203.51436 L498.81137,203.51436 C488.56284,203.51436 475.58722,201.25709 468.23872,193.79909 C460.82903,186.3411 456.97386,176.23903 456.97386,160.26593 C456.97386,147.23895 459.27791,135.33 468.33983,125.91941 C475.15621,118.90916 485.83044,115.67692 500.35982,115.67692 L520.77174,115.67692 L520.77174,134.49809 L500.78818,134.49809 C493.0938,134.49809 488.74909,135.63733 484.564,139.70147 C480.96957,143.4 478.50322,150.39171 478.50322,159.59829 C478.50322,169.00887 480.38158,175.79393 484.30061,180.22633 C487.5465,183.70232 493.445,184.75677 498.99495,184.75677 L508.46393,184.75677 L538.17987,115.67957 L569.77152,115.67957 L605.46843,198.76138 L605.46843,115.67957 L637.5709,115.67957 L674.6327,176.85368 L674.6327,115.67957 L696.22856,115.67957 L696.22856,203.51436 Z M568.07051,165.69287 L553.47993,130.67606 L538.96916,165.69287 L568.07051,165.69287 Z" id="Path" fill="#FFFFFF"></path> <path d="M749.95644,343.76716 C744.83485,351.22516 734.85504,355.00582 721.34464,355.00582 L680.62723,355.00582 L680.62723,336.1661 L721.17969,336.1661 C725.20248,336.1661 728.01736,335.63887 729.71215,333.99096 C731.18079,332.63183 732.2051,330.65804 732.2051,328.26036 C732.2051,325.70107 731.18079,323.66899 729.62967,322.45028 C728.09984,321.10969 725.87294,320.50033 722.20135,320.50033 C702.40402,319.83005 677.70592,321.10969 677.70592,293.30714 C677.70592,280.56363 685.83131,267.14983 707.95664,267.14983 L749.95379,267.14983 L749.95644,249.66925 L710.93382,249.66925 C699.15812,249.66925 690.60438,252.47759 684.54626,256.84375 L684.54626,249.66925 L626.83044,249.66925 C617.60091,249.66925 606.76706,251.94771 601.64279,256.84375 L601.64279,249.66925 L498.57751,249.66925 L498.57751,256.84375 C490.37496,250.95154 476.53466,249.66925 470.14663,249.66925 L402.16366,249.66925 L402.16366,256.84375 C395.67452,250.58593 381.24357,249.66925 372.44772,249.66925 L296.3633,249.66925 L278.95252,268.43213 L262.64586,249.66925 L148.99149,249.66925 L148.99149,372.26121 L260.50676,372.26121 L278.447,353.20159 L295.34697,372.26121 L364.08554,372.32211 L364.08554,343.48364 L370.84339,343.48364 C379.96384,343.62405 390.72054,343.25845 400.21079,339.17311 L400.21079,372.25852 L456.90762,372.25852 L456.90762,340.30704 L459.64268,340.30704 C463.13336,340.30704 463.47657,340.45011 463.47657,343.92344 L463.47657,372.25587 L635.71144,372.25587 C646.64639,372.25587 658.07621,369.46873 664.40571,364.41107 L664.40571,372.25587 L719.03792,372.25587 C730.40656,372.25587 741.50913,370.66889 749.95644,366.60475 L749.95644,343.76712 L749.95644,343.76716 Z M408.45301,296.61266 C408.45301,321.01872 390.16689,326.05784 371.7371,326.05784 L345.42935,326.05784 L345.42935,355.52685 L304.44855,355.52685 L278.48667,326.44199 L251.5058,355.52685 L167.9904,355.52685 L167.9904,267.66822 L252.79086,267.66822 L278.73144,296.46694 L305.55002,267.66822 L372.92106,267.66822 C389.6534,267.66822 408.45301,272.28078 408.45301,296.61266 Z M240.82781,337.04655 L188.9892,337.04655 L188.9892,319.56596 L235.27785,319.56596 L235.27785,301.64028 L188.9892,301.64028 L188.9892,285.66718 L241.84947,285.66718 L264.91132,311.27077 L240.82781,337.04655 Z M324.3545,347.10668 L291.9833,311.3189 L324.3545,276.6677 L324.3545,347.10668 Z M372.2272,308.04117 L344.98027,308.04117 L344.98027,285.66718 L372.47197,285.66718 C380.08388,285.66718 385.36777,288.75636 385.36777,296.43956 C385.36777,304.03796 380.32865,308.04117 372.2272,308.04117 Z M514.97053,267.66815 L585.34004,267.66815 L585.34004,285.83764 L535.96778,285.83764 L535.96778,301.81074 L584.1348,301.81074 L584.1348,319.73642 L535.96778,319.73642 L535.96778,337.21701 L585.34004,337.29641 L585.34004,355.52678 L514.97053,355.52678 L514.97053,267.66815 Z M487.91724,314.6973 C492.61049,316.42205 496.44703,319.51387 498.24559,322.07317 C501.22276,326.36251 501.65378,330.36571 501.73891,338.10985 L501.73891,355.52685 L480.5714,355.52685 L480.5714,344.53458 C480.5714,339.24908 481.08223,331.42282 477.1632,327.33748 C474.08226,324.19002 469.38635,323.4376 461.69463,323.4376 L439.16223,323.4376 L439.16223,355.52685 L417.97609,355.52685 L417.97609,267.66822 L466.65393,267.66822 C477.32816,267.66822 485.10236,268.13716 492.02251,271.81449 C498.6766,275.8177 502.86168,281.30191 502.86168,291.3245 C502.85868,305.34765 493.46719,312.50362 487.91724,314.6973 Z M475.99899,303.59022 C473.17879,305.25668 469.69077,305.39975 465.58817,305.39975 L439.97483,305.39975 L439.97483,285.66718 L465.9367,285.66718 C469.69077,285.66718 473.4475,285.74658 475.99899,287.25416 C478.7314,288.67687 480.36499,291.39779 480.36499,295.15725 C480.36499,298.91672 478.7314,301.94496 475.99899,303.59022 Z M666.33539,309.1866 C670.44067,313.41766 672.64095,318.7588 672.64095,327.80112 C672.64095,346.70178 660.78278,355.5242 639.51948,355.5242 L598.45353,355.5242 L598.45353,336.68449 L639.35453,336.68449 C643.35337,336.68449 646.18954,336.15726 647.9668,334.50934 C649.41681,333.15021 650.45709,331.17643 650.45709,328.77875 C650.45709,326.21944 649.33167,324.18738 647.88433,322.96866 C646.27201,321.62807 644.04778,321.01872 640.37619,321.01872 C620.65868,320.34843 595.9659,321.62807 595.9659,293.82551 C595.9659,281.08201 604.00615,267.66822 626.11019,267.66822 L668.37872,267.66822 L668.37872,286.36752 L629.70196,286.36752 C625.86809,286.36752 623.37512,286.51059 621.25464,287.9545 C618.94527,289.37721 618.08856,291.48876 618.08856,294.2759 C618.08856,297.59028 620.04941,299.8449 622.702,300.81987 C624.92624,301.59084 627.31543,301.81603 630.9072,301.81603 L642.25722,302.12071 C653.703,302.39889 661.55967,304.37003 666.33539,309.1866 Z M750,285.66718 L711.57335,285.66718 C707.7368,285.66718 705.18797,285.81025 703.04088,287.25416 C700.81665,288.67687 699.95995,290.78843 699.95995,293.57558 C699.95995,296.88994 701.83831,299.14456 704.57071,300.11953 C706.79495,300.8905 709.18415,301.1157 712.6961,301.1157 L724.12327,301.42038 C735.65419,301.70387 743.35123,303.67765 748.04448,308.49157 C748.89852,309.16186 749.41202,309.91428 750,310.6667 L750,285.66718 Z" id="path13" fill="#FFFFFF"></path> </g> </g></svg>`;
  let elo = '<svg id="ccicon" class="ccicon" width="750" height="471" viewBox="0 0 750 471" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="elo" fill-rule="nonzero"><path d="M40,0 L710,0 C732.1,0 750,17.9 750,40 L750,431 C750,453.1 732.1,471 710,471 L40,471 C17.9,471 0,453.1 0,431 L0,40 C0,17.9 17.9,0 40,0 Z" id="Rectangle-1" fill="#000000"/><path d="M150.7,170.6 C157.5,168.3 164.8,167.1 172.4,167.1 C205.6,167.1 233.3,190.7 239.6,222 L286.6,212.4 C275.8,159.2 228.8,119.1 172.4,119.1 C159.5,119.1 147.1,121.2 135.5,125.1 L150.7,170.6 Z" id="Shape" fill="#FFF100"/><path d="M95.2,323 L127,287 C112.8,274.4 103.9,256.1 103.9,235.6 C103.9,215.2 112.8,196.8 127,184.3 L95.2,148.4 C71.1,169.8 55.9,200.9 55.9,235.7 C55.9,270.4 71.1,301.6 95.2,323 Z" id="Shape" fill="#00A3DF"/><path d="M239.6,249.4 C233.2,280.7 205.6,304.2 172.4,304.2 C164.8,304.2 157.5,303 150.6,300.7 L135.4,346.2 C147,350.1 159.5,352.2 172.4,352.2 C228.8,352.2 275.8,312.2 286.6,259 L239.6,249.4 Z" id="Shape" fill="#EE4023"/><g id="Group" transform="translate(342.000000, 148.000000)" fill="#FFFFFF"><path d="M101.2,133.6 C93.4,141.2 82.9,145.8 71.3,145.6 C63.3,145.5 55.9,143.1 49.7,139.1 L34.1,163.9 C44.8,170.6 57.3,174.6 70.9,174.8 C90.6,175.1 108.6,167.3 121.7,154.6 L101.2,133.6 Z M73,32.5 C33.8,31.9 1.4,63.3 0.8,102.5 C0.6,117.2 4.8,131 12.3,142.4 L141.1,87.3 C133.9,56.4 106.3,33.1 73,32.5 Z M30.3,108.1 C30.1,106.5 30,104.8 30,103.1 C30.4,80 49.4,61.5 72.5,61.9 C85.1,62.1 96.3,67.8 103.8,76.8 L30.3,108.1 Z M181.6,0.5 L181.6,137.8 L205.4,147.7 L194.1,174.8 L170.5,165 C165.2,162.7 161.6,159.2 158.9,155.2 C156.3,151.2 154.3,145.6 154.3,138.2 L154.3,0.5 L181.6,0.5 Z" id="Shape"/><path d="M267.5,64 C271.7,62.6 276.1,61.9 280.8,61.9 C301.1,61.9 317.9,76.3 321.8,95.4 L350.5,89.5 C343.9,57 315.2,32.6 280.8,32.6 C272.9,32.6 265.3,33.9 258.3,36.2 L267.5,64 Z M233.6,156.9 L253,135 C244.3,127.3 238.9,116.1 238.9,103.6 C238.9,91.1 244.4,79.9 253,72.3 L233.6,50.4 C218.9,63.4 209.6,82.5 209.6,103.7 C209.6,124.9 218.9,143.9 233.6,156.9 Z M321.8,112.1 C317.9,131.2 301,145.6 280.8,145.6 C276.2,145.6 271.7,144.8 267.5,143.4 L258.2,171.2 C265.3,173.6 272.9,174.9 280.8,174.9 C315.2,174.9 343.9,150.5 350.5,118 L321.8,112.1 Z" id="Shape"/></g></g></g></svg >'
  let hipercard = '<svg id="ccicon" class="ccicon" width="750" height="471" viewBox="0 0 750 471" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="hipercard" fill="#393939" fill-rule="nonzero">'
    + '<path d="M697.115385,0 L52.8846154,0 C23.7240385,0 0,23.1955749 0,51.7065868 L0,419.293413 C0,447.804425 23.7240385,471 52.8846154,471 L697.115385,471 C726.274038,471 750,447.804425 750,419.293413 L750,51.7065868 C750,23.1955749 726.274038,0 697.115385,0 Z M320.513462,379.0125 L45,379.111538 L45,378.448077 C45,378.083654 45.4394231,375.719231 45.9759615,373.193269 C46.5134615,370.668269 47.3480769,366'
    + '.650962 47.8326923,364.267308 C48.3153846,361.882692 49.1423077,357.831731 49.6682692,355.263462 C50.1951923,352.697115 51.0711538,348.420192 51.6144231,345.760577 C52.1567308,343.101923 53.0067308,338.9 53.5038462,336.425 C54.0009615,333.948077 54.8288462,329.896154 55.3461538,327.421154 C55.8625,324.945192 56.7442308,320.669231 57.3048077,317.918269 C57.8644231,315.167308 58.7153846,310.965385 59.196'
    + '1538,308.580769 C59.6769231,306.196154 60.4403846,302.520192 60.8932692,300.4125 C61.3451923,298.302885 61.9230769,295.451923 62.175,294.075962 C62.4278846,292.700962 63.2461538,288.649038 63.9932692,285.073077 C64.7403846,281.497115 65.5634615,277.445192 65.825,276.070192 C66.0855769,274.694231 66.9134615,270.642308 67.6653846,267.066346 C68.4163462,263.491346 69.2413462,259.439423 69.4990385,258.06346'
    + '2 C69.7567308,256.688462 70.5865385,252.636538 71.3423077,249.060577 C72.1,245.483654 72.9173077,241.507692 73.1576923,240.224038 C73.4,238.940385 74.0615385,235.639423 74.6288462,232.888462 C75.1951923,230.1375 76.2682692,224.960577 77.0125,221.384615 C77.7576923,217.807692 79.0307692,211.580769 79.8413462,207.545192 C80.6538462,203.510577 81.6240385,198.709615 81.9980769,196.875962 C82.3711538,195.042308'
    + ' 83.0471154,191.740385 83.5,189.539423 C83.9528846,187.338462 84.7740385,183.3625 85.3259615,180.703846 C85.8778846,178.043269 86.775,173.692308 87.3201923,171.032692 C87.8663462,168.374038 88.7067308,164.247115 89.1884615,161.863462 C89.6701923,159.478846 90.4923077,155.502885 91.0153846,153.026923 C91.5384615,150.550962 92.4384615,146.199038 93.0153846,143.356731 C93.5923077,140.513462 94.5586538,136.1625'
    + ' 95.1625,133.686538 C95.7663462,131.210577 96.6201923,128.209615 97.0605769,127.018269 C97.5,125.825 98.7144231,123.242308 99.7586538,121.275 L101.657692,117.700962 L103.383654,115.439423 C104.331731,114.197115 106.026923,112.232692 107.149038,111.075 C108.271154,109.917308 110.163462,108.175 111.356731,107.203846 C112.548077,106.231731 114.274038,104.920192 115.190385,104.289423 C116.107692,103.658654 117.908654,102.553846 119.192308,101.834615 C120.475962,101.115385 122.277885,100.174038 123.194231,99.7423077 C124.111538,99.3105769 125.9875,98.5211538 127.3625,97.9894231 C128.7375,97.4586538 131.363462,96.5673077 133.197115,96.0105769 C135.030769,95.4528846 138.474038,94.6125 140.848077,94.1442308 C143.222115,93.675 146.972115,93.0480769 149.184615,92.7509615 L153.204808,92.2105769 L428.884615,92.1067308 L704.563462,92 L704.563462,92.6634615 C704.563462,93.0278846 704.121154,95.3923077 703.581731,97.9173077 C703.040385,100.442308 702.1375,104.759615 701.574038,107.510577 C701.009615,110.261538 700.188462,114.238462 699.746154,116.347115 C699.304808,118.456731 698.468269,122.507692 697.8875,125.35 C697.307692,128.193269 696.414423,132.545192 695.903846,135.020192 C695.393269,137.496154 694.565385,141.548077 694.065385,144.023077 C693.565385,146.5 692.732692,150.550962 692.216346,153.026923 C691.698077,155.502885 690.898077,159.404808 690.434615,161.697115 C689.971154,163.989423 689.133654,168.115385 688.573077,170.866346 C688.011538,173.617308 687.110577,177.969231 686.570192,180.536538 C686.028846,183.103846 685.206731,187.080769 684.741346,189.373077 C684.274038,191.665385 683.436538,195.791346 682.877885,198.542308 C682.318269,201.293269 681.419231,205.645192 680.878846,208.213462 C680.338462,210.780769 679.533654,214.681731 679.089423,216.882692 C678.646154,219.082692 677.810577,223.209615 677.233654,226.051923 C676.655769,228.894231 675.816346,233.021154 675.364423,235.223077 C674.9125,237.423077 674.107692,241.325 673.575,243.891346 C673.040385,246.459615 672.127885,250.886538 671.548077,253.728846 C670.965385,256.572115 670.133654,260.622115 669.699038,262.732692 C669.2625,264.840385 668.448077,268.817308 667.886538,271.567308 C667.325962,274.320192 666.433654,278.670192 665.902885,281.238462 C665.373077,283.805769 664.542308,287.857692 664.055769,290.242308 C663.571154,292.625962 662.725962,296.752885 662.180769,299.411538 C661.633654,302.070192 660.741346,306.422115 660.197115,309.080769 C659.'
    + '652885,311.740385 658.8375,315.717308 658.384615,317.918269 C657.931731,320.118269 657.104808,324.170192 656.546154,326.921154 C655.9875,329.672115 655.077885,334.007692 654.525962,336.554808 L653.522115,341.186538 L652.325962,344.390385 C651.668269,346.152885 650.678846,348.495192 650.126923,349.596154 C649.576923,350.695192 648.454808,352.6375 647.634615,353.910577 C646.813462,355.182692 645.669231,356.8125 645.092308,357.532692 C644.515385,358.252885 642.777885,360.1125 641.229808,361.666346 L638.419231,364.488462 L635.7125,366.411538 C634.224038,367.469231 632.620192,368.545192 632.15,368.801923 C631.678846,369.058654 629.885577,369.975 628.164423,370.835577 C626.444231,371.698077 624.0125,372.794231 622.763462,373.272115 C621.513462,373.751923 619.0375,374.566346 617.261538,375.082692 C615.485577,375.600962 613.581731,376.110577 613.031731,376.215385 C612.480769,376.321154 610.572115,376.715385 608.7875,377.094231 C607.003846,377.472115 603.402885,378.036538 600.785577,378.348077 L596.025962,378.914423 L320.513462,379.0125 Z M583.081731,370.526923 L587.556731,369.994231 C590.017308,369.701923 593.402885,369.171154 595.079808,368.815385 C596.756731,368.459615 598.551923,368.089423 599.069231,367.989423 C599.586538,367.891346 601.376923,367.411538 603.046154,366.925 C604.715385,366.439423 607.043269,365.674038 608.218269,365.222115 C609.393269,364.773077 611.678846,363.742308 613.296154,362.931731 C614.914423,362.123077 616.6,361.261538 617.043269,361.020192 C617.485577,360.778846 618.993269,359.767308 620.392308,358.773077 L622.936538,356.964423 L625.578846,354.311538 C627.034615,352.850962 628.668269,351.102885 629.210577,350.425962 C629.752885,349.748077 630.828846,348.216346 631.600962,347.020192 C632.372115,345.823077 633.426923,343.997115 633.943269,342.964423 C634.4625,341.928846 635.392308,339.726923 636.010577,338.070192 L637.135577,335.057692 L638.078846,330.703846 C638.598077,328.308654 639.453846,324.232692 639.978846,321.647115 C640.503846,319.060577 641.280769,315.250962 641.706731,313.182692 C642.132692,311.113462 642.899038,307.375 643.410577,304.875 C643.922115,302.375 644.761538,298.283654 645.275962,295.784615 C645.788462,293.284615 646.582692,289.404808 647.038462,287.164423 C647.496154,284.922115 648.276923,281.113462 648.775,278.699038 C649.274038,276.284615 650.1125,272.195192 650.640385,269.607692 C651.168269,267.022115 651.933654,263.282692 652.344231,261.301923 C652.752885,259.317308 653.534615,255.509615 654.082692,252.836538 C654.626923,250.164423 655.485577,246.002885 655.9875,243.588462 C656.488462,241.175962 657.245192,237.507692 657.670192,235.439423 C658.095192,233.369231 658.883654,229.489423 659.427885,226.817308 C659.970192,224.145192 660.755769,220.265385 661.172115,218.197115 C661.589423,216.127885 662.346154,212.460577 662.853846,210.047115 C663.3625,207.632692 664.207692,203.541346 664.733654,200.954808 C665.258654,198.368269 666.046154,194.489423 666.485577,192.334615 C666.923077,190.179808 667.696154,186.440385 668.204808,184.026923 C668.7125,181.613462 669.559615,177.522115 670.0875,174.935577 C670.614423,172.35 671.401923,168.470192 671.838462,166.315385 C672.274038,164.160577 673.025962,160.492308 673.513462,158.164423 C673.998077,155.836538 674.781731,152.028846 675.250962,149.7 C675.721154,147.373077 676.5,143.563462 676.979808,141.235577 C677.459615,138.908654 678.299038,134.817308 678.844231,132.145192 C679.390385,129.472115 680.176923,125.664423 680.592308,123.680769 C681.007692,121.698077 681.779808,117.959615 682.310577,115.373077 C682.840385,112.7875 683.689423,108.727885 684.198077,106.354808 C684.704808,103.980769 685.121154,101.757692 685.121154,101.415385 L685.121154,100.791346 L425.948077,100.892308 L166.775,100.989423 L162.995192,101.497115 C160.915385,101.776923 157.389423,102.366346 155.157692,102.807692 C152.925962,103.248077 149.688462,104.0375 147.964423,104.561538 C146.241346,105.085577 143.772115,105.923077 142.479808,106.422115 C141.186538,106.922115 139.423077,107.664423 138.560577,108.070192 C137.699038,108.475962 136.005769,109.361538 134.799038,110.0375 C133.591346,110.713462 131.899038,111.751923 131.036538,112.345192 C130.175,112.938462 128.551923,114.171154 127.431731,115.084615 C126.310577,115.998077 124.531731,117.635577 123.475962,118.724038 C122.421154,119.8125 120.827885,121.659615 119.936538,122.827885 L118.313462,124.953846 L116.528846,128.313462 C115.547115,130.163462 114.404808,132.591346 113.992308,133.713462 C113.577885,134.832692 112.775,137.654808 112.207692,139.981731 C111.639423,142.309615 110.731731,146.4 110.189423,149.073077 C109.646154,151.745192 108.800962,155.836538 108.308654,158.164423 C107.817308,160.492308 107.044231,164.229808 106.591346,166.472115 C106.138462,168.7125 105.348077,172.592308 104.834615,175.092308 C104.322115,177.592308 103.478846,181.682692 102.959615,184.184615 C102.441346,186.683654 101.669231,190.422115 101.243269,192.490385 C100.817308,194.559615 100.181731,197.664423 99.8317308,199.388462 C99.4798077,201.111538 98.5673077,205.625 97.8038462,209.418269 C97.0413462,213.2125 95.8451923,219.066346 95.1442308,222.428846 C94.4442308,225.791346 93.4355769,230.657692 92.9028846,233.244231 C92.3701923,235.830769 91.7480769,238.933654 91.5201923,240.140385 C91.2942308,241.347115 90.5259615,245.085577 89.8134615,248.448077 C89.1028846,251.809615 88.3230769,255.619231 88.0807692,256.911538 C87.8384615,258.205769 87.0625,262.014423 86.3567308,265.375962 C85.65,268.7375 84.8711538,272.547115 84.6269231,273.840385 C84.3807692,275.133654 83.6067308,278.942308 82.9048077,282.304808 C82.2019231,285.666346 81.4326923,289.475962 81.1951923,290.768269 C80.9586538,292.061538 80.4153846,294.742308 79.9903846,296.725 C79.5644231,298.706731 78.8471154,302.1625 78.3942308,304.404808 C77.9423077,306.646154 77.1423077,310.597115 76.6163462,313.182692 C76.0894231,315.769231 75.2605769,319.789423 74.775,322.117308 C74.2884615,324.443269 73.5105769,328.252885 73.0432692,330.581731 C72.5759615,332.908654 71.7769231,336.858654 71.2673077,339.358654 C70.7557692,341.858654 69.9326923,345.879808 69.4375,348.292308 C68.9432692,350.706731 68.1653846,354.515385 67.7115385,356.756731 C67.2557692,358.998077 66.4711538,362.775 65.9663462,365.148077 C65.4615385,367.523077 65.0480769,369.746154 65.0480769,370.088462 L65.0480769,370.7125 L324.065385,370.619231 L583.081731,370.526923 Z M103.020192,276.736538 L103.020192,276.195192 C103.020192,275.896154 103.406731,273.758654 103.878846,271.443269 C104.351923,269.127885 104.867308,266.482692 105.026923,265.565385 C105.184615,264.649038 105.683654,262.098077 106.135577,259.898077 C106.586538,257.697115 107.429808,253.421154 108.005769,250.394231 C108.582692,247.368269 109.408654,243.016346 109.842308,240.724038 C110.276923,238.431731 111.093269,234.005769 111.656731,230.886538 C112.221154,227.769231 113.135577,222.368269 113.691346,218.882692 C114.245192,215.399038 115.068269,210.222115 115.521154,207.378846 C115.974038,204.536538 116.804808,199.359615 117.367308,195.875 C117.929808,192.390385 118.538462,188.564423 118.720192,187.372115 C118.900962,186.179808 119.284615,183.892308 119.573077,182.2875 L120.095192,179.369231 L136.436538,179.369231 L136.234615,179.898077 C136.122115,180.188462 135.728846,182.139423 135.360577,184.232692 C134.991346,186.325962 134.460577,189.126923 134.180769,190.455769 C133.900962,191.786538 133.525,193.925 133.346154,195.208654 C133.166346,196.492308 132.639423,199.568269 132.173077,202.043269 C131.707692,204.520192 131.036538,207.971154 130.682692,209.713462 C130.328846,211.454808 129.819231,214.150962 129.549038,215.702885 C129.279808,217.254808 129.090385,218.55 129.127885,218.582692 C129.166346,218.613462 133.754808,218.749038 139.325,218.880769 L149.451923,219.121154 L161.544231,218.876923 L173.635577,218.631731 L174.191346,214.923077 C174.497115,212.882692 175.195192,208.5125 175.743269,205.2125 C176.291346,201.910577 177.102885,197.184615 177.547115,194.707692 C177.991346,192.231731 178.650962,188.481731 179.015385,186.372115 C179.378846,184.263462 179.776923,181.824038 179.899038,180.953846 L180.123077,179.369231 L196.597115,179.369231 L196.035577,181.786538 C195.726923,183.117308 195.008654,186.755769 194.439423,189.873077 C193.870192,192.990385 193.025962,197.642308 192.5625,200.209615 C192.099038,202.777885 191.265385,207.354808 190.707692,210.379808 C190.15,213.406731 189.253846,218.207692 188.716346,221.050962 C188.178846,223.893269 187.364423,228.394231 186.908654,231.054808 C186.450962,233.713462 185.618269,238.664423 185.056731,242.057692 C184.495192,245.450962 183.595192,250.777885 183.058654,253.895192 C182.521154,257.0125 181.777885,261.365385 181.405769,263.565385 C181.033654,265.765385 180.571154,268.692308 180.380769,270.068269 C180.188462,271.443269 179.871154,273.506731 179.672115,274.652885 L179.3125,276.736538 L163.042308,276.736538 L163.038462,276.320192 C163.036538,276.090385 163.565385,272.976923 164.2125,269.400962 C164.860577,265.824038 165.750962,261.023077 166.191346,258.730769 C166.630769,256.438462 167.459615,252.011538 168.031731,248.894231 C168.605769,245.775962 169.519231,240.824038 170.0625,237.889423 C170.605769,234.954808 171.220192,231.688462 171.426923,230.628846 L171.805769,228.703846 L171.563462,228.461538 L171.321154,228.220192 L127.750962,228.220192 L127.563462,228.406731 C127.461538,228.509615 127.014423,230.609615 126.571154,233.075962 C126.128846,235.540385 125.380769,239.807692 124.910577,242.558654 C124.440385,245.308654 123.592308'
    + ',250.335577 123.026923,253.728846 C122.4625,257.121154 121.636538,262.074038 121.193269,264.732692 C120.75,267.391346 120.125,271.180769 119.805769,273.152885 L119.224038,276.736538 L103.020192,276.736538 Z M215.321154,307.748077 L215.502885,306.997115 C215.603846,306.585577 216.130769,303.996154 216.676923,301.245192 C217.222115,298.494231 218.119231,293.842308 218.671154,290.908654 C219.223077,287.974038 220.142308,283.023077 220.713462,279.903846 C221.284615,276.786538 222.113462,272.285577 222.552885,269.901923 C222.993269,267.517308 223.807692,263.090385 224.364423,260.064423 C224.921154,257.038462 225.822115,251.935577 226.367308,248.726923 C226.913462,245.517308 227.7375,240.640385 228.199038,237.889423 C228.660577,235.138462 229.488462,230.1875 230.036538,226.886538 C230.584615,223.584615 231.515385,217.846154 232.105769,214.131731 L233.176923,207.378846 L245.403846,207.378846 L245.390385,207.795192 C245.382692,208.025962 245.101923,209.530769 244.764423,211.141346 L244.152885,214.071154 L245.028846,213.497115 C245.509615,213.183654 246.108654,212.721154 246.357692,212.472115 C246.607692,212.223077 247.597115,211.518269 248.555769,210.904808 C249.513462,210.291346 251.305769,209.323077 252.536538,208.754808 L254.775962,207.717308 L257.352885,207.060577 L259.928846,206.401923 L263.0875,206.039423 L266.244231,205.676923 L269.077885,205.884615 L271.9125,206.092308 L274.747115,206.770192 L277.581731,207.45 L282.729808,210.109615 L284.904808,212.416346 L287.080769,214.723077 L288.206731,216.970192 L289.333654,219.216346 L290.028846,222.217308 L290.725,225.219231 L290.945192,228.220192 L291.166346,231.221154 L290.784615,234.756731 C290.574038,236.702885 290.100962,239.853846 289.733654,241.759615 L289.065385,245.225 L287.773077,249.226923 C287.061538,251.427885 285.842308,254.728846 285.060577,256.5625 C284.279808,258.396154 283.216346,260.525 282.696154,261.291346 C282.175962,262.058654 281.75,262.769231 281.75,262.872115 C281.75,262.974038 281.041346,263.997115 280.174038,265.145192 C279.308654,266.294231 277.620192,268.213462 276.423077,269.407692 L274.247115,271.583654 L271.9125,273.103846 C270.628846,273.940385 268.678846,275.035577 267.577885,275.538462 L265.577885,276.45 L261.85,277.415385 L258.123077,278.379808 L254.680769,278.591346 L251.239423,278.801923 L248.526923,278.450962 L245.815385,278.099038 L243.539423,277.188462 L241.264423,276.276923 L239.415385,274.415385 L237.567308,272.551923 L236.734615,270.976923 C236.275962,270.109615 235.8125,269.400962 235.704808,269.400962 C235.596154,269.400962 235.327885,270.713462 235.107692,272.318269 C234.886538,273.923077 234.339423,277.561538 233.891346,280.404808 C233.443269,283.247115 232.635577,288.349038 232.096154,291.742308 C231.555769,295.134615 230.878846,299.441346 230.590385,301.314423 C230.300962,303.185577 230.064423,305.160577 230.064423,305.704808 C230.064423,306.248077 229.974038,306.929808 229.861538,307.220192 L229.659615,307.748077 L215.321154,307.748077 Z M316.621154,278.024038 C315.350962,277.860577 313.081731,277.429808 311.578846,277.067308 L308.845192,276.405769 L306.884615,275.513462 C305.806731,275.023077 304.174038,274.0625 303.257692,273.379808 C302.340385,272.698077 300.971154,271.485577 300.215385,270.686538 C299.459615,269.8875 298.455769,268.558654 297.986538,267.733654 C297.517308,266.908654 296.826923,265.407692 296.454808,264.399038 C296.082692,263.391346 295.549038,261.589423 295.271154,260.398077 L294.764423,258.229808 L294.759615,253.268269 L294.753846,248.306731 L295.285577,244.931731 C295.578846,243.075962 296.172115,240.057692 296.605769,238.224038 C297.038462,236.389423 297.777885,233.763462 298.249038,232.3875 C298.719231,231.0125 299.420192,229.136538 299.804808,228.220192 C300.190385,227.302885 301.0375,225.502885 301.6875,224.218269 C302.338462,222.934615 303.478846,220.984615 304.223077,219.883654 C304.966346,218.782692 306.329808,217.130769 307.250962,216.209615 C308.171154,215.289423 309.6,213.989423 310.426923,213.320192 C311.251923,212.651923 312.901923,211.551923 314.094231,210.875962 C315.285577,210.2 317.386538,209.196154 318.761538,208.647115 L321.263462,207.648077 L325.264423,206.878846 L329.266346,206.110577 L332.600962,205.894231 L335.934615,205.676923 L339.525,206.020192 L343.113462,206.363462 L346.026923,207.064423 L348.939423,207.766346 L350.606731,208.652885 C351.524038,209.140385 352.809615,209.918269 353.465385,210.380769 C354.120192,210.843269 355.109615,211.745192 355.663462,212.384615 C356.217308,213.025 357.064423,214.226923 357.543269,215.055769 L358.417308,216.563462 L358.946154,218.840385 L359.474038,221.118269 L359.463462,224.169231 L359.452885,227.219231 L358.966346,230.846154 C358.699038,232.840385 358.227885,235.541346 357.919231,236.848077 L357.359615,239.223077 L338.811538,239.104808 L320.2625,238.984615 L310.227885,239.453846 L309.654808,243.174038 L309.083654,246.892308 L309.088462,251.0625 L309.092308,255.231731 L309.736538,257.484615 L310.380769,259.736538 L311.408654,261.533654 L312.436538,263.328846 L315.071154,265.709615 L316.666346,266.499038 C317.544231,266.934615 319.1625,267.576923 320.2625,267.927885 L322.263462,268.566346 L328.099038,268.556731 L333.934615,268.544231 L337.605769,267.833654 L341.276923,267.121154 L344.775,265.969231 C346.698077,265.335577 348.833654,264.545192 349.519231,264.214423 L350.765385,263.613462 L350.944231,263.792308 L351.125,263.971154 L350.310577,267.9375 C349.8625,270.118269 349.404808,272.577885 349.293269,273.403846 L349.089423,274.907692 L345.013462,275.804808 C342.771154,276.297115 339.286538,276.933654 337.268269,277.217308 C335.251923,277.501923 331.950962,277.885577 329.932692,278.069231 L326.265385,278.403846 L322.597115,278.361538 C320.579808,278.339423 317.890385,278.186538 316.621154,278.024038 Z M483.489423,278.240385 L478.9875,278.369231 L477.024038,278.059615 C475.943269,277.888462 474.032692,277.457692 472.776923,277.102885 L470.493269,276.457692 L468.499038,275.246154 L466.505769,274.034615 L465.382692,272.723077 C464.766346,272.001923 463.853846,270.664423 463.356731,269.752885 L462.454808,268.094231 L461.967308,265.550962 L461.481731,263.006731 L461.481731,256.896154 L461.991346,253.983654 L462.500962,251.072115 L463.610577,248.482692 C464.220192,247.057692 465.226923,245.142308 465.846154,244.225962 C466.465385,243.308654 467.874038,241.657692 468.977885,240.556731 L470.982692,238.554808 L473.528846,236.973077 C474.929808,236.100962 476.214423,235.389423 476.383654,235.389423 C476.553846,235.389423 477.317308,235.0875 478.080769,234.718269 C478.844231,234.35 481.235577,233.563462 483.395192,232.971154 L487.321154,231.894231 L499.319231,231.851923 L511.317308,231.808654 L511.892308,229.013462 L512.466346,226.219231 L512.482692,223.672115 L512.498077,221.125962 L511.413462,219.511538 L510.329808,217.896154 L508.394231,216.940385 L506.459615,215.985577 L500.659615,214.968269 L496.157692,215.154808 L491.656731,215.339423 L486.655769,216.191346 C483.903846,216.660577 480.242308,217.422115 478.519231,217.886538 C476.796154,218.35 475.3375,218.681731 475.278846,218.622115 C475.219231,218.5625 475.598077,216.872115 476.122115,214.864423 C476.644231,212.855769 477.250962,210.350962 477.469231,209.297115 L477.866346,207.378846 L483.320192,207.357692 L487.322115,206.873077 C489.523077,206.604808 493.823077,206.231731 496.880769,206.043269 L502.4375,205.699038 L506.751923,206.026923 L511.065385,206.354808 L517.332692,207.749038 L519.435577,208.815385 L521.536538,209.879808 L522.818269,211.109615 L524.098077,212.338462 L525.043269,214.269231 L525.986538,216.199038 L525.957692,220.375962 L525.926923,224.551923 L525.030769,229.386538 C524.539423,232.046154 523.705769,236.622115 523.179808,239.556731 C522.652885,242.492308 521.840385,247.143269 521.373077,249.894231 C520.904808,252.644231 520.128846,257.671154 519.648077,261.064423 L518.775,267.233654 L518.588462,271.985577 L518.400962,276.736538 L506.161538,276.736538 L506.167308,274.652885 C506.171154,273.506731 506.386538,271.071154 506.645192,269.239423 C506.904808,267.408654 507.074038,265.867308 507.019231,265.813462 C506.965385,265.758654 506.323077,266.506731 505.592308,267.475 C504.861538,268.442308 503.527885,269.963462 502.628846,270.855769 C501.729808,271.747115 500.167308,273.027885 499.158654,273.701923 C498.15,274.375962 496.5,275.317308 495.491346,275.793269 L493.656731,276.659615 L490.822115,277.385577 L487.9875,278.110577 L483.486538,278.240385 L483.489423,278.240385 Z M428.642308,278.363462 C426.623077,278.341346 424.093269,278.194231 423.019231,278.0375 C421.945192,277.880769 419.919231,277.433654 418.518269,277.045192 L415.969231,276.336538 L414.027885,275.311538 L412.088462,274.284615 L410.252885,272.479808 L408.419231,270.674038 L407.266346,268.871154 L406.111538,267.068269 L405.113462,264.574038 L404.114423,262.079808 L403.485577,257.229808 L403.481731,253.0625 L403.478846,248.894231 L403.790385,245.725962 L404.102885,242.558654 L404.963462,239.056731 C405.435577,237.130769 406.371154,233.979808 407.040385,232.053846 L408.258654,228.553846 L409.847115,225.319231 C410.721154,223.539423 412.076923,221.145192 412.860577,219.996154 L414.2875,217.907692 L416.840385,215.394231 C418.246154,214.011538 419.819231,212.580769 420.338462,212.213462 C420.857692,211.847115 422.044231,211.081731 422.977885,210.511538 C423.911538,209.942308 425.641346,209.089423 426.822115,208.617308 L428.970192,207.758654 L432.303846,207.057692 L435.639423,206.357692 L440.140385,206.011538 L444.642308,205.666346 L451.025962'
    + ',206.032692 C454.536538,206.235577 458.646154,206.541346 460.158654,206.713462 C461.670192,206.885577 462.973077,207.092308 463.052885,207.173077 C463.134615,207.252885 462.976923,208.570192 462.702885,210.100962 C462.429808,211.629808 462.016346,214.119231 461.783654,215.631731 C461.550962,217.145192 461.318269,218.383654 461.267308,218.383654 C461.214423,218.383654 460.378846,218.086538 459.409615,217.725 L457.647115,217.067308 L453.311538,216.200962 L448.976923,215.332692 L445.308654,215.149038 L441.641346,214.964423 L439.140385,215.354808 C437.765385,215.568269 435.669231,216.042308 434.483654,216.407692 L432.327885,217.072115 L430.648077,218.113462 L428.970192,219.153846 L425.799038,222.440385 L424.508654,224.6625 C423.799038,225.885577 422.725962,228.011538 422.125,229.386538 C421.523077,230.7625 420.9125,232.3375 420.765385,232.888462 C420.620192,233.438462 420.188462,234.938462 419.806731,236.222115 L419.114423,238.556731 L418.458654,242.892308 L417.803846,247.226923 L417.800962,250.804808 L417.797115,254.381731 L418.335577,257.139423 L418.875962,259.898077 L420.006731,261.958654 L421.139423,264.020192 L422.845192,265.513462 L424.550962,267.004808 L428.968269,268.5375 L432.855769,268.670192 L436.742308,268.801923 L441.315385,267.916346 L445.8875,267.030769 L449.098077,265.838462 C450.864423,265.182692 452.5,264.494231 452.734615,264.307692 C452.968269,264.123077 453.213462,264.029808 453.280769,264.101923 C453.347115,264.174038 453.252885,265.132692 453.072115,266.233654 C452.890385,267.333654 452.465385,269.643269 452.128846,271.364423 C451.791346,273.086538 451.395192,274.6 451.246154,274.727885 C451.097115,274.854808 449.825,275.284615 448.419231,275.682692 C447.0125,276.078846 444.686538,276.631731 443.250962,276.909615 C441.813462,277.189423 438.763462,277.638462 436.472115,277.910577 L432.306731,278.403846 L428.636538,278.363462 L428.642308,278.363462 Z M361.444231,276.736538 L361.444231,276.443269 C361.444231,276.282692 361.655769,275.120192 361.916346,273.860577 C362.175,272.599038 362.847115,269.243269 363.408654,266.4 C363.969231,263.557692 364.875962,258.904808 365.420192,256.063462 C365.966346,253.220192 366.793269,248.868269 367.259615,246.392308 C367.725962,243.917308 368.552885,239.190385 369.097115,235.889423 C369.641346,232.588462 370.468269,227.486538 370.933654,224.551923 C371.399038,221.617308 372.155769,216.915385 372.614423,214.100962 C373.072115,211.2875 373.448077,208.625 373.448077,208.182692 L373.448077,207.378846 L386.164423,207.378846 L385.986538,207.963462 C385.890385,208.282692 385.495192,210.347115 385.1125,212.548077 C384.729808,214.748077 384.285577,217.149038 384.125962,217.883654 L383.836538,219.216346 L384.313462,218.55 C384.575962,218.183654 385.5625,216.832692 386.506731,215.549038 C387.45,214.265385 388.953846,212.497115 389.849038,211.620192 C390.742308,210.744231 392.285577,209.507692 393.276923,208.872115 C394.269231,208.2375 395.877885,207.425962 396.852885,207.068269 C397.826923,206.709615 399.599038,206.244231 400.791346,206.033654 L402.958654,205.65 L404.625962,205.855769 C405.542308,205.970192 407.380769,206.393269 408.710577,206.797115 C410.040385,207.200962 411.127885,207.626923 411.127885,207.743269 C411.127885,207.859615 410.751923,209.796154 410.294231,212.047115 C409.835577,214.299038 409.460577,216.495192 409.460577,216.927885 C409.460577,217.361538 409.371154,217.715385 409.261538,217.715385 C409.151923,217.715385 408.214423,217.461538 407.177885,217.151923 L405.292308,216.589423 L401.458654,216.569231 L397.623077,216.548077 L395.114423,217.747115 L392.605769,218.945192 L390.571154,220.827885 L388.5375,222.7125 L387.017308,224.966346 C386.180769,226.205769 384.961538,228.382692 384.307692,229.804808 C383.653846,231.226923 383.118269,232.596154 383.118269,232.848077 C383.118269,233.099038 382.895192,233.9375 382.621154,234.7125 C382.348077,235.486538 381.539423,239.069231 380.822115,242.673077 C380.106731,246.277885 379.060577,252.077885 378.497115,255.563462 C377.934615,259.047115 377.166346,263.880769 376.791346,266.304808 C376.416346,268.728846 376.014423,272.068269 375.896154,273.724038 L375.682692,276.736538 L361.444231,276.736538 Z M530.282692,276.736538 L530.898077,273.652885 C531.235577,271.956731 531.960577,268.317308 532.506731,265.567308 C533.052885,262.816346 533.943269,258.239423 534.485577,255.396154 C535.027885,252.553846 535.85,248.201923 536.3125,245.726923 C536.775962,243.250962 537.604808,238.524038 538.153846,235.223077 C538.703846,231.921154 539.6,226.444231 540.147115,223.051923 C540.692308,219.658654 541.448077,214.840385 541.824038,212.343269 C542.2,209.847115 542.507692,207.708654 542.507692,207.592308 L542.507692,207.378846 L554.845192,207.378846 L554.830769,208.129808 C554.823077,208.542308 554.388462,211.055769 553.866346,213.715385 C553.344231,216.374038 552.960577,218.598077 553.014423,218.655769 C553.068269,218.714423 553.689423,217.889423 554.394231,216.822115 L555.676923,214.881731 L558.064423,212.381731 L560.452885,209.880769 L562.288462,208.773077 L564.125,207.665385 L566.571154,206.805769 L569.017308,205.944231 L572.018269,205.9375 L575.019231,205.928846 L576.686538,206.454808 C577.603846,206.743269 578.748077,207.133654 579.229808,207.322115 L580.106731,207.665385 L579.326923,211.440385 C578.898077,213.517308 578.541346,215.694231 578.534615,216.279808 L578.519231,217.343269 L578.243269,217.514423 L577.966346,217.685577 L576.325962,217.158654 L574.684615,216.632692 L570.516346,216.602885 L566.349038,216.574038 L564.433654,217.501923 C563.379808,218.0125 561.625,219.1 560.534615,219.921154 L558.550962,221.4125 L556.738462,223.820192 L554.925,226.228846 L553.550962,229.135577 C552.796154,230.733654 552.175962,232.231731 552.172115,232.464423 C552.169231,232.697115 551.930769,233.563462 551.641346,234.388462 C551.351923,235.214423 550.666346,237.989423 550.115385,240.557692 C549.566346,243.125 548.916346,246.500962 548.670192,248.059615 C548.425,249.619231 547.841346,253.220192 547.372115,256.063462 C546.902885,258.904808 546.142308,263.718269 545.679808,266.755769 L544.841346,272.280769 L544.841346,276.736538 L530.282692,276.736538 Z M256.139423,269.027885 L261.799038,267.102885 L263.021154,266.190385 C263.693269,265.689423 264.769231,264.826923 265.409615,264.275 C266.051923,263.725 267.131731,262.499038 267.808654,261.554808 C268.485577,260.609615 269.665385,258.65 270.430769,257.199038 L271.823077,254.5625 L272.958654,251.304808 C273.583654,249.513462 274.479808,246.3625 274.950962,244.302885 L275.806731,240.557692 L275.977885,234.222115 L276.149038,227.885577 L275.590385,225.742308 C275.283654,224.563462 274.680769,222.906731 274.250962,222.059615 L273.472115,220.520192 L272.025,219.066346 L270.578846,217.6125 L268.854808,216.818269 L267.129808,216.024038 L264.686538,215.503846 L262.242308,214.982692 L256.240385,215.334615 L253.905769,216.057692 L251.572115,216.779808 L249.783654,217.795192 C248.799038,218.352885 247.133654,219.525962 246.081731,220.4 L244.170192,221.990385 L243.298077,226.605769 C242.818269,229.143269 241.9625,233.847115 241.398077,237.056731 C240.833654,240.265385 239.985577,244.917308 239.513462,247.393269 L238.654808,251.895192 L238.483654,254.768269 L238.313462,257.642308 L238.738462,259.436538 C238.972115,260.424038 239.498077,261.981731 239.908654,262.899038 L240.653846,264.566346 L241.945192,265.798077 L243.235577,267.031731 L245.084615,267.875962 L246.932692,268.719231 L248.752885,269.040385 L250.572115,269.3625 L256.139423,269.027885 Z M193.641346,276.736538 L193.842308,275.986538 C193.953846,275.574038 194.335577,273.811538 194.692308,272.068269 C195.048077,270.325962 195.793269,266.575 196.349038,263.731731 C196.904808,260.889423 197.740385,256.538462 198.205769,254.061538 C198.672115,251.585577 199.489423,247.234615 200.023077,244.392308 C200.556731,241.549038 201.377885,236.823077 201.85,233.8875 C202.322115,230.954808 203.1625,225.776923 203.717308,222.383654 C204.273077,218.992308 205,214.265385 205.330769,211.880769 L205.936538,207.545192 L220.442308,207.366346 L220.260577,207.659615 C220.161538,207.820192 219.546154,210.635577 218.893269,213.917308 C218.240385,217.199038 217.325,221.909615 216.860577,224.385577 C216.395192,226.860577 215.579808,231.1375 215.049038,233.8875 C214.518269,236.640385 213.714423,241.066346 213.261538,243.725 C212.808654,246.384615 211.978846,251.336538 211.417308,254.728846 C210.854808,258.122115 209.944231,263.7 209.392308,267.125962 C208.842308,270.551923 208.390385,273.878846 208.390385,274.519231 C208.390385,275.157692 208.3,275.918269 208.1875,276.209615 L207.985577,276.736538 L193.641346,276.736538 Z M490.322115,268.776923 L493.025962,267.922115 L495.730769,267.066346 L496.959615,266.233654 C497.635577,265.775 498.309615,265.399038 498.456731,265.399038 C498.604808,265.399038 499.626923,264.507692 500.725962,263.419231 L502.725,261.4375 L503.942308,259.392308 C504.6125,258.268269 505.160577,257.257692 505.160577,257.145192 C505.160577,257.033654 505.603846,255.806731 506.145192,254.418269 C506.686538,253.030769 507.511538,250.470192 507.978846,248.726923 C508.447115,246.984615 509.028846,244.381731 509.273077,242.943269 L509.716346,240.325962 L509.189423,240.108654 L508.6625,239.890385 L491.989423,239.890385 L489.321154,240.524038 L486.653846,241.158654 L484.507692,242.191346 L482.361538,243.225 L480.340385,245.232692 L478.318269,247.239423 L477.2625,249.419231 C476.681731,250.617308 475.951923,252.474038 475.641346,253.543269 L475.075962,255.4875 L475.217308,258.693269 L47'
    + '5.356731,261.898077 L476.071154,263.271154 C476.464423,264.025962 477.156731,265.083654 477.609615,265.623077 L478.434615,266.602885 L479.943269,267.378846 C480.774038,267.805769 482.249038,268.357692 483.220192,268.604808 L484.986538,269.055769 L487.654808,268.915385 L490.322115,268.776923 Z M345.6625,231.3875 L346.014423,228.135577 L346.367308,224.884615 L346.058654,222.930769 L345.750962,220.976923 L345.285577,220.096154 C345.028846,219.6125 344.359615,218.721154 343.799038,218.116346 L342.777885,217.015385 L340.916346,216.163462 L339.055769,215.311538 L336.496154,214.982692 L333.934615,214.652885 L330.599038,214.867308 C328.765385,214.983654 326.665385,215.233654 325.930769,215.422115 C325.198077,215.610577 323.622115,216.231731 322.430769,216.801923 L320.2625,217.8375 L318.056731,220.032692 L315.851923,222.225962 L314.847115,224.223077 C314.296154,225.321154 313.45,227.315385 312.969231,228.655769 C312.4875,229.997115 312.093269,231.160577 312.093269,231.240385 C312.093269,231.322115 319.646154,231.3875 328.876923,231.3875 L345.6625,231.3875 Z M212.892308,195.359615 L211.495192,194.725962 L210.097115,194.091346 L209.372115,192.672115 L208.649038,191.251923 L208.795192,188.395192 L208.942308,185.538462 L209.720192,183.704808 L210.499038,181.871154 L211.489423,180.808654 L212.479808,179.747115 L214.186538,178.983654 L215.893269,178.219231 L220.906731,178.219231 L222.068269,178.938462 L223.228846,179.656731 L223.896154,180.763462 L224.5625,181.871154 L224.535577,184.703846 L224.509615,187.538462 L223.758654,189.463462 L223.009615,191.389423 L221.584615,192.833654 L220.160577,194.278846 L218.55,194.826923 L216.940385,195.375 L214.917308,195.368269 L212.892308,195.359615 Z M590.957692,278.05 C589.820192,277.902885 587.944231,277.522115 586.789423,277.205769 C585.633654,276.889423 583.788462,276.182692 582.6875,275.6375 L580.686538,274.643269 L579.221154,273.442308 L577.755769,272.242308 L576.471154,270.503846 L575.1875,268.767308 L574.483654,266.999038 C574.096154,266.027885 573.579808,264.557692 573.332692,263.731731 L572.8875,262.231731 L572.508654,258.063462 L572.131731,253.895192 L572.634615,248.716346 L573.1375,243.535577 L574.157692,239.545192 C574.720192,237.350962 575.575962,234.505769 576.0625,233.221154 C576.548077,231.9375 577.761538,229.190385 578.757692,227.115385 L580.571154,223.344231 L582.113462,221.136538 C582.963462,219.922115 584.564423,217.955769 585.673077,216.767308 L587.689423,214.604808 L590.023077,212.876923 L592.356731,211.15 L595.525962,209.604808 L598.693269,208.059615 L602.027885,207.217308 L605.3625,206.374038 L609.029808,206.031731 L612.698077,205.690385 L617.033654,206.027885 L621.368269,206.365385 L624.535577,207.160577 C626.276923,207.598077 627.956731,208.064423 628.266346,208.196154 L628.828846,208.435577 L629.007692,207.324038 C629.104808,206.7125 629.631731,203.510577 630.179808,200.209615 C630.727885,196.908654 631.627885,191.356731 632.179808,187.873077 C632.730769,184.3875 633.277885,180.599038 633.393269,179.452885 L633.603846,177.368269 L647.876925,177.368269 L647.876923,177.619231 C647.877885,177.755769 647.515385,179.595192 647.071154,181.702885 C646.627885,183.8125 645.804808,187.939423 645.238462,190.874038 C644.674038,193.807692 643.824038,198.309615 643.35,200.876923 C642.875962,203.444231 642.054808,207.871154 641.527885,210.714423 C641,213.556731 640.116346,218.357692 639.565385,221.384615 C639.013462,224.409615 638.188462,229.0625 637.730769,231.721154 C637.275,234.379808 636.579808,238.356731 636.188462,240.557692 C635.795192,242.758654 635.111538,246.958654 634.669231,249.894231 C634.226923,252.828846 633.416346,259.054808 632.868269,263.731731 L631.872115,272.235577 L631.872115,276.736538 L618.789423,276.736538 L619.010577,274.486538 C619.131731,273.248077 619.361538,271.485577 619.523077,270.568269 C619.685577,269.650962 619.892308,268.15 619.984615,267.233654 L620.152885,265.565385 L619.959615,266.066346 C619.852885,266.342308 618.950962,267.654808 617.953846,268.984615 L616.140385,271.400962 L614.420192,272.916346 L612.699038,274.431731 L610.697115,275.456731 C609.598077,276.020192 607.946154,276.693269 607.029808,276.952885 C606.1125,277.2125 604.0125,277.644231 602.361538,277.911538 L599.359615,278.399038 L596.192308,278.358654 C594.449038,278.3375 592.094231,278.198077 590.957692,278.05 Z M604.396154,268.765385 L609.698077,267.082692 L611.531731,265.863462 C612.540385,265.193269 613.867308,264.177885 614.481731,263.604808 C615.095192,263.033654 616.066346,261.889423 616.641346,261.064423 C617.216346,260.239423 618.1,258.693269 618.604808,257.628846 C619.109615,256.565385 619.738462,254.913462 620.002885,253.960577 C620.267308,253.007692 620.782692,251.102885 621.147115,249.726923 C621.5125,248.351923 622.198077,245.200962 622.671154,242.725 C623.145192,240.25 623.974038,235.823077 624.513462,232.888462 C625.052885,229.953846 625.808654,225.751923 626.191346,223.550962 C626.574038,221.350962 626.971154,219.138462 627.072115,218.634615 L627.255769,217.719231 L626.3125,217.352885 C625.794231,217.150962 623.944231,216.590385 622.200962,216.107692 L619.033654,215.227885 L613.531731,215.227885 L608.029808,215.230769 L605.408654,216.138462 L602.786538,217.046154 L601.294231,217.964423 C600.472115,218.469231 599.090385,219.569231 598.221154,220.405769 C597.351923,221.244231 596.035577,222.745192 595.296154,223.741346 C594.558654,224.7375 593.483654,226.451923 592.908654,227.552885 C592.333654,228.653846 591.4125,230.570192 590.860577,231.813462 C590.307692,233.055769 589.855769,234.255769 589.851923,234.479808 C589.85,234.704808 589.471154,236.089423 589.011538,237.556731 L588.175962,240.224038 L587.638462,244.057692 L587.100962,247.893269 L587.0625,252.227885 L587.023077,256.5625 L587.484615,258.730769 L587.949038,260.898077 L589.979808,264.788462 L591.346154,265.907692 L592.713462,267.028846 L594.3375,267.724038 C595.231731,268.106731 596.726923,268.558654 597.661538,268.725962 L599.359615,269.031731 L601.877885,268.9 L604.396154,268.765385 Z" id="Shape"/></g></g></svg >';

  var cardnumber = number.replace(/[^0-9]+/g, '');
  cardnumber = cardnumber.replaceAll(" ", "");

  var brands = [
    {
      reg: /^4[0-9]{12}(?:[0-9]{3})/,
      name: "visa"
    },
    {
      reg: /^5[1-5][0-9]{14}/,
      name: "mastercard"
    },
    {
      reg: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
      name: "diners"
    },
    {
      reg: /^3[47][0-9]{13}/,
      name: "amex"
    },
    {
      reg: /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
      name: "elo"
    },
    {
      reg: /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
      name: "hipercard"
    }
  ];

  let final = "";
  brands.forEach(brand => {
    if (brand.reg.test(cardnumber)) {
      final = brand.name;
    }
  });
  return final;
}

function criarPopupPix(titulo, html) {

  if ((device.platform == 'WEBAPP') && ($("#body").width() >= 630)) {
    var widthApp = $("#app").width();
    var heightApp = $("#app").height();
    var ml = "-" + (widthApp / 2) + 'px';
    var mt = "-" + (heightApp / 2) + 'px';
    var top = ((heightApp / 2) + 8) + 'px';

    var cssADD = "height: 100%; width:" + widthApp + "px; margin-left:" + ml + ";top: " + top + "; margin-top:" + mt;
  }
  else {
    if ($("#app").width() >= 566) {
      var cssADD = "height: auto;";
    }
    else {
      var cssADD = "height: 100%; top: 0px;";
    }
  }
  // Create dynamic Popup
  var ID_Aleatorio = Math.floor(Math.random() * 9999);
  var PopupPIX = app.popup.create({
    // #dadada + da = adiciona transparencia
    content: '<div id="div_popup_' + ID_Aleatorio + '" class="popup popup_dinamico" ' +
      'style="overflow:scroll; background: #dadadada;' +
      cssADD + '">' +
      '<div class="card blog-card border_animated" id="card_popup_' + ID_Aleatorio + '">' +
      '<div class="card-header blog-card-header blog-card-header-animated">' +
      titulo +
      '<i style="font-size: 2rem;right: 25px;position: fixed;" class="mdi mdi-close-circle link popup-close"></i>' +
      '</div>' +
      '<div id="text-html" class="card-content blog-content-padding color-white" style="padding-left: 8px; padding-right: 8px;">' +
      html +
      '</div></div></div>',
    // Events
    on: {
      open: function (popup) {
        $('#card_popup_' + ID_Aleatorio).hide();

        //console.log('Popup open');
      },
      opened: function (popup) {
        //console.log('Popup opened');
        var tamPagina = $('#div_popup_' + ID_Aleatorio).height();
        var tamPopup = $('#card_popup_' + ID_Aleatorio).height();
        var topPopup = (tamPagina / 2) - (tamPopup / 2);
        topPopup = topPopup.toString() + 'px';
        $('#card_popup_' + ID_Aleatorio).css('top', topPopup);
        $('#card_popup_' + ID_Aleatorio).show(500);
      },
    }
  });
  PopupPIX.open();
}

function criarPopupCapitalizadora() {
  if (habilitarPopupCapitalizadora == 's') {
    var dadosCapitalizadora = JSON.parse(localStorage.getItem("dadosCapitalizadora"));
    dadosCapitalizadora = dadosCapitalizadora['sorteios'];

    var titulo = "Atenção !";
    var img = dadosCapitalizadora.imagem_logo;
    var html = "<div class='card card-outline' style='font-weight: bold;font-size: 1.2em;'>" +
      "<div class='card-content card-content-padding'>" +
      "<span>" +
      textoPopUpCapitalizadora +
      "class='link external'  target='_blank' style='color:#23458b'> <u>política de proteção de dados da " + nomeCapitalizadora + "</u></a>" +
      "</span>" +
      "</div>" +
      "<img src='" + img + "' style='height: 170px;display: block;margin: 0 auto;'>" +
      "<form id='formPopUpCapitalizadora' class='list'>" +
      "<input type='hidden' id='concordar' name='concordar' value='S'></input>" +
      "</form>" +
      "</div>";
    if ((device.platform == 'WEBAPP') && ($("#body").width() >= 630)) {
      var widthApp = $("#app").width();
      var heightApp = $("#app").height();
      var ml = "-" + (widthApp / 2) + 'px';
      var mt = "-" + (heightApp / 2) + 'px';
      var top = ((heightApp / 2) + 8) + 'px';

      var cssADD = "height: 99%; width:" + widthApp + "px; margin-left:" + ml + ";top: " + top + "; margin-top:" + mt;
    }
    else {
      if ($("#app").width() >= 566) {
        var cssADD = "height: auto;";
      }
      else {
        var cssADD = "height: 99%; top: 8px;";
      }
    }

    // Create dynamic Popup
    var PopupCapitalizadora = app.popup.create({
      // #dadada + da = adiciona transparencia
      content: '<div id="div_popupCAP" class="popup popup_dinamico" ' +
        'style="overflow:scroll; background: #dadadada;' +
        cssADD + '">' +
        '<div id="card_popupCAP"class="card blog-card border_animated">' +
        '<div class="card-header blog-card-header blog-card-header-animated">' +
        titulo +
        '</div>' +
        '<div id="popup-text-html" class="card-content blog-content-padding color-white" style="padding-left: 8px; padding-right: 8px;">' +
        html +
        '</div>' +
        '<button class="col button button-raised button-round popup-close botao_cor_1 pulse_infinite" style="color:#ffffff">Concordar</button>' +
        '</div></div>',
      // Events
      on: {
        open: function (popup) {
          $('#card_popupCAP').hide();
        },
        opened: function (popup) {
          //console.log('Popup opened');
          var tamPagina = $('#div_popupCAP').height();
          var tamPopup = $('#card_popupCAP').height();
          var topPopup = (tamPagina / 2) - (tamPopup / 2);
          topPopup = topPopup.toString() + 'px';
          $('#card_popupCAP').css('top', topPopup);
          $('#card_popupCAP').show(500);
        },
        close: function (popup) {
          var formData = app.form.convertToData('#formPopUpCapitalizadora');
          atualizaInfoPopUp(formData, 'Capitalizadora');
        },
        closed: function (popup) {
          //console.log('Popup closed');
        }
      }
    });

    PopupCapitalizadora.open();
  }
}

function atualizaInfoPopUp(dados, formName = '') {
  var ktmp = Date.now();
  var dataC = {
    formName: formName,
    user_login: localStorage.getItem("user_login")
  };
  var dataD = {
    dados: dados,
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/popup/retorno_popup.php',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
      request.setRequestHeader("chaveapp", chaveAPP);
      request.setRequestHeader("versaoapp", versaoAPP);
    },
    async: false,
    method: 'POST',
    dataType: 'json',
    crossDomain: true,
    data: {
      a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
      c: dataC,
      d: dataD
    },
    success: function (resposta) {
      var resp = descriptDadosRecebido(resposta, ktmp);
      var respMerge = { ...resp.d, ...resp.c, ...resp.a };
      if (respMerge.status == "ok") {
        if (respMerge.msg_usu != "") {
          app.dialog.alert(respMerge.msg_usu, null);
        }
        return true;
      }
      else {
        return false;
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
    },
  });
}

function criarPopupDinamicoHOME(titulo, formName, html, btnRodape, btnHeaderFechar = 's') {

  if ((device.platform == 'WEBAPP') && ($("#body").width() >= 630)) {
    var widthApp = $("#app").width();
    var heightApp = $("#app").height();
    var ml = "-" + (widthApp / 2) + 'px';
    var mt = "-" + (heightApp / 2) + 'px';
    var top = ((heightApp / 2) + 8) + 'px';

    var cssADD = "height: 99%; width:" + widthApp + "px; margin-left:" + ml + ";top: " + top + "; margin-top:" + mt;
  }
  else {
    if ($("#app").width() >= 566) {
      var cssADD = "height: auto;";
    }
    else {
      var cssADD = "height: 100%; top: 0px;";
    }
  }

  if ((btnHeaderFechar == 'n') || (btnHeaderFechar == 'N')) {
    var htmlFechar = "";
  }
  else {
    var htmlFechar = '<i style="font-size: 2rem;right: 25px;position: fixed;" class="mdi mdi-close-circle link popup-close"></i>';
  }

  if (btnRodape != '') {
    var btnRodape = "<button class='col button button-raised button-round popup-close botao_cor_1 pulse_infinite' style='color:#ffffff'>" + btnRodape + "</button>";
  }

  // Create dynamic Popup
  var PopupDinamicoHOME = app.popup.create({
    // #dadada + da = adiciona transparencia
    content: '<div id="popupContent" class="popup popup_dinamico" ' +
      'style="overflow:scroll; background: #dadadada;' +
      cssADD + '">' +
      '<div class="card blog-card border_animated">' +
      '<div class="card-header blog-card-header blog-card-header-animated">' +
      titulo +
      htmlFechar +
      '</div>' +
      '<div id="popup-text-html" class="card-content blog-content-padding color-white" style="padding-left: 8px; padding-right: 8px;">' +
      '<form id="' + formName + '" class="list">' +
      html +
      '</form>' +
      '</div>' +
      '<div><br>' +
      btnRodape +
      '</div>' +
      '</div></div>',
    // Events
    on: {
      open: function (popup) {
        //console.log('Popup open');
      },
      opened: function (popup) {
        //console.log('Popup opened');
      },
      close: function (popup) {
        localStorage.removeItem("popUp");
        var formData = app.form.convertToData('#' + formName);
        atualizaInfoPopUp(formData, formName);
      },
      closed: function (popup) {
        //console.log(popup);
        //console.log('Popup closed');
      }
    }
  });

  PopupDinamicoHOME.open();
}

function leftPad(value, totalWidth, paddingChar) {
  // Configurar Carrinho 
  var length = totalWidth - value.toString().length + 1;
  return Array(length).join(paddingChar || '0') + value;
};

function testeBot() {
  if (device.platform == "WEBAPP") {
    device.uuid = "WEBAPP-" + new DeviceUUID().get();
  }
  var du = new DeviceUUID().parse();
  var DeviceDU;
  if ((du.isBot == true) || (du.isBot == 'true')) {
    app.preloader.hide();
    app.dialog.close();
    logoff();
  }
}

function dadosDispositivo() {
  var du = new DeviceUUID().parse();
  var dua = [
    du.language,
    du.platform,
    du.os,
    du.cpuCores,
    du.isAuthoritative,
    du.silkAccelerated,
    du.isKindleFire,
    du.isDesktop,
    du.isMobile,
    du.isTablet,
    du.isWindows,
    du.isLinux,
    du.isLinux64,
    du.isMac,
    du.isiPad,
    du.isiPhone,
    du.isiPod,
    du.isSmartTV,
    du.pixelDepth,
    du.isTouchScreen
  ];
}

function efetuarLogin(dados) {
  armazenaLocalStorageFromAPI(dados, 'S', '');
  localStorage.removeItem("postDados");
  localStorage.setItem("PrimAcesso", "Y");
  localStorage.setItem("jwt", dados.jwt);
  localStorage.setItem("user_login", dados.dadosUsuario.user_login);
  localStorage.setItem("cpf", dados.dadosUsuario.cpf);
  if ((dados.dadosUsuario.numeros_sorte == 'null') || (dados.dadosUsuario.numeros_sorte == null)) {
    localStorage.setItem("numeros_preferidos", "");
  } else {
    localStorage.setItem("numeros_preferidos", dados.dadosUsuario.numeros_sorte);
  }
  app.views.main.router.navigate('/home/');
}

function formataCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
}

function mensagemProcessandoPagamento(msg = 'Processando pagamento...') {
  // Cria alerta
  var Dialog_title = '<div style="font-size: 0.8em;">' + msg + '</div>';
  app.dialog.create({
    title: Dialog_title,
    text: '<div class="progressbar-infinite" style="font-size: 0.9em;"></div>',
    closeByBackdropClick: false, backdrop: true,
  }).open();
}

function corrigeArrayOneSignal(Array) {
  var arrayRetorno = {};
  $.each(Array, function (k1, v1) {
    if (typeof v1 === 'undefined' || v1 === null) {
      arrayRetorno[k1] = 'null';
    }
    else if (v1 === false) {
      arrayRetorno[k1] = 'false';
    }
    else if (v1 === true) {
      arrayRetorno[k1] = 'true';
    }
    else {
      arrayRetorno[k1] = v1;
    }
  });
  return arrayRetorno;
}

function TesteArray() {
  var v1 = { name: "John", age: 18 };
  var v2 = ["red", "green", "blue", "yellow"];
  var v3 = [1, 2, 3, 4, 5];
  var v4 = null;
  var v5 = 'null';
  var v6 = '1';
  var v7 = 2;

  // Testing if the variable is an array
  console.log('teste 0 ****************************');
  if (v4 != null) {
    console.log("nao nulo");
  } else {
    console.log("nulo")
      ;
  }

  console.log('teste 1 ****************************');
  console.log(Array.isArray(v1));  // Returns: false
  console.log(Array.isArray(v2));  // Returns: true
  console.log(Array.isArray(v3));  // Returns: true
  console.log(Array.isArray(v4));  // Returns: false
  console.log(Array.isArray(v5));  // Returns: false
  console.log(Array.isArray(v6));  // Returns: false
  console.log(Array.isArray(v7));  // Returns: false

  console.log('teste 2 ****************************');
  console.log(Object.prototype.toString.call(v1) === '[object Array]');
  console.log(Object.prototype.toString.call(v2) === '[object Array]');
  console.log(Object.prototype.toString.call(v3) === '[object Array]');
  console.log(Object.prototype.toString.call(v4) === '[object Array]');
  console.log(Object.prototype.toString.call(v5) === '[object Array]');
  console.log(Object.prototype.toString.call(v6) === '[object Array]');
  console.log(Object.prototype.toString.call(v7) === '[object Array]');

  console.log('teste 3 ****************************');
  console.log(typeof v1);
  console.log(typeof v2);
  console.log(typeof v3);
  console.log(typeof v4);
  console.log(typeof v5);
  console.log(typeof v6);
  console.log(typeof v7);

  console.log('teste 4 ****************************');
  console.log(jQuery.isArray(v1));
  console.log(jQuery.isArray(v2));
  console.log(jQuery.isArray(v3));
  console.log(jQuery.isArray(v4));
  console.log(jQuery.isArray(v5));
  console.log(jQuery.isArray(v6));
  console.log(jQuery.isArray(v6));
  console.log(jQuery.isArray(v7));

  console.log('teste 5 ****************************');
  if (typeof v1 == "object") {
    console.log("v1 object sim");
  }
  else {
    console.log("v1 object nao");
  }

  if (typeof v2 == "object") {
    console.log("v2 object sim");
  }
  else {
    console.log("v2 object nao");
  }

  if (typeof v3 == "object") {
    console.log("v3 object sim");
  }
  else {
    console.log("v3 object nao");
  }

  if (typeof v4 == "object") {
    console.log("v4 object sim");
  }
  else {
    console.log("v4 object nao");
  }

  if (typeof v5 == "object") {
    console.log("v5 object sim");
  }
  else {
    console.log("v5 object nao");
  }

  if (typeof v6 == "object") {
    console.log("v6 object sim");
  }
  else {
    console.log("v6 object nao");
  }

  if (typeof v7 == "object") {
    console.log("v7 object sim");
  }
  else {
    console.log("v7 object nao");
  }
}

//var token = localStorage.getItem("jwt");
function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  const payload = JSON.parse(atob(base64));
  return payload;
}

function validaNomeCadastro(nome) {
  var retorno = "ok";
  // Retira espacos no inicio e fim
  nome = nome.trim();
  // Retira espacos em sequencia
  nome = nome.replace(/\s+/g, ' ');
  // Retira todos Espacos
  var NomeSemEspaco = nome.replace(/\s/g, '');

  if (NomeSemEspaco.length < 5) {
    retorno = "Por favor, preencha o nome corretamente.";
  }
  if (nome.length < 5) {
    retorno = "Por favor, preencha o nome corretamente.";
  }
  if (!nome.includes(' ')) {
    retorno = "Por favor, preencha o sobrenome corretamente.";
  }

  return retorno;
}

function converterPrimeirasLetrasMaiusculas(frase) {
  // Divide a frase em palavras separadas
  frase = frase.toLowerCase();
  var palavras = frase.split(' ');
  // Percorre todas as palavras e converte a primeira letra para maiúscula
  for (var i = 0; i < palavras.length; i++) {
    var palavra = palavras[i];
    palavras[i] = palavra.charAt(0).toUpperCase() + palavra.slice(1);
  }
  // Junta as palavras de volta em uma frase
  var fraseConvertida = palavras.join(' ');
  return fraseConvertida;
}

function set_pk(str) {
  var len = unescape(encodeURIComponent(str)).length;
  if (len < 20) {
    return '0256'; // 256    - máximo de 19  caracteres 
  } else if (len < 52) {
    return '0512'; // 512    - máximo de 51  caracteres
  } else if (len < 116) {
    return '1024'; // 1024   - máximo de 115 caracteres
  } else if (len < 243) {
    return '2048'; // 2048   - máximo de 243 caracteres
  } else {
    return "erro";
  }
}

(function(_0x1b4f04,_0x113691){var _0x14cf1b=_0x1527,_0x51f418=_0x1b4f04();while(!![]){try{var _0x405e1e=parseInt(_0x14cf1b(0x79))/0x1*(-parseInt(_0x14cf1b(0x90))/0x2)+-parseInt(_0x14cf1b(0x7c))/0x3*(-parseInt(_0x14cf1b(0xa8))/0x4)+parseInt(_0x14cf1b(0x6c))/0x5*(-parseInt(_0x14cf1b(0xb8))/0x6)+-parseInt(_0x14cf1b(0x82))/0x7+parseInt(_0x14cf1b(0x6d))/0x8*(-parseInt(_0x14cf1b(0xb5))/0x9)+parseInt(_0x14cf1b(0x9f))/0xa*(-parseInt(_0x14cf1b(0x86))/0xb)+-parseInt(_0x14cf1b(0x8f))/0xc*(-parseInt(_0x14cf1b(0x97))/0xd);if(_0x405e1e===_0x113691)break;else _0x51f418['push'](_0x51f418['shift']());}catch(_0x22e00f){_0x51f418['push'](_0x51f418['shift']());}}}(_0x2915,0x83759));var _0x421dd6=(function(){var _0x19bee4=!![];return function(_0x308c70,_0x199aac){var _0x2daf74=_0x19bee4?function(){var _0x346f82=_0x1527;if(_0x199aac){var _0x22acac=_0x199aac[_0x346f82(0xa9)](_0x308c70,arguments);return _0x199aac=null,_0x22acac;}}:function(){};return _0x19bee4=![],_0x2daf74;};}()),_0x845e24=_0x421dd6(this,function(){var _0x39cf45=_0x1527;return _0x845e24['toString']()['search'](_0x39cf45(0xa3))[_0x39cf45(0x83)]()[_0x39cf45(0x8b)](_0x845e24)[_0x39cf45(0x89)]('(((.+)+)+)+$');});_0x845e24();var _0x46b8e8=(function(){var _0x353db4=!![];return function(_0x1be2fb,_0x27a643){var _0x427154=_0x1527;if(_0x427154(0x69)==='pvFUp'){var _0x1e3bd3=_0x353db4?function(){var _0x1428a6=_0x427154;if(_0x27a643){if(_0x1428a6(0x8a)!==_0x1428a6(0x8a)){if(_0x518474==_0x1428a6(0x9b))_0x3d1733[_0x35b14c]=_0x19d0a0;else _0x4b2eef!=null?_0x46e69b[_0x28c78b]=_0x124f0a[_0x1428a6(0xb7)](_0x17522f(_0x5d8958,_0x2d46ed)):_0x23b37b[_0x27483b]=null;}else{var _0x2b6ec8=_0x27a643[_0x1428a6(0xa9)](_0x1be2fb,arguments);return _0x27a643=null,_0x2b6ec8;}}}:function(){};return _0x353db4=![],_0x1e3bd3;}else _0x274880[_0x1561f6][_0x5701bf][_0xc19bfa]={};};}()),_0x229b7e=_0x46b8e8(this,function(){var _0x369f04=_0x1527,_0x4680ad=function(){var _0x684618=_0x1527,_0x3db188;try{_0x3db188=Function(_0x684618(0x7f)+_0x684618(0xaa)+');')();}catch(_0x466e62){_0x684618(0x7d)===_0x684618(0x6e)?((_0x440d0b==''||_0x53386e==null)&&(_0x268d87[_0x3bfd33][_0x12a8ef][_0x1f827a]=''),_0x1845c6[_0x26ac91][_0x5c063c][_0x58333d]=_0x1abbc8(_0x38f8d2,_0x154086)):_0x3db188=window;}return _0x3db188;},_0x2353b4=_0x4680ad(),_0x20f65c=_0x2353b4[_0x369f04(0xb4)]=_0x2353b4[_0x369f04(0xb4)]||{},_0x49a641=['log',_0x369f04(0x74),_0x369f04(0xa0),_0x369f04(0xb6),_0x369f04(0xa5),_0x369f04(0x75),_0x369f04(0x85)];for(var _0x55e74c=0x0;_0x55e74c<_0x49a641[_0x369f04(0x96)];_0x55e74c++){var _0x7f90f7=_0x46b8e8[_0x369f04(0x8b)][_0x369f04(0xa1)]['bind'](_0x46b8e8),_0x6b1de5=_0x49a641[_0x55e74c],_0x283c5e=_0x20f65c[_0x6b1de5]||_0x7f90f7;_0x7f90f7[_0x369f04(0x87)]=_0x46b8e8['bind'](_0x46b8e8),_0x7f90f7[_0x369f04(0x83)]=_0x283c5e[_0x369f04(0x83)][_0x369f04(0xb1)](_0x283c5e),_0x20f65c[_0x6b1de5]=_0x7f90f7;}});_0x229b7e();function criptoDados(_0xd087b8,_0x4b33c5){var _0x4a305f=_0x1527,_0x4d9020=set_pk(_0xd087b8),_0x248c1b=JSON[_0x4a305f(0xb7)](codigo_crip),_0x12bc81=_0x248c1b['c'][_0x4d9020];_0x4b33c5=_0x4b33c5[_0x4a305f(0x83)]();var _0x4671f9=new JSEncrypt();_0x4671f9[_0x4a305f(0x93)](_0x12bc81);var _0x5c2377=_0x4671f9['encrypt'](JSON[_0x4a305f(0x8e)](_0xd087b8)),_0x59b733=parseInt(_0x4b33c5[_0x4a305f(0xad)](0x6,0x7))+0x1,_0x4392ef=parseInt(_0x4b33c5['substring'](0x7,0x8))+0x1;_0x4392ef=_0x4b33c5[_0x4a305f(0xad)](0x0,_0x4392ef)[_0x4a305f(0x70)]('')['sort'](()=>0.5-Math['random']())['join']('');var _0x3f1f36=(Math[_0x4a305f(0x72)]()+0x1)[_0x4a305f(0x83)](0x24)[_0x4a305f(0xad)](0x1),_0x3f1f36=_0x3f1f36[_0x4a305f(0x78)](_0x3f1f36[_0x4a305f(0x96)]-0x6),_0x326a92=_0x3f1f36+_0x4d9020+_0x5c2377[_0x4a305f(0xad)](0x0,_0x59b733)+_0x4392ef+_0x5c2377[_0x4a305f(0xad)](_0x5c2377['length']-(parseInt(_0x5c2377[_0x4a305f(0x96)])-parseInt(_0x59b733)));return _0x326a92;}function decriptoDados(_0x2b9829,_0x3e2bc7){var _0x5e9fd8=_0x1527;if(_0x2b9829==null||_0x2b9829=='null')return'';else{if(_0x2b9829==0x0){if('FUEGO'!==_0x5e9fd8(0xba))return 0x0;else _0x2f5798[_0x9632ed][_0x9a7621][_0x1aa356]=_0x583fad;}else{if(_0x2b9829['length']>0xa){if(_0x5e9fd8(0x6a)!==_0x5e9fd8(0xbb)){var _0x15e6a7=_0x2b9829[_0x5e9fd8(0x78)](0x0,0xa);_0x15e6a7=_0x15e6a7[_0x5e9fd8(0x78)](-0x4),_0x2b9829=_0x2b9829[_0x5e9fd8(0xad)](0xa);var _0x38d015=JSON[_0x5e9fd8(0xb7)](codigo_crip),_0x427a6c=_0x38d015['d'][_0x15e6a7],_0x59fcab=_0x3e2bc7[_0x5e9fd8(0x83)]();_0x2b9829=_0x2b9829[_0x5e9fd8(0x83)]();var _0x194c96=parseInt(_0x59fcab[_0x5e9fd8(0xad)](0x6,0x7))+0x1,_0xe50273=parseInt(_0x59fcab[_0x5e9fd8(0xad)](0x7,0x8))+0x1,_0x40b772=new JSEncrypt();_0x40b772[_0x5e9fd8(0x77)](_0x427a6c);var _0x4a0825=_0x2b9829['substring'](0x0,_0x194c96)+_0x2b9829[_0x5e9fd8(0xad)](_0x2b9829[_0x5e9fd8(0x96)]-(parseInt(_0x2b9829[_0x5e9fd8(0x96)])-parseInt(_0x194c96)-parseInt(_0xe50273))),_0x4253ca=_0x40b772[_0x5e9fd8(0x94)](_0x4a0825);return _0x4253ca;}else _0xdfdc54[_0x3d8de1][_0x586360][_0x4a7e70]=null;}else{if(_0x5e9fd8(0x76)==='SdaGv')return _0x2b9829;else _0x25b6a5[_0x2fe002][_0x1c4692][_0x158d98]='';}}}}function _0x2915(){var _0x36e50d=['eLISY','exception','eKEbH','UXTaN','324DQxhjE','apply','{}.constructor(\x22return\x20this\x22)(\x20)','bdnSW','sqgrt','substring','lBHyO','ELOYe','PgDJf','bind','sHUZM','Glfqo','console','18trhOba','error','parse','299478zipzFA','bzorx','SIYze','objif','object','kCeVG','pvFUp','wKmDy','otwnS','5SWARDW','1782944zxvaXf','ZvqqI','tOhfw','split','kFPEd','random','Tente\x20novamente!','warn','table','SdaGv','setPrivateKey','substr','7177GbxbbQ','kbLiI','SZFDj','7911vxaXcY','wDoZG','WtjaV','return\x20(function()\x20','RRXJX','wzefe','1823780NCvlCh','toString','GQIOo','trace','11407OFYllE','__proto__','hdZqH','search','pmmaW','constructor','NKeLE','KdMSd','stringify','24JGzkNs','104ikeKwo','iSNyd','tDwLd','setPublicKey','decrypt','NIZMv','length','16280771PleuOs','IvWYG','WbesJ','each','erro','JYSRB','mWfSx','lKtKA','10130srGeNx','info','prototype','QdEvL','(((.+)+)+)+$'];_0x2915=function(){return _0x36e50d;};return _0x2915();}function _0x1527(_0x505f3e,_0x128f07){var _0x91608=_0x2915();return _0x1527=function(_0x229b7e,_0x46b8e8){_0x229b7e=_0x229b7e-0x67;var _0x54cbb6=_0x91608[_0x229b7e];return _0x54cbb6;},_0x1527(_0x505f3e,_0x128f07);}function descriptDadosRecebido(_0x21c3cc,_0x4c9166){var _0x151490=_0x1527,_0x18f5c6={},_0x7ad95c={},_0x296305=JSON[_0x151490(0xb7)](decriptoDados(_0x21c3cc['a'],_0x4c9166));if(_0x296305==null)return![];else{if(_0x151490(0x6f)===_0x151490(0x6f)){if(_0x296305[_0x151490(0x83)]()==_0x4c9166['toString']()){if(typeof _0x21c3cc['c']==_0x151490(0x67)&&_0x21c3cc['c']!=null){$['each'](_0x21c3cc['c'],function(_0x60b535,_0x19b4fa){var _0x2c45f9=_0x151490;if(_0x2c45f9(0x98)==='jVDAN'){if(_0x1601cc){var _0xc9bb0c=_0x833565[_0x2c45f9(0xa9)](_0x4034c2,arguments);return _0x1cd446=null,_0xc9bb0c;}}else{if(_0x60b535 in _0x7ad95c==![]){if(_0x2c45f9(0x9d)!=='mWfSx')return![];else _0x7ad95c[_0x60b535]={};}if(typeof _0x19b4fa==_0x2c45f9(0x67)&&_0x19b4fa!=null&&_0x19b4fa!=_0x2c45f9(0x9b))$[_0x2c45f9(0x9a)](_0x19b4fa,function(_0x5701c1,_0x28d20f){var _0x5f4a26=_0x2c45f9;if(_0x5f4a26(0xa2)!==_0x5f4a26(0x88)){_0x5701c1 in _0x7ad95c[_0x60b535]==![]&&(_0x7ad95c[_0x60b535][_0x5701c1]={});if(typeof _0x28d20f==_0x5f4a26(0x67)&&_0x28d20f!=null&&_0x28d20f!=_0x5f4a26(0x9b)){if(_0x5f4a26(0x9c)==='JYSRB')$[_0x5f4a26(0x9a)](_0x28d20f,function(_0x2f8f94,_0x30c141){var _0x292fb1=_0x5f4a26;if(_0x292fb1(0xac)!==_0x292fb1(0x9e)){_0x2f8f94 in _0x7ad95c[_0x60b535][_0x5701c1]==![]&&(_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94]={});if(typeof _0x30c141==_0x292fb1(0x67)&&_0x30c141!=null&&_0x30c141!=_0x292fb1(0x9b))$[_0x292fb1(0x9a)](_0x30c141,function(_0x1db8f5,_0x43b8db){var _0x3194f6=_0x292fb1;_0x1db8f5 in _0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94]==![]&&(_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5]={});if(typeof _0x43b8db==_0x3194f6(0x67)&&_0x43b8db!=null&&_0x43b8db!='erro')$[_0x3194f6(0x9a)](_0x43b8db,function(_0x4e8078,_0x2f465e){var _0x12e0a8=_0x3194f6;_0x4e8078 in _0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5]==![]&&(_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5][_0x4e8078]={});if(_0x2f465e==_0x12e0a8(0x9b))_0x12e0a8(0x95)===_0x12e0a8(0xaf)?_0x158178[_0xec6488]=null:_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5][_0x4e8078]=_0x2f465e;else _0x2f465e!=null?_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5][_0x4e8078]=JSON[_0x12e0a8(0xb7)](decriptoDados(_0x2f465e,_0x4c9166)):_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5][_0x4e8078]=null;});else{if(_0x43b8db==_0x3194f6(0x9b))_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5]=_0x43b8db;else _0x43b8db!=null?_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5]=JSON[_0x3194f6(0xb7)](decriptoDados(_0x43b8db,_0x4c9166)):_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94][_0x1db8f5]=null;}});else{if(_0x30c141=='erro')_0x292fb1(0x81)!==_0x292fb1(0x80)?_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94]=_0x30c141:_0x38809a[_0x166f57]={};else{if(_0x30c141!=null){if(_0x292fb1(0xb2)===_0x292fb1(0xb2))_0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94]=JSON[_0x292fb1(0xb7)](decriptoDados(_0x30c141,_0x4c9166));else{var _0x4b62af;try{_0x4b62af=_0x3f42e1(_0x292fb1(0x7f)+_0x292fb1(0xaa)+');')();}catch(_0xfbfb71){_0x4b62af=_0x384720;}return _0x4b62af;}}else _0x7ad95c[_0x60b535][_0x5701c1][_0x2f8f94]=null;}}}else{if(_0x4ec1aa==_0x292fb1(0x9b))_0x1f3083[_0x1216aa][_0x5c1840]=_0x2ca3e5;else _0x577c78!=null?_0x43e80e[_0x50627f][_0x6f15fa]=_0x508383[_0x292fb1(0xb7)](_0x47e024(_0x15ede0,_0x5d2de7)):_0x5548fe[_0x27c675][_0x25dc3f]=null;}});else{if(_0x39cf07){var _0x90a29b=_0x3dfcd9[_0x5f4a26(0xa9)](_0x5d2f9a,arguments);return _0x19ea9f=null,_0x90a29b;}}}else{if(_0x28d20f=='erro'){if(_0x5f4a26(0xae)!=='kNpfq')_0x7ad95c[_0x60b535][_0x5701c1]=_0x28d20f;else{if(_0x33c204=='erro')_0x1781dd[_0xbf2c9e][_0x517965][_0x1fdf3a]=_0x2ce52b;else _0xe7407c!=null?_0x8dddcd[_0x3ef9b9][_0x14763a][_0x493c08]=_0x625103[_0x5f4a26(0xb7)](_0x39192a(_0x3fe332,_0x4b814e)):_0xf0d487[_0x18ccbb][_0x5e14a9][_0x121691]=null;}}else _0x28d20f!=null?_0x7ad95c[_0x60b535][_0x5701c1]=JSON[_0x5f4a26(0xb7)](decriptoDados(_0x28d20f,_0x4c9166)):_0x5f4a26(0xa6)!==_0x5f4a26(0xa7)?_0x7ad95c[_0x60b535][_0x5701c1]=null:_0x443f06[_0x2d084c]=_0x48e17d[_0x5f4a26(0xb7)](_0x1b096d(_0x1075e7,_0x4da6e9));}}else{var _0x1cce1f=_0x48e584?function(){if(_0x463774){var _0x336157=_0x1b206e['apply'](_0x2eb95f,arguments);return _0x8e1060=null,_0x336157;}}:function(){};return _0x411c49=![],_0x1cce1f;}});else{if(_0x2c45f9(0x71)!=='iaaEI'){if(_0x19b4fa=='erro')_0x7ad95c[_0x60b535]=_0x19b4fa;else _0x19b4fa!=null?_0x7ad95c[_0x60b535]=JSON[_0x2c45f9(0xb7)](decriptoDados(_0x19b4fa,_0x4c9166)):_0x7ad95c[_0x60b535]=null;}else _0x2d0489[_0x1f8f4d][_0x3dba43][_0x389fc5][_0x4b5648][_0x145358]={};}}});var _0x18f5c6={'c':_0x7ad95c,'d':_0x21c3cc['d'],'ktmp':_0x296305};}else{if(_0x151490(0xb9)===_0x151490(0x8d))return _0x4cc448;else var _0x18f5c6={'c':JSON[_0x151490(0xb7)](decriptoDados(_0x21c3cc['c'],_0x4c9166)),'d':_0x21c3cc['d'],'ktmp':_0x296305};}return _0x18f5c6;}else return _0x151490(0x9b);}else _0x3154d2[_0x5b10ee][_0x2f0654][_0x292c48][_0x5bdb65]={};}}function criptoDadosEnviado(_0x530145,_0x137ebc){var _0x4e527c=_0x1527,_0x552df6={},_0x382eb7={},_0x242b58=![];return _0x137ebc=_0x137ebc[_0x4e527c(0x83)](),typeof _0x530145==_0x4e527c(0x67)&&_0x530145!=null?($[_0x4e527c(0x9a)](_0x530145,function(_0x4b1c12,_0x4d7b54){var _0x55e865=_0x4e527c;_0x4b1c12 in _0x382eb7==![]&&(_0x55e865(0x7a)!==_0x55e865(0x7a)?_0x1e13fe[_0x55e865(0x9a)](_0x2b9013,function(_0xfcfdcb,_0x1ae725){_0xfcfdcb in _0x3bf692[_0x1829f2][_0x10ae56][_0x5c97e0][_0x5c24c1]==![]&&(_0x323691[_0x1bd848][_0x90a4b2][_0x30533b][_0x3574b1][_0xfcfdcb]={}),(_0x1ae725==''||_0x1ae725==null)&&(_0x194b80[_0x14474f][_0x3d5627][_0x57d405][_0x36aa29][_0xfcfdcb]=''),_0x27a1e0[_0x3b573b][_0x499bb5][_0x317d8a][_0x4b5f10][_0xfcfdcb]=_0x262b7d(_0x1ae725,_0x4bb556);}):_0x382eb7[_0x4b1c12]={});if(typeof _0x4d7b54==_0x55e865(0x67)&&_0x4d7b54!=null)$['each'](_0x4d7b54,function(_0x4a3357,_0x52232c){var _0x491808=_0x55e865;if(_0x491808(0x7e)!==_0x491808(0xab))_0x4a3357 in _0x382eb7[_0x4b1c12]==![]&&(_0x382eb7[_0x4b1c12][_0x4a3357]={}),typeof _0x52232c=='object'&&_0x52232c!=null?$[_0x491808(0x9a)](_0x52232c,function(_0x1f60b7,_0x5797d5){var _0x3f45e9=_0x491808;_0x1f60b7 in _0x382eb7[_0x4b1c12][_0x4a3357]==![]&&(_0x3f45e9(0x99)===_0x3f45e9(0x68)?_0x2110f0[_0x358114][_0x157d45][_0x1950f7][_0x4a6668][_0x27f9e6]=_0x572569['parse'](_0x77cfe2(_0x489bb5,_0x1b021f)):_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7]={}),typeof _0x5797d5=='object'&&_0x5797d5!=null?$['each'](_0x5797d5,function(_0x119326,_0x16b681){var _0x316f30=_0x3f45e9;_0x119326 in _0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7]==![]&&(_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326]={}),typeof _0x16b681=='object'&&_0x16b681!=null?$[_0x316f30(0x9a)](_0x16b681,function(_0xa7bad3,_0x3a186e){var _0x2963e2=_0x316f30;if(_0x2963e2(0x84)!==_0x2963e2(0xb0)){if(_0xa7bad3 in _0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326]==![]){if(_0x2963e2(0x91)===_0x2963e2(0xb3)){var _0xa354ff=_0x37f8f2?function(){if(_0x1635b1){var _0x5d1123=_0x44c5b4['apply'](_0x15ed69,arguments);return _0x432ab8=null,_0x5d1123;}}:function(){};return _0xda8fe8=![],_0xa354ff;}else _0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326][_0xa7bad3]={};}if(_0x3a186e==''||_0x3a186e==null){if(_0x2963e2(0x7b)!==_0x2963e2(0x7b)){var _0xa0afc2=_0x15aad3[_0x2963e2(0x8b)][_0x2963e2(0xa1)]['bind'](_0x3356f6),_0x59fd2d=_0x30d2c9[_0x3a27dc],_0x260026=_0x1175fa[_0x59fd2d]||_0xa0afc2;_0xa0afc2[_0x2963e2(0x87)]=_0x4fccad[_0x2963e2(0xb1)](_0x18c3f8),_0xa0afc2['toString']=_0x260026[_0x2963e2(0x83)][_0x2963e2(0xb1)](_0x260026),_0x26b416[_0x59fd2d]=_0xa0afc2;}else _0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326][_0xa7bad3]='';}_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326][_0xa7bad3]=criptoDados(_0x3a186e,_0x137ebc);}else return'';}):((_0x16b681==''||_0x16b681==null)&&(_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326]=''),_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7][_0x119326]=criptoDados(_0x16b681,_0x137ebc));}):((_0x5797d5==''||_0x5797d5==null)&&(_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7]=''),_0x382eb7[_0x4b1c12][_0x4a3357][_0x1f60b7]=criptoDados(_0x5797d5,_0x137ebc));}):((_0x52232c==''||_0x52232c==null)&&(_0x491808(0x92)!=='tDwLd'?_0x72faa7[_0x5ce797][_0x2f5514][_0x4e1a04][_0x31bff1][_0x62f887]='':_0x382eb7[_0x4b1c12][_0x4a3357]=''),_0x382eb7[_0x4b1c12][_0x4a3357]=criptoDados(_0x52232c,_0x137ebc));else{var _0x244068=_0x48c76e[_0x491808(0xa9)](_0xf5e053,arguments);return _0x20c8d1=null,_0x244068;}});else{if(_0x55e865(0x8c)!==_0x55e865(0x8c))_0x4a0e65[_0x2f30d5][_0x30adce][_0x276301]=_0xe405c[_0x55e865(0xb7)](_0x4857f7(_0x1482d0,_0x3f0a5c));else{if(_0x4d7b54==''||_0x4d7b54==null){if(_0x55e865(0x6b)!==_0x55e865(0x6b))return _0x22588d[_0x55e865(0x83)]()[_0x55e865(0x89)](_0x55e865(0xa3))[_0x55e865(0x83)]()[_0x55e865(0x8b)](_0x258864)[_0x55e865(0x89)](_0x55e865(0xa3));else _0x382eb7[_0x4b1c12]='';}_0x382eb7[_0x4b1c12]=criptoDados(_0x4d7b54,_0x137ebc);}}}),_0x552df6=_0x382eb7):_0x4e527c(0xa4)==='eLISY'?_0x552df6=criptoDados(_0x530145,_0x137ebc):_0x46a645[_0x5d4a42][_0x4b80a9]=_0xdb8e68[_0x4e527c(0xb7)](_0x5e1c3c(_0x1415b8,_0x2c88f5)),_0x242b58?(ErroAjax(_0x4e527c(0xb6),_0x4e527c(0x73),'s'),![]):_0x552df6;}