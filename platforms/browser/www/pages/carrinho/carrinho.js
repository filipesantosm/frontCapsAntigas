jQuery(function () {

  var dadosCompra = {};

  // ******** ALTERAÇÕES Configuração do Cartao *************** //
  // Adicionado ao CARD.JS 
  // elo: |^36297|^5067|^4576|^4011|  // onde: {type:"elo",pattern:
  // min-width:280px !important; // alterado no CSS e no JS
  // https://github.com/jessepollak/card

  // Num de Segurança Aleatório/Timestamp
  var codMilliSeconds = Date.now();
  /** VERRRRRRRRRR */
  // Dados da Compra

  // Verifica se o usuário pertence a um CEP habilitado para vendas
  verificaCEP();

  if (habilitarBoleto == 'n') {
    $("#carrinhoCompraSaldo").hide();
  }
  else {
    $("#carrinhoCompraSaldo").show();
  }

  var labelSorteios = JSON.parse(localStorage.getItem("labelSorteios"));
  var labelSorteiosArray = [];
  labelSorteiosArray[1] = 'label1_s';
  labelSorteiosArray[2] = 'label1_sm';
  labelSorteiosArray[3] = 'label1_se';

  // JS CONFIGURAÇÂO DO CARTAO DE CREDITO
  new Card({
    form: document.querySelector('.form-pg-cartao'),
    container: '.imagem-cartao',
    formSelectors: {
      numberInput: 'input#cartaoNumero', // optional — default input[name="number"]
      expiryInput: 'input#cartaoValidade', // optional — default input[name="expiry"]
      cvcInput: 'input#cartaoCodSeg', // optional — default input[name="cvc"]
      nameInput: 'input#cartaoNome' // optional - defaults input[name="name"]
    },/*
    placeholders: {
      number: "•••• •••• •••• ••••",
      name: "Nome",
      expiry: "••/••",
      cvc: "•••"
    },*/
    placeholders: {
      number: '**** **** **** ****',
      name: 'Nome',
      expiry: '**/****',
      cvc: '***'
    },

    //height: (200/1.77778),
    //width: 200,
    debug: false // optional - default false
  });
  // FIM CONFIGURAÇÂO DO CARTAO DE CREDITO 

  //console.log(carrinhoObject);

  // Carrega o valor selecionado/carregado na tela HOME
  var qtdTitulos = app.views.main.router.currentRoute.params.qtdTitulos;
  var tipoTitulos = app.views.main.router.currentRoute.params.tipoTitulos;
  // Atualiza nome Sorteio carrinho qdo titulo for aleatório
  if (carrinhoObject.info.nomeSorCarrinho == "") {
    // Só ter compra aleatória em sorteio único
    if (tipoTitulos.substring(0, 9) == 'aleatorio') {
      carrinhoObject.info.nomeSorCarrinho = carrinhoObject.info.nomeSorAberto + ":" + qtdTitulos;
    }
  }

  var valorTotalCarrinho = getValorTotalCarrinho(tipoTitulos, qtdTitulos);
  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
  if ((!dadosUsuario) || (!qtdTitulos) || (!tipoTitulos) || (!dadosUsuario.name)) {
    app.preloader.hide();
    app.dialog.close();
    logoff();
  }
  $('#usuarioCelular').mask('(00) 00000-0009');
  $('#usuarioCPF').mask('000.000.000-00');
  $('#cartaoValidade').mask('00 / 0000');
  $('#cartaoNumero').mask('0000 0000 0000 0000 000');
  $('#cartaoCodSeg').mask('0000');
  $('#cartaoCodSegCofre').mask('0000');
  // Atualiza endereço do Titular
  $("#end-logradouro").text(dadosUsuario.logradouro.substring(0, 25));
  app.tooltip.setText('#end-logradouro', dadosUsuario.logradouro);
  $("#end-num").text(dadosUsuario.numero);
  $("#end-complemento").text(dadosUsuario.complemento);
  $("#end-bairro").text(dadosUsuario.bairro);
  $("#end-cidade").text(dadosUsuario.localidade + " / " + dadosUsuario.uf);
  $("#end-pais").text(dadosUsuario.pais);

  $("#usuarioNome").text(dadosUsuario.name.substring(0, 30));
  app.tooltip.setText('#usuarioNome', dadosUsuario.name);

  if ((dadosUsuario.user_email == "") || (dadosUsuario.user_email == "null") || (dadosUsuario.user_email == null)) {
    $("#p-email").hide();
    fechaDialogRedireciona('/perfil/');
    return false;
  }
  else {
    $("#p-email").show();
    $("#usuarioEmail").text(dadosUsuario.user_email.substring(0, 30));
    app.tooltip.setText('#usuarioEmail', dadosUsuario.user_email);
  }
  var cpfFormatado = dadosUsuario.cpf.substring(0, 3) + '.' + dadosUsuario.cpf.substring(3, 6) + '.' + dadosUsuario.cpf.substring(6, 9) + '-' + dadosUsuario.cpf.substring(9, 11);

  $("#usuarioCPF").text(cpfFormatado); //cpf
  var telefoneFormatado = '(' + dadosUsuario.telefone.substring(0, 2) + ') ' + dadosUsuario.telefone.substring(2, 7) + '-' + dadosUsuario.telefone.substring(7, 11);
  $("#usuarioCelular").text(telefoneFormatado); //telefone

  // Atualiza os valores do saldo do usuário
  if (dadosUsuario.saldo_usuario) {
    if (dadosUsuario.saldo_atualizado_em == null) {
      $('#saldo_atualizado_em').text('');
      $('#atualizacao_saldo').hide();
    } else {
      var dataHoraAtualizacaoSaldo = dadosUsuario.saldo_atualizado_em.split(' ');
      var dataAtualizacaoSaldo = dataHoraAtualizacaoSaldo[0].split('-').reverse().join('/');
      var HoraAtualizacaoSaldo = dataHoraAtualizacaoSaldo[1].split(':');
      $('#saldo_atualizado_em').text(dataAtualizacaoSaldo + " às " + HoraAtualizacaoSaldo[0] + ":" + HoraAtualizacaoSaldo[1]);
      $('#atualizacao_saldo').show();
    }
    $('#saldo_usuario').text('R$ ' + dadosUsuario.saldo_usuario.replace('.', ","));
    $('#saldo_inicial').text('R$ ' + dadosUsuario.saldo_usuario.replace('.', ","));
  }
  else {
    $('#saldo_usuario').text('R$ 0,00');
    $('#saldo_inicial').text('R$ 0,00');
    $('#atualizacao_saldo').hide();
  }
  if (dadosUsuario.boleto_em_aberto) {
    $('#valor_boleto_pendente').text('R$ ' + dadosUsuario.boleto_em_aberto.replace('.', ","));
    $('#saldo_agu_get').text('R$ ' + dadosUsuario.boleto_em_aberto.replace('.', ","));
  }
  else {
    $('#valor_boleto_pendente').text('R$ 0,00');
    $('#saldo_agu_get').text('R$ 0,00');
  }

  // Direciona para o carrinho
  $("#btn_colocar_saldo").on("click", function () {
    app.dialog.create({
      title: null,
      text: 'Deseja sair do Carrinho para adiquirir saldo para COMPRAS FUTURAS?<br><br>Somente após confirmação de pagamento do boleto pela operadora, você poderá adquirir o título',
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'dialog_button_esquerda-cancelar dialog-button-50',
          onClick: function (a, b) {
            app.dialog.close();
          },
        },
        {
          text: 'SIM',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (a, b) {
            fechaDialogRedireciona('/comprarsaldo/');
          },
        },
      ],
      on: { opened: function (a2, b2, c2) { } }
    }).open();

  });

  $('[name="alterar_carrinhoLink"]').on("click", function () {
    var link = $(this).attr('link');
    app.views.main.router.navigate(link);
  });

  $('[name="termoContrato_titulo"]').on("click", function () {
    var numIdSorteio = $(this).attr('item');
    organizaTermoContrato(numIdSorteio)
  });

  $('[name="popUpCondicoes"]').on("click", function () {
    //$("#link_condicoesGeraisCapitalizadora").click(function () {
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    var sorteio = $(this).attr('idp');
    var img = todosSorteios[sorteio].dados.pdf_img_termos;
    var legenda = "Condições Gerais ";
    var myPhotoBrowserPopupDark = app.photoBrowser.create({
      //photos: [img],
      photos: [{ url: img, caption: legenda }],
      theme: 'dark',
      type: 'standalone',
      popupCloseLinkText: 'Fechar',
      toolbar: false
    });
    myPhotoBrowserPopupDark.open();
  });



  // configura para pagamento inicial PIX
  configuraCards('pix', tipoTitulos, qtdTitulos);

  // Configura apresentação dos números dos títulos ou da mensagem de titulo aleatório
  configuraTitulos(tipoTitulos, qtdTitulos);


  // ************** Botoes de ação na pagina ************* //
  // Se desmarcar termos de contrato TC, oculta formas de pagamento.
  document.getElementById("CadcheckTermosContato").onclick = function () {
    if (CadcheckTermosContato.checked) {
      $('#div_todos_pagamentos').show();
    } else {
      $('#div_todos_pagamentos').hide();
      app.dialog.alert('Para comprar o Título você precisa concordar com as Condições Gerais.', null);
    }
  };

  // Alerta para Termo de Resgate (TC), caso seja desmarcado, apresentar alerta ao usuário.
  $("#toggle_TermoResgate").on("change", function () {
    //var toggle_TermoResgate = $("#toggle_TermoResgate").is(":checked");
    var toggle = app.toggle.get('.toggle_tr');
    if (toggle.checked) { /*console.log('s');*/ }
    else {
      var Dialog_text = dialogMsgContribuicao;
      var Dialog_title = null;
      // Cria alerta
      app.dialog.create({
        title: Dialog_title,
        text: '<div style="font-size: 0.9em;">' + Dialog_text + '</div>',
        closeByBackdropClick: false, backdrop: true,
        buttons: [
          {
            text: 'CONCORDO',
            cssClass: 'dialog_button_esquerda dialog-button-50',
            onClick: function () {
              $('#toggle_TermoResgate').prop('checked', true).attr('checked', 'checked');
            },
          },
          {
            text: 'DISCORDO',
            cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
            onClick: function () {
              $('#toggle_TermoResgate').prop('checked', false).removeAttr('checked');
            },
          },
        ],
        on: {
          opened: function (a2, b2, c2) {
            //console.log('onClick opened');
          }
        }
      }).open();
    }
  });

  // ******* Pagamento por SALDO ******** //
  $('#btn-pagar-saldo').on('click', function () {
    // Separa a função e disabilita o botão para nao haver mais de um clique
    $('#btn-pagar-saldo').prop("disabled", true);
    $('#btn-pagar-saldo').hide();

    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).prop("disabled", true);
    });
    $('#forma-pagamento').prop("disabled", true);

    var valorTotal = $("#valorTotal").text();
    var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    var saldoAtual = dadosUsuario.saldo_usuario;
    if (converterParaMoeda(saldoAtual, 'numeroUS', 'US') < (converterParaMoeda(valorTotalCarrinho, 'numeroUS', 'BR'))) {
      var Dialog_text = "Você não possui saldo suficiente. <br><br>Deseja adquirir saldo para efetuar a compra posteriormente?";
      var Dialog_title = null;
      app.dialog.create({
        title: Dialog_title,
        text: Dialog_text,
        closeByBackdropClick: false, backdrop: true,
        buttons: [
          {
            text: 'CANCELAR',
            cssClass: 'dialog_button_esquerda-cancelar dialog-button-50',
            onClick: function (a, b) {
              app.dialog.close();
              mostrarBotaoPagarSaldo();
            },
          },
          {
            text: 'SIM',
            cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
            onClick: function (a, b) {
              //fechaDialogRedireciona('/comprarsaldo/');
              app.dialog.alert('Somente após confirmação de pagamento do boleto pela operadora, você poderá adquirir o título', null, function () {
                //app.dialog.alert(resposta.msg_usu, null, function () {
                fechaDialogRedireciona('/comprarsaldo/');
              });
            },
          },
        ],
        on: { opened: function (a2, b2, c2) { } }
      }).open();
    }
    else {
      var qtd = $("#qtdTitulos").text();
      var Dialog_text = "Confirma compra utilizando saldo disponível ? <br><br>Quantidade: " + qtd + "<br>Valor: " + valorTotal;
      var Dialog_title = null;
      app.dialog.create({
        title: Dialog_title,
        text: Dialog_text,
        closeByBackdropClick: false, backdrop: true,
        buttons: [
          {
            text: 'CANCELAR',
            cssClass: 'dialog_button_esquerda-cancelar dialog-button-50',
            onClick: function (a, b) {
              app.dialog.close();
              mostrarBotaoPagarSaldo();
            },
          },
          {
            text: 'CONFIRMAR',
            cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
            onClick: function (a, b) {

              $('#btn-pagar-saldo').prop("disabled", true);
              $('#btn-pagar-saldo').hide();

              $('button[name="form_metodo_pg"]').each(function (index, item) {
                $(this).prop("disabled", true);
              });
              $('#forma-pagamento').prop("disabled", true);
              $('#toggle_TermoResgate').prop("disabled", true);

              app.preloader.hide();
              app.dialog.close();
              // comandos para pegar um tempo aleatorio e aguardar para comando executar
              // a fim de tentar acabar com a duplicidade dos pagamentos com saldo
              var tempo = Math.floor(Math.random() * 500);
              setTimeout(function () {
                // cadastra o PV
                //mensagemProcessandoPagamento();
                pagarComSaldo();
              }, tempo);
            },
          },
        ],
        on: { opened: function (a2, b2, c2) { } }
      }).open();
    }
  });
  // ******* FIM Pagamento por Cartao com SALDO ******** //

  // ******* Pagamento por CARTAO de CREDITO E DEBITO  ******** //
  $("[name='btn_pagar_cartao']").on("click", function () { //2023
    const btn_id = this.id;

    // Separa a função e disabilita o botão para nao haver mais de um clique
    $('#CadcheckTermosContato').prop("disabled", true);
    $('#cartaoCodSegCofre').prop("disabled", true);
    $('#remover_cartao_cofre').prop("disabled", true);
    $('#lista_cartoes_cofre').prop("disabled", true);
    $('#salvar_cartao').prop("disabled", true);

    $('#btn-pagar-cartao').prop("disabled", true);
    $('#btn-pagar-cartao').hide();

    $('#btn_pagar_cartao_cofre').prop("disabled", true);
    $('#btn_pagar_cartao_cofre').hide();

    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).prop("disabled", true);
    });
    $('#forma-pagamento').prop("disabled", true);
    $('#toggle_TermoResgate').prop("disabled", true);

    var valorTotal = $("#valorTotal").text();
    var qtd = $("#qtdTitulos").text();
    var Dialog_text = "Confirma compra com o Cartão de Crédito informado?<br><br>Quantidade: " + qtd + "<br>Valor: " + valorTotal;
    var Dialog_title = null;
    app.dialog.create({
      title: Dialog_title,
      text: Dialog_text,
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'dialog_button_esquerda-cancelar dialog-button-50',
          onClick: function (a, b) {
            app.dialog.close();
            mostrarBotaoPagarCartao('credit');
          },
        },
        {
          text: 'CONFIRMAR',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (a, b) {
            app.dialog.close();

            // comandos para pegar um tempo aleatorio e aguardar para comando executar
            // a fim de tentar acabar com a duplicidade dos pagamentos com cartao
            var tempo = Math.floor(Math.random() * 500);
            $('#CadcheckTermosContato').prop("disabled", true);
            $('#cartaoCodSegCofre').prop("disabled", true);
            $('#remover_cartao_cofre').prop("disabled", true);
            $('#lista_cartoes_cofre').prop("disabled", true);
            $('#salvar_cartao').prop("disabled", true);

            $('#btn-pagar-cartao').prop("disabled", true);
            $('#btn-pagar-cartao').hide();

            $('#btn_pagar_cartao_cofre').prop("disabled", true);
            $('#btn_pagar_cartao_cofre').hide();

            $('button[name="form_metodo_pg"]').each(function (index, item) {
              $(this).prop("disabled", true);
            });
            $('#forma-pagamento').prop("disabled", true);
            $('#toggle_TermoResgate').prop("disabled", true);

            app.preloader.hide();
            app.dialog.close();
            setTimeout(function () {
              //mensagemProcessandoPagamento();
              if (btn_id == 'btn-pagar-cartao') {
                validaPagamentoCartao('credit', pgc);
              }
              else if (btn_id == 'btn_pagar_cartao_cofre') {
                validaPagamentoCartaoCofre('credit', pgc); // 2023Pendente
              }
            }, tempo);
          },
        },
      ],
      on: { opened: function (a2, b2, c2) { } }
    }).open();
  });

  // Ação: Ao digitar Corrige Nome, retira caracter especial e coloca em maiúsculo
  $("#cartaoNome").keyup(function () {
    var nome = $("#cartaoNome").val();
    nome = retirarEspecialChar(nome);
    //nome = nome.toUpperCase();
    $("#cartaoNome").val(nome);
  });

  // Ação: Ao digitar Corrige codigo de seguraça ao digital o número do cartao
  $("#cartaoNumero").keyup(function () {
    var bandeira = "";
    var num = $("#cartaoNumero").val();
    var bandeiraCard = verBandeiraCartao(num).toLowerCase();;
    var bandeiraEFI = verBandeiraCartaoGerenciaNet(num).toLowerCase();;

    if ($(".jp-card-identified")) {
      var myDivElement = $(".jp-card-identified");
      if (myDivElement[0]) {
        var bandeiraJS = verBandeiraCartaoJS(myDivElement[0].classList).toLowerCase();;
      }
    }
    else {
      var bandeiraJS = null;
    }

    if ((bandeiraEFI != "") && (bandeiraEFI != "null") && (bandeiraEFI != null) && (bandeiraEFI != 'não localizada')) {
      bandeira = bandeiraEFI.toLowerCase();
    }
    else if ((bandeiraCard != "") && (bandeiraCard != "null") && (bandeiraCard != null) && (bandeiraCard != 'não localizada')) {
      bandeira = bandeiraCard.toLowerCase();
    }
    else if ((bandeiraJS != "") && (bandeiraJS != "null") && (bandeiraJS != null) && (bandeiraJS != 'não localizada')) {
      bandeira = bandeiraJS.toLowerCase();
    }


    if ((bandeira == 'amex')) {
      $('#cartaoCodSeg').unmask();
      $('#cartaoCodSeg').mask('0000');
      $('#cartaoCodSeg').attr('placeholder', 'xxxx');
    }
    else {
      $('#cartaoCodSeg').unmask();
      $('#cartaoCodSeg').mask('000');
      $('#cartaoCodSeg').attr('placeholder', 'xxx');
    }

    //console.log('bandeiraCard', bandeiraCard);
    //console.log('bandeiraEFI', bandeiraEFI);
    //console.log('bandeiraJS', bandeiraJS);
    //console.log('bandeira', bandeira);

    if (bandeira != "") {
      if (bandeira == "amex") { $('#cartaoBandeira').val('amex'); }
      else if (bandeira.toLowerCase() == "mastercard") { $('#cartaoBandeira').val('mastercard'); }
      else if (bandeira.toLowerCase() == "visa") { $('#cartaoBandeira').val('visa'); }
      else if (bandeira.toLowerCase() == "visa electron") { $('#cartaoBandeira').val('visa'); }
      else if (bandeira.toLowerCase() == "elo") { $('#cartaoBandeira').val('elo'); }
      else if (bandeira.toLowerCase() == "diners") { $('#cartaoBandeira').val('diners'); }
      else if (bandeira.toLowerCase() == "hipercard") { $('#cartaoBandeira').val('hipercard'); }
      else { $('#cartaoBandeira').val(''); }
    } else { $('#cartaoBandeira').val(''); }
  });
  // ******* FIM Pagamento por Cartao de Credito ******** //


  // ******* Pagamento por PIX ******** //
  $('#btn_pagar_pix').on('click', function () {
    var valorTotal = $("#valorTotal").text();
    var qtd = $("#qtdTitulos").text();
    var Dialog_text = "Gerar o PIX ?<br><br>Quantidade: " + qtd + "<br>Valor: " + valorTotal;
    var Dialog_title = null;
    app.dialog.create({
      title: Dialog_title,
      text: Dialog_text,
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'dialog_button_esquerda-cancelar dialog-button-50',
          onClick: function (a, b) {
            app.dialog.close();
          },
        },
        {
          text: 'CONFIRMAR',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (a, b) {
            app.dialog.close();
            // Separa a função e disabilita o botão para nao haver mais de um clique
            $('#btn_pagar_pix').prop("disabled", true);
            $('#btn_pagar_pix').hide();
            $('#div_confirma_pg_pix').hide();
            $('#div_pix_pagamento').show();

            $('button[name="form_metodo_pg"]').each(function (index, item) {
              $(this).prop("disabled", true);
            });
            $('#forma-pagamento').prop("disabled", true);
            $('#toggle_TermoResgate').prop("disabled", true);

            var toggleTR = app.toggle.get('.toggle_tr');
            if (toggleTR.checked) { doacao_resgate = "S"; }
            else { doacao_resgate = "N"; }

            app.preloader.hide();
            app.dialog.close();
            var tempo = Math.floor(Math.random() * 500);
            //console.log(carrinhoObject);
            setTimeout(function () {
              gerencianetPixGenerateOrder(doacao_resgate, tipoTitulos, qtdTitulos, 'pix', codMilliSeconds, carrinhoObject.info);
            }, tempo);
          },
        },
      ],
      on: { opened: function (a2, b2, c2) { } }
    }).open();
  });

  // Ao clicar no BRCode, copiar o pix Copie e Cola
  $("input[name=BRCode]").click(function () {
    gerencianetPixCopy();
  });

  // Ao clicar no botao1, copiar o pix Copie e Cola
  $(".gerencianetpix-label > button").click(function () {
    gerencianetPixCopy();
  });

  // Ao clicar no botao2 copiar, copiar o pix Copie e Cola
  $("#btn_pix_copiar").click(function () {
    gerencianetPixCopy();
  });

  $("#btn_pagar_pix_duvidas").click(function () {
    //exemplo de html que poderia vir do banco
    var html = '<div style="text-align: center;margin: 16px 16px 16px 16px;">' +
      '<img class="" src="img/carrinho/pix.png" style="width: 45%;">' +
      '<p style="color:#db1921; font-weight: bold; font-size: 1.2em;margin: 0 0 0 0;">+1º Passo:</p>' +
      '<p>Copie o código gerado</p>' +
      '<p style="color:#db1921; font-weight: bold; font-size: 1.2em;margin: 0 0 0 0;">+2º Passo:</p>' +
      '<p>Abra o aplicativo do seu banco, tenha um PIX habilitado e use a opção PIX Copia e Cola</p>' +
      '<p style="color:#db1921; font-weight: bold; font-size: 1.2em;margin: 0 0 0 0;">+3º Passo:</p>' +
      '<p>Cole o código, confirme o valor e faça o pagamento.<br>Ele será confirmado na hora! </p>' +
      '<p></p>' +
      '</div>';

    var novoTextoHTML = dimensaoIframeVideo(html);
    criarPopupPix('Dúvidas PIX', novoTextoHTML);
  });
  // ******* FIM Pagamento por PIX ******** //


  // Ao clicar no Credito
  $("button[id='form_pg_cartao_credito']").on('click', function () {
    $("#title_credito").show();
    $("#li_bt_credito").show();

    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).removeClass("button-active");
    });
    $(this).addClass("button-active");
    configuraCards('credito', tipoTitulos, qtdTitulos);

  });

  // Ao clicar no Saldo
  $("button[id='form_pg_cartao_saldo']").on('click', function () {
    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).removeClass("button-active");
    });
    $(this).addClass("button-active");
    configuraCards('saldo', tipoTitulos, qtdTitulos);
  });

  // Ao clicar no PIX
  $("button[id='form_pg_pix']").on('click', function () {
    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).removeClass("button-active");
    });
    $(this).addClass("button-active");
    configuraCards('pix', tipoTitulos, qtdTitulos);
  });

  $("#remover_cartao_cofre").click(function () { // OK
    if ($("#lista_cartoes_cofre").val() != 'novo') {
      var Dialog_text = "Confirma a retirada da sua lista de cartões salvos ?";
      var Dialog_title = null;
      // Cria alerta
      app.dialog.create({
        title: Dialog_title,
        text: '<div style="font-size: 0.9em;">' + Dialog_text + '</div>',
        closeByBackdropClick: false, backdrop: true,
        buttons: [
          {
            text: 'CANCELAR',
            cssClass: 'dialog_button_esquerda-cancelar  dialog-button-50',
            onClick: function () { },
          },
          {
            text: 'CONFIRMAR',
            cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
            onClick: function () {
              if ((pgc == 1) || (pgc == '1')) {
                //GET NET
                getnet_cofre_remove($("#lista_cartoes_cofre").val());
              }
              else if ((pgc == 2) || (pgc == '2')) {
                // Gerencianet
                gerencianet_cofre_remove($("#lista_cartoes_cofre").val());
              }
            },
          },
        ],
        on: {
          opened: function () { }
        }
      }).open();
    }
    /*
 
        app.dialog.alert('remover cartao');
        */
    // se n restar nenhum cartao, ocultar a div de Cofre e mostrar apenas a de novos cartoes
  });

  $("#lista_cartoes_cofre").on("change", function () { // OK
    if ($("#lista_cartoes_cofre").val() == 'novo') {
      $('#li_credito_cofre_codseguranca').hide();
      $('#li_cartao_cofre_pg').hide();
      $('#cartao_credito_novo_cartao').show(300);
    }
    else if ($("#lista_cartoes_cofre").val() != '') {
      $('#li_credito_cofre_codseguranca').show(300);
      $('#li_cartao_cofre_pg').show(300);
      $('#cartao_credito_novo_cartao').hide();
    }
  });


  // Função para retornar com o botão de comprar
  // que foi retirado para não correr o risco de clicar mais de 1 x
  function mostrarBotaoPagarSaldo() {
    $('#btn-pagar-saldo').prop("disabled", false);
    $('#btn-pagar-saldo').show();

    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).prop("disabled", false);
    });
    $('#forma-pagamento').prop("disabled", false);
    $('#toggle_TermoResgate').prop("disabled", false);
  }

  function pagarComSaldo() {
    var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    var saldoUsuario = converterParaMoeda(dadosUsuario.saldo_usuario, 'numeroUS', 'US');
    var valorTotal = converterParaMoeda(valorTotalCarrinho, 'numeroUS', 'BR');
    if (parseFloat(valorTotal) > parseFloat(saldoUsuario)) {
      //app.dialog.alert('Saldo insuficiente', 'ops...!');
      app.dialog.alert('Saldo insuficiente', null);
      $('#btn-pagar-saldo').prop("disabled", false);
      $('#btn-pagar-saldo').show();

      $('button[name="form_metodo_pg"]').each(function (index, item) {
        $(this).prop("disabled", false);
      });
      $('#forma-pagamento').prop("disabled", false);
      $('#toggle_TermoResgate').prop("disabled", false);
      return false;
    }
    else {

      var toggleTR = app.toggle.get('.toggle_tr');
      if (toggleTR.checked) { doacao_resgate = "S"; }
      else { doacao_resgate = "N"; }
      mensagemProcessandoPagamento();

      //pagamentoSaldo_CadastraPedido_GetDados(doacao_resgate, tipoTitulos, qtdTitulos, 'saldo', codMilliSeconds);
      pagamentoSaldo_CadastraPedido_GetDados(doacao_resgate, tipoTitulos, qtdTitulos, 'saldo', codMilliSeconds, carrinhoObject.info);
    }
  }

  // Função para retornar com o botão de comprar
  // que foi retirado para não correr o risco de clicar mais de 1 x
  function mostrarBotaoPagarCartao(tipo) {
    if (tipo == 'credit') {
      $('#cartaoCodSegCofre').prop("disabled", false);
      $('#remover_cartao_cofre').prop("disabled", false);
      $('#lista_cartoes_cofre').prop("disabled", false);
      $('#salvar_cartao').prop("disabled", false);

      $('#btn-pagar-cartao').prop("disabled", false);
      $('#btn-pagar-cartao').show();

      $('#btn_pagar_cartao_cofre').prop("disabled", false);
      $('#btn_pagar_cartao_cofre').show();
    }

    $('#CadcheckTermosContato').prop("disabled", false);
    $('button[name="form_metodo_pg"]').each(function (index, item) {
      $(this).prop("disabled", false);
    });
    $('#forma-pagamento').prop("disabled", false);
    $('#toggle_TermoResgate').prop("disabled", false);

  }

  // Valida todos campos do cartão e se estiver OK, avança
  function validaPagamentoCartao(tipo, pgc) { //2023-ok
    // Valida se foi preenchido o campo NUMERO DO CARTAO
    var num = $("#cartaoNumero").val().replace(/ /g, "");
    if (num == '') {
      ErroValidacao('Favor informar o número do cartão corretamente');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }
    // Valida se foi preenchido o campo NOME CONFORME CARTAO DE CREDITO
    if ($("#cartaoNome").val() == '') {
      ErroValidacao('Favor informar o nome conforme escrito no cartão');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }
    // Valida se foi preenchido o campo CODIGO DE SEGURANÇA
    if ($("#cartaoCodSeg").val() == '') {
      ErroValidacao('Favor informar o código de segurança corretamente');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    // Valida se foi preenchido o campo VALIDADE
    if ($("#cartaoValidade").val() == '') {
      ErroValidacao('Favor informar a validade do cartão corretamente');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    // Valida se foi preenchido o campo VALIDADE
    var validade = $("#cartaoValidade").val();

    if (validade.length < 7) {
      ErroValidacao('Favor informar a validade do cartão corretamente');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    // Valida se o cartão está vencido
    var mes = $("#cartaoValidade").val().substring(0, 2);
    var ano = $("#cartaoValidade").val();
    ano = "20" + ano.substring(ano.length - 2, ano.length);
    var ultimoDiaMes = (new Date(ano, mes, 0)).getDate(); // para mes vigente é necessário subtrair 1
    var validadeCartao = new Date(ano, mes - 1, ultimoDiaMes);
    if (new Date() > validadeCartao) {
      ErroValidacao('Atenção, este cartão está vencido.');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    // Valida se foi preenchido o TERMO DE CONTRATO
    var termoContrato = $("#CadcheckTermosContato").is(":checked");
    if (!termoContrato) {
      ErroValidacao('Para avançar, é necessário concordar com o termo de uso.');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }
    // Valida se foi preenchido o TERMO DE CESSAO DE RESGATE(TR)
    var toggleTR = app.toggle.get('.toggle_tr');
    if (toggleTR.checked) { doacao_resgate = "S"; }
    else { doacao_resgate = "N"; }

    // MENSAGEM PARA O USUARIO
    //app.dialog.preloader('Cadastrando pedido...');

    var mes = $("#cartaoValidade").val().substring(0, 2);
    var ano = $("#cartaoValidade").val();
    ano = ano.substring(ano.length - 2, ano.length);
    var cartao = $("#cartaoNumero").val();
    var cartao_num = cartao.replace(/[^\d]+/g, '');

    var salvar_cartao = $("#salvar_cartao").is(":checked").toString();

    var bandeira = $('#cartaoBandeira').val();
    if (bandeira == "") {
      ErroValidacao('Favor informar a bandeira do cartão');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    var dadosCartao = {
      validade: $("#cartaoValidade").val(),
      validade_mes: mes,
      validade_ano: ano,
      numero: cartao,
      num: cartao_num,
      nome: $("#cartaoNome").val(),
      cod_seg: $("#cartaoCodSeg").val(),
      salvar_cartao: salvar_cartao,
      tipo: 'novo',
      bandeira: bandeira
    };
    mensagemProcessandoPagamento();
    if ((pgc == 1) || (pgc == '1')) {
      //2023-Testar GETNET
      pagamentoCartao_CadastraPedido_GetDados(doacao_resgate, tipoTitulos, qtdTitulos, dadosCartao, tipo, codMilliSeconds);
    }
    else if ((pgc == 2) || (pgc == '2')) {
      //cadastraPedidoGerencianet_Teste3(doacao_resgate, tipoTitulos, qtdTitulos, dadosCartao, tipo, codMilliSeconds, dadosCartao);
      getTokenEFICartao(doacao_resgate, tipoTitulos, qtdTitulos, dadosCartao, tipo, codMilliSeconds);
    }

  };

  function gerencianetPixCopy() {
    if (device.platform == 'WEBAPP') {
      var toastCSS = 'toast_webapp';
    } else { var toastCSS = ''; }
    var toastWithCustomButton = app.toast.create({
      text: 'Código PIX copiado com sucesso!',
      closeButton: true,
      closeButtonText: '<i style="font-size: 1.5rem;right: 0px;position: fixed;" class="mdi mdi-close-circle"></i>',
      closeButtonColor: 'white',
      horizontalPosition: 'center',
      cssClass: toastCSS,
    });


    $("input[name=BRCode]").select();
    document.execCommand("copy");

    $("#btn_pix_copiar").css({ "animation": "none" });
    $("#img_pix_copiar").css({ "animation": "none" });

    toastWithCustomButton.open();
    setTimeout(function () {
      toastWithCustomButton.close();
    }, 4500);

  }

  // Função para validar se o cliente pode comprar, CEP habilitado
  function verificaCEP() {
    var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    if (dadosUsuario.cep_ativo != 'S') {
      $("#forma-pagamento").hide();
      $("#block_credito_debito").hide();
      $("#block_credito").hide();

      $("#block-saldo").hide();
      ErroValidacao('Desculpe, produto ainda não disponível em sua região !', aguardar = 'S', link = '/home/');
    }
  }

  function configuraTitulos(tipoTitulos, qtdTitulos) {

    if (tipoTitulos.substring(0, 9) == 'aleatorio') {
      $("#qtdTitulos").text(qtdTitulos);
      $("#p_titulo_compra_aleatorio").show();
      if (qtdTitulos > 1) {
        $("#numsTitulos").text("Serão atribuidos aleatoriamente");
      }
      else {
        $("#numsTitulos").text("Será atribuido aleatoriamente");
      }
      $("#p_alterar_carrinho").hide();
      $("#S1_numsTitulosSelecionados").hide();
      $("#S2_numsTitulosSelecionados").hide();
      $("#S3_numsTitulosSelecionados").hide();
      configuraTituloAleatorio(qtdTitulos);
    }
    else {
      $("#qtdTitulos").text(carrinhoObject.info.totalTitulosCarrinho);
      $("#valorTotal").text(converterParaMoeda(parseFloat(carrinhoObject.info.valorCarrinho), 'texto'));
      valorTotalCarrinho = converterParaMoeda(parseFloat(carrinhoObject.info.valorCarrinho), 'numeroStringBR');

      $("#p_titulo_compra_aleatorio").hide();
      $("#numsTitulos").parent().hide();
      mostrarDadosCarrinho();
    }
  }

  function configuraTituloAleatorio(qtdTitulos) {
    var dadosCapitalizadora = JSON.parse(localStorage.getItem("dadosCapitalizadora"));

    $.each(carrinhoObject, function (indexSorteio, dadossorteio) {
      if (indexSorteio != "info") {
        $.each(dadossorteio, function (index, dados) {
          $('#link_seleciona_compra_aleatorio').attr("idp", indexSorteio);
          $('#link_seleciona_compra_aleatorio').attr("link", '/selecionarcap/' + indexSorteio + '/');
          $("#valorTotal").text(converterParaMoeda(parseFloat(qtdTitulos * parseFloat(dados.dados_sorteio.valor_venda)), 'texto'));
          valorTotalCarrinho = converterParaMoeda(parseFloat(qtdTitulos * parseFloat(dados.dados_sorteio.valor_venda)), 'numeroStringBR');

          $('#aleatorio_termoContrato_block').show();
          $('#aleatorio_termoContrato_texto').show();
          $("#aleatorio_carrinho_html_condicoes_comprar").html(dadosCapitalizadora[indexSorteio].texto_condicoes_comprar);

          if ((dados.dados_sorteio.processo_susep != "") && (dados.dados_sorteio.processo_susep != null)) {
            $("#aleatorio_carrinho_processosusep").show();
            $("#aleatorio_carrinho_processosusep").text(" ( Processo SUSEP " + dados.dados_sorteio.processo_susep + " )");
          } else {
            $("#aleatorio_carrinho_processosusep").hide();
          }
          $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_1');
          $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_2');
          $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_3');
          $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo');
          $('#aleatorio_link_condicoesGeraisCapitalizadora').attr("idp", indexSorteio);

          $("#unico_termo").show();
          $("#unico_valor_resgate").text(converterParaMoeda(parseFloat(dados.dados_sorteio.valor_resgate), 'texto'));
          $("#unico_valor_quota_resgate").text(dados.dados_sorteio.quota_resgate.toString().replace(".", ","));
          $("#unico_valor_titulo_unitario").text(converterParaMoeda(parseFloat(dados.dados_sorteio.valor_venda), 'texto'));

        });
      };
    });
  }

  function verificaSalvarCofre(){
    if (tipoCofre=='0'){
      $('#cartao_credito_cofre').hide();
      $('#cartao_credito_novo_cartao').show();
      $('#li_salvar_cartao').hide();
    }
    else{
      $('#li_salvar_cartao').show();
    }
  }
  function configuraCards(tipoPagamento, tipoTitulos, qtdTitulos) {
    verificaSalvarCofre()
    if (tipoPagamento == "credito") {

      $("#form_pg_cartao_saldo").removeClass('button-active');
      $("#form_pg_pix").removeClass('button-active');
      $("#form_pg_cartao_credito").addClass('button-active');

      $("#block_credito_debito").show();
      $("#block_credito").show();

      $("#title_credito").show();
      $("#li_bt_credito").show();
      $("#block-saldo").hide();
      $("#card_compra_titulos").show();
      $("#block-TermosContato").show();
      $('#block-pix').hide();
      $('#div_pix_pagamento').hide();
      $('#div_confirma_pg_pix').hide();
      //$('#li_salvar_cartao').show(); // temporariamente indisponível
      //configuraCardCartaoCofre();

    }
    else if (tipoPagamento == "saldo") {
      $("#form_pg_cartao_credito").removeClass('button-active');
      $("#form_pg_pix").removeClass('button-active');
      $("#form_pg_cartao_saldo").addClass('button-active');

      $("#block_credito").hide();
      $("#block_credito_debito").hide();
      $("#block-saldo").show();
      $("#card_compra_titulos").show();
      $("#block-TermosContato").show();
      $('#block-pix').hide();
      $('#div_pix_pagamento').hide();
      $('#div_confirma_pg_pix').hide();
    }
    else if (tipoPagamento == "pix") {
      $("#form_pg_cartao_credito").removeClass('button-active');
      $("#form_pg_cartao_saldo").removeClass('button-active');
      $("#form_pg_pix").addClass('button-active');

      $("#block_credito").hide();
      $("#block_credito_debito").hide();
      $("#block-saldo").hide();
      $("#card_compra_titulos").show();
      $("#block-TermosContato").show();
      $('#block-pix').show();
      $('#div_pix_pagamento').hide();
      $('#div_confirma_pg_pix').show();

    }
  }

  function mostrarDadosCarrinho() {
    var tiposSorteios = [];
    tiposSorteios['sorteios'] = 1;
    tiposSorteios['sorteios_semanal'] = 2;
    tiposSorteios['sorteios_extra'] = 3;

    var dadosCapitalizadora = JSON.parse(localStorage.getItem("dadosCapitalizadora"));

    var numIdSorteio = 0;
    var primeiroNumIdSorteio = 0;
    $.each(carrinhoObject, function (indexSorteio, dadossorteio) {
      if (indexSorteio != "info") {
        $.each(dadossorteio, function (index, dados) {
          //numIdSorteio = numIdSorteio + 1;
          numIdSorteio = tiposSorteios[indexSorteio];
          $('#S' + numIdSorteio + '_link_condicoesGeraisCapitalizadora').attr("idp", indexSorteio);
          //$("#S" + numIdSorteio + "_termoContrato_titulo").show();

          if (carrinhoObject['info']['datasSorteiosCombo'] == 'dif') {
            $('#S' + numIdSorteio + '_TituloItens').text(nomeProduto +'(s) Sorteio: ' + dataParaTexto(dados.dados_sorteio.data, 'dd/mm/aaaa'));
            $('#S' + numIdSorteio + '_termoContrato_titulo').text('Sorteio: ' + dataParaTexto(dados.dados_sorteio.data, 'dd/mm'));
          }
          else {
            $('#S' + numIdSorteio + '_TituloItens').text(nomeProduto +'(s) ' + labelSorteios[labelSorteiosArray[numIdSorteio]] + ' : ');
            $('#S' + numIdSorteio + '_termoContrato_titulo').text(labelSorteios[labelSorteiosArray[numIdSorteio]]);

          }


          $('#S' + numIdSorteio + '_p_alterar_carrinhoLink').attr("link", '/selecionarcap/' + indexSorteio + '/');
          var tipoSorteio = parseInt(dados.dados_sorteio.tipo_sorteio);
          if (tipoSorteio == 1) {
            $('#S' + numIdSorteio + '_titulosCarrinho1').show();
            $('#S' + numIdSorteio + '_titulosCarrinho2').hide();
            $('#S' + numIdSorteio + '_titulosCarrinho3').hide();
            idAdd = 'S' + numIdSorteio + '_titulosCarrinho1';
          }
          else if (tipoSorteio == 2) {
            $('#S' + numIdSorteio + '_titulosCarrinho1').hide();
            $('#S' + numIdSorteio + '_titulosCarrinho2').show();
            $('#S' + numIdSorteio + '_titulosCarrinho3').hide();
            idAdd = 'S' + numIdSorteio + '_titulosCarrinho2';
          }
          else if (tipoSorteio == 3) {
            $('#S' + numIdSorteio + '_titulosCarrinho1').hide();
            $('#S' + numIdSorteio + '_titulosCarrinho2').hide();
            $('#S' + numIdSorteio + '_titulosCarrinho3').show();
            idAdd = 'S' + numIdSorteio + '_titulosCarrinho3';
          }
          if (dados.carrinho) {
            $('#S' + numIdSorteio + '_p_alterar_carrinho').show();
            $('#S' + numIdSorteio + '_numsTitulosSelecionados').show();
            $('#S' + numIdSorteio + '_termoContrato_block').show();
            $('#S' + numIdSorteio + '_termoContrato_titulo').show();
            $('#S' + numIdSorteio + '_termoContrato_texto').show();
            organizaTermoContrato(numIdSorteio);
            if (primeiroNumIdSorteio == 0) { primeiroNumIdSorteio = numIdSorteio; }

            $("#S" + numIdSorteio + "_carrinho_html_condicoes_comprar").html(dadosCapitalizadora[indexSorteio].texto_condicoes_comprar);
            if ((dados.dados_sorteio.processo_susep != "") && (dados.dados_sorteio.processo_susep != null)) {
              $("#S" + numIdSorteio + "_carrinho_processosusep").show();
              $("#S" + numIdSorteio + "_carrinho_processosusep").text(" ( Processo SUSEP " + dados.dados_sorteio.processo_susep + " )");
            } else {
              $("#S" + numIdSorteio + "_carrinho_processosusep").hide();
            }

            var itens = dados.carrinho.dados;
          }
          else {
            $('#S' + numIdSorteio + '_numsTitulosSelecionados').hide();
            var itens = {};
          }
          var dadosSorteio = dados.dados_sorteio;

          if (parseInt(carrinhoObject.info.qtdSorteiosCarrinho) == 1) {
            $("#p_valorUnitario").show();
            $("#valorUnitario").text(converterParaMoeda(parseFloat(carrinhoObject['info']['valorUnitario']), 'texto'));
            //$("#valorUnitario").text(converterParaMoeda(parseFloat(dadosSorteio.valor_venda), 'texto'));
            $("#unico_termo").show();
            $("#unico_valor_resgate").text(converterParaMoeda(parseFloat(dados.dados_sorteio.valor_resgate), 'texto'));
            $("#unico_valor_quota_resgate").text(dados.dados_sorteio.quota_resgate.toString().replace(".", ","));
            $("#unico_valor_titulo_unitario").text(converterParaMoeda(parseFloat(dados.dados_sorteio.valor_venda), 'texto'));
          }
          else {
            $("#p_valorUnitario").hide();
            $("#multi_termo").show();
            $("#S" + numIdSorteio + "_valor_titulo_unitario").text(converterParaMoeda(parseFloat(dados.dados_sorteio.valor_venda), 'texto'));
            $("#S" + numIdSorteio + "_valor_quota_resgate").text(dados.dados_sorteio.quota_resgate.toString().replace(".", ","));


            if (carrinhoObject['info']['datasSorteiosCombo'] == 'dif') {
              $("#S" + numIdSorteio + "_termoDataSorteio").text('Sorteio ' + dataParaTexto(dados.dados_sorteio.data, 'dd/mm/aa') + ' : ');
            }
            else {
              $("#S" + numIdSorteio + "_termoDataSorteio").text(labelSorteios[labelSorteiosArray[numIdSorteio]] + ' : ');
            }
            $("#S" + numIdSorteio + "_valor_resgate").text(converterParaMoeda(parseFloat(dados.dados_sorteio.valor_resgate), 'texto'));
            $("#S" + numIdSorteio + "_termo").show();
          }





          var count = 1;
          var code = "";
          $.each(itens, function (index2, value) {
            if (parseInt(value.tipo_sorteio) == 1) {
              code = "<div id='titulosAdd-" + count + "' class='row no-gap'>" +
                "        <div id='col-0' class='col col-grid-carrinho'>" + value.titulo1 + "</div>" +
                "        <div id='col-1' class='col col-grid-carrinho'>" + value.titulo1 + "</div>" +
                "      </div>";
            }
            else if (parseInt(value.tipo_sorteio) == 2) {
              code = "<div id='titulosAdd-" + count + "' class='row no-gap'>" +
                "        <div id='col-0' class='col col-grid-carrinho'>" + value.titulo1 + "</div>" +
                "        <div id='col-1' class='col col-grid-carrinho'>" + value.titulo1 + "</div>" +
                "        <div id='col-2' class='col col-grid-carrinho'>" + value.titulo2 + "</div>" +
                "      </div>";
            }
            else if (parseInt(value.tipo_sorteio) == 3) {
              code = "<div id='titulosAdd-" + count + "' class='row no-gap'>" +
                "        <div id='col-0' class='col col-grid-carrinho'>" + value.titulo1 + "</div>" +
                "        <div id='col-1' class='col col-grid-carrinho'>" + value.titulo1 + "</div>" +
                "        <div id='col-2' class='col col-grid-carrinho'>" + value.titulo2 + "</div>" +
                "        <div id='col-3' class='col col-grid-carrinho'>" + value.titulo3 + "</div>" +
                "      </div>";
            }

            count = count + 1;
            $('#' + idAdd).after(code);
          });


        });
      }
    });

    organizaTermoContrato(primeiroNumIdSorteio);
  }

  // ********* Funções do Cofre *********
  function configuraCardCartaoCofre() { // ok GETNET
    var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    if ((localStorage.getItem("qtdcofre") == 0) || (localStorage.getItem("qtdcofre") == '0')) {
      $('#cartao_credito_cofre').hide();
      $('#cartao_credito_novo_cartao').show();
    }
    else {
      if (dadosUsuario.qtd_itens_cofre > 0) {
        $('#cartao_credito_cofre').show();
        $('#cartao_credito_novo_cartao').hide();

        if ($("#lista_cartoes_cofre").val() == 'novo') {
          $('#li_credito_cofre_codseguranca').hide();
          $('#li_cartao_cofre_pg').hide();
          $('#cartao_credito_novo_cartao').show();
        }
        else if ($("#lista_cartoes_cofre").val() != '') {
          $('#li_credito_cofre_codseguranca').show();
          $('#li_cartao_cofre_pg').show();
          $('#cartao_credito_novo_cartao').hide();
        }

      }
      else {
        $('#cartao_credito_cofre').hide();
        $('#cartao_credito_novo_cartao').show();
      }
    }
  }

  function validaPagamentoCartaoCofre(tipo, pgc) {
    // Valida se foi selecionado o cartão correto
    if (card == 'novo') {
      ErroValidacao('Favor informar o número do cartão corretamente');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    //console.log($("#cartaoCodSegCofre").val());
    // Valida se foi preenchido o campo CODIGO DE SEGURANÇA
    if ($("#cartaoCodSegCofre").val() == '') {
      ErroValidacao('Favor informar o código de segurança corretamente');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }

    // Valida se foi preenchido o TERMO DE CONTRATO
    var termoContrato = $("#CadcheckTermosContato").is(":checked");
    if (!termoContrato) {
      ErroValidacao('Para avançar, é necessário concordar com o termo de uso.');
      mostrarBotaoPagarCartao(tipo);
      return false;
    }
    // Valida se foi preenchido o TERMO DE CESSAO DE RESGATE(TR)
    var toggleTR = app.toggle.get('.toggle_tr');
    if (toggleTR.checked) { doacao_resgate = "S"; }
    else { doacao_resgate = "N"; }

    // MENSAGEM PARA O USUARIO
    //app.dialog.preloader('Cadastrando pedido...');
    if ((pgc == 1) || (pgc == '1')) {
      const cartoes = JSON.parse(localStorage.getItem("list_c"));
      $.each(cartoes, function (index, cartao) {
        if (cartao.card_id == card) {
          var dadosCartao = {
            validade_mes: leftPad(cartao.expiration_month, 2, '0'),
            validade_ano: cartao.expiration_year.toString(),
            number_token: cartao.number_token,
            nome: cartao.cardholder_name,
            last_four_digits: cartao.last_four_digits,
            customer_id: cartao.customer_id,
            cod_seg: $("#cartaoCodSegCofre").val(),
            brand: cartao.brand,
            salvar_cartao: 'false',
            tipo: 'cofre',
          };
          mensagemProcessandoPagamento();
          pagamentoCartao_CadastraPedido_GetDados(doacao_resgate, tipoTitulos, qtdTitulos, dadosCartao, tipo, codMilliSeconds);
        }
      });
    }
    else if ((pgc == 2) || (pgc == '2')) {
      mensagemProcessandoPagamento();
      var itemSelecionado = $('#lista_cartoes_cofre option').filter(':selected').text();
      var ultimos4 = itemSelecionado.substring(itemSelecionado.lastIndexOf(" ") + 1, itemSelecionado.length);
      var bandeiraCofre = itemSelecionado.split(' ')[0].toLowerCase();

      var dadosCartao = {
        cod_seg: $("#cartaoCodSegCofre").val(),  // codigo de segurança,(TEMPORARIO)
        tipo: 'cofre',
        guidcofre: $("#lista_cartoes_cofre").val(),  // GuidCofre
        bandeira: bandeiraCofre,
        uf: ultimos4
      }
      var dados = {
        codMilliSeconds: codMilliSeconds,
        doacao_resgate: doacao_resgate,
        tipoTitulos: tipoTitulos,
        qtdTitulos: qtdTitulos,
        payment_method: tipo
      };
      dados['dadosCartao'] = dadosCartao;
      cadastraPedidoCartaoGerencianet(dados, '', 's');
    }

  };

  function carregaCofre() {
    if ((pgc == 1) || (pgc == '1') || (pgc == "")) {
      //GetNet Modelo 1
      // lista cartões do cofre
      configuraCardCartaoCofre()
    }
    else if ((pgc == 2) || (pgc == "2")) {
      //Gerencianet Modelo 1
      configuraCardCartaoCofre_EFI()
    }
  }

  function configuraCardCartaoCofre_EFI() {

    if (Object.keys(carrinhoCC).length > 0) {
      // TEM CARTAO SALVO NO COFRE
      $('#cartao_credito_cofre').show();
      $('#cartao_credito_novo_cartao').hide();

      $("#lista_cartoes_cofre").empty();
      $.each(carrinhoCC, function (index, value) {
        var bandeira = value.bc;
        bandeira = bandeira[0].toUpperCase() + bandeira.slice(1);
        $('#lista_cartoes_cofre').append($('<option>', {
          value: value.gc,
          text: bandeira + ' final: ' + value.uf
        }));
      });
      $('#lista_cartoes_cofre').append($('<option>', {
        value: 'novo',
        text: "Adicionar Novo Cartão"
      }));

      if ($("#lista_cartoes_cofre").val() == 'novo') {
        $('#li_credito_cofre_codseguranca').hide();
        $('#li_cartao_cofre_pg').hide();
        $('#cartao_credito_novo_cartao').show();
      }
      else if ($("#lista_cartoes_cofre").val() != '') {
        $('#li_credito_cofre_codseguranca').show();
        $('#li_cartao_cofre_pg').show();
        $('#cartao_credito_novo_cartao').hide();
      }

    }
    else {
      // NAO TEM CARTAO SALVO NO COFRE
      $("#lista_cartoes_cofre").empty();
      $('#cartao_credito_cofre').hide();
      $('#cartao_credito_novo_cartao').show();
    }
  }

  if (tipoCofre=='0'){
    $('#li_salvar_cartao').hide();
    $('#cartao_credito_cofre').hide();
    $('#cartao_credito_novo_cartao').show();
  }
  else{
    $('#li_salvar_cartao').show();
    carregaCofre();
  }


  ///************* Fim Cofre */

  function getValorTotalCarrinho(tipoTitulos, qtdTitulos) {
    var retorno = "";
    var todosSorteios = JSON.parse(localStorage.getItem("todosSorteios"));
    if (tipoTitulos.substring(0, 9) == 'aleatorio') {
      if ((todosSorteios.totalSorteiosAbertos == 1) || (todosSorteios.totalSorteiosAbertos == '1')) {
        if ((modeloApp == 2) || (modeloApp == '2')) {
          $.each(carrinhoObject, function (indexSorteio, dados) {
            if (indexSorteio != "info") {
              $.each(dados, function (guidSorteio, dadosSorteio) {
                if (retorno == "") {
                  retorno = converterParaMoeda(dadosSorteio.dados_sorteio.valor_venda, 'numeroUS', 'US') * qtdTitulos;
                }
              });
            }
          });
        }
      }
      else {
        // ainda n está disponível compra aletória para multiplos sorteios
        app.preloader.hide();
        app.dialog.close();
        logoff();
      }
    }
    else {
      retorno = parseFloat(carrinhoObject.info.valorCarrinho);
    }
    return retorno;
  }

  function organizaTermoContrato(numIdSorteio) {
    if (parseInt(carrinhoObject.info.qtdSorteiosCarrinho) == 1) {
      $("#termoContrato_titulos").hide();
      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_1');
      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_2');
      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_3');
      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo');
      $("#S" + numIdSorteio + "_li_accordion_box").addClass('accordion_box_' + numIdSorteio);
    }
    else {
      $("#S1_termoContrato_block").hide();
      $("#S3_termoContrato_block").hide();
      $("#S2_termoContrato_block").hide();
      $("#S" + numIdSorteio + "_termoContrato_block").show();

      $("#S1_termoContrato_titulo").removeClass('tabCarrinhoItemAtivo');
      $("#S2_termoContrato_titulo").removeClass('tabCarrinhoItemAtivo');
      $("#S3_termoContrato_titulo").removeClass('tabCarrinhoItemAtivo');

      $("#S1_termoContrato_titulo").addClass('tabCarrinhoItemInativo');
      $("#S2_termoContrato_titulo").addClass('tabCarrinhoItemInativo');
      $("#S3_termoContrato_titulo").addClass('tabCarrinhoItemInativo');

      $("#S" + numIdSorteio + "_termoContrato_titulo").removeClass('tabCarrinhoItemInativo');
      $("#S" + numIdSorteio + "_termoContrato_titulo").addClass('tabCarrinhoItemAtivo');


      $("#S" + numIdSorteio + "_termoContrato_titulo").removeClass('tabCarrinhoItemAtivo_1');
      $("#S" + numIdSorteio + "_termoContrato_titulo").removeClass('tabCarrinhoItemAtivo_2');
      $("#S" + numIdSorteio + "_termoContrato_titulo").removeClass('tabCarrinhoItemAtivo_3');
      $("#S" + numIdSorteio + "_termoContrato_titulo").addClass('tabCarrinhoItemAtivo_' + numIdSorteio);

      $("#S" + numIdSorteio + "_li_accordion_box").addClass('accordion_box_' + numIdSorteio);

      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_1');
      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_2');
      $("#divTermoContratoConteudo").removeClass('tabCarrinhoConteudo_3');
      $("#divTermoContratoConteudo").addClass('tabCarrinhoConteudo_' + numIdSorteio);
    }
  }
});
