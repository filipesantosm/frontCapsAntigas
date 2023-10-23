jQuery(function () {
  var ktmp = Date.now();
  // Mascara para deixar somente número(sem espaço)
  $('.pin-login').mask('0');
  $('#novoPinCode').mask('0-0-0-0-0-0');
  $('#cad_PinCodeLogin_web').mask('0-0-0-0-0-0');
  $('#cad_PinCodeLogin_app').mask('0-0-0-0-0-0');

  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Estou%20com%20dificuldades%20para%20efetuar%20cadastro%20na%20tela%20P2.%20Poderia%20me%20ajudar%3f';
  $("#cadastro_suporteP2").attr("href", novoTelSuporte);

  // desabilita o form p não dar erro ao efetuar o login
  $('#form_cadastrop3').on('submit', function () { return false; });
  // CAMPO SENHA
  // Mostrar a senha/pin digitado
  $("#cad_pass_show_web").on("click", function () {
    cad_pass_show_web();
  });
  // Ocultar a senha/pin digitado
  $("#cad_pass_hide_web").on("click", function () {
    cad_pass_hide_web();
  });

  // Mostrar a senha/pin digitado quando estiver no WEBAPP
  function cad_pass_show_web() {
    $("#cad_PinCodeLogin_web").prop("type", "tel");
    $("#cad_pass_show_web").hide();
    $("#cad_pass_hide_web").show();
  }
  // Ocultar a senha/pin digitado quando estiver no WEBAPP
  function cad_pass_hide_web() {
    $("#cad_PinCodeLogin_web").prop("type", "password");
    $("#cad_pass_hide_web").hide();
    $("#cad_pass_show_web").show();
  }

  // Mostrar a senha/pin digitado
  $("#cad_pass_show_app").on("click", function () {
    cad_pass_show_app();
  });
  // Ocultar a senha/pin digitado
  $("#cad_pass_hide_app").on("click", function () {
    cad_pass_hide_app();
  });

  // Mostrar a senha/pin digitado quando estiver no APP
  function cad_pass_show_app() {
    $("#cad_PinCodeLogin_app").removeClass("password-mascara");
    $("#cad_pass_show_app").hide();
    $("#cad_pass_hide_app").show();
  }
  // Ocultar a senha/pin digitado quando estiver no APP
  function cad_pass_hide_app() {
    $("#cad_PinCodeLogin_app").addClass("password-mascara");
    $("#cad_pass_show_app").show();
    $("#cad_pass_hide_app").hide();
  }



  $('#CadcadastraP3').click(function () {
    // Pega a senha conforme o formulário preenchido
    if (device.platform == 'WEBAPP') {
      var novoPinCode = $("#cad_PinCodeLogin_web").val().replace(/[-+_ *]/g, "");
    }
    else {
      var novoPinCode = $("#cad_PinCodeLogin_app").val().replace(/[-+_ *]/g, "");
    }
    //var novoPinCode = $("#novoPinCode").val().replace(/[-+_ *]/g, "");

    var aceite_msg_publicitaria = $("#CadcheckTermosContato").is(":checked");
    var aceite_capitalizadora = $("#CadcheckPoliticaLGPD").is(":checked");

    if (novoPinCode.length != 6) {
      ErroValidacao('Por favor, informe uma senha de 6 números.');
      return false;
    }
    else {
      var user_pass = novoPinCode;
    }
    if (($("#CadcheckPolitica").is(":checked")) && ($("#CadcheckPoliticaLGPD").is(":checked"))) {
      app.dialog.preloader('Cadastrando');

      var dataC = {
        user_login: localStorage.getItem("cpf"),
        cpf: localStorage.getItem("cpf"),
        aceite_msg_publicitaria: aceite_msg_publicitaria.toString(),
        user_pass, user_pass,
        cadastro: '3',
        lang: 'pt-br',
        aceite_capitalizadora: aceite_capitalizadora
      };
      var dataD = {
        ktmp: ktmp,
        device: localStorage.getItem("device"),
      };
      var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
      var dataD = JSON.stringify(dataD);

      app.request({
        url: servidor + '/api_public/cadastro/cadastrar.php',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
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
            if ((respMerge.todosSorteios.totalSorteiosAbertos == "0") || (respMerge.todosSorteios.totalSorteiosAbertos == 0)) {
              ErroAjax('error', 'Sorteio ainda não disponível', 's');
            }
            else {
              efetuarLogin(respMerge);
              return true;
            }
          }
          else {
            ErroAjax(resp);
            return false;
          }
        },
        error: function (erro) {
          ErroAjax('error', 'conexao/servidor');
          //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_004)');
        },
        complete: function () { }
      });
    } else {
      app.dialog.alert("É necessário aceitar a <b>Política de Privacidade</b> e <b>Política de Proteção de Dados</b> para se cadastrar.", "<span style='color: var(--cor_vermelha);'><i class='mdi mdi-alert'></i> Aceitar Termos</span>");
      //app.dialog.alert("É necessário aceitar as <b>Políticas de Privacidade</b> e também os <b>Termos de Uso</b> para se cadastrar.", "<i class='mdi mdi-alert'></i> Aceitar Termos");
      return false;
    }
  });
});

$("#CadcheckTermosContato").click(function () {
  if ($(this).is(':checked')) {
    $("#msg_publicidade").show();
  } else {
    $("#msg_publicidade").hide();
  }
});