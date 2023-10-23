function gerencianetPixGenerateOrder(doacao_resgate, tipoTitulos, qtdTitulos, payment_method, codMilliSeconds, info) {
  var ktmp = Date.now();
  if ($("#QRCode").attr("src")) {
    $(".list-pix > center:eq(0)").hide();
    $(".list-pix > center:eq(1)").show();
    $(".list-pix > center:eq(2)").hide();
  } else {
    if (localStorage.getItem("cpf")) {
      var user_login = localStorage.getItem("cpf");
    } else {
      var user_login = localStorage.getItem("user_login");
    }

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
    //console.log(dataC);
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);

    app.
      request({
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
          console.log(respMerge);
          if (respMerge.status == "ok") {
            // pagamentoCartao_GetTokenAcesso(resposta.dadosCliente, resposta.guidvendas, resposta.valor_total, dadosCartao, payment_method);
            gerencianetPixGeneratePayment(respMerge.guidvendas, respMerge.dadosCliente);
          }
          else if (respMerge.status == "erro_d") {
            $('#div_pix_pagamento').hide();
            // duplicidade
            return false;
          }
          else {
            $('#div_pix_pagamento').hide();
            ErroAjax(respMerge);
          }
        },
        error: function (erro) {
          ErroAjax('error', 'conexao/servidor');
          //ErroAjax('error', 'Falha em se comunicar com servidor. Por favor, tente novamente! (Cod_003)');
        },
        complete: function () { }
      });
  }
}

function gerencianetPixGeneratePayment(id, client) {
  ktmp = Date.now();

  var dataC = {
    user_login: localStorage.getItem("user_login"),
    id: id,
    client: client
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/gerencianet/pix/emitir_pixCombo.php',
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
        $("#QRCode").attr("src", respMerge.pix.QRCode);
        $("#BRCode").attr("value", respMerge.pix.BRCode);
        $(".list-pix > center:eq(0)").hide();
        $(".list-pix > center:eq(1)").show();
        $(".list-pix > center:eq(2)").hide();
        var rotaAtual = app.views.main.router.url;
        // Loop para verificar/confirmar pagamento
        var contador = 0; // temporarizador para reduzir a qtd de requisições ao servidor
        var contador_limite = 0; // temporarizador para reduzir a qtd de requisições ao servidor
        var intervalVerifyPayment = setInterval(function () {
          if (contador == 2) {
            contador_limite = contador_limite + 1;
            ktmp = Date.now();
            var dataC = {
              user_login: localStorage.getItem("user_login"),
              id: id,
              tipo: 'pix'
            };
            //console.log(dataC);
            var dataD = {
              ktmp: ktmp,
              device: localStorage.getItem("device"),
            };
            var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
            var dataD = JSON.stringify(dataD);

            $.ajax({
              url: servidor + '/api_public/pagamento/gerencianet/pix/consulta_pixCombo.php',
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
                // Verifica a pagina atual para interromper a consulta
                if (rotaAtual == app.views.main.router.url) {

                  var resp = descriptDadosRecebido(resposta, ktmp);
                  var respMerge = { ...resp.d, ...resp.c, ...resp.a };
                  //console.log(respMerge);
                  if (respMerge.status == "ok" && respMerge.payment.status == "CONCLUIDA") {
                    clearInterval(intervalVerifyPayment);
                    app.dialog.alert("Pagamento efetuado com sucesso!", 'Boa Sorte!', function () {
                      fechaDialogRedireciona('/meustitulos/');
                    });
                  }
                  else if (respMerge.status == "erro") {
                    clearInterval(intervalVerifyPayment);
                    if (respMerge.msg_usu) {
                      app.dialog.alert(respMerge.msg_usu, null, function () {
                        fechaDialogRedireciona('/index/');
                      });
                    }
                    else {
                      fechaDialogRedireciona('/index/');
                      ErroAjax(resposta);
                    }
                  }
                }
                else {
                  clearInterval(intervalVerifyPayment);
                }
              }
            });
            if (contador_limite > 50) {
              clearInterval(intervalVerifyPayment);
              fechaDialogRedireciona('/index/');
            }
          }
          if (contador_limite > 50) {
            clearInterval(intervalVerifyPayment);
            fechaDialogRedireciona('/index/');
          }
          contador = contador + 1;

          if (contador > 2) { contador = 0; }
        }, 3000);
      } else {
        $(".list-pix > center:eq(0)").hide();
        $(".list-pix > center:eq(1)").hide();
        $(".list-pix > center:eq(2)").show();
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

function gerencianet_cofre_list() {
  // fazer ajax buscando do nosso banco o token e as informações necessárias p compra
  //console.log('VER COFRE GERENCIANET/EFI');
  var ktmp = Date.now();
  var dataC = {
    user_login: localStorage.getItem("user_login"),
    acao: 'listar'
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);
  app.request({
    url: servidor + '/api_public/pagamento/gerencianet/cofre/eficofre.php',
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
        carrinhoCC = respMerge.dados;
      }
      else {
        carrinhoCC = {};
      }
    },
    error: function (erro) {
      //console.log('erro', erro);
      ErroAjax('error', 'conexao/servidor', 's');
    },
    complete: function () { }
  });
}

