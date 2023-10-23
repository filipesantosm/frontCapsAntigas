jQuery(function () {
  var ktmp = Date.now();
  var userAlterarSenha = "";
  var codeRecover = "";
  //copyright
  $("#login-desenvolidoPor").text(copyright_desenvolvidoPor);
  $("#login-versaoAPP").text(copyright_versaoAPP);

  // desabilita o form p não dar erro ao efetuar o login
  $('#form_login').on('submit', function () { return false; });
  if (device.platform == 'WEBAPP') {
    $("#span-TextButton").addClass('span-TextButton-webapp');
    $("#span-TextButton").removeClass('span-TextButton');
  }

  //Atualiza Telefone de suporte Whatsapp
  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Estou%20com%20dificuldades%20para%20efetuar%20o%20login%2c%20poderia%20me%20ajudar%3f';
  $("#login_suporteWA").attr("href", novoTelSuporte);

  // Campo SENHA
  // Mostrar a senha/pin digitado
  $("#pass_show_web").on("click", function () {
    pass_show_web();
  });
  // Ocultar a senha/pin digitado
  $("#pass_hide_web").on("click", function () {
    pass_hide_web();
  });

  // Mostrar a senha/pin digitado quando estiver no WEBAPP
  function pass_show_web() {
    $("#novoPinCodeLogin_web").prop("type", "tel");
    $("#pass_show_web").hide();
    $("#pass_hide_web").show();
  }
  // Ocultar a senha/pin digitado quando estiver no WEBAPP
  function pass_hide_web() {
    $("#novoPinCodeLogin_web").prop("type", "password");
    $("#pass_hide_web").hide();
    $("#pass_show_web").show();
  }

  // Mostrar a senha/pin digitado
  $("#pass_show_app").on("click", function () {
    pass_show_app();
  });
  // Ocultar a senha/pin digitado
  $("#pass_hide_app").on("click", function () {
    pass_hide_app();
  });

  // Mostrar a senha/pin digitado quando estiver no APP
  function pass_show_app() {
    $("#novoPinCodeLogin_app").removeClass("password-mascara");
    $("#pass_show_app").hide();
    $("#pass_hide_app").show();
  }
  // Ocultar a senha/pin digitado quando estiver no APP
  function pass_hide_app() {
    $("#novoPinCodeLogin_app").addClass("password-mascara");
    $("#pass_show_app").show();
    $("#pass_hide_app").hide();
  }


  // Escreve o CPF informado anteriormente
  $('#logincpf').val(localStorage.getItem("cpf"));
  $('#logincpf').mask('000.000.000-00');
  $("#RecSenhaTelefoneCadastro").mask('(00) 00000-0009');
  $('#RecSenhaCPFCadastro').mask('000.000.000-00');
  $('#codigoRecebido').mask('AA-AA-AA-AA');
  $('#novaSenha').mask('0-0-0-0-0-0');

  $('#novoPinCodeLogin_web').mask('0-0-0-0-0-0');
  $('#novoPinCodeLogin_app').mask('0-0-0-0-0-0');
  $('#logincpf').prop('readonly', true);
  $("#logincpf").attr("readonly", true);
  $('#RecSenhaCPFCadastro').prop('readonly', true);
  $("#RecSenhaCPFCadastro").attr("readonly", true);

  // Novo cadastro
  $("#novoCadastro").on("click", function () {
    // limpa historico e inicia pelo index, 
    // onde será solicitado o CPF e analisado se já tem cadastro
    if (localStorage.getItem("telSuporte")) { var telSuporte = localStorage.getItem("telSuporte"); }
    if (localStorage.getItem("tel_mkt")) { var tel_mkt = localStorage.getItem("tel_mkt"); }
    if (localStorage.getItem("linkAtualizacao")) { var linkAtualizacao = localStorage.getItem("linkAtualizacao"); }

    localStorage.clear();

    if (linkAtualizacao) { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
    if (telSuporte) { localStorage.setItem("telSuporte", telSuporte); }
    if (tel_mkt) { localStorage.setItem("tel_mkt", tel_mkt); }
    app.views.main.router.navigate('/index/');
  });

  // Novo cadastro
  $("#AlterarCPF").on("click", function () {
    // limpa historico e inicia pelo index, 
    // onde será solicitado o CPF e analisado se já tem cadastro
    if (localStorage.getItem("telSuporte")) { var telSuporte = localStorage.getItem("telSuporte"); }
    if (localStorage.getItem("tel_mkt")) { var tel_mkt = localStorage.getItem("tel_mkt"); }
    if (localStorage.getItem("linkAtualizacao")) { var linkAtualizacao = localStorage.getItem("linkAtualizacao"); }
    if (localStorage.getItem("WWAPP_comprar")) { var WWAPP_comprar = localStorage.getItem("WWAPP_comprar"); }

    localStorage.clear();

    if (telSuporte) { localStorage.setItem("telSuporte", telSuporte); }
    if (tel_mkt) { localStorage.setItem("tel_mkt", tel_mkt); }
    if (linkAtualizacao) { localStorage.setItem("linkAtualizacao", linkAtualizacao); }
    if (WWAPP_comprar) { localStorage.setItem("WWAPP_comprar", WWAPP_comprar); }

    app.views.main.router.navigate('/index/');
  });

  // Fazer login
  $('#Fazerlogin').on('click', function () {
    // Pega a senha conforme o formulário preenchido
    if (device.platform == 'WEBAPP') {
      var novoPinCodeLogin = $("#novoPinCodeLogin_web").val().replace(/[-+_ *]/g, "");
    }
    else {
      var novoPinCodeLogin = $("#novoPinCodeLogin_app").val().replace(/[-+_ *]/g, "");
    }
    if (novoPinCodeLogin.length != 6) {
      ErroValidacao('Por favor, informe uma senha de 6 números.');
      return false;
    }
    else {
      var user_pass = novoPinCodeLogin;
    }
    var user_login = $("#logincpf").val();

    if (user_login == '') {
      ErroValidacao('Por favor, preencha seu C.P.F corretamente');
      return false;
    }
    if (!validaCpfCnpj(user_login)) { // envio do CNPJ com a mascara
      ErroValidacao('Favor informar um CPF válido.');
      return false;
    }
    app.dialog.preloader('Fazendo Login...');

    var dataC = {
      user_login: user_login,
      user_pass: user_pass,
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };

    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/login/logar.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
      crossDomain: true,
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };

        if (respMerge.status == "ok") {
          if ((respMerge.todosSorteios.totalSorteiosAbertos == "0") || (respMerge.todosSorteios.totalSorteiosAbertos == 0)) {
            ErroAjax('error', 'Sorteio ainda não disponível', 's');
          }
          else {
            efetuarLogin(respMerge);
          }
        }
        else if (respMerge.direcionar) {
          logoff();
        }
        else if ((respMerge.status == "erro") && (respMerge.msg_usu == "Usuário/Senha inválido")) {

          var Dialog_text = "Usuário / Senha inválido";
          var Dialog_title = null;
          // Cria alerta
          app.dialog.create({
            verticalButtons: true,
            title: Dialog_title,
            text: '<div style="font-size: 1em;text-align: center;">' + Dialog_text + '</div>',
            closeByBackdropClick: false, backdrop: true,
            buttons: [
              {
                text: '<i style="color: #fff703;font-size: 38px !important; vertical-align: middle;" class="mdi mdi-chevron-right"></i>' +
                  'TENTAR NOVAMENTE',
                cssClass: 'dialog-button-vertical_cor_1',
                onClick: function () {
                  app.dialog.close();
                  pass_show_web();
                  $("#novoPinCodeLogin_app").removeClass("password-mascara");
                },
              },
              {
                text: '<i style="color: #db1921;font-size: 38px !important;vertical-align: middle;" class="mdi mdi-chevron-double-right"></i>' +
                  'CRIAR NOVA SENHA',
                cssClass: 'dialog-button-vertical_cor_2',
                onClick: function () {
                  abrirEsqueciSenha();
                },
              },
            ],
            on: {
              open: function (a2, b2, c2) {
                $(".dialog-buttons").css({ marginLeft: "0px", marginRight: "0px" });
              },
              opened: function (a2, b2, c2) {
                $(".dialog-buttons").css({ marginLeft: "0px", marginRight: "0px" });
              }
            }
          }).open();
        }
        else {
          ErroAjax(respMerge);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_018)');
      },
      complete: function () { }
    });
  });

  // Ao clicar no ESQUECI a senha, abrir o poupup/Modal
  $('#esqueceuSenha').on('click', function () {
    abrirEsqueciSenha();
  });

  function abrirEsqueciSenha() {
    $('#RecSenhaCPFCadastro').val($('#logincpf').val());
    $("#li-RecSenhaTelefoneCadastro").show();
    $("#li-RecSenhaEmailCadastro").hide();
    app.popup.open('.popup-RecuperarSenha', true);
    $("#bt-EnviarSenhaSMS").hide();
    $("#bt-EnviarSenhaEMAIL").hide();
  }
  // Cria a Modal para enviar a senha
  var esqueceuSenha = app.actions.create({
    buttons: [
      {
        text: '<span style="font-size: 0.9em;">Receber código por SMS</span>',
        icon: "<i style='font-size: 1.3rem;' class='mdi mdi-message-arrow-right-outline color-azul'></i>",
        onClick: function () {
          $("#li-RecSenhaTelefoneCadastro").show();
          $("#li-RecSenhaEmailCadastro").hide();
          $("#bt-EnviarSenhaSMS").show();
          $("#bt-EnviarSenhaEMAIL").hide();
          app.popup.open('.popup-RecuperarSenha', true);
        }
      },
      {
        text: '<span style="font-size: 0.9em;"> Receber código por EMAIL</span>',
        icon: "<i style='font-size: 1.3rem;' class='mdi mdi-email-send-outline color-azul'></i>",
        //color: 'red',
        onClick: function () {
          $("#li-RecSenhaEmailCadastro").show();
          $("#li-RecSenhaTelefoneCadastro").hide();
          $("#bt-EnviarSenhaSMS").hide();
          $("#bt-EnviarSenhaEMAIL").show();
          app.popup.open('.popup-RecuperarSenha', true);
        }
      }
    ]
  });

  // Envia a senha por SMS
  $('#bt-EnviarSenhaSMS').on('click', function () {
    recuperarSenha('sms');
  });

  // Envia a senha por EMAIL
  $('#bt-EnviarSenhaEMAIL').on('click', function () {
    recuperarSenha('email');
  });

  // Recupera senha
  $('#bt-RestarSenha').on('click', function () {
    var user_login = $('#RecSenhaCPFCadastro').val();
    var telefone = $('#RecSenhaTelefoneCadastro').val();
    resetarsenhanew(user_login, telefone);
  });

  function recuperarSenha(tipo) {
    var RecSenhaCPFCadastro = $('#RecSenhaCPFCadastro').val();
    var RecSenhaEmailCadastro = $('#RecSenhaEmailCadastro').val();
    var RecSenhaTelefoneCadastro = $('#RecSenhaTelefoneCadastro').val();

    // Valida CPF
    var cpf_informado = RecSenhaCPFCadastro.replace(/[^0-9]/g, '');
    if (cpf_informado.length !== 11) {
      ErroValidacao('Favor informar um CPF válido.');
      return false;
    }
    if (!validaCpfCnpj(RecSenhaCPFCadastro)) {
      ErroValidacao('Favor informar um CPF válido.');
      return false;
    }
    localStorage.setItem("cpf", RecSenhaCPFCadastro);

    if (tipo == "email") {
      //VALIDACAO DO EMAIL 1a etapa
      var sEmail = RecSenhaEmailCadastro;
      sEmail = sEmail.toLowerCase();
      // filtros
      var emailFilter = /^.+@.+\..{2,}$/;
      var illegalChars = /[\(\)\<\>\,\;\:\\\/\"\[\]]/
      // condicao
      if (!(emailFilter.test(sEmail)) || sEmail.match(illegalChars)) {
        //EMAIL INVALIDO
        ErroValidacao('Por favor, informe um e-mail válido!');
        return false;
      }
      //VALIDACAO DO EMAIL 1a etapa
      if (!validaEmail(sEmail)) {
        ErroValidacao('Por favor, informe um e-mail válido!');
        return false;
      }
      EnviaCodigoRecuperacao(RecSenhaCPFCadastro, RecSenhaEmailCadastro, '', tipo);
    } else if (tipo == "sms") {
      if (RecSenhaTelefoneCadastro == '') {
        ErroValidacao('Por favor, informe o número do seu celular.');
        return false;
      }
      else if (RecSenhaTelefoneCadastro.length < 15) {
        ErroValidacao('Por favor, informe um telefone correto.');
        return false;
      }
      else if (!validaPhone(RecSenhaTelefoneCadastro)) {
        ErroValidacao('Por favor, informe um telefone correto.');
        return false;
      }
      EnviaCodigoRecuperacao(RecSenhaCPFCadastro, '', RecSenhaTelefoneCadastro, tipo);
    }
  }

  //Envia o novo código de recuperação de senha por emai ou SMS
  function EnviaCodigoRecuperacao(user_login, email, telefone, tipo) {
    app.popup.close('.popup-RecuperarSenha', true);
    app.dialog.preloader('Verificando...');
    app.request({
      url: servidor + '/public/login/recuperar-senha.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "recuperarSenha");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      data: {
        user_login: user_login,
        cpf: user_login,
        user_email: email,
        telefone: telefone,
        tipo: tipo,
        emailSuporte: emailSuporte,
        emailAssunto: "Recuperar acesso",
        NomeEmpresa: NomeEmpresa,
        device: localStorage.getItem("device")
      },
      success: function (resposta) {
        app.dialog.close();
        if (resposta.status == "ok") {
          localStorage.setItem("ValidarCodRecSenha", "Y");
          app.popup.open('.popup-ValidaSenha', true);
        }
        else {
          //app.dialog.alert(resposta.msg_usu, 'ops...!');
          app.dialog.alert(resposta.msg_usu, null);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_019)');
        return false;
      },
      complete: function () { }
    });
  };

  // Executa ao inciar, verificando a necessidade de abrir o popup de validar codigo
  VerificaValidacaoCodigo();

  // Verifica se o usuário está aguardando algum código e abre a popup ao iniciar
  function VerificaValidacaoCodigo() {
    if (localStorage.getItem("ValidarCodRecSenha") == "Y") {
      app.popup.open('.popup-ValidaSenha', true);
    }
    else {
      app.popup.close('.popup-ValidaSenha', true);
      localStorage.removeItem("ValidarCodRecSenha");
      $("#pin-1").val('');
      $("#pin-1").focus();
    }
  }


  // Remover as variáveis ao fechar o popup
  $('.popup-ValidaSenha').on('popup:close', function () {
    localStorage.removeItem("ValidarCodRecSenha");
    $('#codigoRecebido').val('');
  });

  // Ao clicar em Validar a senha, chamar a função de validação
  $('#bt-ValidaSenha').on('click', function () {
    app.popup.close('.popup-validaCodigo', true);
    var codigo = $('#codigoRecebido').val();
    localStorage.setItem("CodRecSenha", codigo);
    validarCodigo(localStorage.getItem("cpf"), codigo);
  });

  function validarCodigo(user_login, codigo) {
    app.dialog.preloader('Verificando...');
    app.request({
      url: servidor + '/public/login/validar-codigo.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "recuperarSenha");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      data: {
        user_login: user_login,
        codigo: codigo,
        device: localStorage.getItem("device")
      },
      success: function (resposta) {
        app.dialog.close();
        if (resposta.status == "ok") {
          app.popup.close('.popup-ValidaSenha', true);
          app.popup.open('.popup-novaSenha', true);
        }
        else {
          ErroAjax(resposta);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_020)');
        return false;
      },
      complete: function () { }
    });
  };

  // Ao clicar em Cadastrar nova senha, atualizar servidor e logar
  $('#bt-cadastraNovaSenha').on('click', function () {

    if (userAlterarSenha == localStorage.getItem("cpf")) {
      var novaSenha = $('#novaSenha').val();
      var novaSenha = novaSenha.replace(/[^0-9]/g, '');
      if (novaSenha.length == 6) {
        // Recuperar senha padrao básico, n tem código gerado pela api
        var codigo = codeRecover;

        //var codigo = localStorage.getItem("CodRecSenha");
        //localStorage.removeItem("CodRecSenha");
        $('#novaSenha').val('');
        app.popup.close('.popup-novaSenha', true);
        criarNovaSenha(userAlterarSenha, codigo, novaSenha);
      }
      else {
        ErroValidacao('Por favor, informe uma senha de 6 números.');
        return false;
      }
    }
    else {
      ErroValidacao('Usuário incorreto');
      app.popup.close('.popup-novaSenha', true);
    }

  });

  function criarNovaSenha(user_login, codigo, user_pass) {
    app.dialog.preloader('Salvando nova senha...');

    var dataC = {
      user_login: user_login,
      user_pass: user_pass,
      codigo: codigo,
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);

    app.request({
      url: servidor + '/api_public/login/salvar_nova_senha.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "recuperarSenha");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == "ok") {
          efetuarLogin(respMerge);
          return true;
        }
        else {
          ErroAjax(respMerge);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_021)');
        return false;
      },
      complete: function () { }
    });
  };


  //Envia o novo código de recuperação de senha por emai ou SMS
  function resetarsenhanew(user_login, telefone) {
    app.popup.close('.popup-RecuperarSenha', true);
    app.dialog.preloader('Verificando...');

    var dataC = {
      user_login: user_login,
      cpf: user_login,
      telefone: telefone,
      email: 'email',
      tipo: 'basico'
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };

    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/login/recuperar_senha.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "recuperarSenha");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      crossDomain: true,
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == "ok") {
          codeRecover = respMerge.cod;
          userAlterarSenha = user_login.replace(/[^0-9]/g, '').toString();
          localStorage.setItem("ValidarCodRecSenha", "Y");
          app.popup.open('.popup-novaSenha', true);
        }
        else {
          app.dialog.alert(respMerge.msg_usu, null);
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_019)');
        return false;
      },
      complete: function () { }
    });
  };

});
