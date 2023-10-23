jQuery(function () {
  var ktmp = Date.now();
  var dadosUsuario = JSON.parse(localStorage.getItem("dadosUsuario"));
  $('#saldo_usuario_extrato').text('R$ ' + dadosUsuario.saldo_usuario.replace('.', ","));
  $('#valor_boleto_pendente_extrato').text('R$ ' + dadosUsuario.boleto_em_aberto.replace('.', ","));

  $('[name="btn_extrato"]').on("click", function () {
    var tab = $(this).attr('href');
    $("#tab-cartao").removeClass('tab-active');
    $("#tab-boleto").removeClass('tab-active');
    $(tab).addClass('tab-active');
    //tab-cartao
    $('[name="btn_extrato"]').each(function (index, item) {
      $(this).removeClass('extrato-tab_Ativo');
      $(this).addClass('extrato-tab_inAtivo');
    });
    $(this).removeClass('extrato-tab_inAtivo');
    $(this).addClass('extrato-tab_Ativo');
  });

  consultaRelatorioExtrato();

  function consultaRelatorioExtrato() {
    var dataC = {
      user_login: localStorage.getItem("user_login")
    };
    var dataD = {
      ktmp: ktmp,
      device: localStorage.getItem("device"),
    };
    var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
    var dataD = JSON.stringify(dataD);
    app.request({
      url: servidor + '/api_public/extrato/relatorio_extratoCombo.php',
      /*headers: {
        'Authorization': "Bearer " + localStorage.getItem("jwt"),
        'chaveapp': chaveAPP,
        'versaoapp': versaoAPP
      },*/
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
          if (parseInt(respMerge.extrato.qtdCompras) > 0) {

            escreveRelatorioExtratoCartaoPix(respMerge.extrato.dados);
            escreveRelatorioExtratoBoletoSaldo(respMerge.extrato.dados);
            popUpExtrato();
            criarPopupExtrato();
          }
          else {
            $("#cardSemTitulos-cartao").show();
            $("#detExtratoCartao").hide();
            $("#cardSemTitulos-boleto").show();
            $("#detExtratoBoleto").hide();
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

  function escreveRelatorioExtratoCartaoPix(dadosCompleto) {

    var qtdTotal = 0;
    qtdTotal = (dadosCompleto.credit) ? qtdTotal + Object.keys(dadosCompleto.credit).length : qtdTotal;
    qtdTotal = (dadosCompleto.debit) ? qtdTotal + Object.keys(dadosCompleto.debit).length : qtdTotal;
    qtdTotal = (dadosCompleto.pix) ? qtdTotal + Object.keys(dadosCompleto.pix).length : qtdTotal;

    //console.log('dados', dados);
    if (qtdTotal == 0) {
      $("#cardSemTitulos-cartao").show();
      $("#detExtratoCartao").hide();
      return false;
    }
    else {
      var i = 0;
      var code = "";
      var dataExtratoString = "";
      var ultimaDataCartao = "";
      dadosJson = "";
      $.each(dadosCompleto, function (metodoPagamento, dados) {
        if ((metodoPagamento == 'credit') || (metodoPagamento == 'debit') || (metodoPagamento == 'pix')) {
          var mpArray = [];
          mpArray['credit'] = 'Cartão de Credito';
          mpArray['debit'] = 'Cartão de Débito';
          mpArray['pix'] = 'PIX';

          $.each(dados, function (index, dado) {
            var dadosJson = JSON.stringify(dado);
            var dataHoraString = dado.data_extrato.split(' ')[0] + ' ' + dado.hora_extrato;
            var dataExtrato = novaDataJS(dataHoraString, 'yyyy-mm-dd hh:mm:ss');
            localStorage.setItem("ultimaDataCartao", dataExtrato);
            ultimaDataCartao = dataExtrato;
            var dia = "/";
            var dia = dataExtrato.toLocaleString('pt-BR', { day: '2-digit' }) + dia;
            var mes = dataExtrato.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
            var idDiaMes = dataExtrato.toLocaleString('pt-BR', { day: '2-digit' }) + '-' + dataExtrato.toLocaleString('pt-BR', { month: '2-digit' }).toUpperCase();
            var horario = dataExtrato.toLocaleString('pt-BR', { timeStyle: 'short' });
            var texto = "Compra no " + mpArray[metodoPagamento] + "<br>" + dado.titulos.qtdItens + " " + nomeProduto;
            if (dado.titulos.qtdItens > 1) { texto = texto + "s" };
            var valor = "Valor Total: " + converterParaMoeda(dado.amount, 'numeroStringBR');

            if (dataExtratoString != dado.data_extrato) {
              dataExtratoString = dado.data_extrato;

              // Fecha ExCartao-div e ExCartao-cont do dia  anterior
              if (i != 0) {
                code += "  </div><!--Fecha ExCartao-cont-->";
                code += "</div><!--Fecha ExCartao-div-->";// Fecha a Div ec-div-id-*****
              }

              // Cadastra novo dia
              code += "<div id='ExCartao-div-id-" + idDiaMes + "' class='timeline-item timeline-item-right timeline_esquerda'>";
              code += "  <div class='timeline-item-date' style='width: 60px;'>" + dia + "<small>" + mes + "</small></div>";
              code += "  <div class='timeline-item-divider'></div>";
              code += "  <div id='ExCartao-cont-id-" + i + "' class='timeline-item-content'>";
            }
            // Adiciona Conteudo
            code += "    <div id='ExCartao-item-id-" + i + "' class='timeline-item-inner timeline-box-out itemExtrato' ";
            code += "dados='" + dadosJson + "'>";
            code += "      <div class='timeline-item-time'>" + horario + "</div>";
            code += "      <div class='timeline-item-subtitle'>" + texto + "</div>";
            code += "      <div class='timeline-item-text' style='font-size:0.9em;'>" + valor + "</div>";
            code += "    </div><!--Fecha ExCartao-item-->";
            i = i + 1;
          });
        }
      });
      // Fecha o dia Anterior
      code += "  </div><!--Fecha ExCartao-cont-->";
      code += "</div><!--Fecha ExCartao-div-->";

      localStorage.removeItem("ultimaDataCartao");
      ultimaDataCartao.setDate(ultimaDataCartao.getDate() - 1);

      var primDia = "/";
      var primDia = ultimaDataCartao.toLocaleString('pt-BR', { day: '2-digit' }) + primDia;
      var primMes = ultimaDataCartao.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      var idDiaMes = ultimaDataCartao.toLocaleString('pt-BR', { day: '2-digit' }) + '-' + ultimaDataCartao.toLocaleString('pt-BR', { month: '2-digit' }).toUpperCase();
      // Cadastra um novo dia sem titulos (1 dia antes do 1ºdia do relatório), para manter layot
      code += "<div id='ExCartao-div-id-" + idDiaMes + "' class='timeline-item timeline-item-right timeline_esquerda'>";
      code += "  <div class='timeline-item-date' style='width: 60px;'>" + primDia + "<small>" + primMes + "</small></div>";
      code += "  <div class='timeline-item-divider'></div>";
      code += "  <div id='ExCartao-cont-id-" + (i + 1) + "' class='timeline-item-content'>";
      code += "  </div><!--Fecha ExCartao-cont-->";
      code += "</div><!--Fecha ExCartao-div-->";
    }
    code = "<div class='timeline timeline-sides timelineExtrato'>" + code + "</div><!--Fecha timeline-sides-->";
    $('.extrato-cartao').append(code);
  }

  function escreveRelatorioExtratoBoletoSaldo(dadosCompleto) {

    var qtdTotal = 0;
    qtdTotal = (dadosCompleto.boleto) ? qtdTotal + Object.keys(dadosCompleto.boleto).length : qtdTotal;
    qtdTotal = (dadosCompleto.saldo) ? qtdTotal + Object.keys(dadosCompleto.saldo).length : qtdTotal;

    if (qtdTotal == 0) {
      $("#cardSemTitulos-boleto").show();
      $("#detExtratoBoleto").hide();
      return false;
    }
    else {
      var i = 0;
      var code = '';
      var divAberta = "";
      var mesAnterior = "";
      var dataAnterior = "";
      var operacaoAnterior = "";
      var idDiaMesAnterior = "";
      var escreveuSaldo = "n";

      $.each(dadosCompleto, function (metodoPagamento, dados) {
        if ((metodoPagamento == 'saldo') || (metodoPagamento == 'boleto')) {
          var mpArray = [];
          mpArray['saldo'] = 'Saldo';
          mpArray['boleto'] = 'Boleto';
          $.each(dados, function (index, dado) {
            var dadosJson = JSON.stringify(dado);
            localStorage.setItem("ultimaDataBoleto", dado.criado_em);
            localStorage.setItem("ultimoSaldoAnterior", dado.saldo_anterior);

            var dataHoraString = dado.data_extrato.split(' ')[0] + ' ' + dado.hora_extrato;
            var dataExtrato = novaDataJS(dataHoraString, 'yyyy-mm-dd hh:mm:ss');

            var mes = dataExtrato.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
            if (mesAnterior != mes) {
              mesAnterior = mes;

              if (divAberta == "ExBolSaldo-cont") {
                code += "  </div><!--Fecha(ExBolSaldo-cont)-count -->"; // Fecha conteudo
                code += "</div><!--Fecha(ExBolSaldo-cont)-div -->";
                divAberta = "";
              }
              else if (divAberta == "ExBolSaldo-div") {
                code += "</div><!--Fecha(ExBolSaldo-div)-div -->";
                divAberta = "";
              }
              code += escreveSaldodoDia(dataExtrato, dado.saldo_atual, i);
              divAberta = "";
              i = i + 1
            }
            var dia = "/";
            var dia = dataExtrato.toLocaleString('pt-BR', { day: '2-digit' }) + dia;
            var horario = dataExtrato.toLocaleString('pt-BR', { timeStyle: 'short' });
            var valor = "Valor: " + converterParaMoeda(dado.amount, 'numeroStringBR');
            if (dado.operacao == 'd') {
              classeLado = 'right';
              classeCor = 'out';
              var texto = "Compra no " + mpArray[metodoPagamento] + "<br>" + dado.titulos.qtdItens + " " + nomeProduto;
              if (dado.titulos.qtdItens > 1) { texto = texto + "s" };
            }
            else {
              classeLado = 'left';
              classeCor = 'in';
              var texto = "Credito adicionado !";
            }

            var idDiaMes = dado.operacao + '-' + dataExtrato.toLocaleString('pt-BR', { day: '2-digit' }) + '-' + dataExtrato.toLocaleString('pt-BR', { month: '2-digit' }).toUpperCase();

            // Oculta a data do Operacao e Data forem iguais para n repetir
            if ((dataAnterior == dado.data_extrato) && (operacaoAnterior == dado.operacao)) {
              dia = "";
              mes = "";
            }
            else {
              dataAnterior = dado.data_extrato;
              operacaoAnterior = dado.operacao;
            }

            if (idDiaMesAnterior != idDiaMes) {
              idDiaMesAnterior = idDiaMes;
              // Feca a div anterior
              if (divAberta == "ExBolSaldo-cont") {
                code += "  </div><!--Fecha(ExBolSaldo-cont)-count -->"; // Fecha conteudo
                code += "</div><!--Fecha(ExBolSaldo-cont)-div -->";
                divAberta = "";
              }
              else if (divAberta == "ExBolSaldo-div") {
                code += "</div><!--Fecha(ExBolSaldo-div)-div -->";
                divAberta = "";
              }
              // Adiciona um dia
              code += "<div id='ExBolSaldo-div-id-" + idDiaMes + "' class='timeline-item timeline-item-" + classeLado + "'>";
              divAberta = "ExBolSaldo-div";
              code += "  <div class='timeline-item-date'>" + dia + "<small>" + mes + "</small></div>";
              code += "  <div class='timeline-item-divider'></div>";
              // Adciona Conteudo
              code += "  <div id='ExBolSaldo-cont-id-" + i + "' class='timeline-item-content'>";
              divAberta = "ExBolSaldo-cont";
            }

            // Adiciona Itens ao Conteudo
            code += "    <div id='ExBolSaldo-item-id-" + i + "' class='timeline-item-inner timeline-box-" + classeCor + " itemExtrato' ";
            code += "dados='" + dadosJson + "'>";
            code += "      <div class='timeline-item-time'>" + horario + "</div>";
            code += "      <div class='timeline-item-subtitle'>" + texto + "</div>";
            code += "      <div class='timeline-item-text' style='font-size:0.9em;'>" + valor + "</div>";
            code += "    </div><!--Fecha ExBolSaldo-item-->";
            i = i + 1;
          });
        }
      });
      // Fecha o dia Anterior
      code += "  </div><!--Fecha Ultimo ExCartao-cont-->";
      code += "</div><!--Fecha Ultimo ExCartao-div-->";

      code += escreveSaldodoDia(localStorage.getItem("ultimaDataBoleto"), localStorage.getItem("ultimoSaldoAnterior"), i + 1)
      localStorage.removeItem("ultimaDataBoleto");
      localStorage.removeItem("ultimoSaldoAnterior");

      // Adiciona o cabeçalho princial // timeline-sides
      code = "<div class='timeline timeline-sides timelineExtrato'>" + code + "</div><!--Fecha timeline-sides-->";
      $('.extrato-boleto').append(code);
    }
  };

  function escreveSaldodoDia(data, saldo, i) {
    if (typeof (data) == 'string') {
      var dataSaldo = novaDataJS(data, 'yyyy-mm-dd hh:mm:ss');
    }
    else {
      var dataSaldo = data;
    }
    code = '';
    var valor = "Valor: " + converterParaMoeda(saldo, 'numeroStringBR');
    var dia = "/";
    var dia = dataSaldo.toLocaleString('pt-BR', { day: '2-digit' }) + dia;
    var mes = dataSaldo.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
    var idDiaMes = 's-' + dataSaldo.toLocaleString('pt-BR', { day: '2-digit' }) + '-' + dataSaldo.toLocaleString('pt-BR', { month: '2-digit' }).toUpperCase();

    // Cadastra um novo dia sem titulos (1 dia antes do 1ºdia do relatório), para manter layot

    code += '<div id="ExSaldo-div-id-' + idDiaMes + '" class="timeline-item timeline-item-left">';
    code += '  <div class="timeline-item-date">' + dia + '<small>' + mes + '</small></div>';
    code += '  <div class="timeline-item-divider"></div>';
    code += '  <div id="ExSaldo-cont-id-' + i + '" class="timeline-item-content">';

    // Adiciona Conteudo
    code += '    <div class="timeline-item-inner timeline-box-saldo">';
    code += '      <div class="timeline-item-subtitle">Saldo:</div>';
    code += '      <div class="timeline-item-text" style="font-size:0.9em;">' + valor + '</div>';
    code += '    </div>';

    code += '  </div><!--Fecha ExSaldo-cont-->';
    code += '</div><!--Fecha ExSaldo-div-->';
    return code;
  }

  function popUpExtrato() {
    $('.itemExtrato').on('click', function () {
      var dados = $(this).attr('dados');
      var id = $(this).attr('id');
      criarPopupExtrato(id, dados);
    });

  }

  function criarPopupExtrato(id = null, dados = null) {
    if (dados != null) {

      var dadosJson = JSON.parse(dados);
      var dataHoraString = dadosJson.data_extrato.split(' ')[0] + ' ' + dadosJson.hora_extrato;
      var dataExtrato = novaDataJS(dataHoraString, 'yyyy-mm-dd hh:mm:ss');
      if (dadosJson.payment_type.toUpperCase() == 'CREDIT') {
        var formaDePagamento = 'Cartão de Crédito';
      }
      else if (dadosJson.payment_type.toUpperCase() == 'DEBIT') {
        var formaDePagamento = 'Cartão de Débito';
      }
      else if (dadosJson.payment_type.toUpperCase() == 'PIX') {
        var formaDePagamento = 'PIX';
      }
      else if (dadosJson.payment_type.toUpperCase() == 'BOLETO') {
        var formaDePagamento = 'BOLETO';
      }
      else {
        var formaDePagamento = dadosJson.payment_type.toUpperCase();
      }

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
      var htmlFechar = '<i style="font-size: 2rem;right: 25px;position: fixed;" class="mdi mdi-close-circle link popup-close"></i>';

      var btnRodape = "";
      if (btnRodape != '') {
        //var btnRodape = "<button class='col button button-raised button-round popup-close botao_cor_1 pulse_infinite' style='color:#ffffff'>" + btnRodape + "</button>";
        btnRodape = "";
      }
      var qtdProdutos = Object.keys(dadosJson.titulos.dados).length;
      if (dadosJson.titulos) {
        var itens = "";
        var count = 1;
        $.each(dadosJson.titulos.dados, function (nomeSorteio, dados) {
          if (qtdProdutos == 1) {
            itens = dados.titulos.replace(/[-]/g, ", ");
          }
          else {
            if (count == 1) {
              itens = "Produto " + count + ": " + dados.titulos.replace(/[-]/g, ", ");
            }
            else {
              itens = itens + "<br>Produto " + count + ": " + dados.titulos.replace(/[-]/g, ", ");
            }
          }
          count = count + 1;
        });
        // Atualiza qtdItens
        dadosJson['qtd_itens'] = dadosJson.titulos.qtdItens;

      }
      else {
        var itens = "";
      }

      if (dadosJson.operacao == 'd') {
        var operacao = 'Débito';
        var cssBox = 'timeline-box-out';
        var cssHeader = "color: var(--cor_branca);background-color: var(--cor_vermelha);";
      } else if (dadosJson.operacao == 'c') {
        var operacao = 'Crédito';
        var cssBox = 'timeline-box-in';
        var cssHeader = "color: var(--cor_branca);background-color: var(--cor_verde);";
      } else {
        var operacao = 'Saldo';
        var cssBox = 'timeline-box-saldo';
        var cssHeader = "color: var(--cor_branca);background-color: var(--cor_azul);";
      }
      //var titulo = "Operação " + operacao;
      var titulo = "DETALHAMENTO";

      //var html = '<div class="card ' + cssBox + '" style="color: black;">'
      var html = '<div class="card border_animated" style="color: black;">'
        + '     <!-- <div class="block-title titulo-card-pagamento">Detalhamento</div>-->'
        + '      <div class="list">'
        + '        <ul style="color: black;">'
        + '          <li>'
        + '            <div class="item-content">'
        + '              <div class="item-inner">'
        + '                <div class="item-title" style="Font-size: 0.9rem;">Tipo de Operação:</div>'
        + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">' + operacao.toUpperCase() + '</span>'
        + '                </div>'
        + '              </div>'
        + '            </div>'
        + '          </li>'

        + '          <li>'
        + '            <div class="item-content">'
        + '              <div class="item-inner">'
        + '                <div class="item-title" style="Font-size: 0.9rem;">Forma de Pagamento:</div>'
        + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">' + formaDePagamento + '</span>'
        + '                </div>'
        + '              </div>'
        + '            </div>'
        + '          </li>'

        + '          <li>'
        + '            <div class="item-content">'
        + '              <div class="item-inner">'
        + '                <div class="item-title" style="Font-size: 0.9rem;">Valor :</div>'
        + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">R$ ' + converterParaMoeda(dadosJson.amount, 'numeroStringBR') + '</span>'
        + '                </div>'
        + '              </div>'
        + '            </div>'
        + '          </li>'
        + '          <li>'
        + '            <div class="item-content">'
        + '              <div class="item-inner">'
        + '                <div class="item-title" style="Font-size: 0.9rem;">Data :</div>'
        + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">' + dataExtrato.toLocaleString('pt-BR', { dateStyle: 'medium' }) + '</span>'
        + '                </div>'
        + '              </div>'
        + '            </div>'
        + '          </li>';

      if (dadosJson.operacao == 'd') { // N precisa mostrar a hora que validou o boleto, hora da callback
        html += '      <li>'
          + '            <div class="item-content">'
          + '              <div class="item-inner">'
          + '                <div class="item-title" style="Font-size: 0.9rem;">Hora :</div>'
          + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">' + dataExtrato.toLocaleString('pt-BR', { timeStyle: 'medium' }) + '</span>'
          + '                </div>'
          + '              </div>'
          + '            </div>'
          + '          </li>';
      }
      if (dadosJson.operacao == 'd') {
        if ((dadosJson.qtd_itens == 0) || (dadosJson.qtd_itens == '') || (dadosJson.qtd_itens == null)) {
          //  mostra nada
        } else {
          html += '     <li>'
            + '            <div class="item-content">'
            + '              <div class="item-inner">'
            + '                <div class="item-title" style="Font-size: 0.9rem;">Quantidade de itens</div>'
            + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">' + dadosJson.qtd_itens + '</span>'
            + '                </div>'
            + '              </div>'
            + '            </div>'
            + '          </li>';

          if (dadosJson.qtd_itens == 1) {
            var campoQtd = "Título: ";
          } else {
            var campoQtd = "Títulos: ";
          }

          if (dadosJson.qtd_itens < 4) {
            html += '      <li>'
              + '            <div class="item-content">'
              + '              <div class="item-inner">'
              + '                <div class="item-title" style="Font-size: 0.9rem;">' + campoQtd + '</div>'
              + '                <div class="item-after"><span style="Font-size: 1rem;" class="popupExtrato-texto">' + itens + '</span>'
              + '                </div>'
              + '              </div>'
              + '            </div>'
              + '          </li>';
          } else {

            html += '      <li>'
              + '            <div class="item-content">'
              + '              <div class="item-inner">'
              + '                <div class="item-title" style="Font-size: 0.9rem;">' + campoQtd + '</div>'
              + '              </div>'
              + '              <div class="" style="text-align: right;padding-right: 12px;">'
              + '                <span style="Font-size: 1rem;" class="popupExtrato-texto">' + itens + '</span>'
              + '                </div>'
              + '              </div>'
              + '            </div>'
              + '          </li>';
          }
        }
      }
      html += '     </ul>'
        + '      </div>'
        + '    </div>';

      // Create dynamic Popup
      var PopupExtrato = app.popup.create({
        // #dadada + da = adiciona transparencia
        content: '<div id="popupExtrato-' + id + '" class="popup popup_dinamico" ' +
          'style="overflow:scroll; background: #dadadada;text-shadow: 0 0 black;' +
          cssADD + '">' +
          '<div id="card_popupE_' + id + '"class="card blog-card">' +
          '<div class="card-header blog-card-popupExtrato" style="' + cssHeader + '">' +
          titulo +
          htmlFechar +
          '</div>' +
          '<div id="popup-text-html" class="card-content blog-content-padding color-white">' +
          html +

          '</div>' +
          '</div></div>',
        // Events
        on: {
          open: function (popup) {
            $('#card_popupE_' + id).hide();
            //console.log(popup);
            //console.log('Popup open');
          },
          opened: function (popup) {
            //console.log(popup);
            //console.log('Popup opened');
            //console.log('Popup opened');
            var tamPagina = $('#popupExtrato-' + id).height();
            var tamPopup = $('#card_popupE_' + id).height();
            var topPopup = (tamPagina / 2) - (tamPopup / 2);
            topPopup = topPopup.toString() + 'px';
            $('#card_popupE_' + id).css('top', topPopup);
            $('#card_popupE_' + id).show(500);
          },
          close: function (popup) {
            //console.log(popup);
            //console.log('Popup close');
          },
          closed: function (popup) {
            //console.log(popup);
            //console.log('Popup closed');
          }
        }
      });

      PopupExtrato.open();
    }
  }

});