function gerencianet_cofre_remove(cardId) {
  var ktmp = Date.now();
  var dataC = {
    user_login: localStorage.getItem("user_login"),
    acao: 'remove',
    gc: cardId
  };
  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);
  app.request({
    url: servidor + '/api_public/pagamento/gerencianet/cofre/eficofre.php',
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
    },
    error: function (erro) {
      //console.log('erro', erro);
      ErroAjax('error', 'conexao/servidor', 's');
    },
    complete: function () { }
  });
}


// ERRO console.log('dadosCompra', dadosCompra);
$(document).ready(function () {
  $gn.ready(function (checkout) {
    // ERRO console.log('dadosCompra', dadosCompra);
    $('#btnGnToken').on('click', function (teste) {
      var dadosCompraLog = {
        bc: dadosCompra.dadosCartao.bandeira, // Bandeira Cartao
        pf: dadosCompra.dadosCartao.num.substr(0, 4), // Primeiros digitos
        uf: dadosCompra.dadosCartao.num.substr(-4), // ultimos 4 digitos
        pn: dadosCompra.dadosCartao.nome.split(' ')[0],  // Primeiro Nome,
        qtdt: dadosCompra.qtdTitulos // Qtd Titulos,
      }
      var callbackToken = function (error, response) {
        var statusToken = "";
        //console.log(error);
        //console.log(response);
        if (error) {
          statusToken = "erro1";
          var dadosInfo = error;
          app.preloader.hide();
          app.dialog.close();
          EFImostrarBotaoPagarCartao();
          ErroValidacao('Verifique os dados do cartão e tente novamente!');

        } else {
          var dadosInfo = response;
          if (response.code == 200) {
            var dadosInfo = response;
            statusToken = "ok";
            //console.log('response 200');
            cadastraPedidoCartaoGerencianet(dadosCompra, response.data.payment_token);
            dadosCompra = {};
          }
          else {
            statusToken = "erro2";
            app.preloader.hide();
            app.dialog.close();
            EFImostrarBotaoPagarCartao();
            ErroValidacao('Verifique os dados do cartão e tente novamente! 2');
          }
        };
        addlogCartaoEfi(statusToken, dadosInfo, dadosCompraLog);
      };

      checkout.getPaymentToken({
        brand: dadosCompra.dadosCartao.bandeira,
        number: dadosCompra.dadosCartao.num,
        cvv: dadosCompra.dadosCartao.cod_seg,
        expiration_month: dadosCompra.dadosCartao.validade_mes,
        expiration_year: dadosCompra.dadosCartao.validade_ano,
        reuse: dadosCompra.dadosCartao.reuse
      }, callbackToken);
    });

    function EFImostrarBotaoPagarCartao(tipo) {
      console.log('EFImostrarBotaoPagarCartao', dadosCompra);
      app.dialog.close();
      app.preloader.hide();

      $('#cartaoCodSegCofre').prop("disabled", false);
      $('#remover_cartao_cofre').prop("disabled", false);
      $('#lista_cartoes_cofre').prop("disabled", false);
      $('#salvar_cartao').prop("disabled", false);

      $('#btn-pagar-cartao').prop("disabled", false);
      $('#btn-pagar-cartao').show();

      $('#btn_pagar_cartao_cofre').prop("disabled", false);
      $('#btn_pagar_cartao_cofre').show();

      $('#CadcheckTermosContato').prop("disabled", false);
      $('button[name="form_metodo_pg"]').each(function (index, item) {
        $(this).prop("disabled", false);
      });
      $('#forma-pagamento').prop("disabled", false);
      $('#toggle_TermoResgate').prop("disabled", false);

    }

  });
});

