
// *********** Funcoes de pagamento BOLETO ********//
// Obtém Token de Acesso, retornando dados de compra do boleto
function pagamentoBoleto_CadastraBoleto_GetDados(valor_boleto, dataVencimento) {
  var ktmp = Date.now();

  var dataC = {
    user_login: localStorage.getItem("user_login"),
    valor: valor_boleto,// valores em centavos
    expiration_date: dataVencimento
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/cadastra_boleto.php',
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
        pagamentoBoleto_GetTokenAcesso(respMerge.dados.dadosCliente, respMerge.dados.dadosCompra);
      }
      else if (respMerge.status == "erro") {
        if (respMerge.msg_usu) {
          app.dialog.close();
          app.preloader.hide();
          app.dialog.alert(respMerge.msg_usu, null);
          return false;
        }
        else {
          ErroAjax(respMerge);
        }
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_001)');
    },
    complete: function () { }
  });
}

function pagamentoBoleto_GetTokenAcesso(dadosCliente, dadosCompra) {
  var ktmp = Date.now();
  var dataC = {
    user_login: localStorage.getItem("user_login"),
    payment_method: 'boleto',
    card_number: 'null',
    customer_id: dadosCliente.Customer_id
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };

  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/getnet_autenticacao.php',
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
        pagamentoBoleto_GeraBoleto(respMerge.dados, dadosCliente, dadosCompra)
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_002)');
    },
    complete: function () { }
  });
}

// gera o boleto na GETNET
function pagamentoBoleto_GeraBoleto(dados, dadosCliente, dadosCompra) {
  var dataVencimento = dadosCompra.expiration_date.split('-')[2] + "/" + dadosCompra.expiration_date.split('-')[1] + "/" + dadosCompra.expiration_date.split('-')[0];
  var json_dados = JSON.stringify({
    seller_id: dados.seller_id,
    amount: dadosCompra.valor,
    currency: dados.currency,
    order: {
      order_id: dadosCompra.boleto_guid,
      sales_tax: dados.sales_tax,
      product_type: dados.product_type,
    },
    boleto: {
      //our_number: 'dadosCompra.our_number,'
      document_number: dadosCompra.document_number.toString(),
      expiration_date: dataVencimento,
      //instructions: "Não receber após o vencimento",
      instructions: dadosCompra.instructions,
      provider: dados.provider
    },
    customer: {
      //customer_id: dadosCliente.Customer_id,
      first_name: dadosCliente.FirstName,
      name: dadosCliente.Name,
      document_type: dadosCliente.DocumentType,
      document_number: dadosCliente.DocumentNumber.toString(),
      billing_address: {
        street: dadosCliente.Street,
        number: dadosCliente.Number,
        complement: dadosCliente.Complement.toString(),
        district: dadosCliente.District,
        city: dadosCliente.City,
        state: dadosCliente.State,
        postal_code: dadosCliente.PostalCode
      }
    }
  });

  app.request({
    url: dados.base_url + '/v1/payments/boleto',
    headers: {
      "cache-control": "no-cache",
      "Authorization": "Bearer " + dados.token_acesso
    },
    async: true,
    method: 'POST',
    dataType: 'json',
    data: json_dados,
    contentType: 'application/json;charset=utf-8',
    processData: false,
    //data: "{\"seller_id\":\"47bc57c4-ba76-494c-93c9-04e670b98ac3\",\"amount\":100,\"currency\":\"BRL\",\"order\":{\"order_id\":\"6d2e4380-d8a3-4ccb-9138-c289182818a3\",\"sales_tax\":0,\"product_type\":\"service\"},\"boleto\":{\"our_number\":\"000001946598\",\"document_number\":\"170500000019763\",\"expiration_date\":\"16/11/2021\",\"instructions\":\"Não receber após o vencimento\",\"provider\":\"santander\"},\"customer\":{\"first_name\":\"João\",\"name\":\"João da Silva\",\"document_type\":\"CPF\",\"document_number\":\"12345678912\",\"billing_address\":{\"street\":\"Av. Brasil\",\"number\":\"1000\",\"complement\":\"Sala 1\",\"district\":\"São Geraldo\",\"city\":\"Porto Alegre\",\"state\":\"RS\",\"postal_code\":\"90230060\"}}}",
    success: function (resposta) {
      pagamentoBoleto_atualizaBDBoleto(dados, resposta, "ok", dadosCompra.boleto_guid);
    },
    error: function (erro) {
      pagamentoBoleto_atualizaBDBoleto(dados, erro.response, "erro", dadosCompra.boleto_guid);
    },
    complete: function () { }
  });
}

