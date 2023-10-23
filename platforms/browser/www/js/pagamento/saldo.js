// *********** Funcoes de pagamento VIA SALDO ********//
function pagamentoSaldo_CadastraPedido_GetDados(doacao_resgate, tipoTitulos, qtdTitulos, payment_method, codMilliSeconds, info) {
  var ktmp = Date.now();
  if (localStorage.getItem("cpf")) {
    var user_login = localStorage.getItem("cpf");
  }
  else {
    var user_login = localStorage.getItem("user_login");
  }

  //console.log(tipoTitulos);
  /**Patrick */
  var indicacao = sessionStorage.getItem("id_indicacao");
  if (!indicacao) {
    indicacao = '0';
  } else {
    indicacao = sessionStorage.getItem("id_indicacao");
  } /**Patrick */

  var dataC = {
    user_login: user_login,
    indicacao: id_indicacao, /**Patrick */
    doacao_resgate: doacao_resgate,
    tipoTitulos: tipoTitulos,
    qtdTitulos: qtdTitulos,
    payment_method: payment_method,
    codMilliSeconds: codMilliSeconds,
    info: info,
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };

  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    //url: servidor + '/api_public/carrinho/cadastrar_pvPGComboCofre.php',
    url: servidor + '/api_public/carrinho/cadastrar_pvPGComboCofreRasp.php',
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
      app.dialog.close();
      app.preloader.hide();
      limpaIndicacao();

      var resp = descriptDadosRecebido(resposta, ktmp);
      var respMerge = { ...resp.d, ...resp.c, ...resp.a };
      //console.log(respMerge); 
      if (respMerge.status == "ok") {
        // Realiza o pagamento via saldo
        pagamentoSaldo_atualizaBD(respMerge.guidvendas, respMerge.dadosCliente.Customer_id, payment_method, codMilliSeconds)
      }
      else if (respMerge.status == "erro_d") {
        // duplicidade
        return false;
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_008)');
    },
    complete: function () { }
  });

}

function pagamentoSaldo_atualizaBD(guid_vendas, guid_sec_users, payment_method, codMilliSeconds) {
  var ktmp = Date.now();
  if (localStorage.getItem("cpf")) {
    var user_login = localStorage.getItem("cpf");
  }
  else {
    var user_login = localStorage.getItem("user_login");
  }

  var dataC = {
    user_login: user_login,
    guid_vendas: guid_vendas,
    guid_sec_users: guid_sec_users,
    payment_method: payment_method,
    codMilliSeconds: codMilliSeconds
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/saldo/pagar_viasaldoCombo.php',
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
      app.dialog.close();
      app.preloader.hide();
      var resp = descriptDadosRecebido(resposta, ktmp);
      var respMerge = { ...resp.d, ...resp.c, ...resp.a };
      //console.log('retorno pg saldo', respMerge);
      if (respMerge.status == "ok") {
        app.dialog.alert(respMerge.msg_usu, 'Boa Sorte!', function () {
          fechaDialogRedireciona('/meustitulos/');
        });
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_007)');
    },
    complete: function () { }
  });
}

