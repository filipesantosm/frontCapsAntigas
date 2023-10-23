jQuery(function () {

  //Atualiza Telefone de suporte Whatsapp
  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Gostaria%20de%20atualizar%20meus%20dados%20cadastrais.';
  $("#perfil_suporteWA").attr("href", novoTelSuporte);

  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
  // Atualiza endereço do Titular
  $("#perfil_nome").val(dadosUsuario.name);
  //cpf
  var cpfFormatado = dadosUsuario.cpf.substring(0, 3) + '.' + dadosUsuario.cpf.substring(3, 6) + '.' + dadosUsuario.cpf.substring(6, 9) + '-' + dadosUsuario.cpf.substring(9, 11);
  $("#perfil_cpf").val(cpfFormatado);
  $("#perfil_email").val(dadosUsuario.user_email);
  //telefone
  var telefoneFormatado = '(' + dadosUsuario.telefone.substring(0, 2) + ') ' + dadosUsuario.telefone.substring(2, 7) + '-' + dadosUsuario.telefone.substring(7, 11);
  $("#perfil_telefone").val(telefoneFormatado);

  $("#perfil_cep").val(dadosUsuario.cep);
  $("#perfil_end_logradouro").val(dadosUsuario.logradouro);
  $("#perfil_end_numero").val(dadosUsuario.numero);
  $("#perfil_end_complemento").val(dadosUsuario.complemento);
  $("#perfil_end_bairro").val(dadosUsuario.bairro);
  $("#perfil_end_cidade").val(dadosUsuario.localidade);
  $("#perfil_end_cidade_e_uf").val(dadosUsuario.localidade + " / " + dadosUsuario.uf);
  $("#perfil_end_uf").val(dadosUsuario.uf);
  $("#perfil_end_pais").val(dadosUsuario.pais);

  if (dadosUsuario.sexogenero) { $("#perfil_sexogenero").val(dadosUsuario.sexogenero); }

  if (dadosUsuario.aceite_msg_publicitaria == "Y") {
    $('#perfil_msg_pub').prop('checked', true).attr('checked', 'checked');
  }
  else {
    $('#perfil_msg_pub').prop('checked', false).attr('checked', 'checked');
  }

  $('#perfil_nome').prop('readonly', true);
  //$('#perfil_email').prop('readonly', true);
  //$('#perfil_telefone').prop('readonly', true);
  $('#perfil_cpf').prop('readonly', true);
  $('#perfil_end_logradouro').prop('readonly', true);
  //$('#perfil_end_bairro').prop('readonly', true);
  $('#perfil_end_cidade').prop('readonly', true);
  $('#perfil_end_cidade_e_uf').prop('readonly', true);
  $('#perfil_end_pais').prop('readonly', true);

  $('#perfil_nome').attr('readonly', true);
  //$('#perfil_email').attr('readonly', true);
  //$('#perfil_telefone').attr('readonly', true);
  $('#perfil_cpf').attr('readonly', true);
  $('#perfil_end_logradouro').attr('readonly', true);
  //$('#perfil_end_bairro').attr('readonly', true);
  $('#perfil_end_cidade').attr('readonly', true);
  $('#perfil_end_cidade_e_uf').attr('readonly', true);
  $('#perfil_end_pais').attr('readonly', true);

  $('#perfil_telefone').mask('(00) 00000-0009');
  $('#perfil_cep').mask('00.000-000');
  $('#perfil_cpf').mask('000.000.000-00');

  $('#perfil_cep').on("input", function () {
    var caracteresDigitados = $(this).val().length;
    if (caracteresDigitados == 10) {
      var ktmp = Date.now();
      // update campos
      var cep = $(this).val();
      app.dialog.preloader('Pesquisando');

      var dataC = {
        cep: cep,
        cpf: localStorage.getItem("cpf"),
        user_login: localStorage.getItem("user_login")
      };
      var dataD = {
        ktmp: ktmp,
        device: localStorage.getItem("device"),
      };
      var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
      var dataD = JSON.stringify(dataD);

      app.request({
        url: servidor + '/api_public/cep/valida_cep.php',
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
            if ((!respMerge.dados.logradouro) || (respMerge.dados.logradouro == '')) {
              $("#perfil_end_logradouro").attr("readonly", false);
              $("#perfil_end_logradouro").val('');
              $("#perfil_end_logradouro").addClass("campo_formulario_cinza");
            }
            else {
              $("#perfil_end_logradouro").val(respMerge.dados.logradouro);
              $("#perfil_end_logradouro").attr("readonly", true);
              $("#perfil_end_logradouro").removeClass("campo_formulario_cinza");
            }
            if ((!respMerge.dados.bairro) || (respMerge.dados.bairro == '')) {
              $("#perfil_end_bairro").attr("readonly", false);
              $("#perfil_end_bairro").val('');
              $("#perfil_end_bairro").addClass("campo_formulario_cinza");
            }
            else {
              $("#perfil_end_bairro").val(respMerge.dados.bairro);
              // $("#perfil_end_bairro").attr("readonly", true);
              //$("#perfil_end_bairro").removeClass("campo_formulario_cinza");
              $("#perfil_end_bairro").addClass("campo_formulario_cinza");
            }
            if ((!respMerge.dados.localidade) || (respMerge.dados.localidade == '')) {
              $("#perfil_end_cidade_e_uf").attr("readonly", false);
              $("#perfil_end_cidade_e_uf").val('');
              $("#perfil_end_cidade_e_uf").addClass("campo_formulario_cinza");

              $("#perfil_end_cidade").attr("readonly", false);
              $("#perfil_end_cidade").val('');
              $("#perfil_end_cidade").addClass("campo_formulario_cinza");

              $("#perfil_end_uf").attr("readonly", false);
              $("#perfil_end_uf").val('');
              $("#perfil_end_uf").addClass("campo_formulario_cinza");
            }
            else {
              $("#perfil_end_cidade_e_uf").val(respMerge.dados.localidade + " / " + respMerge.dados.uf);
              $("#perfil_end_cidade_e_uf").attr("readonly", true);
              $("#perfil_end_cidade_e_uf").removeClass("campo_formulario_cinza");

              $("#perfil_end_cidade").val(respMerge.dados.localidade);
              $("#perfil_end_cidade").attr("readonly", true);
              $("#perfil_end_cidade").removeClass("campo_formulario_cinza");

              $("#perfil_end_uf").val(respMerge.dados.uf);
              $("#perfil_end_uf").attr("readonly", true);
              $("#perfil_end_uf").removeClass("campo_formulario_cinza");

            }
            $("#perfil_end_pais").val('Brasil');
          }
          else {
            //app.dialog.alert(resposta.msg_usu, 'ops...!');
            app.dialog.alert(respMerge.msg_usu, null);
            $("#perfil_end_pais").val('');
            $("#perfil_end_pais").attr("readonly", true);

            $("#perfil_end_cidade_e_uf").val('');
            $("#perfil_end_cidade_e_uf").attr("readonly", true);
            $("#perfil_end_cidade_e_uf").addClass("campo_formulario_cinza");

            $("#perfil_end_bairro").val('');
            //$("#perfil_end_bairro").attr("readonly", true);
            $("#perfil_end_bairro").addClass("campo_formulario_cinza");

            $("#perfil_end_logradouro").val('');
            $("#perfil_end_logradouro").attr("readonly", true);
            $("#perfil_end_logradouro").addClass("campo_formulario_cinza");
            return false;
          }
        },
        error: function (erro) {
          ErroAjax('error', 'conexao/servidor');
          //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_029)');
        },
        complete: function () { }
      });
    }
  });

  $('#btn_AtualizarPerfil').on('click', function () {
    var ktmp = Date.now();

    var toggle = app.toggle.get('.toggle_msg_pub');
    if (toggle.checked) {
      var perfil_msg_pub = "Y";
    }
    else {
      var perfil_msg_pub = "N";
    }
    var formData = app.form.convertToData('#perfil_form');
    // Atualiza o campo perfil_msg_pub 
    formData.perfil_msg_pub = perfil_msg_pub;
    var cpf1 = localStorage.getItem("user_login");
    var cpf2 = $('#perfil_cpf').val();
    cpf2 = cpf2.replace(/\ /g, '');
    cpf2 = cpf2.replace(/\./g, '');
    cpf2 = cpf2.replace(/\-/g, '');
    // valida se o CPF do formulário é o mesmo do usuário
    if (cpf1 != cpf2) {
      ErroValidacao('Erro, Não foi possível editar o perfil.');
      return false;
    }

    var cep = $("#perfil_cep").val();
    var logradouro = $("#perfil_end_logradouro").val();
    var numero = $("#perfil_end_numero").val();
    var complemento = $("#perfil_end_complemento").val();
    var bairro = $("#perfil_end_bairro").val();
    var cidade = $("#perfil_end_cidade").val();
    var uf = $("#perfil_end_uf").val();
    var pais = $("#perfil_end_pais").val();
    var telefone = $("#perfil_telefone").val();
    var email = $("#perfil_email").val();
    var sexogenero = $("#perfil_sexogenero").val();
    email = email.toLowerCase();
    email = email.replace(/\ /g, '');
    email = email.replace(".@", '@');
    document.getElementById("perfil_email").value = email;

    if (!validaEmail(email)) {
      ErroValidacao('Favor informar um email válido.');
      return false;
    }
    //VALIDACAO DO EMAIL
    var sEmail = email;
    // filtros
    var emailFilter = /^.+@.+\..{2,}$/;
    var illegalChars = /[\(\)\<\>\,\;\:\\\/\"\[\]]/
    // condicao
    if (!(emailFilter.test(sEmail)) || sEmail.match(illegalChars)) {
      //EMAIL INVALIDO
      ErroValidacao('Favor informar um email válido. 3');
      return false;
    }

    $("#perfil_email").val(email);

    if (telefone == '') {
      ErroValidacao('Favor preencher o e-mail corretamente');
      return false;
    }
    else if (telefone.length < 15) {
      ErroValidacao('Por favor, informe um telefone correto');
      return false;
    }
    else if (!validaPhone(telefone)) {
      ErroValidacao('Por favor, informe um telefone correto');
      return false;
    }

    if (logradouro == '') {
      ErroValidacao('Favor preencher o endereço corretamente. (Rua/Avenida)');
      return false;
    }

    if (bairro == '') {
      ErroValidacao('Favor preencher o bairro corretamente.');
      return false;
    }

    if (cidade == '') {
      ErroValidacao('Favor preencher a cidade corretamente.');
      return false;
    }

    if (cep.length != 10) {
      ErroValidacao('Favor preencher o CEP corretamente.');
      return false;
    }

    if (cep == '') {
      ErroValidacao('Favor preencher o CEP corretamente.');
      return false;
    }

    if (sexogenero == '') {
      ErroValidacao('Atenção, verifique os campos obrigatórios');
      return false;
    }

    app.dialog.preloader('Atualizando...');
    var jwt = localStorage.getItem("jwt");
    var user_login = localStorage.getItem("user_login")
    var dataC = {
      user_login: user_login,
      dados: formData
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };

    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);

    app.request({
      url: servidor + '/api_public/perfil/atualiza_perfil.php',
      beforeSend: function (request) {
        request.setRequestHeader('Authorization', 'Bearer ' + jwt);
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
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == "ok") {
          var telefoneEnviado = formData.perfil_telefone.replace(/\W/g, "");
          var telefoneRecebido = respMerge.dadosUsuario.telefone.replace(/\W/g, "");
          if (respMerge.vt == 's') {
            gerarCodValidacaoTelefone(telefoneEnviado, telefoneRecebido, user_login);
          }
          else {
            if (telefoneEnviado != telefoneRecebido) {
              const regexTelefone = /^([0-9]{2})([0-9]{4,5})([0-9]{4})$/;
              $("#perfil_telefone").val(telefoneRecebido.replace(regexTelefone, "($1) $2-$3"));
            }
            armazenaLocalStorageFromAPI(respMerge, 'N', '');
            app.dialog.alert('Dados Atualizados com sucesso!', null);
          }
        }
        else {
          ErroAjax(respMerge);
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
        //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_030)');
      },
      complete: function () { }
    });
  });

  $('#btn_CancelarPerfil').on('click', function () {
    var Dialog_text = "Confirma a exclusão de seus dados e cancelar seu acesso a " + NomeEmpresa + " ?";
    var Dialog_title = null;

    var dialog = app.dialog.create({
      title: Dialog_title,
      text: Dialog_text,
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'dialog_button_esquerda-cancelar  dialog-button-50',
          onClick: function (dialog, index) {
            return false;
          },
        },
        {
          text: 'CONFIRMAR',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (dialog, index) {
            var ktmp = Date.now();
            app.dialog.preloader('Vamos sentir saudades...');
            var jwt = localStorage.getItem("jwt");
            var dataC = {
              user_login: localStorage.getItem("user_login"),
            };
            var dataD = {
              ktmp: ktmp,
              device: localStorage.getItem("device"),
            };

            var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
            var dataD = JSON.stringify(dataD);

            app.request({
              url: servidor + '/api_public/perfil/cancelar_perfil.php',
              beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + jwt);
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
                var resp = descriptDadosRecebido(resposta, ktmp);
                var respMerge = { ...resp.d, ...resp.c, ...resp.a };
                if (respMerge.status == "ok") {
                  localStorage.clear();
                  setTimeout(function () {
                    app.preloader.hide();
                    app.dialog.close();
                    app.views.main.router.navigate('/index/');
                  }, 300);
                  app.preloader.hide();
                  app.dialog.close();
                }
                else {
                  ErroAjax(respMerge);
                }
              },
              error: function (erro) {
                ErroAjax('error', 'conexao/servidor');
                //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_030)');
              },
              complete: function () { }
            });
          },
        },
      ],
      onClick: function (dialog, index) {
        //console.log(dialog.$el.find('.dialog-input').val());
      },
      on: {
        open: function () {
        },
        opened: function () { }
      }
    }).open();
  });

  function abrirMsgValidacaoTelefone(telefoneEnviado, telefoneRecebido, user_login) {
    var nome = $("#perfil_nome").val();
    const regexTelefone = /^([0-9]{2})([0-9]{4,5})([0-9]{4})$/;
    var TelefoneEnviadoFormatado = telefoneEnviado.replace(regexTelefone, "($1) $2-$3");
    var ID_Aleatorio = 'codigoRecebido_' + Math.floor(Math.random() * 9999);
    var Dialog_text = nome.split(' ')[0] + ", informe o código recebido por Whatsapp ou mensagem SMS";
    var Dialog_title = null;
    var dialog = app.dialog.create({
      title: '<div style="font-size: 0.9em;text-align:center">' + TelefoneEnviadoFormatado + '</div>',
      text: '<div style="font-size: 0.9em;text-align:center">' + Dialog_text + '</div>',
      //content: '<div class="dialog-input-field item-input"><div class="item-input-wrap"><input class="dialog-input" style="text-align: center;" id="codigoRecebido" type="tel" placeholder="Informe o código aqui" required validate pattern="[0-9]*" data-error-message="Apenas números!"></div></div>',
      content: '<div class="dialog-input-field item-input"><div class="item-input-wrap"><input class="dialog-input" style="text-align: center;" id="' + ID_Aleatorio + '" type="tel" placeholder="Informe o código aqui"></div></div>',
      closeByBackdropClick: false, backdrop: true,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'dialog_button_esquerda-cancelar  dialog-button-50',
          onClick: function (dialog, index) {
            return false;
          },
        },
        {
          text: 'CONFIRMAR',
          cssClass: 'dialog_ok_Button dialog_button_direita dialog-button-50',
          onClick: function (dialog, index) {
            var codInformado = dialog.$el.find('#' + ID_Aleatorio).val();
            verificarCodValidacaoTelefone(codInformado, telefoneEnviado, telefoneRecebido, user_login)
          },
        },
      ],
      onClick: function (dialog, index) {
        //console.log(dialog.$el.find('.dialog-input').val());
      },
      on: {
        open: function () {
          $('#' + ID_Aleatorio).mask('0-0-0-0-0');
        },
        opened: function () { }
      }
    }).open();

  }

  function gerarCodValidacaoTelefone(telefoneEnviado, telefoneRecebido, user_login) {
    var ktmp = Date.now();
    var dataC = {
      cpf: user_login,
      telefone: telefoneEnviado,
      acao: 'gerarCodigo'
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/cadastro/autenticar_telefone.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "novo_cadastro");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == 'ok') {
          //abrirMsgValidacaoTelefone(dadosCadastrais);
          abrirMsgValidacaoTelefone(telefoneEnviado, telefoneRecebido, user_login);
        }
        else {
          ErroAjax('error', 'Desculpe, tente novamente mais tarde!', 's');
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
      },
      complete: function () { }
    });
  }

  function verificarCodValidacaoTelefone(codInformado, telefoneEnviado, telefoneRecebido, user_login) {
    var ktmp = Date.now();
    var dataC = {
      cpf: user_login,
      telefone: telefoneEnviado,
      acao: 'validarCodigoPerfil',
      cod: codInformado
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/cadastro/autenticar_telefone.php',
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + "atualiza_perfil");
        request.setRequestHeader("chaveapp", chaveAPP);
        request.setRequestHeader("versaoapp", versaoAPP);
      },
      //async: false,
      method: 'POST',
      dataType: 'json',
      data: {
        a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
        c: dataC,
        d: dataD
      },
      success: function (resposta) {
        app.preloader.hide();
        app.dialog.close();
        var resp = descriptDadosRecebido(resposta, ktmp);
        var respMerge = { ...resp.d, ...resp.c, ...resp.a };
        if (respMerge.status == 'ok') {
          // ATUALIZAR CADASTRO
          const regexTelefone = /^([0-9]{2})([0-9]{4,5})([0-9]{4})$/;
          $("#perfil_telefone").val(telefoneEnviado.replace(regexTelefone, "($1) $2-$3"));
          dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
          dadosUsuario.telefone = telefoneEnviado;
          localStorage.setItem("dadosUsuario", JSON.stringify(dadosUsuario));
          app.dialog.alert('Dados Atualizados com sucesso!', null);
        }
        else {
          const regexTelefone = /^([0-9]{2})([0-9]{4,5})([0-9]{4})$/;
          $("#perfil_telefone").val(telefoneRecebido.replace(regexTelefone, "($1) $2-$3"));
          ErroAjax('error', 'Desculpe, tente novamente mais tarde!');
          return false;
        }
      },
      error: function (erro) {
        ErroAjax('error', 'conexao/servidor');
      },
      complete: function () { }
    });
  }

});