// Atualiza dados do Boleto e disponibiliza o link p download
function pagamentoBoleto_atualizaBDBoleto(dados, boletoJson, status, order_id) {
  var ktmp = Date.now();
  var dataC = {
    user_login: localStorage.getItem("user_login"),
    dados: dados,
    status: status,
    order_id: order_id,
    boleto: boletoJson
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };

  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/atualiza_boleto.php',
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
        app.dialog.close();
        app.preloader.hide();
        var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));

        var linknovo = respMerge.linknovo + '&gu=' + dadosUsuario.guid_sec_users;
        //var link = respMerge.link;
        var link = linknovo;
        var RotaAtual = app.views.main.router.url;

        if (RotaAtual == '/home/') {
          $("[name='HOME_add_valor_boleto']").attr("disabled", true);
          $("#HOME_btn_gerar_boleto").hide();
          $("#HOME_btn_download_boleto").show();
          $("#HOME_link_boleto").show();
          $("#HOME_link_boleto").attr("href", link);
        }
        else if (RotaAtual == '/comprarsaldo/') {
          $("[name='CSALDO_add_valor_boleto']").attr("disabled", true);
          $("#CSALDO_btn_gerar_boleto").hide();
          $("#CSALDO_btn_download_boleto").show();
          $("#CSALDO_link_boleto").show();
          $("#CSALDO_link_boleto").attr("href", link);
        }
        app.dialog.close();
        app.preloader.hide();
        app.dialog.alert('Clique no botão abaixo para baixar o boleto!', null);

      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
    },
    complete: function () { }
  });
}

// *********** Funcoes de pagamento CARTAO ********//
// Obtém Token de Acesso, retornando dados de compra do boleto
function pagamentoCartao_CadastraPedido_GetDados(doacao_resgate, tipoTitulos, qtdTitulos, dadosCartao, payment_method, codMilliSeconds) {
  var ktmp = Date.now();
  if (localStorage.getItem("cpf")) {
    var user_login = localStorage.getItem("cpf");
  }
  else {
    var user_login = localStorage.getItem("user_login");
  }

  /**Patrick 
  var indicacao = sessionStorage.getItem("id_indicacao");
  if (!indicacao) {
    indicacao = '0';
  } else {
    indicacao = sessionStorage.getItem("id_indicacao");
  } Patrick */

  var dataC = {
    user_login: user_login,
    indicacao: id_indicacao, /**Patrick */
    doacao_resgate: doacao_resgate,
    tipoTitulos: tipoTitulos,
    qtdTitulos: qtdTitulos,
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
    url: servidor + '/api_public/carrinho/cadastrar_pv.php',
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
        pagamentoCartao_GetTokenAcesso(respMerge.dadosCliente, respMerge.guidvendas, respMerge.valor_total, dadosCartao, payment_method, codMilliSeconds);
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
      //console.log(erro);
      ErroAjax('error', 'conexao/servidor', 's');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_003)');
    },
    complete: function () { }
  });

}