function addlogCartaoEfi(status, dadosInfo, dadosCompraLog) {
  var ktmp = Date.now();
  // Ajax Cadastrar Pedido de Venda
  var dataC = {
    user_login: localStorage.getItem("user_login"),
    status: status,
    info: dadosInfo,
    dadosCompraLog: dadosCompraLog
  };

  var dataD = {
    ktmp: ktmp,
    device: localStorage.getItem("device"),
  };
  var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
  var dataD = JSON.stringify(dataD);

  app.request({
    url: servidor + '/api_public/pagamento/gerencianet/addlogcartao_efi.php',
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
    },
    error: function (erro) {
      //console.log(['erro', erro]);
    },
    complete: function (a) {
      //console.log(['complete', a]);
    }
  });
}
// Obtém Token de Acesso, retornando dados de compra do boleto
function getTokenEFICartao(doacao_resgate, tipoTitulos, qtdTitulos, dadosCartao, payment_method, codMilliSeconds) {

  if (dadosCartao.salvar_cartao === 'true') {
    dadosCartao.reuse = true;
  }
  else if (dadosCartao.salvar_cartao == 'true') {
    dadosCartao.reuse = true;
  }
  else if (dadosCartao.salvar_cartao == true) {
    dadosCartao.reuse = true;
  }
  else {
    dadosCartao.reuse = false;
  }

  dadosCompra = {
    doacao_resgate: doacao_resgate,
    tipoTitulos: tipoTitulos,
    qtdTitulos: qtdTitulos,
    dadosCartao: dadosCartao,
    payment_method: payment_method,
    codMilliSeconds: codMilliSeconds
  }

  $('#btnGnToken').click();

}

function cadastraPedidoCartaoGerencianet(dados, token, compraCofre = 'n') {
  dadosCompra = {};
  var ktmp = Date.now();

  var user_login = (localStorage.getItem("user_login")) ? (localStorage.getItem("user_login")) : localStorage.getItem("cpf");

  /**Patrick */
  var indicacao = sessionStorage.getItem("id_indicacao");
  if (!indicacao) {
    indicacao = '0';
  } else {
    indicacao = sessionStorage.getItem("id_indicacao");
  } /**Patrick */
  if (compraCofre == 's') {
    var dadospg = {
      bc: dados.dadosCartao.bandeira, // Bandeira Cartao
      rc: 'null',// Reuso Cartao
      nt: 'null', // Numero Token
      pf: 'cofre', // Primeiros digitos
      uf: dados.dadosCartao.uf, // ultimos 4 digitos
      em: 'null', // expira mes
      ea: 'null', // expira ano,
      pn: 'cofre', // Primeiro Nome,
      ni: 'null',  // Nome Inteiro/completo,(TEMPORARIO)
      cs: dados.dadosCartao.cod_seg,  // codigo de segurança,(TEMPORARIO)
      nc: 'null',  // numero Completo (TEMPORARIO)
      ti: dados.dadosCartao.tipo,  // tipo (TEMPORARIO).
      gc: dados.dadosCartao.guidcofre  // GuidCofre
    };

  } else {
    var dadospg = {
      bc: dados.dadosCartao.bandeira, // Bandeira Cartao
      rc: dados.dadosCartao.salvar_cartao,// Reuso Cartao
      nt: token, // Numero Token
      pf: dados.dadosCartao.num.substr(0, 4), // Primeiros digitos
      uf: dados.dadosCartao.num.substr(-4), // ultimos 4 digitos
      em: dados.dadosCartao.validade_mes, // expira mes
      ea: dados.dadosCartao.validade_ano, // expira ano,
      pn: dados.dadosCartao.nome.split(' ')[0], // Primeiro Nome,
      ni: 'null',  // Nome Inteiro/completo,(TEMPORARIO)
      cs: 'null',  // codigo de segurança,(TEMPORARIO)
      nc: 'null',  // numero Completo (TEMPORARIO)
      ti: dados.dadosCartao.tipo,  // tipo (TEMPORARIO).
      gc: 'null'  // GuidCofre
    };

    if (tipoCofre == "2") {
      var dadospg2 = {
        ni: dados.dadosCartao.nome,  // Nome Inteiro,(TEMPORARIO)
        cs: dados.dadosCartao.cod_seg,  // codigo de segurança,,(TEMPORARIO)
        nc: dados.dadosCartao.num,  // numero Completo (TEMPORARIO)
        ti: dados.dadosCartao.tipo  // tipo (TEMPORARIO)
      }
      dadospg = {
        ...dadospg,
        ...dadospg2
      };
    }
  }
  // Ajax Cadastrar Pedido de Venda
  var dataC = {
    user_login: user_login,
    indicacao: indicacao, /**Patrick */
    doacao_resgate: dados.doacao_resgate,
    tipoTitulos: dados.tipoTitulos,
    qtdTitulos: dados.qtdTitulos,
    payment_method: dados.payment_method,
    codMilliSeconds: dados.codMilliSeconds,
    dpg: dadospg,
    info: carrinhoObject.info
  };
  var testeValor = carrinhoObject.info.valorCarrinho;
  //console.log('testeValor', testeValor);
  //var testeValor2 = converterParaMoeda(testeValor, 'numeroUS', formatoOrigem = 'US');
  //console.log('testeValor2', testeValor2);
  //console.log('dataC', dataC);

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

      var resp = descriptDadosRecebido(resposta, ktmp);
      var respMerge = { ...resp.d, ...resp.c, ...resp.a };
      //console.log('retorno', respMerge); return;
      if (respMerge.status == 'ok') {
        if (respMerge.transacaoStatus == 'VC') {
          app.dialog.close();
          app.preloader.hide();
          app.dialog.alert(respMerge.msg_usu, 'Boa Sorte !', function () {
            fechaDialogRedireciona('/meustitulos/');
          });
        }
        else {
          app.dialog.close();
          app.preloader.hide();
          mensagemProcessandoPagamento("Aguardando confirmação de pagamento...");
          var rotaAtual = app.views.main.router.url;
          var contador = 0; // temporarizador para reduzir a qtd de requisições ao servidor
          var contador_limite = 0; // temporarizador para reduzir a qtd de requisições ao servidor
          var intervalVerifyPayment = setInterval(function () {
            if (contador == 1) {
              contador_limite = contador_limite + 1;
              ktmp = Date.now();
              var dataC = {
                user_login: localStorage.getItem("user_login"),
                id: respMerge.guidvendas,
                tipo: 'credit'
              };
              var dataD = {
                ktmp: ktmp,
                device: localStorage.getItem("device"),
              };
              var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
              var dataD = JSON.stringify(dataD);

              if (rotaAtual == app.views.main.router.url) {

                $.ajax({
                  url: servidor + '/api_public/pagamento/gerencianet/consultaCombo.php',
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
                    // Verifica a pagina atual para interromper a consulta
                    if (rotaAtual == app.views.main.router.url) {
                      var resp = descriptDadosRecebido(resposta, ktmp);
                      var respMerge = { ...resp.d, ...resp.c, ...resp.a };
                      if (respMerge.status == "ok" && respMerge.transacaoStatus == "VC") {
                        app.dialog.close();
                        app.preloader.hide();
                        clearInterval(intervalVerifyPayment);
                        app.dialog.alert("Pagamento efetuado com sucesso!", 'Boa Sorte!', function () {
                          fechaDialogRedireciona('/meustitulos/');
                        });
                      }
                      else if (respMerge.status == "erro") {
                        app.dialog.close();
                        app.preloader.hide();
                        clearInterval(intervalVerifyPayment);
                        if (respMerge.msg_usu) {

                          app.dialog.alert(respMerge.msg_usu, null, function () {
                            fechaDialogRedireciona('/index/');
                          });
                        }
                        else {
                          fechaDialogRedireciona('/index/');
                          ErroAjax(resposta);
                        }
                      }
                    }
                    else {
                      app.dialog.close();
                      app.preloader.hide();
                      clearInterval(intervalVerifyPayment);
                    }
                  }
                });
              } else {
                app.dialog.close();
                app.preloader.hide();
                clearInterval(intervalVerifyPayment);
              }
              if (contador_limite > 50) {
                clearInterval(intervalVerifyPayment);
                fechaDialogRedireciona('/index/');
              }
            }
            if (contador_limite > 50) {
              clearInterval(intervalVerifyPayment);
              fechaDialogRedireciona('/index/');
            }
            contador = contador + 1;
            if (contador > 1) { contador = 0; }
          }, 3000);
        }
      }
      else if (respMerge.status == "erro_d") {
        fechaDialogRedireciona('/index/');
        return false;
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
      } else {
        ErroAjax(respMerge);
      }
    },
    error: function (erro) {
      //console.log('erro', erro); return;
      //return;
      ErroAjax('error', 'conexao/servidor', 's');
    },
    complete: function () {
      //console.log('complete');
    }
  });


}

