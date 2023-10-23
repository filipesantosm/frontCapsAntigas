jQuery(function () {
  var ktmp = Date.now();
  // Máscara/Formata os campos 
  $('#CadCEPCadastro').mask('00.000-000');
  //$('#CadNumero').mask('999.999.999', {reverse: true});
  var cpf = localStorage.getItem("cpf");

  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ol%c3%a1%21%20Estou%20com%20dificuldades%20para%20efetuar%20cadastro%20na%20tela%20P1.%20Poderia%20me%20ajudar%3f';
  $("#cadastro_suporteP1").attr("href", novoTelSuporte);

  $('#CadCEPCadastro').on("input", function () {
    var caracteresDigitados = $(this).val().length;
    if (caracteresDigitados == 10) {
      ktmp = Date.now();
      // update campos
      var cep = $(this).val();
      app.dialog.preloader('Pesquisando');
      var dataC = {
        cep: cep,
        cpf: cpf,
        user_login: cpf
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
              $("#CadLogradouro").attr("readonly", false);
              $("#CadLogradouro").val('');
            }
            else {
              $("#CadLogradouro").val(respMerge.dados.logradouro);
              $("#CadLogradouro").attr("readonly", true);
            }
            if ((!respMerge.dados.bairro) || (respMerge.dados.bairro == '')) {
              $("#CadBairro").attr("readonly", false);
              $("#CadBairro").val('');
            }
            else {
              $("#CadBairro").val(respMerge.dados.bairro);
              //$("#CadBairro").attr("readonly", true); 
            }
            if ((!respMerge.dados.localidade) || (respMerge.dados.localidade == '')) {
              $("#CadCidade").attr("readonly", false);
              $("#CadCidade").val('');
            }
            else {
              $("#CadCidade").val(respMerge.dados.localidade);
              $("#CadCidade").attr("readonly", true);
            }

            if ((!respMerge.dados.uf) || (respMerge.dados.uf == '')) {
              $("#CadUF").attr("readonly", false);
              $("#CadUF").val('');
            }
            else {
              $("#CadUF").val(respMerge.dados.uf);
              $("#CadUF").attr("readonly", true);
            }

            $("#CadPais").val('Brasil');
          }
          else {
            //app.dialog.alert(resposta.msg_usu, 'ops...!');
            app.dialog.alert(respMerge.msg_usu, null);
            $("#CadPais").val('');
            $("#CadPais").attr("readonly", true);
            $("#CadUF").val('');
            $("#CadUF").attr("readonly", true);
            $("#CadCidade").val('');
            $("#CadCidade").attr("readonly", true);
            $("#CadBairro").val('');
            //$("#CadBairro").attr("readonly", true); 
            $("#CadLogradouro").val('');
            $("#CadLogradouro").attr("readonly", true);
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

  $('#CadcadastraP2').click(function () {
    ktmp = Date.now();
    var cep = $("#CadCEPCadastro").val();
    var numero = $("#CadNumero").val();
    var complemento = $("#CadComplemento").val();
    var logradouro = $("#CadLogradouro").val();
    var bairro = $("#CadBairro").val();
    var cidade = $("#CadCidade").val();
    var uf = $("#CadUF").val();
    var pais = $("#CadPais").val();

    if (logradouro == '') {
      ErroValidacao('Favor preencher o endereço corretamente. (Rua/Avenida)');
      return false;
    }

    if (bairro == '') {
      ErroValidacao('Favor preencher o Bairro corretamente.');
      return false;
    }

    if (cidade == '') {
      ErroValidacao('Favor preencher a Cidade corretamente.');
      return false;
    }

    if (uf == '') {
      ErroValidacao('Favor preencher a UF corretamente.');
      return false;
    }

    if (cep.length != 10) {
      ErroValidacao('Favor preencher o CEP corretamente.');
      return false;
    }

    if ((cep == '') || (numero == '')) {
      ErroValidacao('Por favor, todos os campos são obrigatórios.');
      return false;
    }
    if ((cep !== '') && (numero !== '')) {
      app.dialog.preloader('Cadastrando');
      var dataC = {
        cep: cep,
        numero: numero == "" ? 'N/A' : numero,
        complemento: complemento == "" ? 'N/A' : complemento,
        logradouro: logradouro,
        bairro: bairro,
        cidade: cidade,
        uf: uf,
        pais: pais,
        cpf: cpf,
        user_login: cpf,
        cadastro: '2'
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
          app.preloader.hide();
          app.dialog.close();
          var resp = descriptDadosRecebido(resposta, ktmp);
          var respMerge = { ...resp.d, ...resp.c, ...resp.a };
          if (respMerge.status == "ok") {
            app.views.main.router.navigate('/cadastro_p3/');
          }
          else {
            ErroAjax(resp);
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
});