// Obtém o Token de Acesso
function pagamentoCartao_GetTokenAcesso(dadosCliente, guid_vendas, valor_total, dadosCartao, payment_method, codMilliSeconds) {
  var ktmp = Date.now();

  if (dadosCartao.tipo == 'cofre') {
    var customer_id = dadosCliente.Customer_id;
    var card_number = null;
    var card_token = dadosCartao.number_token;
  }
  else if ((payment_method == 'credit') || (payment_method == 'debit')) {
    var customer_id = dadosCliente.Customer_id;
    var card_number = dadosCartao.num;
    var card_token = null;
  }
  else {
    app.dialog.close();
    logoff();
    //app.dialog.alert('Falha em se comunicar com servidor. Por favor, tente novamente! (Erro_004)', 'ops...!');
    app.dialog.alert('Falha em se comunicar com servidor. Por favor, tente novamente! (Erro_004)', null);
  }

  var dataC = {
    user_login: dadosCliente.DocumentNumber,
    payment_method: payment_method,
    card_number: card_number,
    customer_id: customer_id,
    codMilliSeconds: codMilliSeconds,
    card_token: card_token
  };
  //console.log('dataC',dataC);
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };

  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/getnet_autenticacao.php',
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
        if (payment_method == 'credit') {
          pagamentoCartao_ProcessaCredito(dadosCliente, guid_vendas, valor_total, dadosCartao, respMerge.dados, codMilliSeconds);
        }
        else if (payment_method == 'debit') {
          pagamentoCartao_ProcessaDebito(dadosCliente, guid_vendas, valor_total, dadosCartao, respMerge.dados, codMilliSeconds);
        }
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_005)');
    },
    complete: function () { }
  });
}

// Realiza pagamento Cartao de CREDITO Na getnet
function pagamentoCartao_ProcessaCredito(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, codMilliSeconds) {
  // retira o ponto para informar a GETNET em centavos
  valor_total = valor_total.replace('.', '');

  var json_dados = JSON.stringify({
    seller_id: ambiente.seller_id,
    amount: valor_total,
    currency: ambiente.currency,
    order: {
      order_id: guid_vendas,
      sales_tax: ambiente.sales_tax,
      product_type: ambiente.product_type
    },
    customer: {
      customer_id: dadosCliente.Customer_id,
      first_name: dadosCliente.FirstName,
      last_name: dadosCliente.LastName,
      name: dadosCliente.Name,
      email: dadosCliente.Email,
      document_type: dadosCliente.DocumentType,
      document_number: dadosCliente.DocumentNumber.toString(),
      phone_number: '55' + dadosCliente.PhoneNumber.toString(),
      billing_address: {
        street: dadosCliente.Street,
        number: dadosCliente.Number,
        complement: dadosCliente.Complement.toString(),
        district: dadosCliente.District,
        city: dadosCliente.City,
        state: dadosCliente.State,
        country: dadosCliente.Country,
        postal_code: dadosCliente.PostalCode
      }
    },
    device: {
      ip_address: dadosCliente.IpAddress,
      device_id: dadosCliente.UUID
    },
    shippings: [
      {
        first_name: dadosCliente.FirstName,
        name: dadosCliente.Name,
        email: dadosCliente.Email,
        phone_number: '55' + dadosCliente.PhoneNumber.toString(),
        shipping_amount: 0,
        address: {
          street: dadosCliente.Street,
          number: dadosCliente.Number,
          complement: dadosCliente.Complement.toString(),
          district: dadosCliente.District,
          city: dadosCliente.City,
          state: dadosCliente.State,
          country: dadosCliente.Country,
          postal_code: dadosCliente.PostalCode
        }
      }
    ],
    /* Opicional, preenchimento exemplo
    sub_merchant: {
      identification_code: "9058344",
      document_type: "CNPJ",
      document_number: "20551625000159",
      address: "Torre Negra 44",
      city: "Cidade",
      state: "RS",
      postal_code: "90520000"
    },
    */
    credit: {
      delayed: false,
      pre_authorization: false,
      save_card_data: false,
      transaction_type: ambiente.TransactionType,
      number_installments: ambiente.NumberInstallments,
      soft_descriptor: ambiente.SoftDescriptor,
      dynamic_mcc: ambiente.DynamicMcc,
      card: {
        number_token: ambiente.token_cartao,
        cardholder_name: dadosCartao.nome,
        security_code: dadosCartao.cod_seg,
        //brand: "Mastercard", // Não é obrigatório, a GETNET preenche automático
        expiration_month: dadosCartao.validade_mes,
        expiration_year: dadosCartao.validade_ano,
      }
    }
  });

  app.request({
    url: ambiente.base_url + '/v1/payments/credit',
    headers: {
      "cache-control": "no-cache",
      "Authorization": "Bearer " + ambiente.token_acesso
    },
    async: true,
    method: 'POST',
    dataType: 'json',
    data: json_dados,
    contentType: 'application/json;charset=utf-8',
    processData: false,
    success: function (resposta) {
      pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, resposta, 'success', 'credit', codMilliSeconds);
    },
    error: function (erro) {
      pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, erro.response, 'error', 'credit', codMilliSeconds);
    },
    complete: function () { }
  });
}