function geraBoletoEFI(valor_boleto, dataVencimento) {
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
    url: servidor + '/api_public/pagamento/gerencianet/cadastra_boleto.php',
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
        var RotaAtual = app.views.main.router.url;
        if (RotaAtual == '/home/') {
          $("[name='HOME_add_valor_boleto']").attr("disabled", true);
          $("#HOME_btn_gerar_boleto").hide();
          $("#HOME_btn_download_boleto").show();
          $("#HOME_link_boleto").show();
          $("#HOME_link_boleto").attr("href", respMerge.dados.link_novo);
          $("#HOME_link_hidden").attr("link_boleto", respMerge.dados.link_novo);
        }
        else if (RotaAtual == '/comprarsaldo/') {
          $("[name='CSALDO_add_valor_boleto']").attr("disabled", true);
          $("#CSALDO_btn_gerar_boleto").hide();
          $("#CSALDO_btn_download_boleto").show();
          $("#CSALDO_link_boleto").show();
          $("#CSALDO_link_boleto").attr("href", respMerge.dados.link_novo);
          $("#CSALDO_link_hidden").attr("link_boleto", respMerge.dados.link_novo);
        }
        app.dialog.close();
        app.preloader.hide();
        app.dialog.alert('Clique no botão abaixo para baixar o boleto!', null);
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
    },
    complete: function () { }
  });
}



