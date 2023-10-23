jQuery(function () {
  var raspadinhaObj = {};

  var qtdProdutos = 0;
  var prodSelecionado = "";

  var pickerConferirSorteioProdutoSelecionadoArray = {};
  var pickerConferirSorteioTodosProdutos = {};
  var pickerConferirSorteioGuidSorteio = "";
  var pickerConferirSorteioGuidSorteioAcao = "";

  var AjaxFlag = 0; // raspadinha
  var vendasItensAberto = "";
  var tituloSelecionado = "";
  var raspadinhaNomeSorteio = "";
  var qtdRasp = 0;
  //Atualiza Telefone de suporte Whatsapp
  var novoTelSuporte = 'https://wa.me/' + localStorage.getItem("telSuporte") + '/?text=Ola%2c+preciso+de+ajuda+com+a+raspadinha.';
  $("#Rasp_1WA").attr("href", novoTelSuporte);
  $("#Rasp_2WA").attr("href", novoTelSuporte);
  $("#Rasp_3WA").attr("href", novoTelSuporte);

  // Badge - Sinalização de Compra e de itens no carrinho
  badgeCompraSemana('meust-badge-qtd-comprada'); // cada pagina tem um id
  badgeCarrinhoEmAberto('meust-badge-qtd-carrinho');// cada pagina tem um id

  //app.dialog.preloader('Aguarde, consultando histórico...');
  app.dialog.preloader();

  localStorage.setItem("TMPsorteiosAnteriores", '');
  localStorage.setItem("TMPnumerosSorteados", '');

  if (localStorage.getItem("dadosSorteioAberto")) {
    var dadosSorteioAberto = JSON.parse(localStorage.getItem("dadosSorteioAberto"));
    var dataInicio = dadosSorteioAberto.data_sorteio;
  }
  else {
    //var dataInicio = new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('pt-BR');
    var dataInicio = new Date().toISOString().slice(0, 10);
  }

  listaHistorico(dataInicio, 'S');

  $("#icone_avancar").on("click", function () {
    var DE = $("#hidden_pagina").val();
    var qtd = $("#hidden_qtd").val();
    if (DE == "A") {
      click_item("B");
    }
    else if (DE == "B") {
      if (qtd > 2) {
        click_item("C");
      }
    }
  });

  $("#icone_voltar").on("click", function () {
    var DE = "";
    DE = $("#hidden_pagina").val();
    if (DE == "C") {
      click_item("B");
    }
    else if (DE == "B") {
      click_item("A");
    }
  });

  function click_item(PARA) {
    var DE = $("#hidden_pagina").val();
    $("#hidden_pagina").val(PARA);
    mostrarItemSelecionado(DE, PARA);
  }

  function mostrarItemSelecionado(DE, PARA) {
    toastRaspadinha.open();
    $("#hidden_pagina").val(PARA);
    $('#bloco' + DE).hide();
    $('#bloco' + PARA).show();
    $('#conjuntoBolas' + DE + ' > i').removeClass('blockRaspadinha_bulletSelecionada');
    $('#conjuntoBolas' + DE + ' > i').addClass('blockRaspadinha_bullet');
    $('#conjuntoBolas' + PARA + ' > i').addClass('blockRaspadinha_bulletSelecionada');
    $('#conjuntoBolas' + PARA + ' > i').removeClass('blockRaspadinha_bullet');
  }

  $("#conjuntoBolasA").on("click", function () {
    click_item("A")
  });

  $("#conjuntoBolasB").on("click", function () {
    click_item("B")
  });

  $("#conjuntoBolasC").on("click", function () {
    click_item("C")
  });


  $("[name='MT_sel_produto']").on("click", function () {
    configuraMTSelecaoProdutos(this.id);
  });

  $("[name='conferirItem']").on("click", function () {
    if (app.picker.get() === undefined) {
      criaPickerConferirSorteio();
    }
    else {
      // n faz nada, só abre
    }
  });



  function configuraMTSelecaoProdutos(ativarId) {
    var cardTitulos = "";
    prodSelecionado = ativarId.substring(3);
    $("#conferir_sorteios").hide();
    $("#conferir_sorteios_semanal").hide();
    $("#conferir_sorteios_extra").hide();
    $("#conferir_" + prodSelecionado).show();

    $('button[name="MT_sel_produto"]').each(function (index, item) {
      cardTitulos = item.id.substring(3);
      $('.titulos_' + cardTitulos).hide();
      $(this).removeClass("btn_mt_produtoAtivo");
      $('#span_qtc_' + cardTitulos).hide();
    });

    $("#" + ativarId).addClass("btn_mt_produtoAtivo");
    cardTitulos = ativarId.substring(3);
    $('.titulos_' + cardTitulos).show();
    $('#span_qtc_' + cardTitulos).show();
    $('#quant_sorteio_span_' + cardTitulos).text('ATUALIZAR');

  }

  function listaHistorico(dataPesquisa, cargaInicial) {

    $('#MT_produtos').hide();

    $('#conferir_sorteios').hide();
    $('#conferir_sorteios_semanal').hide();
    $('#conferir_sorteios_extra').hide();

    $('#MT_sorteios_semanal').hide();
    $('#MT_sorteios_extra').hide();
    $('#MT_sorteios_extra').hide();

    $('#MT_sorteios_semanal').removeClass("btn_mt_produtoAtivo");
    $('#MT_sorteios_extra').removeClass("btn_mt_produtoAtivo");
    $('#MT_sorteios_extra').removeClass("btn_mt_produtoAtivo");

    $('.titulos_sorteios').hide();
    $('.titulos_sorteios_semanal').hide();
    $('.titulos_sorteios_extra').hide();

    $('#proc_susep_sorteios').hide();
    $('#proc_susep_sorteios_semanal').hide();
    $('#proc_susep_sorteios_extra').hide();

    $('#qtc_sorteios').hide();
    $('#qtc_sorteios_semanal').hide();
    $('#qtc_sorteios_extra').hide();

    qtdProdutos = 0;
    prodSelecionado = "";

    var ktmp = Date.now();

    if (dataPesquisa) {
      var dataC = {
        user_login: localStorage.getItem("user_login"),
        data_sorteio: dataPesquisa,
        cargaInicial: cargaInicial,
        tipo: 'combo'
      };
      var dataD = {
        ktmp: ktmp,
        device: localStorage.getItem("device"),
      };
      var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
      var dataD = JSON.stringify(dataD);
      app.request({
        //url: servidor + '/api_public/titulos/meus_titulosComboV2.php',
        url: servidor + '/api_public/titulos/meus_titulosComboRasp.php',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
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
          app.preloader.hide();
          var resp = descriptDadosRecebido(resposta, ktmp);
          var respMerge = { ...resp.d, ...resp.c, ...resp.a };
          //console.log(respMerge);
          if (respMerge.status == "ok") {
            if (respMerge.hist == "ok") {
              // historico encontrado
              $('#selecaoDataHistorico').show();
              $('#cardCompraZerada').hide();

              $('#conferir_sorteios').hide();
              $('#conferir_sorteios_semanal').hide();
              $('#conferir_sorteios_extra').hide();

              // Verifica a qtd e qual produto/soteio aberto no dia
              $.each(respMerge.historicoCompras.qtd, function (nomeSorteio, qtd) {
                // Se tem historico de compras, organiza o layout com os botoes corretos
                if (parseInt(qtd) > 0) {
                  if (prodSelecionado == "") {
                    prodSelecionado = nomeSorteio;
                    $('.titulos_' + prodSelecionado).show();
                    $('#MT_' + prodSelecionado).addClass("btn_mt_produtoAtivo");
                    $('#qtc_' + prodSelecionado).show();
                  }
                  qtdProdutos = qtdProdutos + 1;
                  $('#MT_' + nomeSorteio).show();
                  $('.titulos_' + prodSelecionado).show();
                }
              });
              if (qtdProdutos > 1) {
                $("#MT_produtos").show();
              }

              rg = null;
              rgq = null;
              if (respMerge.historicoCompras) {
                if (respMerge.historicoCompras.compras) {
                  if (respMerge.historicoCompras.compras.raspadinha) {
                    raspadinhaObj = respMerge.historicoCompras.compras.raspadinha;
                  }
                }
              }

              // Organiza todas as datas, retirando duplicados e ordenando Decrescente
              var valTemp = {};
              var todasDatas = {};
              valTemp = Object.values(respMerge.sorteiosAnteriores.todasDatas); // retorna um array com os valores do objeto 1
              valTemp = [...new Set(valTemp)]; // remove os elementos duplicados do array concatenado
              todasDatas = valTemp.sort(function (a, b) {
                const dataA = new Date(a.split('-').reverse().join('-'));
                const dataB = new Date(b.split('-').reverse().join('-'));
                //return dataA.getTime() - dataB.getTime(); // Ordem Crescente
                return dataB.getTime() - dataA.getTime(); // Ordem Descrescente
                // ordena os valores como datas no formato d-m-Y
              });

              // Calendario compras
              var calendarioCompras = {};
              const mesesPTBR = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
              ];

              $.each(todasDatas, function (id, dataSorteioTexto) {
                const dataSorteio = new Date(dataSorteioTexto.split('-').reverse().join('-'));
                const nomeMes = mesesPTBR[dataSorteio.getMonth()];
                if (nomeMes in calendarioCompras == false) { calendarioCompras[nomeMes] = {}; }
                count = Object.keys(calendarioCompras[nomeMes]).length;
                calendarioCompras[nomeMes][count] = dataSorteioTexto;
              });

              if (respMerge.sorteiosAnteriores.totalSorteiosComprados == 0) {
                //Nunca comprou // nao comprou nos ultimos 6 meses
                $('#cardCompraZerada').show();
                $('#cardObservacoes').show();
                $('#cardSemTitulos').hide();
                $("#cardtitulos").hide();
                $('#dadosSorteio').hide();

                $('#conferir_sorteios').hide();
                $('#conferir_sorteios_semanal').hide();
                $('#conferir_sorteios_extra').hide();

                $('#selecaoDataHistorico').hide();
                $("#MT_produtos").hide();
                return;
              }
              else if (cargaInicial == 'S') {
                criaPickerV3(calendarioCompras);
                var dataConsulta = todasDatas[0];
              }
              else {
                // atualização, ou selecionada outra opção
                var dataConsulta = dataPesquisa.split('-').reverse().join('-').toString();
                $('.titulos_sorteios').empty();
                $('.titulos_sorteios_semanal').empty();
                $('.titulos_sorteios_extra').empty();
              }

              if (respMerge.historicoCompras.qtdTotal == 0) {
                // Nenhuma compra para a data selecionada
                $("#cardtitulos").hide();
                $('#dadosSorteio').hide();

                $('#conferir_sorteios').hide();
                $('#conferir_sorteios_semanal').hide();
                $('#conferir_sorteios_extra').hide();

                if (respMerge.sorteiosAnteriores.totalSorteiosComprados == 0) {
                  $('#selecaoDataHistorico').hide();
                }
                $('#cardSemTitulos').show();
              }
              else {
                $('#quant_sorteio_span_' + prodSelecionado).text(respMerge.historicoCompras.qtd[prodSelecionado]);
                $('#span_qtc_' + prodSelecionado).show();

                pickerConferirSorteioTodosProdutos = respMerge.numerosSorteados.dados;

                verificaSusep(respMerge.sorteiosAnteriores.SorteiosComprados, dataConsulta, prodSelecionado);
                verificaTipoSorteio(respMerge.sorteiosAnteriores.SorteiosComprados, dataConsulta, prodSelecionado);
                verificaStatusSorteio(respMerge.sorteiosAnteriores.SorteiosComprados[prodSelecionado], dataConsulta,
                  respMerge.numerosSorteados.dados[prodSelecionado], prodSelecionado, cargaInicial);

                localStorage.setItem("TMPnumerosSorteados", JSON.stringify(respMerge.numerosSorteados.dados));

                $("#cardtitulos").show();
                $('#dadosSorteio').show();
                idTitulo = 0;

                $.each(respMerge.historicoCompras.compras, function (nomeSorteio, dadosSorteio) {
                  if (nomeSorteio != 'raspadinha') {
                    $.each(dadosSorteio, function (index, titulo) {
                      code = "";
                      var dataTitulo = titulo.data.split('-').reverse().join('-').toString();
                      var dataSel = $("#selecionar_data_historico").val();
                      var dataSel = $("#selecionar_data_historico").val().toString();
                      $('#data_sorteio_span').text(dataSel);
                      // Confirma se os titulos que serão apresentados corresponde ao sorteio selecionado
                      if (dataTitulo == dataSel) {
                        if (localStorage.getItem("linkDownloadPdf")) {
                          var linkDownload = localStorage.getItem("linkDownloadPdf");
                        }
                        else {
                          var linkDownload = servidor + '/api_public/titulos/baixar_titulo.php';
                        }

                        if (nomeSorteio == 'sorteios') { prodSorteio = 's'; }
                        if (nomeSorteio == 'sorteios_semanal') { prodSorteio = 'sm'; }
                        if (nomeSorteio == 'sorteios_extra') { prodSorteio = 'se'; }

                        if (titulo.tipo_sorteio == 1) {
                          code = escreverHistoricoTitulo1(titulo, idTitulo, linkDownload, prodSorteio, nomeSorteio);
                        }
                        else if (titulo.tipo_sorteio == 2) {
                          code = escreverHistoricoTitulo2(titulo, idTitulo, linkDownload, prodSorteio, nomeSorteio);
                        }
                        else if (titulo.tipo_sorteio == 3) {
                          code = escreverHistoricoTitulo3(titulo, idTitulo, linkDownload, prodSorteio, nomeSorteio);
                        }
                      }
                      idTitulo = idTitulo + 1;
                      $('.titulos_' + nomeSorteio).append(code);

                    });
                  }
                });

                $.fn.idRaspadinha = null;
                idRaspadinha();
              }

              // Caso não tenha sido importado os ganhadores, oculta a conferencia do sorteio
              if (respMerge.numerosSorteados.dados[prodSelecionado].length > 0) {
                //$('#conferirSorteio').show();

              } else {
                $('#conferir_sorteios').hide();
                $('#conferir_sorteios_semanal').hide();
                $('#conferir_sorteios_extra').hide();
              }

            }
            else {
              // historico NAO encontrado
              $('#selecaoDataHistorico').hide();
              $('#cardCompraZerada').show();
              $('#conferir_sorteios').hide();
              $('#conferir_sorteios_semanal').hide();
              $('#conferir_sorteios_extra').hide();
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
  }


  function verificaSusep(SorteiosComprados, data, prodSelecionado) {
    var dataSorteio = data.split('-').reverse().join('-').toString();

    $.each(SorteiosComprados, function (nomeSorteio, sorteios) {
      $.each(sorteios, function (index, dadosSorteio) {
        if (dadosSorteio.data == dataSorteio) {
          $('#hidden-guid-sorteioSelecionado_' + nomeSorteio).val(dadosSorteio.guid_sorteios);
          if (dadosSorteio.processo_susep != NomeEmpresa) {
            if (prodSelecionado == nomeSorteio) {
              $('#proc_susep_' + nomeSorteio).show();
              $('#susep_span_' + nomeSorteio).text(dadosSorteio.processo_susep);
            }
          }
        }
      });
    });
  }

  function verificaTipoSorteio(SorteiosComprados, data, prodSelecionado) {
    var dataSorteio = data.split('-').reverse().join('-').toString();
    $('#hiddenTipo_sorteios').val("");
    $('#hiddenTipo_sorteios_semanal').val("");
    $('#hiddenTipo_sorteios_extra').val("");

    $.each(SorteiosComprados, function (nomeSorteio, sorteios) {
      $.each(sorteios, function (index, dadosSorteio) {
        if (dadosSorteio.data == dataSorteio) {
          $('#hiddenTipo_' + nomeSorteio).val(dadosSorteio.tipo_sorteio);
        }
      });
    });

  }

  function verificaStatusSorteio(array, data, premiosDescricao, prodSelecionado, cargaInicial) {

    var ArrayPremios = [];
    $.each(premiosDescricao, function (index, value) {
      ArrayPremios[value.guid_sorteio_premios] = value.premio_descricao;
    });

    // Limpa e adiciona os premios ao Select
    $('#conferir_sorteios').hide();
    $('#conferir_sorteios_semanal').hide();
    $('#conferir_sorteios_extra').hide();
    $.each(array, function (index, value) {
      if (value.data) {
        var NovaData = value.data.split('-').reverse().join('-').toString();
        if (NovaData == data) {
          if (value.status_sorteio == 'CO') {
            $('#conferir_' + prodSelecionado).show();
            $("#cardtitulos").show();

            pickerConferirSorteioGuidSorteio = prodSelecionado + ":" + value.guid_sorteios;
            pickerConferirSorteioProdutoSelecionadoArray = ArrayPremios;

          }
        }
      }
    });

  }

  function criaPickerConferirSorteio() {
    // Se cricou ou atualizou picker, proximo passo é abrir
    var arrayPremios = [];
    $.each(pickerConferirSorteioTodosProdutos[prodSelecionado], function (index, value) {
      arrayPremios[value.guid_sorteio_premios] = value.premio_descricao;
    });
    values = Object.keys(arrayPremios);
    displayValues = Object.values(arrayPremios);

    var valorSelecionado = "";
    var pickerDependent = app.picker.create({
      inputEl: '#selecionarPremio_' + prodSelecionado,
      rotateEffect: true,
      sheetSwipeToClose: false,
      closeByOutsideClick: false,
      backdrop: true,
      renderToolbar: function () {
        return '<div class="toolbar picker_toolbar">' +
          '<div class="toolbar-inner picker_toolbar">' +
          '<div class="left">' +
          '<a href="#" class="link cab_picker">Selecione o Prêmio</a>' +
          '</div>' +
          '<div class="right">' +
          '<a href="#" class="link cab_picker sheet-close popover-close picker_botao">OK</a>' +
          '</div>' +
          '</div>' +
          '</div>';
      },
      formatValue: function (values) {
        return arrayPremios[values[0]];
      },
      cols: [
        {
          textAlign: 'center',
          values: values,
          displayValues: displayValues,
          onChange: function (picker, valor) {
            valorSelecionado = valor;
          }
        },

      ],
      on: {
        open: function (picker) {
          //picker.cols[0].replaceValues(values, displayValues)
        },
        change: function (picker, valor) {
          valorSelecionado = valor;
          //console.log('picker Change', picker);
        },
        init: function (picker) {
          //console.log('picker init', picker);
        },
        close: function (picker) {
          //console.log('picker close', picker);
          ListaBolaTiulo(valorSelecionado);
          app.picker.destroy();
        },
        closed: function (picker) {
          //console.log('picker closeddd', picker);
          app.picker.destroy();
          var divItem = app.picker.get().$el;
          $(divItem).remove();

        }
      }
    }).open();
  }

  function criaPickerV3(datasHistorico) {
    $.each(datasHistorico, function (mes, data) {
      datasHistorico[mes] = Object.values(data);
    });
    var arrayMeses = Object.keys(datasHistorico);
    var ultimoMes = encode_utf8(arrayMeses[0]);
    var ultimoDia = datasHistorico[arrayMeses[0]][0];

    var pickerDependent = app.picker.create({
      inputEl: '#selecionar_data_historico',
      //cssClass: 'teste',
      rotateEffect: true,
      sheetSwipeToClose: false,
      closeByOutsideClick: false,
      backdrop: true,

      //toolbarCloseText: 'Selecionar',
      renderToolbar: function () {
        return '<div class="toolbar picker_toolbar">' +
          '<div class="toolbar-inner picker_toolbar">' +
          '<div class="left">' +
          '<a href="#" class="link cab_picker">Selecione a Data do Sorteio</a>' +
          '</div>' +
          '<div class="right">' +
          '<a href="#" class="link cab_picker sheet-close popover-close picker_botao">OK</a>' +
          '</div>' +
          '</div>' +
          '</div>';
      },
      formatValue: function (values) {
        return values[1];
      },
      cols: [
        {
          textAlign: 'left',
          values: arrayMeses,
          onChange: function (picker, mesSelecionado) {
            //mesSelecionado = encode_utf8(mesSelecionado);
            if (picker.cols[1].replaceValues) {
              var NovosValores = Object.values(datasHistorico[mesSelecionado]);
              picker.cols[1].replaceValues(NovosValores);
            }
          }
        },
        {
          values: datasHistorico[ultimoMes],
          width: 160
        },
      ],
      on: {
        change: function (picker) {
          $('#numerosSorteados_sorteios').hide();
          $('#numerosSorteados_sorteios_semanal').hide();
          $('#numerosSorteados_sorteios_extra').hide();

          $('#titulosSorteados_sorteios').hide();
          $('#titulosSorteados_sorteios_semanal').hide();
          $('#titulosSorteados_sorteios_extra').hide();

          $('#conferir_sorteios').hide();
          $('#conferir_sorteios_semanal').hide();
          $('#conferir_sorteios_extra').hide();

          $("#selecionarPremio_sorteios").val("");
          $("#selecionarPremio_sorteios_semanal").val("");
          $("#selecionarPremio_sorteios_extra").val("");
        },
        init: function (picker) {
          picker.setValue([ultimoMes, ultimoDia]);
        },
        open: function (picker) {
        },
        close: function (picker) {
          var dataSelecionada = picker.value[1];
          var novadataSelecionada = dataSelecionada.split('-').reverse().join('-').toString();
          listaHistorico(novadataSelecionada, 'N');
        },
        closed: function (picker) {
        }
      }
    });
  }

  function ListaBolaTiulo(sorteioGuid) {
    var numSArray = JSON.parse(localStorage.getItem("TMPnumerosSorteados"));

    var prefixoSorteio = [];
    prefixoSorteio['s'] = 'sorteios';
    prefixoSorteio['sm'] = 'sorteios_semanal';
    prefixoSorteio['se'] = 'sorteios_extra';

    var prefixoSorteioAbreviado = [];
    prefixoSorteioAbreviado['sorteios'] = 's';
    prefixoSorteioAbreviado['sorteios_semanal'] = 'sm';
    prefixoSorteioAbreviado['sorteios_extra'] = 'se';

    $.each(numSArray, function (nomeSorteio, numS) {
      var TipoProduto = "";
      var TipoSorteio = "";
      var TipoPrefixoSorteio = "";
      var itemID = "";
      // Percorre os dados para localizar a informação do sorteio selecionado
      $.each(numS, function (index, value) {
        // Se o sorteio selecionado/sorteioID == sorteio do array/bd
        if (value.guid_sorteio_premios == sorteioGuid) {
          //******************************************************* */
          // Limpar marcacao bolas dos titulos que foram sorteadas
          $("div[name='bola-titulo']").each(function (a, item) {
            itemID = item.id;
            TipoSorteio = $(this).attr('tipoS');
            TipoProduto = $(this).attr('tipoP');

            if (TipoProduto == nomeSorteio) {
              if ((TipoSorteio == 2) || (TipoSorteio == '2')) {
                // para titulos de dupla chance, o css é diferente
                $("#" + itemID).removeClass("circulo-preferido");
                $("#" + itemID).addClass("circulo");
              }
              else {
                // css dos titulos chance simples e tripla
                $("#" + itemID).removeClass("circulo2-preferido");
                $("#" + itemID).addClass("circulo2");
              }
            }
          });

          if (value.bola_titulo.toLowerCase() == "bola") {
            $('#numerosSorteados_' + nomeSorteio).show();
            $('#titulosSorteados_' + nomeSorteio).hide();
            var arrayBolas = value.bolas.split("-");

            // Marcar as bolas sorteadas na lista completa de bolas disponíveis
            $("div[name='bolas-resultado']").each(function (a, item) {
              itemID = item.id;
              TipoProduto = prefixoSorteio[itemID.split('-')[0]];
              if (TipoProduto == nomeSorteio) {
                var bola = $("#" + this.id).text().toString();
                if (arrayBolas.includes(bola)) {
                  $("#" + this.id).removeClass("circulo-apagado");
                  $("#" + this.id).addClass("circulo-preferido");
                }
                else {
                  $("#" + this.id).removeClass("circulo-preferido");
                  $("#" + this.id).addClass("circulo-apagado");
                }
              }
            });

            // marcar bolas dos titulos que foram sorteadas
            $("div[name='bola-titulo']").each(function (a, item) {
              var ArrayitemID = item.id.split("_");
              itemID = item.id;
              TipoSorteio = $(this).attr('tipoS');
              TipoProduto = $(this).attr('tipoP');
              if (TipoProduto == nomeSorteio) {
                $.each(arrayBolas, function (index, value) {
                  if (ArrayitemID[2] == "b-" + value) {

                    if ((TipoSorteio == 2) || (TipoSorteio == '2')) {
                      $("#" + itemID).removeClass("circulo");
                      $("#" + itemID).addClass("circulo-preferido");
                    }
                    else {
                      $("#" + itemID).removeClass("circulo2");
                      $("#" + itemID).addClass("circulo2-preferido");
                    }

                  }
                });
              }
            });
          }
          else if ((value.bola_titulo.toLowerCase() == "titulo") || (value.bola_titulo.toLowerCase() == "título")) {
            $('#titulosSorteados_' + nomeSorteio).show();
            $('#numerosSorteados_' + nomeSorteio).hide();

            // Limpa e Oculta todos os 51 campos de titulos
            $("div[name='titulo-resultado']").each(function (a, item) {
              itemID = item.id;
              TipoProduto = prefixoSorteio[itemID.split('-')[0]];
              if (TipoProduto == nomeSorteio) {
                $("#" + item.id).text('');
                $("#" + item.id).hide();
              }
            });

            if (value.TitulosPremiados) {
              var arrayTitulos = value.TitulosPremiados.split("-");
              // Preenche com os titulos ganhadores e mostra a div correspondente
              var qtdTitulos = 0; // soma a qtd de titulos escritos

              // verifica se algum título da linha possui mais de um título, entao a linha é duplicada
              var titulo_linha = 1;
              var titulo_coluna = 1;
              var titulo_linha_dupla = 'n';
              var ultimo_index = 0;
              TipoPrefixoSorteio = prefixoSorteioAbreviado[nomeSorteio] + '-';
              $.each(arrayTitulos, function (index, value) {
                ultimo_index = index;

                $("#" + TipoPrefixoSorteio + "resultado-t" + (index + 1)).text(value);
                $("#" + TipoPrefixoSorteio + "resultado-t" + (index + 1)).show();
                if (value.indexOf("(") >= 0) { titulo_linha_dupla = 's'; }
                qtdTitulos = qtdTitulos + 1;
                titulo_coluna = titulo_coluna + 1;
                if (titulo_coluna == 4) {
                  titulo_linha = titulo_linha + 1;
                  titulo_coluna = 1;
                  if (titulo_linha_dupla == 's') {
                    $("#" + TipoPrefixoSorteio + "resultado-t" + (index + 1)).addClass("col-grid-carrinho-duplo");
                    $("#" + TipoPrefixoSorteio + "resultado-t" + (index)).addClass("col-grid-carrinho-duplo");
                    $("#" + TipoPrefixoSorteio + "resultado-t" + (index - 1)).addClass("col-grid-carrinho-duplo");
                    titulo_linha_dupla = 'n';
                  }
                }
              });
              // se o ultimo index for divisivel por 3, terminou na celula correta
              // caso contrário precisa corrigir a ultima linha
              // lembrando que o index começa em 0, por isso +1
              if (((ultimo_index + 1) % 3) > 0) {
                if (titulo_coluna == 3) { ultimo_index = ultimo_index + 1; }
                if (titulo_coluna == 2) { ultimo_index = ultimo_index + 2; }
                // qdo terminar sem ser multiplo de 3, precisa corrigir o tamanho da linha
                if (titulo_linha_dupla == 's') {
                  // corrigir a celula correta
                  $("#" + TipoPrefixoSorteio + "resultado-t" + (ultimo_index + 1)).addClass("col-grid-carrinho-duplo");
                  $("#" + TipoPrefixoSorteio + "resultado-t" + (ultimo_index)).addClass("col-grid-carrinho-duplo");
                  $("#" + TipoPrefixoSorteio + "resultado-t" + (ultimo_index - 1)).addClass("col-grid-carrinho-duplo");
                  titulo_linha_dupla = 'n';
                }
              }
              // Completa a linha porém sem titulos
              var qtdShow = qtdTitulos % 3; // resto da divisão por 3
              if (qtdShow == 1) {
                $("#" + TipoPrefixoSorteio + "resultado-t" + (qtdTitulos + 1)).show();
                $("#" + TipoPrefixoSorteio + "resultado-t" + (qtdTitulos + 2)).show();
              }
              else if (qtdShow == 2) {
                $("#" + TipoPrefixoSorteio + "resultado-t" + (qtdTitulos + 1)).show();
              }
            }
          }
        }
      });
    });
  }

  function escreverHistoricoTitulo1(titulo, id, servidor, prodSorteio, nomeSorteio) {
    var tipoTitulo = 1;
    var valorPago = "R$ " + titulo.valor_venda_unitario.replace(".", ",");
    var arrayDataCompra = titulo.criado_em.split(' ');
    var hora = arrayDataCompra[1].split(':')[0];
    var min = arrayDataCompra[1].split(':')[1];
    var data_compra = arrayDataCompra[0].split('-').reverse().join('/').toString();
    var data_compraRodape = data_compra + " às " + hora + ":" + min;

    // Verifica se o título está no carrinho
    var classeCard = "";
    var classeHeader = "";

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    // Verifica o titulo da rodada Extra 
    if (isNaN(parseInt(titulo.titulo_rodada))) {
      var numTituloExtra = "";
      var numTituloExtra_str = "";
    } else {
      var numTituloExtra = parseInt(titulo.titulo_rodada);
      var numTituloExtra_str = numTituloExtra.toLocaleString('pt-br', { minimumFractionDigits: 0 });
    }

    // Verifica a qtd de numeros da sorte
    var qtd_num_sorte = 0;
    var giro_extra = parseInt(titulo.giro_extra);
    if (isNaN(parseInt(titulo.qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else if (parseInt(titulo.qtd_num_sorte) > parseInt(titulo.tipo_sorteio)) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else { qtd_num_sorte = parseInt(titulo.qtd_num_sorte); }
    var qtd_titulos_direta = parseInt(qtd_num_sorte) + parseInt(giro_extra);

    var vendasID = titulo.guid_vendas;
    var vendasItensID = titulo.guid_vendas_itens;

    var cpf = localStorage.getItem("cpf");
    cpf = cpf.replace(" ", "");
    cpf = cpf.replace("-", "");
    cpf = cpf.replace(".", "");
    var linkDownload = servidor + "?u=" + cpf + "&vi=" + vendasItensID + "&s=" + prodSorteio;

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var numsTitulos = numSorteID1; // Titulo único / simples chance
    var code = "";

    var code = "";
    code += "           <!-- MODELO 1 TITULO-->";
    code += "          <div id='MT-card-" + id + "' class='card card-titulo " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='1'";
    code += "            vendasID='" + vendasID + "' vendasItensID='" + vendasItensID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='MT-header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "              <div class='row' style='margin-left: 2px;margin-right: 2px; width: 100%;'>";
    code += "                <div class='col-45' style='float: left;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direta == 1) {
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 1 Numero da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
    }
    else {
      if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div><!-- FIM CAB-TITULO -->";

    code += "            <div class='block block-titulo'>";
    code += "              <div class='row row-titulo'>";
    code += "                <div class='col col2-titulo'>";

    var code2 = "";
    var count = 1;
    $.each(numBolas, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }
        code2 += "<div id='card-" + id + "_t-1_b-" + value + "' name='bola-titulo' class='circulo2' tipoP=" + nomeSorteio + " tipoS=" + tipoTitulo + ">" + value + "<\/div>";
        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div>";
        }
      }
    });

    code += code2;
    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div>";
    code += "            <div class='card-footer card-footer-titulo' style='justify-content: center;'>";
    /*
        if (titulo.doacao_resgate == "S") {
          //code += "            <i id='doacao'" + id + " class='mdi mdi-hand-heart text-color-red icone-doacao-historico-compras'></i>";
          code += "   <img id='doacao" + id + "' src='img\/meustitulos\/doacao.png' class='bt-meustitulos-doacao'>"
        }
    */
    code += "<a id='MT_download' cardID='" + id + "' class='link external' href='" + linkDownload + "' target='_blank' style='padding-right: 5px;height: 42px'>";
    code += "              <img cardID='" + id + "' vendasItensID='" + vendasItensID + "' id='download-" + id + "' src='img\/meustitulos\/download.png' alt='' class='bt-meustitulos-baixar-titulo'>";
    code += "            </a>";

    var qtdRaspadinha = parseInt(titulo.quant_raspadinhas);
    if (qtdRaspadinha > 0) {
      if (raspadinhaObj[nomeSorteio][titulo.titulo1]) {
        //code += "<a  data-popup='.popupRasp_" + qtdRaspadinha + "' name='btRasp' id='rasp_" + vendasItensID + "' cardID='" + id + "' class='popup-open' href='#' nomeSorteio='" + nomeSorteio + "' qtdRasp='" + qtdRaspadinha + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' style='padding-left: 5px;height: 42px'>";
        code += "<a  data-popup='.popupRasp' name='btRasp' id='rasp_" + vendasItensID + "' cardID='" + id + "' class='popup-open' href='#' nomeSorteio='" + nomeSorteio + "' qtdRasp='" + qtdRaspadinha + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' style='padding-left: 5px;height: 42px'>";
        if (qtdRaspadinha > parseInt(raspadinhaObj[nomeSorteio][titulo.titulo1]['cliente_raspou'])) {
          code += "<img cardID='" + id + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' id='btnRasp_" + vendasItensID + "' src='img\/meustitulos\/raspeAgora.png' alt='' class='bt-meustitulos-baixar-titulo'>";
        }
        else {
          code += "<img cardID='" + id + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' id='btnRasp_" + vendasItensID + "' src='img\/meustitulos\/raspadinha.png' alt='' class='bt-meustitulos-baixar-titulo'>";
        }
        code += "</a>";
      }
    }

    //code += "    <div class='rodape-dir'>Data Compra<br>" + data_compraRodape + "</div>";
    code += "  <\/div>";
    code += "<div class='mt_footer'><span >Data da Compra: " + data_compraRodape + "</span></div>";
    code += "<div class='mt_footer'><span >Valor pago (unitário): " + valorPago + "</span></div>";
    code += "<\/div><!-- FIM MODELO 1 TITULO-->";
    return code;
  }

  function escreverHistoricoTitulo2(titulo, id, servidor, prodSorteio, nomeSorteio) {
    var tipoTitulo = 2;
    var valorPago = "R$ " + titulo.valor_venda_unitario.replace(".", ",");
    // Verifica se o título está no carrinho
    var arrayDataCompra = titulo.criado_em.split(' ');
    var hora = arrayDataCompra[1].split(':')[0];
    var min = arrayDataCompra[1].split(':')[1];
    var data_compra = arrayDataCompra[0].split('-').reverse().join('/').toString();
    var data_compraRodape = data_compra + " às " + hora + ":" + min;

    var classeCard = "";
    var classeHeader = "";

    var vendasID = titulo.guid_vendas;
    var vendasItensID = titulo.guid_vendas_itens;

    var cpf = localStorage.getItem("cpf");
    cpf = cpf.replace(" ", "");
    cpf = cpf.replace("-", "");
    cpf = cpf.replace(".", "");
    var linkDownload = servidor + "?u=" + cpf + "&vi=" + vendasItensID + "&s=" + prodSorteio;

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    var numSorteID2 = parseInt(titulo.titulo2);
    var numSorteID2_str = numSorteID2.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    // Verifica o titulo da rodada Extra 
    if (isNaN(parseInt(titulo.titulo_rodada))) {
      var numTituloExtra = "";
      var numTituloExtra_str = "";
    } else {
      var numTituloExtra = parseInt(titulo.titulo_rodada);
      var numTituloExtra_str = numTituloExtra.toLocaleString('pt-br', { minimumFractionDigits: 0 });
    }

    // Verifica a qtd de numeros da sorte
    var qtd_num_sorte = 0;
    var giro_extra = parseInt(titulo.giro_extra);
    if (isNaN(parseInt(titulo.qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else if (parseInt(titulo.qtd_num_sorte) > parseInt(titulo.tipo_sorteio)) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else { qtd_num_sorte = parseInt(titulo.qtd_num_sorte); }
    var qtd_titulos_direta = parseInt(qtd_num_sorte) + parseInt(giro_extra);

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var bolasStr2 = titulo.combinacao2;
    var numBolas2 = bolasStr2.split("-");

    var numsTitulos = numSorteID1 + ";" + numSorteID2; // Titulo único / simples chance
    var code = "";

    code += "          <!-- MODELO 2 TITULOS -->";
    code += "          <div id='MT-card-" + id + "' class='card card-titulo " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='2'";
    code += "            vendasID='" + vendasID + "' vendasItensID='" + vendasItensID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='MT-header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "                <div class='col-45' style='float: left;width: 60%;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direta == 1) {
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 1 Numero da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
    }
    else {
      if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 2) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";
    //code += "              <\/div>";
    code += "            <\/div><!-- FIM CAB-TITULO -->";

    code += "            <div class='block block-titulo'>";
    code += "              <div class='row row-titulo'>";
    code += "                <div class='col col-titulo'>";

    var code2 = "";
    var count = 1;
    $.each(numBolas, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row-titulo2'>"; }
        //code2 += "<div id='b"+value+"' name='bola-titulo' class='circulo'>" + value + "<\/div>";
        code2 += "<div id='card-" + id + "_t-1_b-" + value + "'  name='bola-titulo' class='circulo' tipoP=" + nomeSorteio + " tipoS=" + tipoTitulo + ">" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div>";
        }
      }
    });
    code += code2;

    code += "<\/div>";
    code += "<div class='col col-titulo'>";

    code2 = "";
    count = 1;
    $.each(numBolas2, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row-titulo2'>"; }
        //code2 += "<div id='b"+value+"' name='bola-titulo' class='circulo'>" + value + "<\/div>";
        code2 += "<div id='card-" + id + "_t-2_b-" + value + "' name='bola-titulo' class='circulo' tipoP=" + nomeSorteio + " tipoS=" + tipoTitulo + ">" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div>";
        }
      }
    });
    code += code2;
    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div>";
    code += "            <div class='card-footer' style='justify-content: center;border-style: none;margin-top: 5px;height: 32px !important;min-height: 32px!important;'>";
    /*
        if (titulo.doacao_resgate == "S") {
          code += "   <img id='doacao" + id + "' src='img\/meustitulos\/doacao.png' class='bt-meustitulos-doacao'>"
        }
    */
    code += "<a id='MT_download' cardID='" + id + "' class='link external' href='" + linkDownload + "' target='_blank' style='padding-right: 5px;height: 42px'>";
    code += "              <img cardID='" + id + "' vendasItensID='" + vendasItensID + "' id='download-" + id + "' src='img\/meustitulos\/download.png' alt='' class='bt-meustitulos-baixar-titulo'>";
    code += "            </a>";

    //code += "    <div class='rodape-dir'>Data Compra<br>" + data_compraRodape + "</div>";
    code += "  <\/div>";
    // code += "Enviar por whatsapp <i class='mdi mdi-whatsapp text-color-white' ></i>";
    code += "<div class='mt_footer'><span>Data da Compra: " + data_compraRodape + "</span></div>";
    code += "<div class='mt_footer'><span>Valor pago (unitário): " + valorPago + "</span></div>";
    code += "<\/div><!-- FIM MODELO 2 TITULO-->";

    var qtdRaspadinha = parseInt(titulo.quant_raspadinhas);
    if (qtdRaspadinha > 0) {
      if (raspadinhaObj[nomeSorteio][titulo.titulo1]) {
        if (qtdRaspadinha > parseInt(raspadinhaObj[nomeSorteio][titulo.titulo1]['cliente_raspou'])) {
          var icone = 'raspeAgora';
        }
        else {
          var icone = 'raspadinha';
        }
        code += escreverCardRaspadinha(titulo.titulo1, id, vendasItensID, icone, nomeSorteio, qtdRaspadinha);
      }
    }

    return code;
  }

  function escreverHistoricoTitulo3(titulo, id, servidor, prodSorteio, nomeSorteio) {
    var tipoTitulo = 3;
    // Verifica se o título está no carrinho
    var valorPago = "R$ " + titulo.valor_venda_unitario.replace(".", ",");
    var arrayDataCompra = titulo.criado_em.split(' ');
    var hora = arrayDataCompra[1].split(':')[0];
    var min = arrayDataCompra[1].split(':')[1];
    var data_compra = arrayDataCompra[0].split('-').reverse().join('/').toString();
    var data_compraRodape = data_compra + " às " + hora + ":" + min;

    var classeCard = "";
    var classeHeader = "";

    var numTituloID = parseInt(titulo.titulo1);
    var numTituloID_str = numTituloID.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID1 = numTituloID;
    var numSorteID1_str = numTituloID_str;

    var numSorteID2 = parseInt(titulo.titulo2);
    var numSorteID2_str = numSorteID2.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    var numSorteID3 = parseInt(titulo.titulo3);
    var numSorteID3_str = numSorteID3.toLocaleString('pt-br', { minimumFractionDigits: 0 });

    // Verifica o titulo da rodada Extra 
    if (isNaN(parseInt(titulo.titulo_rodada))) {
      var numTituloExtra = "";
      var numTituloExtra_str = "";
    } else {
      var numTituloExtra = parseInt(titulo.titulo_rodada);
      var numTituloExtra_str = numTituloExtra.toLocaleString('pt-br', { minimumFractionDigits: 0 });
    }

    // Verifica a qtd de numeros da sorte
    var qtd_num_sorte = 0;
    var giro_extra = parseInt(titulo.giro_extra);
    if (isNaN(parseInt(titulo.qtd_num_sorte))) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else if (parseInt(titulo.qtd_num_sorte) > parseInt(titulo.tipo_sorteio)) { qtd_num_sorte = parseInt(titulo.tipo_sorteio); }
    else { qtd_num_sorte = parseInt(titulo.qtd_num_sorte); }
    var qtd_titulos_direta = parseInt(qtd_num_sorte) + parseInt(giro_extra);

    var vendasID = titulo.guid_vendas;
    var vendasItensID = titulo.guid_vendas_itens;

    var cpf = localStorage.getItem("cpf");
    cpf = cpf.replace(" ", "");
    cpf = cpf.replace("-", "");
    cpf = cpf.replace(".", "");

    var linkDownload = servidor + "?u=" + cpf + "&vi=" + vendasItensID + "&s=" + prodSorteio;

    var bolasStr = titulo.combinacao1;
    var numBolas = bolasStr.split("-");

    var bolasStr2 = titulo.combinacao2;
    var numBolas2 = bolasStr2.split("-");

    var bolasStr3 = titulo.combinacao3;
    var numBolas3 = bolasStr3.split("-");

    var numsTitulos = numSorteID1 + ";" + numSorteID2 + ";" + numSorteID3; // Titulo único / simples chance

    var code = "";
    code += "          <!-- MODELO 3 TITULOS -->";
    code += "          <div id='MT-card-" + id + "' class='card card-titulo  " + classeCard + "' numsTitulos='" + numsTitulos + "' tipoTitulo='3'";
    code += "            vendasID='" + vendasID + "' vendasItensID='" + vendasItensID + "'>";
    code += "            <!-- CAB-TITULO -->";
    code += "            <div id='MT-header-" + id + "' class='card-header cartela-card-header-vertical " + classeHeader + "'>";
    code += "                <div class='col-45' style='float: left;width: 60%;'>";
    code += "                  <p class='label'";
    code += "                    style='margin-top: 0px;margin-bottom: 0px;float: left;font-size: 0.8rem;text-align: center;'>";
    code += "                    <span style='font-size: 0.7rem;'>" + nomeProduto + "<\/span>";
    code += "                    <span class='span-numTitulo' style='display: block;'>" + numTituloID_str + "<\/span>";
    code += "                  <\/p>";
    code += "                <\/div>";
    code += "                <div class='col-55' style='float: right;'>";

    if (qtd_titulos_direta == 1) {
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 1 Numero da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte' style='display: block;'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
    }
    else {
      if (parseInt(qtd_num_sorte) == 1) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 2) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p>";
      }
      else if (parseInt(qtd_num_sorte) == 3) {
        // 1 Titulo e 2 Numerow da Sorte (igual ao numero do titulo)
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 1: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID1_str + "<\/span>";
        code += "                  <\/p></br>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 2: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID2_str + "<\/span>";
        code += "                  <\/p></br>";
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>N° da Sorte 3: <\/span>";
        code += "                    <span class='span-numSorte'>" + numSorteID3_str + "<\/span>";
        code += "                  <\/p></br>";
      }
      if ((parseInt(giro_extra) == 1) && (numTituloExtra_str != "")) {
        //  1 Titulo e 1 Rodada Extra
        code += "                  <p class='label' style='margin-top: 0px;margin-bottom: 0px; float: right;font-size: 0.8rem;'>";
        code += "                    <span style='font-size: 0.7rem;'>" + textoDadoAppJS.dadosComum.premioExtra + " : <\/span>";
        code += "                    <span class='span-numSorte'>" + numTituloExtra_str + "<\/span>";
        code += "                  <\/p>";
      }
    }

    code += "                <\/div>";

    code += "            <\/div><!-- FIM CAB-TITULO -->";

    code += "            <div class='block block-titulo'>";
    // Escreve titulo 1
    code += "              <div class='row row-titulo'>";
    code += "                <div class='col col2-titulo'>";
    var code2 = "";
    var count = 1;
    $.each(numBolas, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }
        //code2 += "<div id='b"+value+"' name='bola-titulo' class='circulo2'>" + value + "<\/div>";
        code2 += "<div id='card-" + id + "_t-1_b-" + value + "'  name='bola-titulo' class='circulo2' tipoP=" + nomeSorteio + " tipoS=" + tipoTitulo + ">" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div><!--fim -->";
        }
      }
    });
    code += code2;
    code += "<\/div>";
    code += "<\/div>";
    // Escreve titulo 2
    code += "<div class='row row-titulo'>";
    code += "<div class='col col2-titulo'>";
    var code2 = "";
    var count = 1;
    $.each(numBolas2, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }
        //code2 += "<div id='b"+value+"' name='bola-titulo' class='circulo2'>" + value + "<\/div>";
        code2 += "<div id='card-" + id + "_t-2_b-" + value + "'  name='bola-titulo' class='circulo2' tipoP=" + nomeSorteio + " tipoS=" + tipoTitulo + ">" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div><!--fim -->";
        }
      }
    });
    code += code2;
    code += "<\/div>";
    code += "<\/div>";
    // Escreve titulo 3
    code += "<div class='row row-titulo'>";
    code += "<div class='col col2-titulo'>";
    var code2 = "";
    var count = 1;
    $.each(numBolas3, function (index, value) {
      if (value != "00") {
        if (count == 1) { code2 += "<div class='row row2'>"; }
        //code2 += "<div id='b"+value+"' name='bola-titulo' class='circulo2'>" + value + "<\/div>";
        code2 += "<div id='card-" + id + "_t-3_b-" + value + "'  name='bola-titulo' class='circulo2' tipoP=" + nomeSorteio + " tipoS=" + tipoTitulo + ">" + value + "<\/div>";

        count = count + 1;
        if (count == 6) {
          count = 1;
          code2 += "<\/div><!--fim -->";
        }
      }
    });

    code += code2;
    code += "                <\/div>";
    code += "              <\/div>";
    code += "            <\/div>";
    code += "            <div class='card-footer card-footer-titulo' style='justify-content: center;'>";
    /*
        if (titulo.doacao_resgate == "S") {
          //code += "            <i id='doacao'" + id + " class='mdi mdi-hand-heart text-color-red icone-doacao-historico-compras'></i>";
          code += "   <img id='doacao" + id + "' src='img\/meustitulos\/doacao.png' class='bt-meustitulos-doacao'>"
        }
    */
    code += "<a id='MT_download' cardID='" + id + "' class='link external' href='" + linkDownload + "' target='_blank' style='padding-right: 5px;height: 42px'>";
    code += "              <img cardID='" + id + "' vendasItensID='" + vendasItensID + "' id='download-" + id + "' src='img\/meustitulos\/download.png' alt='' class='bt-meustitulos-baixar-titulo'>";
    code += "            </a>";

    var qtdRaspadinha = parseInt(titulo.quant_raspadinhas);
    if (qtdRaspadinha > 0) {
      if (raspadinhaObj[nomeSorteio][titulo.titulo1]) {
        //code += "<a  data-popup='.popupRasp_" + qtdRaspadinha + "' name='btRasp' id='rasp_" + vendasItensID + "' cardID='" + id + "' class='popup-open' href='#' nomeSorteio='" + nomeSorteio + "' qtdRasp='" + qtdRaspadinha + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' style='padding-left: 5px;height: 42px'>";
        code += "<a  data-popup='.popupRasp' name='btRasp' id='rasp_" + vendasItensID + "' cardID='" + id + "' class='popup-open' href='#' nomeSorteio='" + nomeSorteio + "' qtdRasp='" + qtdRaspadinha + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' style='padding-left: 5px;height: 42px'>";
        console.log(qtdRaspadinha,qtdRaspadinha);
        if (qtdRaspadinha > parseInt(raspadinhaObj[nomeSorteio][titulo.titulo1]['cliente_raspou'])) {
          code += "<img cardID='" + id + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' id='btnRasp_" + vendasItensID + "' src='img\/meustitulos\/raspeAgora.png' alt='' class='bt-meustitulos-baixar-titulo'>";
        }
        else {
          code += "<img cardID='" + id + "' titulo='" + titulo.titulo1 + "' vendasItensID='" + vendasItensID + "' id='btnRasp_" + vendasItensID + "' src='img\/meustitulos\/raspadinha.png' alt='' class='bt-meustitulos-baixar-titulo'>";
        }
        code += "</a>";
      }
    }
    //code += "    <div class='rodape-dir'>Data Compra<br>" + data_compraRodape + "</div>";
    code += "  <\/div>";
    code += "<div class='mt_footer'><span>Data da Compra: " + data_compraRodape + "</span></div>";
    code += "<div class='mt_footer'><span>Valor pago (unitário): " + valorPago + "</span></div>";
    code += "<\/div><!-- FIM MODELO 3 TITULO-->";
    return code;
  }

  function escreverCardRaspadinha(titulo, cardid, vendasitensid, icone, nomesorteio, qtdrasp) {

    var mensagem = 'Chegou a raspadinha<br>do MARACAP';
    return '<div class="card" style="background-color: #dadada4a !important;">' +
      '<div class="row" style="padding-top: 8px;">' +
      '<div class="col-60" style="padding: 8px !important;text-align: center;">' +
      '<span>' + mensagem + '</span>' +
      '</div>' +
      '<div class="col-40" style="padding: 8px !important;">' +
      '<a data-popup=".popupRasp" name="btRasp" id="rasp_' + vendasitensid + '" cardid="' + cardid + '" class="popup-open" href = "#" nomesorteio = "' + nomesorteio + '" qtdrasp = "' + qtdrasp + '" titulo = "' + titulo + '" vendasitensid = "' + vendasitensid + '" style = "padding-left: 5px;height: 42px" >' +
      '<img style="vertical-align: text-top;"cardid="' + cardid + '" titulo="' + titulo + '" vendasitensid="' + vendasitensid + '"id="btnRasp_' + vendasitensid + '" src="img/meustitulos/' + icone + '.png" alt="" class="bt-meustitulos-baixar-titulo">' +
      '</a></div>' +
      '</div>' +
      '</div>';
  }


  $('.popupRasp').on('popup:open', function (e) {
    toastRaspadinha.open();
    $('#rasp_msg0_A').show();
    $('#rasp_msg1_A').hide();
    $('#rasp_msg0_B').show();
    $('#rasp_msg1_B').hide();
    $('#rasp_msg0_C').show();
    $('#rasp_msg1_C').hide();


    $('#divCardraspTitulo_A').hide();
    $('#divraspTitulo_A').hide();

    $('#divCardraspTitulo_B').hide();
    $('#divraspTitulo_B').hide();

    $('#divCardraspTitulo_C').hide();
    $('#divraspTitulo_C').hide();

    $('#conjuntoBolasA > i').removeClass('blockRaspadinha_bullet');
    $('#conjuntoBolasA > i').addClass('blockRaspadinha_bulletSelecionada');
    $('#conjuntoBolasB > i').removeClass('blockRaspadinha_bulletSelecionada');
    $('#conjuntoBolasB > i').addClass('blockRaspadinha_bullet');
    $('#blocoA').show();
    $('#blocoB').hide();
    $('#blocoC').hide();
    click_item("A");
    $('#hidden_pagina').val("A");

  });

  $('.popupRasp').on('popup:close', function (e) {
    toastRaspadinha.close();
    $('#cardRasp_A').wScratchPad('reset');
    $('#cardRasp_B').wScratchPad('reset');
    $('#cardRasp_C').wScratchPad('reset');
    vendasItensAberto = "";
    tituloSelecionado = "";
    raspadinhaNomeSorteio = "";
    qtdRasp = 0;
    
  });

  $('.popupRasp').on('popup:opened', function (e) {
    //$("[name='RaspeAqui']").width('250px');
    AjaxFlag = 0;
    var rasp_msg_A = "";
    var rasp_valor_A = 0;
    var rasp_cliente_raspou_A = "";
    var rasp_titulo_A = "";

    var rasp_msg_B = "";
    var rasp_valor_B = 0;
    var rasp_cliente_raspou_B = "";
    var rasp_titulo_B = "";

    var rasp_msg_C = "";
    var rasp_valor_C = 0;
    var rasp_cliente_raspou_C = "";
    var rasp_titulo_C = "";

    var qtdRaspadinhaTitulo = 0;
    var dadosRaspadinha = {};
    if (raspadinhaObj[raspadinhaNomeSorteio]) {
      if (raspadinhaObj[raspadinhaNomeSorteio][tituloSelecionado]) {
        dadosRaspadinha = raspadinhaObj[raspadinhaNomeSorteio][tituloSelecionado];
        qtdRaspadinhaTitulo = parseInt(raspadinhaObj[raspadinhaNomeSorteio][tituloSelecionado]['quant_raspadinhas']);
      }
    }
    if (!dadosRaspadinha) {
      return false;
    }
    else {
      if (qtdRasp == qtdRaspadinhaTitulo) {
        $('#hidden_qtd').val(qtdRaspadinhaTitulo);
        $('#texto_paginacao').text("Você possui " + qtdRasp + " raspadinha(s)");
        if (parseInt(qtdRasp) >= 1) {
          $('#cardRasp_A').wScratchPad('enable', true);
          rasp_titulo_A = dadosRaspadinha['numero_titulo'];
          rasp_msg_A = (dadosRaspadinha['premio_rasp_1'] != null) ? dadosRaspadinha['premio_rasp_1'] : textoDadoAppJS.dadosComum.msg_rasp_naopremiada;

          if (dadosRaspadinha['raspou_em_1'] === null || dadosRaspadinha['raspou_em_1'] === "") {
            rasp_cliente_raspou_A = '';
            $("#icone_bolaA1").show();
            $("#icone_bolaA2").hide();
          }
          else {
            $("#icone_bolaA1").hide();
            $("#icone_bolaA2").show();
            var dataCompletaArray = dadosRaspadinha['raspou_em_1'].toLocaleString('pt-BR').split(' ');
            var arrayData = dataCompletaArray[0].split('-');
            var arrayHora = dataCompletaArray[1].split(':');
            var novaData = ("0" + arrayData[0]).slice(-2) + "/" + ("0" + arrayData[1]).slice(-2);
            var novaHora = arrayHora[0] + ":" + arrayHora[1];
            rasp_cliente_raspou_A = novaData + " às " + novaHora;
          }

          $('#cardRasp_A').attr('numTitulo', rasp_titulo_A);
          $('#cardRasp_A').attr('guid', dadosRaspadinha['guid_rasp_1']);
          $('#raspTitulo_A').text("Título: " + rasp_titulo_A);
          $('#rasp_msg1_A').text(rasp_msg_A);
          $('#numTitulo_A').val(rasp_titulo_A);
          $('#rasp_msg2_A').text(rasp_cliente_raspou_A);
          ativarRaspadinha("A", rasp_cliente_raspou_A, dadosRaspadinha['status_rasp_1']);

        }
        if (parseInt(qtdRasp) >= 2) {
          $('#cardRasp_B').wScratchPad('enable', true);
          rasp_titulo_B = dadosRaspadinha['numero_titulo'];
          rasp_msg_B = (dadosRaspadinha['premio_rasp_2'] != null) ? dadosRaspadinha['premio_rasp_2'] : textoDadoAppJS.dadosComum.msg_rasp_naopremiada;
          if (dadosRaspadinha['raspou_em_2'] === null || dadosRaspadinha['raspou_em_2'] === "") {
            rasp_cliente_raspou_B = '';
            $("#icone_bolaB1").show();
            $("#icone_bolaB2").hide();
          }
          else {
            $("#icone_bolaB1").hide();
            $("#icone_bolaB2").show();
            var dataCompletaArray = dadosRaspadinha['raspou_em_2'].toLocaleString('pt-BR').split(' ');
            var arrayData = dataCompletaArray[0].split('-');
            var arrayHora = dataCompletaArray[1].split(':');
            var novaData = ("0" + arrayData[0]).slice(-2) + "/" + ("0" + arrayData[1]).slice(-2);
            var novaHora = arrayHora[0] + ":" + arrayHora[1];
            rasp_cliente_raspou_B = novaData + " às " + novaHora;
          }

          $('#cardRasp_B').attr('numTitulo', rasp_titulo_B);
          $('#cardRasp_B').attr('guid', dadosRaspadinha['guid_rasp_2']);
          $('#raspTitulo_B').text("Título: " + rasp_titulo_B);
          $('#rasp_msg1_B').text(rasp_msg_B);
          $('#numTitulo_B').val(rasp_titulo_B);
          $('#rasp_msg2_B').text(rasp_cliente_raspou_B);
          ativarRaspadinha("B", rasp_cliente_raspou_B, dadosRaspadinha['status_rasp_2']);

        }
        if (parseInt(qtdRasp) >= 3) {
          $('#cardRasp_C').wScratchPad('enable', true);
          rasp_titulo_C = dadosRaspadinha['numero_titulo'];
          rasp_msg_C = (dadosRaspadinha['premio_rasp_3'] != null) ? dadosRaspadinha['premio_rasp_3'] : textoDadoAppJS.dadosComum.msg_rasp_naopremiada;
          if (dadosRaspadinha['raspou_em_3'] === null || dadosRaspadinha['raspou_em_3'] === "") {
            rasp_cliente_raspou_C = '';
            $("#icone_bolaC1").show();
            $("#icone_bolaC2").hide();
          }
          else {
            $("#icone_bolaC1").hide();
            $("#icone_bolaC2").show();
            var dataCompletaArray = dadosRaspadinha['raspou_em_3'].toLocaleString('pt-BR').split(' ');
            var arrayData = dataCompletaArray[0].split('-');
            var arrayHora = dataCompletaArray[1].split(':');
            var novaData = ("0" + arrayData[0]).slice(-2) + "/" + ("0" + arrayData[1]).slice(-2);
            var novaHora = arrayHora[0] + ":" + arrayHora[1];
            rasp_cliente_raspou_C = novaData + " às " + novaHora;
          }

          $('#cardRasp_C').attr('numTitulo', rasp_titulo_C);
          $('#cardRasp_C').attr('guid', dadosRaspadinha['guid_rasp_3']);
          $('#raspTitulo_C').text("Título: " + rasp_titulo_C);
          $('#rasp_msg1_C').text(rasp_msg_C);
          $('#numTitulo_C').val(rasp_titulo_C);
          $('#rasp_msg2_C').text(rasp_cliente_raspou_C);
          ativarRaspadinha("C", rasp_cliente_raspou_C, dadosRaspadinha['status_rasp_3']);
        }
      }
    }
  });

  function ativarRaspadinha(op, raspou, statusRasp) {
    $('#cardRasp_' + op).wScratchPad({
      //bg: '/img/scratchcard/premio.png',
      bg: '#00000000',
      fg: '#dadada',
      scratchMove: function (e, percent) {
        if ((percent > 2) && (percent < 50)) {
          toastRaspadinha.open();
        }
        if (percent > 50) {
          toastRaspadinha.close();
          $('#rasp_msg0_' + op).hide();
          $('#rasp_msg1_' + op).show();

          $('#cardRasp_' + op).wScratchPad('enable', false);
          $('#icone_bola' + op + '1').hide();
          $('#icone_bola' + op + '2').show();

          var dataCompletaArray = new Date().toLocaleString('pt-BR').split(' ');
          var arrayData = dataCompletaArray[0].split('/');
          var arrayHora = dataCompletaArray[1].split(':');
          var novaData = ("0" + arrayData[0]).slice(-2) + "/" + ("0" + arrayData[1]).slice(-2);
          var novaHora = arrayHora[0] + ":" + arrayHora[1];
          var NovaDataCompleta = novaData + " às " + novaHora;
          $('#rasp_msg2_' + op).text(NovaDataCompleta);
          this.clear();
          atualizaRaspadinha($(this.$el).attr('numTitulo'), $(this.$el).attr('guid'), op);
        }
      }
    });

    $('#cardRasp_' + op).wScratchPad('size', 40);
    if (raspou != '') {
      toastRaspadinha.close();
      $('#rasp_msg0_' + op).hide();
      $('#rasp_msg1_' + op).show();

      $('#icone_bola' + op + '1').hide();
      $('#icone_bola' + op + '2').show();
      $('#cardRasp_' + op).wScratchPad('clear');
      $('#cardRasp_' + op).wScratchPad('enable', false);
    }
    $('#divCardraspTitulo_' + op).show(800);
    $('#divraspTitulo_' + op).show();
  }

  function imgRaspadinha(guid, numTitulo) {
    // Atualiza Frontend com a data que raspou
    var qtdRaspadinhaTitulo = 0;
    var qtdRaspadinhaRaspou = 0;
    $.each(raspadinhaObj, function (nomeSorteio, ItensSorteio) {
      $.each(ItensSorteio, function (id, dados) {
        if (id == numTitulo) {
          qtdRaspadinhaRaspou = parseInt(parseInt(raspadinhaObj[nomeSorteio][numTitulo]['cliente_raspou']) + 1);
          raspadinhaObj[nomeSorteio][numTitulo]['cliente_raspou'] = qtdRaspadinhaRaspou;
          var horaAtualizado = new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('pt-BR');
          if (guid == raspadinhaObj[nomeSorteio][numTitulo]['guid_rasp_1']) {
            raspadinhaObj[nomeSorteio][numTitulo]['raspou_em_1'] = horaAtualizado;
          }
          else if (guid == raspadinhaObj[nomeSorteio][numTitulo]['guid_rasp_2']) {
            raspadinhaObj[nomeSorteio][numTitulo]['raspou_em_2'] = horaAtualizado;
          }
          else if (guid == raspadinhaObj[nomeSorteio][numTitulo]['guid_rasp_3']) {
            raspadinhaObj[nomeSorteio][numTitulo]['raspou_em_3'] = horaAtualizado;
          }
          qtdRaspadinhaTitulo = parseInt(raspadinhaObj[nomeSorteio][numTitulo]['quant_raspadinhas']);
        }
      });
    });
    if (qtdRaspadinhaRaspou >= qtdRaspadinhaTitulo) {
      $("#btnRasp_" + vendasItensAberto).attr('src', 'img\/meustitulos\/raspadinha.png');
    }
  }

  function idRaspadinha() {
    $("[name='btRasp']").on("click", function () {
      vendasItensAberto = $(this).attr('vendasItensID');
      tituloSelecionado = $(this).attr('titulo');
      raspadinhaNomeSorteio = $(this).attr('nomeSorteio');
      qtdRasp = $(this).attr('qtdRasp');
    });
  };

  function atualizaRaspadinha(numTitulo, guid, opcao) {
    if (AjaxFlag == 0) {
      if (numTitulo == tituloSelecionado) {
        AjaxFlag = 1;
        imgRaspadinha(guid, numTitulo);

        var ktmp = Date.now();
        var dataC = {
          user_login: localStorage.getItem("user_login"),
          guid: guid,
          numTitulo: numTitulo,
          op: opcao,
          acao: 'visto'
        };
        var dataD = {
          ktmp: ktmp,
          device: localStorage.getItem("device"),
        };
        var dataC = JSON.stringify(criptoDadosEnviado(dataC, ktmp));
        var dataD = JSON.stringify(dataD);
        app.request({
          url: servidor + '/api_public/titulos/raspadinhaV2.php',
          beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("jwt"));
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
            app.preloader.hide();
            var resp = descriptDadosRecebido(resposta, ktmp);
            var respMerge = { ...resp.d, ...resp.c, ...resp.a };
            if (respMerge.status == "ok") {

            }
            else {
              ErroAjax(respMerge);
            }
          },
          error: function (erro) {
            ErroAjax('error', 'conexao/servidor');
          },
          complete: function () {
            setTimeout(function () {
              AjaxFlag = 0;
            }, 500);
          }
        });
      }
    }
  }
  // FIM  FUNCOES PARA AS RASPADINHAS

  if (device.platform == 'WEBAPP') {
    var toastCSS = ''; 
    var divWeb = $("#web_app_imgcell").width();
    if (divWeb<1025){
      var toastCSS = 'toast_webapp';
    }
  }
  var toastRaspadinha = app.toast.create({
    text: textoDadoAppJS.dadosComum.msg_rasp_toast,
    closeButton: false,
    position: 'top',
    horizontalPosition: 'center',
    closeTimeout: 4000,
    cssClass: toastCSS,
    on: {
      open: function () {
        $(this.$el).children().css( { 'justify-content': 'center', 'text-align-last': 'center'});
      }
    }
  });
  
});