// Realiza pagamento Cartao de DEBITO Na getnet
function pagamentoCartao_ProcessaDebito(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, codMilliSeconds) {
  // retira o ponto para informar a GETNET em centavos
  valor_total = valor_total.replace('.', '');

  var json_dados = JSON.stringify({
    seller_id: ambiente.seller_id,
    amount: valor_total,
    currency: ambiente.currency,
    order: {
      order_id: guid_vendas,
      sales_tax: ambiente.sales_tax,
      product_type: ambiente.product_type
    },
    customer: {
      customer_id: dadosCliente.Customer_id,
      first_name: dadosCliente.FirstName,
      last_name: dadosCliente.LastName,
      name: dadosCliente.Name,
      email: dadosCliente.Email,
      document_type: dadosCliente.DocumentType,
      document_number: dadosCliente.DocumentNumber.toString(),
      phone_number: '55' + dadosCliente.PhoneNumber.toString(),
      billing_address: {
        street: dadosCliente.Street,
        number: dadosCliente.Number,
        complement: dadosCliente.Complement.toString(),
        district: dadosCliente.District,
        city: dadosCliente.City,
        state: dadosCliente.State,
        country: dadosCliente.Country,
        postal_code: dadosCliente.PostalCode
      }
    },
    device: {
      ip_address: dadosCliente.IpAddress,
      device_id: dadosCliente.UUID
    },
    shippings: [
      {
        first_name: dadosCliente.FirstName,
        name: dadosCliente.Name,
        email: dadosCliente.Email,
        phone_number: '55' + dadosCliente.PhoneNumber.toString(),
        shipping_amount: 0,
        address: {
          street: dadosCliente.Street,
          number: dadosCliente.Number,
          complement: dadosCliente.Complement.toString(),
          district: dadosCliente.District,
          city: dadosCliente.City,
          state: dadosCliente.State,
          country: dadosCliente.Country,
          postal_code: dadosCliente.PostalCode
        }
      }
    ],
    /* Opicional, preenchimento exemplo
    sub_merchant: {
      identification_code: "9058344",
      document_type: "CNPJ",
      document_number: "20551625000159",
      address: "Torre Negra 44",
      city: "Cidade",
      state: "RS",
      postal_code: "90520000"
    },
    */
    debit: {
      cardholder_mobile: '55' + dadosCliente.PhoneNumber,
      soft_descriptor: ambiente.SoftDescriptor,
      dynamic_mcc: ambiente.DynamicMcc,
      authenticated: false,
      card: {
        number_token: ambiente.token_cartao,
        cardholder_name: dadosCartao.nome,
        security_code: dadosCartao.cod_seg,
        //brand: "Mastercard", // Não é obrigatório, a GETNET preenche automático
        expiration_month: dadosCartao.validade_mes,
        expiration_year: dadosCartao.validade_ano,
      }
    }
  });

  app.request({
    url: ambiente.base_url + '/v1/payments/debit',
    headers: {
      "cache-control": "no-cache",
      "Authorization": "Bearer " + ambiente.token_acesso
    },
    async: true,
    method: 'POST',
    dataType: 'json',
    data: json_dados,
    contentType: 'application/json;charset=utf-8',
    processData: false,
    success: function (resposta) {
      pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, resposta, 'success', 'debit', codMilliSeconds,);
    },
    error: function (erro) {
      pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, erro.response, 'error', 'debit', codMilliSeconds);
    },
    complete: function () { }
  });
}

function pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, retornoGetNet, status, payment_method, codMilliSeconds) {

  var ktmp = Date.now();
  if (dadosCartao.tipo == 'cofre') {
    var dados = {
      guid_sec_users: dadosCliente.Customer_id,
      ip_user: dadosCliente.IpAddress,
      uuid: dadosCliente.UUID,
      order_id: guid_vendas,
      valor_total: valor_total,
      currency: ambiente.currency,
      primeiros4: 'Cofre',
      ultimos4: dadosCartao.last_four_digits,
      ambiente: ambiente.ambiente,
      //token_cartao: dadosCartao.token_cartao,
      brand: dadosCartao.brand,
      payment_method: payment_method,
      prim_nome_cartao: 'Cofre'
    };
  }
  else {
    var dados = {
      guid_sec_users: dadosCliente.Customer_id,
      ip_user: dadosCliente.IpAddress,
      uuid: dadosCliente.UUID,
      order_id: guid_vendas,
      valor_total: valor_total,
      currency: ambiente.currency,
      primeiros4: dadosCartao.num.substring(0, 4),
      ultimos4: dadosCartao.num.substring(dadosCartao.num.length - 4, dadosCartao.num.length),
      ambiente: ambiente.ambiente,
      //token_cartao: dadosCartao.token_cartao,
      brand: verBandeiraCartao(dadosCartao.num),
      payment_method: payment_method,
      prim_nome_cartao: dadosCartao.nome.split(' ')[0]
    };
  }

  if (verificaJSON(retornoGetNet)) {
    retornoGetNet = JSON.parse(retornoGetNet);
  }

  var dataC = {
    user_login: localStorage.getItem("user_login"),
    dados: dados,
    retornoGetNet: retornoGetNet,
    status: status,
    codMilliSeconds: codMilliSeconds
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  //console.log('dataC', dataC);
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);
  app.request({
    url: servidor + '/api_public/pagamento/getnet/atualiza_cartao.php',
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
      app.dialog.close();
      app.preloader.hide();
      if (respMerge.status == "ok") {
        if (dadosCartao.salvar_cartao == 'true') {
          getnet_cofre_cadastrar_cartao(dadosCliente, dadosCartao, respMerge.msg_usu);
        }
        else {
          app.dialog.alert(respMerge.msg_usu, 'Boa Sorte !', function () {
            //app.dialog.alert(resposta.msg_usu, null, function () {
            fechaDialogRedireciona('/meustitulos/');
          });
        }
      }
      else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      ErroAjax('error', 'conexao/servidor');
      //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_006)');
    },
    complete: function () { }
  });
};


// COFRE ok
function getnet_cofre_cadastrar_cartao(dadosCliente, dadosCartao, msg_usu) {
  // Autenticação - Gera Token de Acesso
  var ktmp = Date.now();
  var dataC = {
    user_login: dadosCliente.DocumentNumber,
    customer_id: dadosCliente.Customer_id,
    acao: 'aut'
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/cofre/getnet_cofre.php',
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
    success: function (resposta1) {
      app.dialog.close();
      app.preloader.hide();
      var resp = descriptDadosRecebido(resposta1, ktmp);
      var respMerge1 = { ...resp.d, ...resp.c, ...resp.a };
      if (respMerge1.status == "ok") {
        var json_dados = JSON.stringify({
          card_number: dadosCartao.num,
          customer_id: dadosCliente.Customer_id
        });

        // TOKETINZAÇÂO - Gera Token cartao
        app.request({
          url: respMerge1.base_url + '/v1/tokens/card',
          headers: {
            "cache-control": "no-cache",
            "Authorization": respMerge1.dados.token_type + " " + respMerge1.dados.access_token
          },
          async: false,
          method: 'POST',
          dataType: 'json',
          data: json_dados,
          contentType: 'application/json;charset=utf-8',
          processData: false,
          success: function (resposta2) {
            var json_dados = JSON.stringify({
              number_token: resposta2.number_token,
              cardholder_name: dadosCartao.nome,
              expiration_month: dadosCartao.validade_mes,
              expiration_year: dadosCartao.validade_ano,
              customer_id: dadosCliente.Customer_id,
              security_code: dadosCartao.cod_seg // Código de segurança. CVV ou CVC.
              //,cardholder_identification: dadosUsuario.cpf
              //,verify_card: false // Realiza uma transação que Verifica se o cartão informado, não está cancelado, bloqueado ou com restrições.
            });

            app.request({
              url: respMerge1.base_url + '/v1/cards',
              headers: {
                "cache-control": "no-cache",
                "Authorization": respMerge1.dados.token_type + " " + respMerge1.dados.access_token,
                "seller_id": respMerge1.Seller_Id
              },
              async: false,
              method: 'POST',
              dataType: 'json',
              data: json_dados,
              contentType: 'application/json;charset=utf-8',
              processData: false,
              success: function (resposta3) {
                if (resposta3.card_id) {
                  app.dialog.alert('Cartão salvo para as próximas compras', null);
                }
              },
              error: function (erro3) {
                app.dialog.alert('Não foi possível adicionar o cartão', null);
              },
              complete: function () {
                getnet_cofre_updUsuario();
                app.dialog.alert(msg_usu, 'Boa Sorte !', function () {
                  //app.dialog.alert(resposta.msg_usu, null, function () {
                  fechaDialogRedireciona('/meustitulos/');
                });
              }
            });
          },
          error: function (erro2) {
            // Erro Tokenização
            //console.log('erro2');
            //console.log(erro2);

          },
          complete: function () {
            //app.dialog.alert('complete 2', null);
          }
        });
      }
      else {
        ErroAjax(respMerge1);
      }
    },
    error: function (erro1) {
      // Erro Autenticação
      //console.log('erro1');
      //console.log(erro1);
      ErroAjax('error', 'conexao/servidor');
    },
    complete: function () {
      //app.dialog.alert('complete 3', null); // em sucesso, retirar
    }
  });

}
// listar cartões do cofre
function getnet_cofre_list(verificar = 's') { // ok
  var ktmp = Date.now();
  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));

  var dataC = {
    user_login: dadosUsuario.user_login,
    customer_id: dadosUsuario.guid_sec_users,
    acao: 'list'
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/cofre/getnet_cofre.php',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
      request.setRequestHeader("chaveapp", chaveAPP);
      request.setRequestHeader("versaoapp", versaoAPP);
    },
    async: true,
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
      if (respMerge.status == "ok") {
        if (respMerge.qtd > 0) {
          localStorage.setItem("list_c", JSON.stringify(respMerge.dados.cards));
          $("#lista_cartoes_cofre").empty();
          $.each(respMerge.dados.cards, function (index, value) {
            var bandeira = value.brand;
            bandeira = bandeira[0].toUpperCase() + bandeira.slice(1);
            $('#lista_cartoes_cofre').append($('<option>', {
              value: value.card_id,
              text: bandeira + ' final: ' + value.last_four_digits
            }));
          });
          $('#lista_cartoes_cofre').append($('<option>', {
            value: 'novo',
            text: "Outro Cartão"
          }));
        }
        else {
          // lista de cartões nao encontrada
          localStorage.setItem("qtdcofre", 0);
          $("#lista_cartoes_cofre").empty();
          $('#cartao_credito_cofre').hide();
          $('#cartao_credito_novo_cartao').show();
        }
      }
      else {
        localStorage.setItem("qtdcofre", 0);
        $("#lista_cartoes_cofre").empty();
        $('#cartao_credito_cofre').hide();
        $('#cartao_credito_novo_cartao').show();
        // Erro ao carregar lista de cartões
      }
    }
  });
  //}
}

// Atualizar Qtd na tabela Usuário - wpbo_user
function getnet_cofre_updUsuario() { // ok
  var ktmp = Date.now();
  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));

  var dataC = {
    user_login: dadosUsuario.user_login,
    customer_id: dadosUsuario.guid_sec_users,
    acao: 'updUsuario'
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/cofre/getnet_cofre.php',
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
      request.setRequestHeader("chaveapp", chaveAPP);
      request.setRequestHeader("versaoapp", versaoAPP);
    },
    async: true,
    method: 'POST',
    dataType: 'json',
    crossDomain: true,
    data: {
      a: JSON.stringify(criptoDadosEnviado(ktmp, ktmp)),
      c: dataC,
      d: dataD
    },
    success: function (resposta) {
      //console.log(resposta); 
    }
  });
}

function getnet_cofre_remove(cardId) { // OK
  var ktmp = Date.now();
  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));

  var dataC = {
    user_login: dadosUsuario.user_login,
    customer_id: dadosUsuario.guid_sec_users,
    acao: 'remove',
    card_id: cardId
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/getnet/cofre/getnet_cofre.php',
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
      //console.log(respMerge);
      if (respMerge.status == "ok") {
        $('#lista_cartoes_cofre').find('[value="' + cardId + '"]').remove();
        app.dialog.alert('Removido com sucesso!', null);
        // remover do select !!
        if (respMerge.qtd == 0) {
          //alterar configuração do carrinho
          $('#cartao_credito_cofre').hide();
          $('#cartao_credito_novo_cartao').show(300);
        }
      }
      else {
        app.dialog.alert('Tente novamente.', null);
        // Erro ao carregar lista de cartões
      }
    }
  });
}

// Realiza pagamento Cartao de CREDITO Na getnet
function getnet_cofre_pagamentoCartao_ProcessaCredito(guid_vendas, valor_total, dadosCartao, codMilliSeconds) {
  // retira o ponto para informar a GETNET em centavos
  valor_total = valor_total.replace('.', '');

  const ambiente = "";
  const dadosCliente = "";

  var json_dados = JSON.stringify({
    seller_id: ambiente.seller_id,
    amount: valor_total,
    currency: ambiente.currency,
    order: {
      order_id: guid_vendas,
      sales_tax: ambiente.sales_tax,
      product_type: ambiente.product_type
    },
    customer: {
      customer_id: dadosCliente.Customer_id,
      first_name: dadosCliente.FirstName,
      last_name: dadosCliente.LastName,
      name: dadosCliente.Name,
      email: dadosCliente.Email,
      document_type: dadosCliente.DocumentType,
      document_number: dadosCliente.DocumentNumber.toString(),
      phone_number: '55' + dadosCliente.PhoneNumber.toString(),
      billing_address: {
        street: dadosCliente.Street,
        number: dadosCliente.Number,
        complement: dadosCliente.Complement.toString(),
        district: dadosCliente.District,
        city: dadosCliente.City,
        state: dadosCliente.State,
        country: dadosCliente.Country,
        postal_code: dadosCliente.PostalCode
      }
    },
    device: {
      ip_address: dadosCliente.IpAddress,
      device_id: dadosCliente.UUID
    },
    shippings: [
      {
        first_name: dadosCliente.FirstName,
        name: dadosCliente.Name,
        email: dadosCliente.Email,
        phone_number: '55' + dadosCliente.PhoneNumber.toString(),
        shipping_amount: 0,
        address: {
          street: dadosCliente.Street,
          number: dadosCliente.Number,
          complement: dadosCliente.Complement.toString(),
          district: dadosCliente.District,
          city: dadosCliente.City,
          state: dadosCliente.State,
          country: dadosCliente.Country,
          postal_code: dadosCliente.PostalCode
        }
      }
    ],
    /* Opicional, preenchimento exemplo
    sub_merchant: {
      identification_code: "9058344",
      document_type: "CNPJ",
      document_number: "20551625000159",
      address: "Torre Negra 44",
      city: "Cidade",
      state: "RS",
      postal_code: "90520000"
    },
    */
    credit: {
      delayed: false,
      pre_authorization: false,
      save_card_data: false,
      transaction_type: ambiente.TransactionType,
      number_installments: ambiente.NumberInstallments,
      soft_descriptor: ambiente.SoftDescriptor,
      dynamic_mcc: ambiente.DynamicMcc,
      card: {
        number_token: ambiente.token_cartao,
        cardholder_name: dadosCartao.nome,
        security_code: dadosCartao.cod_seg,
        //brand: "Mastercard", // Não é obrigatório, a GETNET preenche automático
        expiration_month: dadosCartao.validade_mes,
        expiration_year: dadosCartao.validade_ano,
      }
    }
  });

  app.request({
    url: ambiente.base_url + '/v1/payments/credit',
    headers: {
      "cache-control": "no-cache",
      "Authorization": "Bearer " + ambiente.token_acesso
    },
    async: true,
    method: 'POST',
    dataType: 'json',
    data: json_dados,
    contentType: 'application/json;charset=utf-8',
    processData: false,
    success: function (resposta) {
      //console.log('resposta', resposta);
      pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, resposta, 'success', 'credit', codMilliSeconds);
    },
    error: function (erro) {
      //console.log('erro', erro);
      pagamentoCartao_atualizaBD(dadosCliente, guid_vendas, valor_total, dadosCartao, ambiente, erro.response, 'error', 'credit', codMilliSeconds);
    },
    complete: function () { }
  });
}